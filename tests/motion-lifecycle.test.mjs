import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the exported lifecycle without installing a DOM/test dependency.
function fixture({ torus = false } = {}) {
  const button = new EventTarget();
  button.dataset = { labelOn: 'on', labelOff: 'off' };
  const attributes = new Map();
  button.setAttribute = (key, value) => attributes.set(key, value);
  button.querySelector = () => null;
  const document = new EventTarget();
  document.documentElement = { classList: { toggle() {} }, dataset: {} };
  document.querySelector = (selector) => torus && selector === '[data-torus]' ? { textContent: '' } : null;
  document.querySelectorAll = (selector) => selector === '[data-motion-toggle]' ? [button] : [];
  const media = new EventTarget();
  media.matches = true;
  const storage = new Map();
  const intervals = new Set();
  const observers = new Set();
  const frames = new Set();
  class Observer {
    constructor(callback) { this.callback = callback; observers.add(this); }
    observe() {}
    disconnect() { observers.delete(this); }
  }
  const window = new EventTarget();
  window.matchMedia = () => media;
  const exports = {};
  vm.runInNewContext(ts.transpileModule(
    readFileSync(new URL('../src/scripts/motion.ts', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText, {
    exports, document, window,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    AbortController, IntersectionObserver: Observer, Intl, innerWidth: 400,
    requestAnimationFrame: (callback) => { frames.add(callback); return callback; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setInterval: (fn) => { intervals.add(fn); return fn; },
    clearInterval: (id) => intervals.delete(id),
    setTimeout, clearTimeout,
  });
  return { api: exports, button, attributes, intervals, observers, frames, storage };
}

test('motion controls keep working and resources are disposed between language pages', () => {
  const f = fixture();
  f.api.initMotion();
  assert.equal(f.attributes.get('aria-pressed'), 'false');
  assert.equal(f.intervals.size, 1);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.attributes.get('aria-pressed'), 'true');
  assert.equal(f.storage.get('rmendoza:motion'), 'on');

  assert.equal(typeof f.api.disposeMotion, 'function');
  f.api.disposeMotion();
  assert.equal(f.intervals.size, 0);
  assert.equal(f.observers.size, 0);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.storage.get('rmendoza:motion'), 'on', 'disposed controls must not retain listeners');

  f.api.initMotion();
  assert.equal(f.attributes.get('aria-pressed'), 'true', 'preference survives language changes');
  f.api.initMotion();
  assert.equal(f.intervals.size, 1, 'reinitialization must not duplicate clocks');
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.attributes.get('aria-pressed'), 'false', 'one click must toggle exactly once');
  f.api.disposeMotion();
  assert.equal(f.intervals.size, 0);
  assert.equal(f.observers.size, 0);
});


test('queued observer and animation callbacks cannot restart disposed page effects', () => {
  const f = fixture({ torus: true });
  f.api.initMotion();
  f.button.dispatchEvent(new Event('click'));
  const [torusObserver, revealObserver] = [...f.observers];
  torusObserver.callback([{ isIntersecting: true }]);
  assert.equal(f.frames.size, 1);
  const queuedFrame = [...f.frames][0];
  f.api.disposeMotion();
  assert.equal(f.frames.size, 0);
  torusObserver.callback([{ isIntersecting: true }]);
  queuedFrame(100);
  assert.equal(f.frames.size, 0, 'late callbacks must not resurrect an old animation loop');
  assert.doesNotThrow(() => revealObserver.callback([{ isIntersecting: true, target: {} }]),
    'late reveal callbacks must not touch detached elements');
});
