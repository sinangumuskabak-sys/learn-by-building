// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createBridge, loadKey, parseArgs, VAULT_FOLDER, vaultFile } from '../../public/maymun-bridge.mjs'

const home = mkdtempSync(join(tmpdir(), 'maymun-test-'))
let bridge, url, key

const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)))

beforeAll(async () => {
  key = loadKey(home)
  bridge = createBridge(parseArgs(['--origin', 'https://learn.example/']), key)
  url = `http://127.0.0.1:${await listen(bridge)}/v1`
})

afterAll(() => {
  bridge.close()
  rmSync(home, { recursive: true, force: true })
})

describe('Maymun bridge', () => {
  it('keeps the same key across starts', () => {
    expect(loadKey(home)).toBe(key)
    expect(key).toMatch(/^maymun-/)
  })

  it('turns away requests without the key and sites that are not allowed', async () => {
    expect((await fetch(`${url}/vault`, { headers: { Authorization: 'Bearer nope' } })).status).toBe(401)
    expect((await fetch(`${url}/vault`, { headers: { Origin: 'https://evil.example', Authorization: `Bearer ${key}` } })).status).toBe(403)
    const preflight = await fetch(`${url}/vault`, { method: 'OPTIONS', headers: { Origin: 'https://learn.example' } })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://learn.example')
    expect(preflight.headers.get('access-control-allow-private-network')).toBe('true')
    const local = await fetch(`${url}/vault`, { headers: { Origin: 'http://localhost:5173', Authorization: `Bearer ${key}` } })
    expect(local.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
  })

  it('only does the vault: chat and model requests are not found', async () => {
    const auth = { Authorization: `Bearer ${key}` }
    expect((await fetch(`${url}/models`, { headers: auth })).status).toBe(404)
    expect((await fetch(`${url}/chat/completions`, { method: 'POST', headers: auth, body: '{}' })).status).toBe(404)
  })
})

describe('Maymun bridge: memory vault mirror', () => {
  const vault = mkdtempSync(join(tmpdir(), 'maymun-vault-'))
  let mirror, mirrorUrl
  beforeAll(async () => {
    mirror = createBridge(parseArgs(['--vault', vault]), key)
    mirrorUrl = `http://127.0.0.1:${await listen(mirror)}/v1/vault`
  })
  afterAll(() => {
    mirror.close()
    rmSync(vault, { recursive: true, force: true })
  })
  const post = (body, base = mirrorUrl) =>
    fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) })
  const get = () => fetch(mirrorUrl, { headers: { Authorization: `Bearer ${key}` } }).then((r) => r.json())

  it('only accepts note paths inside its own folder', () => {
    expect(vaultFile(vault, 'Oyunlar/Yılan/Güncel durum.md')).toBe(join(vault, VAULT_FOLDER, 'Oyunlar', 'Yılan', 'Güncel durum.md'))
    for (const bad of ['../x.md', 'a/../../x.md', '/etc/x.md', String.raw`a\..\x.md`, 'a/b.txt', 'a//b.md', './a.md']) {
      expect(vaultFile(vault, bad), bad).toBeNull()
    }
  })

  it('says how to turn the mirror on when started without --vault', async () => {
    const response = await fetch(`${url}/vault`, { headers: { Authorization: `Bearer ${key}` } })
    expect(response.status).toBe(404)
    expect((await response.json()).error.message).toContain('--vault')
  })

  it('writes notes, gives them back, sets up a new vault for Obsidian, and starts over on reset', async () => {
    const response = await post({
      files: [{ path: 'Güncel durum.md', content: '# Now' }, { path: 'Oyunlar/Yılan/Güncel durum.md', content: '# Snake' }, { path: '../escape.md', content: 'no' }],
      obsidian: { 'app.json': '{}', '../evil.json': 'no' },
    })
    expect(await response.json()).toMatchObject({ written: 2 })
    expect(existsSync(join(vault, 'escape.md'))).toBe(false)
    expect(readFileSync(join(vault, '.obsidian', 'app.json'), 'utf8')).toBe('{}')
    const { files } = await get()
    expect(files.map((f) => f.path).sort()).toEqual(['Güncel durum.md', 'Oyunlar/Yılan/Güncel durum.md'])
    expect(files.find((f) => f.path === 'Güncel durum.md').content).toBe('# Now')

    // An existing vault keeps its own Obsidian settings.
    writeFileSync(join(vault, '.obsidian', 'app.json'), '{"mine": true}')
    await post({ reset: true, files: [{ path: 'Güncel durum.md', content: '# Fresh' }], obsidian: { 'app.json': '{}' } })
    expect(readFileSync(join(vault, '.obsidian', 'app.json'), 'utf8')).toBe('{"mine": true}')
    expect((await get()).files.map((f) => f.path)).toEqual(['Güncel durum.md'])
  })

  it('keeps My notes written in Obsidian that the app has not read yet', async () => {
    const note = (status, notes) => `# Snake\n\n${status}\n\n## Notlarım\n${notes}`
    const path = 'Oyunlar/Yılan/Güncel durum.md'
    await post({ files: [{ path, content: note('Step 1', ''), notesBase: '' }] })
    // Written in Obsidian; then the app updates its own part of the note before reading that back.
    writeFileSync(join(vault, VAULT_FOLDER, path), note('Step 1', 'Mine, from Obsidian.\n'))
    expect(await (await post({ files: [{ path, content: note('Step 2', ''), notesBase: '' }] })).json()).toMatchObject({ kept: [path] })
    expect(readFileSync(join(vault, VAULT_FOLDER, path), 'utf8')).toBe(note('Step 2', 'Mine, from Obsidian.\n'))
    // Once the app has seen them, what it sends is written as is.
    await post({ files: [{ path, content: note('Step 3', 'Edited in the app.\n'), notesBase: 'Mine, from Obsidian.' }] })
    expect(readFileSync(join(vault, VAULT_FOLDER, path), 'utf8')).toBe(note('Step 3', 'Edited in the app.\n'))
  })
})
