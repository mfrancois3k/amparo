/* Storage boundary between /app (beta) and the live root app.
 * wargames/15 §1.2.
 *
 * THE RULE: /app may READ the six root-owned keys, and may WRITE only its own
 * `app_*` keys. A live user's saved pack is the product — it is the thing in
 * their glovebox — and a write bug in an unproven beta must not be able to
 * corrupt it. State therefore diverges between the two apps during beta; that
 * is accepted, and unifying it is promotion-scope work.
 *
 * The rule is enforced by SHAPE, not by discipline: writers take a short name
 * and this module applies the `app_` prefix itself, so no caller — present or
 * future, careless or not — can name a root key at all. Root keys are exposed
 * only through individual named readers, so there is no generic
 * read-any-key surface either.
 *
 * Every access is try/catch-wrapped. Root does the same, because localStorage
 * throws outright in sandboxed viewers and in Safari private mode, and the app
 * is expected to keep working (in memory) rather than white-screen.
 */

/** Keys owned by the live root app. Read-only from here, forever. */
const ROOT_KEYS = {
  save: 'sr_save',
  docs: 'sr_docs',
  practice: 'amparo_prx',
  muted: 'amparo_muted',
  voice: 'amparo_voice',
  stt: 'amparo_stt',
} as const;

export type Lang = 'en' | 'es';
export type VoiceGender = 'm' | 'f';

export interface RootSave {
  state: string | null;
  name: string;
  ec: string; ecp: string;
  ec2: string; ecp2: string;
  att: string;
  email: string;
  skipped: Record<string, boolean>;
  lang: Lang | null;
  step: number | null;
  hasPrinted: boolean;
  printedAt: string | null;
  printedEdition: string | null;
}

export interface RootPractice {
  done: Record<string, boolean>;
  runs: Record<string, number>;
  best: Record<string, string>;
  streak: { last: string; n: number };
  cbDay?: string;
  v?: number;
}

function readRaw(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function readJson<T>(key: string): T | null {
  const raw = readRaw(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

/* ---------- root: read-only ---------- */

/**
 * Read the root app's saved pack.
 *
 * `state` and `lang` are whitelisted exactly as root's `restore()` does, and for
 * the same reasons recorded there: an unrecognised state would silently print
 * the WRONG state's rules, and an unrecognised lang bricks every render until
 * site data is cleared. Validation is the caller's `validStates` set so this
 * module never needs the content banks imported.
 */
export function readRootSave(validStates: ReadonlySet<string>): RootSave | null {
  const s = readJson<Record<string, unknown>>(ROOT_KEYS.save);
  if (!s) return null;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const state = typeof s.state === 'string' && validStates.has(s.state) ? s.state : null;
  const lang = s.lang === 'en' || s.lang === 'es' ? s.lang : null;
  const step = typeof s.step === 'number' && s.step >= 1 && s.step <= 5 ? s.step : null;
  return {
    state,
    name: str(s.name), ec: str(s.ec), ecp: str(s.ecp),
    ec2: str(s.ec2), ecp2: str(s.ecp2), att: str(s.att), email: str(s.email),
    skipped: (s.skipped && typeof s.skipped === 'object' ? s.skipped : {}) as Record<string, boolean>,
    lang, step,
    hasPrinted: Boolean(s.hasPrinted),
    printedAt: typeof s.printedAt === 'string' ? s.printedAt : null,
    printedEdition: typeof s.printedEdition === 'string' ? s.printedEdition : null,
  };
}

/**
 * Interpret the root app's practice progress, applying BOTH of root's migrations
 * in memory. Nothing is ever written back — root owns this key, and a beta that
 * rewrote it could corrupt a real user's history.
 *
 * v1 -> v2: the original shape was a flat `{ level: true }` map with no `done`.
 * index-shift: level 3 ("the hard stop") was removed from the ladder, so every
 * index above it moved down. Without the shift a returning user's Hard-mode
 * result silently displays as their Checkpoint result. Old index 3 is DROPPED,
 * not remapped — its deck no longer exists, and showing a result for a level
 * someone never played would be inventing progress.
 *
 *   old: 0 calm · 1 irritated · 2 ordered-out · 3 hard-stop · 4 hard-mode · 5 checkpoint
 *   new: 0 calm · 1 irritated · 2 ordered-out · 3 hard-mode  · 4 checkpoint
 */
export function readRootPractice(): RootPractice {
  const empty: RootPractice = { done: {}, runs: {}, best: {}, streak: { last: '', n: 0 } };
  const raw = readJson<Record<string, unknown>>(ROOT_KEYS.practice);
  if (!raw) return empty;

  let prx: RootPractice;
  if (raw.done) {
    prx = { ...empty, ...(raw as unknown as RootPractice) };
  } else {
    // v1 flat shape: every truthy top-level entry was a completed level.
    const done: Record<string, boolean> = {};
    for (const k of Object.keys(raw)) if (raw[k]) done[k] = true;
    prx = { ...empty, done };
  }
  prx.best = prx.best || {};
  prx.runs = prx.runs || {};
  prx.streak = prx.streak || { last: '', n: 0 };

  if ((prx.v ?? 0) >= 2) return prx;

  const shift = <T>(o: Record<string, T> | undefined): Record<string, T> => {
    if (!o) return {};
    const n: Record<string, T> = {};
    if (o[0] !== undefined) n[0] = o[0];
    if (o[1] !== undefined) n[1] = o[1];
    if (o[2] !== undefined) n[2] = o[2];
    if (o[4] !== undefined) n[3] = o[4]; // hard mode  4 -> 3
    if (o[5] !== undefined) n[4] = o[5]; // checkpoint 5 -> 4
    return n;
  };
  return { ...prx, done: shift(prx.done), runs: shift(prx.runs), best: shift(prx.best), v: 2 };
}

/** Root's captured document photos. Prefix-validated exactly as root's `docsRestore()` does. */
export function readRootDocs(): Record<string, string> {
  const raw = readJson<Record<string, unknown>>(ROOT_KEYS.docs);
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const [slot, v] of Object.entries(raw)) {
    if (typeof v === 'string' && v.startsWith('data:image/')) out[slot] = v;
  }
  return out;
}

export function readRootPrefs(): { muted: boolean; voice: VoiceGender; stt: boolean } {
  const voice = readRaw(ROOT_KEYS.voice);
  return {
    muted: readRaw(ROOT_KEYS.muted) === '1',
    voice: voice === 'f' ? 'f' : 'm',
    // The browser transcript API this gates is not on-device on most platforms;
    // it is opt-in only, and nothing in either app writes this key today.
    // /app never uses it at all. See wargames/14 §1.
    stt: readRaw(ROOT_KEYS.stt) === '1',
  };
}

/* ---------- /app: read-write, namespaced ---------- */

const APP_PREFIX = 'app_';

/** `name` is a short key — the `app_` prefix is applied here so a root key cannot be addressed. */
export function readApp<T>(name: string, fallback: T): T {
  const v = readJson<T>(APP_PREFIX + name);
  return v === null ? fallback : v;
}

export function writeApp(name: string, value: unknown): void {
  try { localStorage.setItem(APP_PREFIX + name, JSON.stringify(value)); } catch { /* quota or sandbox — in-memory only */ }
}

export function removeApp(name: string): void {
  try { localStorage.removeItem(APP_PREFIX + name); } catch { /* ignore */ }
}

/** Clear only /app's own keys. Root's six are untouchable from here by construction. */
export function clearApp(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(APP_PREFIX)) doomed.push(k);
    }
    doomed.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
