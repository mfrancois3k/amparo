#!/usr/bin/env node
/**
 * Extends the daily law-watch (tools/law-watch.mjs) to cover data/hud.json's
 * 230 cites, from research/law-sources.json's verified-URL sidecar.
 *
 *   node tools/law-sources.mjs --gaps    # write research/law-watch-gaps.md
 *   node tools/law-sources.mjs --sync    # append newly-matched sources into
 *                                        # research/law-watch.json (additive
 *                                        # only — never touches an existing entry)
 *
 * The daily job (tools/law-watch.mjs) and its GitHub Action are unchanged: they
 * just watch whatever is in research/law-watch.json's `sources` array, however
 * it got there. This tool only grows that array, honestly — see
 * research/law-sources.json's own header for why it starts at zero entries.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchedSources, renderGapsMarkdown } from './lib/lawSources.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadJson(root, rel) {
  return JSON.parse(await readFile(path.join(root, rel), 'utf8'))
}

/** Returns the added entries (possibly empty); writes research/law-watch.json
 * only when there is something new, so a repeat run never touches its mtime. */
export async function sync({ root = ROOT } = {}) {
  const hud = await loadJson(root, 'data/hud.json')
  const sidecar = (await loadJson(root, 'research/law-sources.json')).sources
  const watch = await loadJson(root, 'research/law-watch.json')
  const existingIds = new Set(watch.sources.map((s) => s.id))
  const added = matchedSources(hud, sidecar, existingIds)
  if (added.length > 0) {
    watch.sources.push(...added)
    await writeFile(path.join(root, 'research/law-watch.json'), JSON.stringify(watch, null, 1) + '\n', 'utf8')
  }
  return added
}

/** Returns the rendered markdown; always (re)writes the gap report. */
export async function gaps({ root = ROOT } = {}) {
  const hud = await loadJson(root, 'data/hud.json')
  const sidecar = (await loadJson(root, 'research/law-sources.json')).sources
  const md = renderGapsMarkdown(hud, sidecar)
  await writeFile(path.join(root, 'research/law-watch-gaps.md'), md, 'utf8')
  return md
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  let did = false
  if (process.argv.includes('--sync')) {
    did = true
    const added = await sync()
    console.log(added.length === 0
      ? 'law-sources --sync: nothing new to add (every sidecar entry is already watched)'
      : `law-sources --sync: added ${added.length} source(s) to research/law-watch.json:\n` + added.map((s) => `  ${s.id}  (${s.state} ${s.cite})`).join('\n'))
  }
  if (process.argv.includes('--gaps')) {
    did = true
    const md = await gaps()
    console.log(`law-sources --gaps: wrote research/law-watch-gaps.md (${(md.match(/^- `/gm) || []).length} uncovered cites)`)
  }
  if (!did) {
    console.log('usage: node tools/law-sources.mjs --gaps | --sync')
    process.exitCode = 1
  }
}
