import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Run the shipped controller unmodified; only browser surfaces are simulated.
const source = readFileSync(new URL('../new/cinema-motion.js', import.meta.url), 'utf8');
class Element {
  listeners = new Map(); attrs = {}; dataset = {}; textContent = ''; hidden = false;
  classes = new Set();
  classList = {add: name => this.classes.add(name), remove: name => this.classes.delete(name)};
  addEventListener(type, callback, options = {}) {
    const entries = this.listeners.get(type) || [];
    entries.push({callback, signal: options.signal}); this.listeners.set(type, entries);
  }
  emit(type) {
    for (const entry of this.listeners.get(type) || []) if (!entry.signal?.aborted) entry.callback({});
  }
  setAttribute(key, value) { this.attrs[key] = String(value); }
}
function makeHero() {
  const root = new Element(), video = new Element(), button = new Element();
  let src = '';
  video.assignments = []; video.plays = 0; video.pauses = 0; video.loads = 0;
  video.paused = true; video.currentTime = 0; video.dataset.cineVideo = '/new/assets/cinema-traffic-hero.mp4';
  Object.defineProperty(video, 'src', {get: () => src, set: value => {src = value; video.assignments.push(value);}});
  video.play = () => {video.plays++; video.paused = false; return video.playResult || Promise.resolve();};
  video.pause = () => {video.pauses++; video.paused = true;};
  video.load = () => {video.loads++;};
  video.removeAttribute = key => {if (key === 'src') src = '';};
  root.querySelector = selector => selector === 'video' ? video : button;
  return {root, video, button};
}
function harness({reduced = false, saveData = false, language = 'en'} = {}) {
  let current = makeHero();
  const document = new Element(); document.documentElement = {lang: language};
  document.querySelector = () => current.root;
  const media = new Element(); media.matches = reduced;
  const observers = [], connection = {saveData};
  const context = {window: {}, document, navigator: {connection}, AbortController,
    matchMedia: () => media,
    IntersectionObserver: class {
      constructor(callback) {this.callback = callback; observers.push(this);}
      observe() {} disconnect() {this.disconnected = true;}
    }
  };
  vm.runInNewContext(source, context);
  return {document, media, observers, connection,
    get current() {return current;},
    enter() {observers.at(-1).callback([{isIntersecting: true}]);},
    leave() {observers.at(-1).callback([{isIntersecting: false}]);},
    dispose() {context.window.AmparoCinemaMotion.dispose();},
    remount(lang = 'es') {current = makeHero(); document.documentElement.lang = lang; context.window.AmparoCinemaMotion.mount();}
  };
}

for (const setting of [{reduced: true}, {saveData: true}]) {
  test(`${Object.keys(setting)[0]} preserves the still without a video request or autoplay`, () => {
    const h = harness(setting), {video, button} = h.current;
    h.enter(); h.leave(); h.enter(); h.document.emit('visibilitychange');
    assert.deepEqual(video.assignments, []); assert.equal(video.plays, 0);
    assert.equal(button.hidden, true); assert.equal(video.paused, true); h.dispose();
  });
}
test('video is lazy-loaded once on entry, and offscreen/background pauses resume only when visible', () => {
  const h = harness(), {video} = h.current;
  assert.deepEqual(video.assignments, []); assert.equal(video.plays, 0);
  h.enter(); assert.equal(video.plays, 1); assert.equal(video.muted, true);
  h.leave(); assert.equal(video.paused, true);
  h.document.hidden = true; h.enter(); assert.equal(video.plays, 1);
  h.document.hidden = false; h.document.emit('visibilitychange'); assert.equal(video.plays, 2);
  h.document.hidden = true; h.document.emit('visibilitychange'); assert.equal(video.paused, true);
  assert.deepEqual(video.assignments, ['/new/assets/cinema-traffic-hero.mp4']); h.dispose();
});
test('user pause survives observer and visibility callbacks and a language remount', () => {
  const h = harness(); h.enter(); const old = h.current;
  old.button.emit('click'); assert.equal(old.video.paused, true);
  assert.equal(old.button.textContent, 'Resume scene');
  h.leave(); h.enter(); h.document.hidden = true; h.document.emit('visibilitychange');
  h.document.hidden = false; h.document.emit('visibilitychange'); assert.equal(old.video.plays, 1);
  h.remount(); h.enter(); assert.equal(old.video.src, '');
  assert.equal(h.current.video.plays, 0); assert.equal(h.current.button.textContent, 'Reanudar escena');
  h.current.button.emit('click'); assert.equal(h.current.video.plays, 1); h.dispose();
});
test('ending plays once until explicit replay resets currentTime', () => {
  const h = harness(), {video, button} = h.current; h.enter();
  video.currentTime = 5.04; video.emit('ended');
  assert.equal(button.textContent, 'Replay scene');
  h.leave(); h.enter(); h.document.emit('visibilitychange'); assert.equal(video.plays, 1);
  assert.equal(video.currentTime, 5.04);
  button.emit('click'); assert.equal(video.currentTime, 0); assert.equal(video.plays, 2);
  assert.equal(button.attrs['aria-label'], 'Pause scene'); h.dispose();
});
test('live reduced-motion changes stop playback and suppress restart while constrained', () => {
  const h = harness(), {video, button} = h.current; h.enter();
  h.media.matches = true; h.media.emit('change'); assert.equal(video.paused, true); assert.equal(button.hidden, true);
  h.leave(); h.enter(); assert.equal(video.plays, 1);
  h.media.matches = false; h.media.emit('change'); assert.equal(video.plays, 2); h.dispose();
});
test('media errors restore the still and never retry through later callbacks', () => {
  const h = harness(), {video, button} = h.current; h.enter(); video.emit('playing');
  assert.equal(video.classes.has('is-playing'), true);
  video.emit('error'); assert.equal(video.classes.has('is-playing'), false); assert.equal(button.hidden, true);
  h.leave(); h.enter(); h.document.emit('visibilitychange'); h.media.emit('change');
  assert.equal(video.plays, 1); assert.equal(video.paused, true); h.dispose();
});
test('dispose aborts listeners, disconnects observers, releases source and ignores late rejection', async () => {
  const h = harness(), {video, button} = h.current;
  let reject;
  video.playResult = new Promise((_, fail) => {reject = fail;}); h.enter();
  const observer = h.observers[0]; h.dispose();
  assert.equal(observer.disconnected, true); assert.equal(video.src, ''); assert.equal(video.loads, 1);
  assert.equal(video.paused, true);
  for (const element of [video, button, h.document, h.media]) {
    for (const entries of element.listeners.values()) assert.ok(entries.every(entry => entry.signal.aborted));
  }
  video.emit('playing'); video.emit('ended'); button.emit('click');
  observer.callback([{isIntersecting: true}]); // Already-queued observer delivery.
  reject(new Error('play aborted by teardown')); await Promise.resolve(); await Promise.resolve();
  assert.equal(video.plays, 1); assert.equal(video.src, ''); assert.equal(video.classes.has('is-playing'), false);
  h.remount(); h.enter(); assert.equal(h.current.video.plays, 1); // Late rejection did not set global userPaused.
  h.dispose();
});
