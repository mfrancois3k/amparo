import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped controller, replacing only its network module import.
const source = readFileSync(new URL('../new/encounter-stage.js', import.meta.url), 'utf8')
  .replace("import('/new/vendor/three-stage.js')", 'loadThree()');
class Element {
  listeners = new Map(); attrs = {}; dataset = {}; children = [];
  textContent = ''; disabled = false; hidden = false; clientWidth = 600; clientHeight = 560;
  classes = new Set(); classList = {add: (...names) => names.forEach(n => this.classes.add(n))};
  addEventListener(type, callback, options = {}) {
    const records = this.listeners.get(type) || [];
    records.push({callback, signal: options.signal}); this.listeners.set(type, records);
  }
  emit(type) { for (const entry of this.listeners.get(type) || []) if (!entry.signal?.aborted) entry.callback({preventDefault() {}}); }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  append(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  animate() {}
}
function makeRoot(language = 'en') {
  const root = new Element(); root.dataset.language = language;
  const nodes = Object.fromEntries(['view','canvas','poster','pause','status','label','description','number'].map(n => [n, new Element()]));
  const buttons = [0, 1, 2].map(i => { const b = new Element(); b.dataset.encounter = String(i); return b; });
  root.querySelector = selector => nodes[selector.replace('.encounter-', '')];
  root.querySelectorAll = () => buttons;
  return {root, nodes, buttons};
}
function deferred() { let resolve; const promise = new Promise(r => resolve = r); return {promise, resolve}; }
async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); }
function harness({reduced = false, deferImport = false, deferModel = false} = {}) {
  let current = makeRoot(); const document = new Element(); document.hidden = false;
  document.querySelector = () => current.root;
  const media = new Element(); media.matches = reduced;
  const observers = [], frames = new Map(), renderers = [], meshes = [];
  let nextFrame = 0;
  class Vector { set() {} sub() {} }
  class Group {
    children = []; position = new Vector(); visible = true;
    add(item) { this.children.push(item); } attach(item) { this.add(item); }
    traverse(fn) { fn(this); this.children.forEach(child => child.traverse(fn)); }
    updateMatrixWorld() {}
  }
  const model = new Group(); const named = {};
  ['scene_traffic', 'scene_door', 'scene_search'].forEach(name => {
    const mesh = new Group(); mesh.isMesh = true; mesh.disposed = false;
    mesh.geometry = {dispose: () => mesh.disposed = true};
    model.add(mesh); named[name] = mesh; meshes.push(mesh);
  });
  model.getObjectByName = name => named[name];
  const gltf = {scene: model, animations: []};
  const importGate = deferred(), modelGate = deferred();
  const T = {
    WebGLRenderer: class {
      domElement = new Element(); shadowMap = {}; draws = 0; disposed = false;
      constructor() { renderers.push(this); }
      setPixelRatio() {} setSize() {} render() { this.draws++; }
      dispose() { this.disposed = true; } forceContextLoss() {}
    },
    Scene: Group, Group, Vector3: Vector,
    PerspectiveCamera: class { position = new Vector(); constructor(fov) { this.fov = fov; } updateProjectionMatrix() {} lookAt() {} },
    HemisphereLight: Group,
    DirectionalLight: class extends Group { shadow = {mapSize: new Vector(), camera: {}}; },
    Box3: class { setFromObject() { return this; } getCenter(v) { return v; } },
    GLTFLoader: class { loadAsync() { return deferModel ? modelGate.promise : Promise.resolve(gltf); } }
  };
  const context = {window: {}, document, AbortController, devicePixelRatio: 2,
    matchMedia: query => query.includes('reduced') ? media : {matches: false},
    requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {} disconnect() { this.dead = true; }
    },
    ResizeObserver: class { observe() {} disconnect() {} },
    loadThree: () => deferImport ? importGate.promise : Promise.resolve(T)
  };
  vm.runInNewContext(source, context);
  return {
    context, document, media, frames, renderers, meshes,
    get current() { return current; },
    enter() { observers.at(-1).callback([{isIntersecting: true}]); },
    leave() { observers.at(-1).callback([{isIntersecting: false}]); },
    dispose() { context.window.AmparoEncounter.dispose(); },
    remount(language = 'es') { current = makeRoot(language); context.window.AmparoEncounter.mount(); },
    resolveImport() { importGate.resolve(T); }, resolveModel() { modelGate.resolve(gltf); }
  };
}

test('reduced motion renders a static scene and never schedules animation', async () => {
  const h = harness({reduced: true}); h.enter(); await flush();
  assert.equal(h.renderers.length, 1); assert.ok(h.renderers[0].draws > 0);
  assert.equal(h.frames.size, 0); assert.equal(h.current.nodes.pause.disabled, true);
  h.current.buttons[2].emit('click');
  assert.equal(h.current.nodes.label.textContent, 'The window'); assert.equal(h.frames.size, 0);
  h.dispose();
});
test('pause stops animation and remains stopped after visibility changes', async () => {
  const h = harness(); h.enter(); await flush(); assert.equal(h.frames.size, 1);
  h.current.nodes.pause.emit('click'); assert.equal(h.frames.size, 0);
  h.document.hidden = true; h.document.emit('visibilitychange');
  h.document.hidden = false; h.document.emit('visibilitychange');
  assert.equal(h.frames.size, 0); assert.equal(h.current.nodes.pause.textContent, 'Resume motion');
  h.dispose();
});
test('disposal during the module import prevents a stale canvas', async () => {
  const h = harness({deferImport: true}); const old = h.current;
  h.enter(); h.dispose(); h.resolveImport(); await flush();
  assert.equal(h.renderers.length, 0); assert.equal(old.nodes.canvas.children.length, 0);
  assert.equal(h.frames.size, 0);
});
test('disposal during model loading removes canvas and releases late geometry', async () => {
  const h = harness({deferModel: true}); const old = h.current;
  h.enter(); await flush(); assert.equal(old.nodes.canvas.children.length, 1);
  h.dispose(); h.resolveModel(); await flush();
  assert.equal(old.nodes.canvas.children.length, 0); assert.equal(h.renderers[0].disposed, true);
  assert.ok(h.meshes.every(mesh => mesh.disposed)); assert.equal(h.frames.size, 0);
});
test('lost WebGL context falls back permanently without restarting frames', async () => {
  const h = harness(); h.enter(); await flush();
  const renderer = h.renderers[0]; renderer.domElement.emit('webglcontextlost');
  const draws = renderer.draws;
  h.document.emit('visibilitychange'); h.media.emit('change'); h.leave(); h.enter();
  h.current.buttons[1].emit('click');
  assert.equal(h.frames.size, 0); assert.equal(renderer.draws, draws);
  assert.ok(h.current.nodes.view.classes.has('has-fallback')); assert.equal(h.current.nodes.pause.hidden, true);
  h.dispose();
});
test('selected scene and user pause survive a language remount', async () => {
  const h = harness(); h.enter(); await flush();
  h.current.buttons[1].emit('click'); h.current.nodes.pause.emit('click');
  const old = h.current; h.remount(); h.enter(); await flush();
  assert.equal(old.nodes.canvas.children.length, 0);
  assert.equal(h.current.nodes.label.textContent, 'En casa');
  assert.equal(h.current.buttons[1].attrs['aria-pressed'], 'true');
  assert.equal(h.current.nodes.pause.textContent, 'Reanudar movimiento'); assert.equal(h.frames.size, 0);
  h.dispose();
});
