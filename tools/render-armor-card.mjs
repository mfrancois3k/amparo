#!/usr/bin/env node
/**
 * Renders the Physical Armor card for one state: the Avery 5371 duplex sheet
 * (HTML + PDF) and 300-dpi PNG proofs of both faces.
 *
 *   node tools/render-armor-card.mjs --state TX [--lang es] [--name "Ana P."] [--out lab/armor]
 *   node tools/render-armor-card.mjs --selftest
 *
 * The template is app-src/convex/lib/armorCard.ts, the same module the
 * fulfilment action hands to Lob; this script only puts Chrome in front of it.
 * Node 24 loads the .ts module directly (type stripping); nothing to build.
 * lab/ is gitignored: these are proofs, not source.
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import os from 'node:os'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { findChrome } from './render-kyr-card.mjs'
import { armorCardHtml, armorPrintSheetHtml, ARMOR_CARD_SIZE, ARMOR_CSS } from '../app-src/convex/lib/armorCard.ts'

const execFileP = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

async function loadData() {
  const hud = JSON.parse(await readFile(path.join(ROOT, 'data', 'hud.json'), 'utf8'))
  const states = JSON.parse(await readFile(path.join(ROOT, 'app-src', 'src', 'content', 'states.json'), 'utf8'))
  return { hud, states }
}

function lifelinesFor(states, code) {
  const own = states.STATE_LEGAL_AID[code]
  return (own ? [own, ...states.BASE_LIFELINES] : states.BASE_LIFELINES).slice(0, 3).map((l) => ({ n: l.n, p: l.p }))
}

/* A face at exactly 3.5x2in in a window of the same CSS size; the device
 * scale factor turns that into the 1050x600 proof. */
function faceDoc(face) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#FAF6EE}body{width:${ARMOR_CARD_SIZE.w};height:${ARMOR_CARD_SIZE.h};overflow:hidden}${ARMOR_CSS}</style></head><body>${face}</body></html>`
}

export async function render({ code, lang = 'en', name, out }) {
  const { hud, states } = await loadData()
  const lifelines = code === 'US' ? states.BASE_LIFELINES.slice(0, 3) : lifelinesFor(states, code)
  await mkdir(out, { recursive: true })
  const sheetHtml = path.join(out, `armor-${code}-${lang}-sheet.html`)
  await writeFile(sheetHtml, armorPrintSheetHtml({ code, lang, hud, lifelines, name }), 'utf8')
  const faces = {}
  for (const side of ['front', 'back']) {
    const p = path.join(out, `armor-${code}-${lang}-${side}.html`)
    const body = armorCardHtml({ code, lang, side, hud, lifelines, name }).replace(/^<style>[\s\S]*?<\/style>/, '')
    await writeFile(p, faceDoc(body), 'utf8')
    faces[side] = p
  }
  const chrome = await findChrome()
  const common = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--disable-extensions']
  const pdf = path.join(out, `armor-${code}-${lang}-sheet.pdf`)
  await execFileP(chrome, [...common, '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(sheetHtml).href])
  const [w, h] = ARMOR_CARD_SIZE.px300dpi
  const cssW = 3.5 * 96, cssH = 2 * 96
  const pngs = {}
  for (const side of ['front', 'back']) {
    const png = path.join(out, `armor-${code}-${lang}-${side}.png`)
    await execFileP(chrome, [...common, `--window-size=${cssW},${cssH}`, `--force-device-scale-factor=${w / cssW}`, `--screenshot=${png}`, pathToFileURL(faces[side]).href])
    pngs[side] = png
  }
  return { sheetHtml, pdf, pngs, size: [w, h] }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain && process.argv.includes('--selftest')) {
  const out = await (await import('node:fs/promises')).mkdtemp(path.join(os.tmpdir(), 'amparo-armor-'))
  try {
    const r = await render({ code: 'TX', lang: 'en', name: 'Selftest', out })
    const size = (await readFile(r.pdf)).length
    const ok = size > 10_000
    console.log(`${ok ? 'ok  ' : 'FAIL'}  sheet PDF rendered (${size} bytes)`)
    for (const side of ['front', 'back']) {
      const png = await readFile(r.pngs[side])
      const okPng = png.length > 5_000 && png[1] === 0x50 && png[2] === 0x4e
      console.log(`${okPng ? 'ok  ' : 'FAIL'}  ${side} proof PNG (${png.length} bytes)`)
      if (!okPng) process.exitCode = 1
    }
    if (!ok) process.exitCode = 1
  } finally {
    await rm(out, { recursive: true, force: true })
  }
} else if (isMain) {
  const code = arg('state', 'TX').toUpperCase()
  const r = await render({ code, lang: arg('lang', 'en'), name: arg('name'), out: path.resolve(ROOT, arg('out', 'lab/armor')) })
  console.log(`wrote ${r.pdf}\n      ${r.pngs.front}\n      ${r.pngs.back}`)
}
