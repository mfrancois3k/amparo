import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { sync, gaps } from './law-sources.mjs'

const hud = { states: {
  FL: { lines: [{ id: 'sign', cite: 'Fla. Stat. §318.14(3)' }] },
  TX: { lines: [{ id: 'documents', cite: 'Transp. Code §521.025' }] },
} }
const watch = { _comment: ['fixture'], sources: [{ id: 'existing-hand-verified', state: 'NY', cite: 'x', url: 'u', anchor: 'a', hash: 'keepme' }] }

async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'amparo-lawsrc-'))
  await mkdir(path.join(dir, 'data'), { recursive: true })
  await mkdir(path.join(dir, 'research'), { recursive: true })
  await writeFile(path.join(dir, 'data', 'hud.json'), JSON.stringify(hud))
  await writeFile(path.join(dir, 'research', 'law-watch.json'), JSON.stringify(watch))
  return dir
}

test('sync(): adds a matched source, leaves an already-hand-verified entry untouched, no-ops on repeat', async () => {
  const dir = await fixture()
  try {
    await writeFile(path.join(dir, 'research', 'law-sources.json'), JSON.stringify({
      sources: { 'Fla. Stat. §318.14(3)': { url: 'https://example.gov/fl', anchor: '318.14' } },
    }))
    const added = await sync({ root: dir })
    assert.equal(added.length, 1)
    assert.equal(added[0].state, 'FL')

    const written = JSON.parse(await readFile(path.join(dir, 'research', 'law-watch.json'), 'utf8'))
    assert.equal(written.sources.length, 2)
    const kept = written.sources.find((s) => s.id === 'existing-hand-verified')
    assert.equal(kept.hash, 'keepme', 'sync() must never touch a pre-existing entry')

    const mtimeBefore = (await import('node:fs/promises').then((m) => m.stat(path.join(dir, 'research', 'law-watch.json')))).mtimeMs
    const again = await sync({ root: dir })
    assert.equal(again.length, 0)
    const mtimeAfter = (await import('node:fs/promises').then((m) => m.stat(path.join(dir, 'research', 'law-watch.json')))).mtimeMs
    assert.equal(mtimeBefore, mtimeAfter, 'a no-op sync must not rewrite the file')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('gaps(): writes a report naming the uncovered TX cite and excluding a covered FL one', async () => {
  const dir = await fixture()
  try {
    await writeFile(path.join(dir, 'research', 'law-sources.json'), JSON.stringify({
      sources: { 'Fla. Stat. §318.14(3)': { url: 'https://example.gov/fl', anchor: '318.14' } },
    }))
    const md = await gaps({ root: dir })
    assert.match(md, /## TX/)
    assert.doesNotMatch(md, /## FL/)
    const onDisk = await readFile(path.join(dir, 'research', 'law-watch-gaps.md'), 'utf8')
    assert.equal(onDisk, md)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('the committed sidecar and gap report are current for the real data/hud.json', async () => {
  const before = await readFile(new URL('../research/law-watch-gaps.md', import.meta.url), 'utf8').catch(() => null)
  const rendered = await gaps()
  assert.equal(before, rendered, 'run `node tools/law-sources.mjs --gaps` and commit the result')
})
