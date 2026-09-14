import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {PRODUCTS} from '../app-src/convex/lib/products.ts';

// Execute actual action handlers with an inert Stripe SDK. No credentials,
// network transport, or Convex project is used by these regression tests.
function code(file) {
  return stripTypeScriptTypes(readFileSync(new URL('../app-src/convex/'+file,import.meta.url),'utf8'))
    .replace(/^import .*$/gm,'').replace(/export const /g,'const ').replace(/^export default .*$/gm,'');
}
function actions(flag) {
  let constructions=0, sessions=0, request;
  const sandbox={PRODUCTS,process:{env:{PAYMENTS_LIVE:flag,STRIPE_SECRET_KEY:'test-inert'}},
    action:x=>x,internalAction:x=>x,v:{string:()=>null,optional:()=>null},
    Stripe:class {constructor(){constructions++;} checkout={sessions:{create:async input=>{request=input;sessions++;return {url:'https://example.invalid/checkout'};}}};}};
  vm.runInNewContext(code('stripe.ts')+';globalThis.handlers={createCheckout,guestCheckout};',sandbox);
  return {sandbox,get constructions(){return constructions;},get sessions(){return sessions;},get request(){return request;}};
}
for(const flag of [undefined,'false','TRUE','1',' true ']) test('checkout stays closed for flag '+String(flag),async()=>{
  const h=actions(flag),ctx={auth:{getUserIdentity:async()=>({subject:'test-user'})}};
  for(const name of ['createCheckout','guestCheckout']) await assert.rejects(h.sandbox.handlers[name].handler(ctx,{product:'armor'}),/not configured for launch/);
  assert.equal(h.constructions,0);assert.equal(h.sessions,0);
});
test('explicit enablement retains product holds and uses server price',async()=>{
  const h=actions('true');
  await assert.rejects(h.sandbox.handlers.guestCheckout.handler({}, {product:'deep'}),/not available yet/);
  assert.equal(h.constructions,0);
  await h.sandbox.handlers.guestCheckout.handler({}, {product:'master'});
  assert.equal(h.constructions,1);assert.equal(h.sessions,1);
  assert.equal(h.request.line_items[0].price_data.unit_amount,999);
});
test('public checkout returns prelaunch 503 without invoking actions or mutations',async()=>{
  const routes=[];
  const sandbox={Response,PRODUCTS,process:{env:{}},httpRouter:()=>({route:r=>routes.push(r)}),httpAction:fn=>fn,internal:{},LIMITS:{},clientKey:()=>''};
  vm.runInNewContext(code('http.ts'),sandbox);
  const route=routes.find(r=>r.path==='/checkout'&&r.method==='POST');
  const forbidden=()=>{throw new Error('Prelaunch must not call a backend dependency');};
  const response=await route.handler({runAction:forbidden,runMutation:forbidden},{json:forbidden});
  assert.equal(response.status,503);assert.equal((await response.json()).error,'payments not available yet');
  assert.ok(routes.some(r=>r.path==='/redeem'));assert.ok(routes.some(r=>r.path==='/stripe'));
});
