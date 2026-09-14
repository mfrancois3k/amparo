import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../new/commerce.js',import.meta.url),'utf8');
function setup(){
  class El{
    dataset={};listeners={};textContent='';value='';required=false;hidden=false;disabled=false;validity='';href='';
    addEventListener(type,fn){this.listeners[type]=fn;} setAttribute(key,value){this[key]=value;}
    setCustomValidity(value){this.validity=value;} focus(){this.focused=true;} select(){this.selected=true;}
    emit(type){return this.listeners[type]?.({preventDefault(){}});}
  }
  const ids=Object.fromEntries(['leadForm','leadStatus','leadDraft','prepareLead','leadPreview','openEmail','copyDraft'].map(id=>[id,new El()]));
  const names=['name','organization','email','size','state','interest'];
  const labels=names.map(name=>{const e=new El();e.dataset.i18n=name;e.textContent=name;return e;});
  const values=['A & B','Community <Group>','person@example.org','1–25','TX','A bilingual workshop & a sample'];
  const fields=names.map((name,i)=>{const e=new El();e.name=name;e.value=values[i];e.required=true;return e;});
  ids.leadForm.elements=fields;ids.leadForm.reportValidity=()=>fields.every(f=>!f.validity);
  ids.leadPreview.hidden=true;ids.prepareLead.disabled=true;
  const langs=['en','es'].map(language=>{const e=new El();e.dataset.language=language;return e;});
  const trustLinks=['/about','/how-we-verify','/privacy'].map(path=>{
    const e=new El();let href='https://www.amparohq.com'+path;
    Object.defineProperty(e,'href',{get:()=>href,set:value=>href=new URL(value,'https://www.amparohq.com').href});return e;
  });
  const nav=new El(),language=new El();let copied='';
  const sandbox={URL,URLSearchParams,location:{href:'https://www.amparohq.com/organizations',search:''},history:{replaceState(){}},
    navigator:{clipboard:{writeText:async text=>{copied=text;}}},
    document:{documentElement:{},body:{dataset:{commerce:'organizations'}},getElementById:id=>ids[id]||null,
      querySelectorAll:selector=>selector==='[data-i18n]'?labels:selector==='[data-language]'?langs:selector==='[data-lang-link]'?trustLinks:[],
      querySelector:selector=>selector==='nav'?nav:selector==='.language'?language:null},
    FormData:class{constructor(form){this.form=form;}get(name){return this.form.elements.find(el=>el.name===name)?.value;}},
    fetch(){throw Error('This contact form must not transmit data');},localStorage:{setItem(){throw Error('This contact form must not persist contact data');}}};
  vm.runInNewContext(script,sandbox);
  return {ids,fields,langs,trustLinks,sandbox,get copied(){return copied;}};
}
test('organization inquiry prepares an encoded draft without submitting or navigating',()=>{
  const h=setup();assert.equal(h.ids.prepareLead.disabled,false);assert.equal(h.ids.openEmail.href,'');
  h.ids.leadForm.emit('submit');
  assert.equal(h.ids.leadPreview.hidden,false);assert.equal(h.ids.leadDraft.focused,true);
  const mail=new URL(h.ids.openEmail.href);assert.equal(mail.protocol,'mailto:');assert.equal(mail.pathname,'orgs@amparohq.com');
  assert.equal(mail.searchParams.get('body'),h.ids.leadDraft.value);
  assert.match(h.ids.leadDraft.value,/Community <Group>/);assert.match(h.ids.leadStatus.textContent,/Nothing has been sent/);
  assert.equal(h.sandbox.location.href,'https://www.amparohq.com/organizations');
});
test('whitespace fields prevent drafting; edits invalidate an old draft',()=>{
  const h=setup();h.fields[0].value='   ';h.ids.leadForm.emit('submit');
  assert.equal(h.ids.leadPreview.hidden,true);assert.notEqual(h.fields[0].validity,'');
  h.fields[0].value='Name';h.ids.leadForm.emit('input');h.ids.leadForm.emit('submit');assert.equal(h.ids.leadPreview.hidden,false);
  h.fields[5].value='Different request';h.ids.leadForm.emit('input');assert.equal(h.ids.leadPreview.hidden,true);
});
test('Spanish switch preserves contact values and clipboard copies only on explicit action',async()=>{
  const h=setup();const values=h.fields.map(f=>f.value);h.langs[1].emit('click');
  assert.equal(h.sandbox.document.documentElement.lang,'es');assert.deepEqual(h.fields.map(f=>f.value),values);
  h.ids.leadForm.emit('submit');assert.match(h.ids.leadDraft.value,/Organización:/);assert.equal(h.copied,'');
  await h.ids.copyDraft.emit('click');assert.equal(h.copied,h.ids.leadDraft.value);
});
test('clipboard denial exposes manual selection and never reports a successful copy',async()=>{
  const h=setup();h.ids.leadForm.emit('submit');h.sandbox.navigator.clipboard.writeText=async()=>{throw Error('Denied');};
  await h.ids.copyDraft.emit('click');assert.equal(h.ids.leadDraft.selected,true);assert.match(h.ids.leadStatus.textContent,/Select and copy/);
});
test('Spanish trust links use existing translated routes and switch back correctly',()=>{
  const h=setup();h.langs[1].emit('click');
  assert.deepEqual(h.trustLinks.map(link=>new URL(link.href).pathname),['/acerca/','/como-verificamos/','/privacidad/']);
  h.langs[0].emit('click');assert.deepEqual(h.trustLinks.map(link=>new URL(link.href).pathname),['/about/','/how-we-verify/','/privacy/']);
});
