import { expect, test, type Page } from '@playwright/test'

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

async function passFirstSnakeStep(page: Page) {
  await page.goto('./#/games/snake/01-canvas')
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await page.getByRole('button', { name: 'Show solution' }).click()
  await page.getByRole('button', { name: /Replace your code/ }).click()
  await page.getByRole('button', { name: /^Run/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Step complete!' })).toBeVisible({ timeout: 15_000 })
}

test('the memory vault: a note for everything, following progress, my notes kept, a zip, and a reset', async ({ page }) => {
  await page.goto('./#/memory')
  const tree = page.getByRole('navigation', { name: 'Memory vault' })
  await expect(tree.getByRole('button', { name: '00 Read me' })).toBeVisible()
  await expect(tree).toContainText(/\d{3} notes/)

  // Open a game's status note through the tree.
  await tree.getByText('Games', { exact: true }).click()
  await tree.getByText('Snake', { exact: true }).click()
  const snake = tree.locator('details').filter({ has: page.locator('summary', { hasText: /^Snake$/ }) })
  await snake.getByRole('button', { name: 'Current status' }).click()
  const note = page.getByRole('main').last()
  await expect(note).toContainText('Snake — Current status')
  await expect(note).toContainText('0/28')

  // Finishing a step shows in the vault (the app writes the status), and links lead to the step's note.
  await passFirstSnakeStep(page)
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Current status.md'))
  await expect(note).toContainText('1/28')
  await expect(note).toContainText('✅ Done')
  await note.getByRole('link', { name: /^01 / }).click()
  await expect(note).toContainText('What you learned')
  await expect(note).toContainText('✅ Done')

  // My notes are the learner's and survive a reload.
  await note.getByLabel('My notes').fill('ctx is the brush.')
  await note.getByRole('button', { name: 'Save my notes' }).click()
  await expect(note.getByRole('status')).toHaveText('Saved')
  await page.reload()
  await expect(note.getByLabel('My notes')).toHaveValue('ctx is the brush.')

  // The whole vault downloads as a zip, ready for Obsidian.
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download the vault (.zip)' }).click()])
  expect(download.suggestedFilename()).toBe('Learn Platform.zip')

  // Resetting all data brings the vault back to its skeleton.
  await page.goto('./#/settings')
  await page.getByRole('button', { name: 'Reset all data' }).click()
  await page.getByRole('button', { name: /Delete all progress/ }).click()
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Current status.md'))
  await expect(note).toContainText('0/28')
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Steps/01 Find the canvas.md'))
  await expect(note).toContainText('⏳ Not started')
  await expect(note.getByLabel('My notes')).toHaveValue('')
})

test('one backup file brings back progress and notes after the browser data is gone', async ({ page }) => {
  // The home page says where everything is kept, once.
  await page.goto('./#/games')
  const storage = page.getByRole('note')
  await expect(storage).toContainText('kept only in this browser')
  await storage.getByRole('button', { name: 'Got it' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Workshop', level: 1 })).toBeVisible()
  await expect(page.getByRole('note')).toHaveCount(0)

  await passFirstSnakeStep(page)
  const note = page.getByRole('main').last()
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Steps/01 Find the canvas.md'))
  await note.getByLabel('My notes').fill('ctx is the brush.')
  await note.getByRole('button', { name: 'Save my notes' }).click()
  await expect(note.getByRole('status')).toHaveText('Saved')

  await page.goto('./#/settings')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()])
  expect(download.suggestedFilename()).toMatch(/^learn-platform-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const backup = await download.path()

  await page.getByRole('button', { name: 'Reset all data' }).click()
  await page.getByRole('button', { name: /Delete all progress/ }).click()
  await page.locator('input[type="file"]').setInputFiles(backup)
  await expect(page.getByText('Backup restored.')).toBeVisible()

  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Current status.md'))
  await expect(note).toContainText('1/28')
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Steps/01 Find the canvas.md'))
  await expect(note.getByLabel('My notes')).toHaveValue('ctx is the brush.')
})

test('switching the interface language keeps one vault; a reset builds it in the new language', async ({ page }) => {
  await page.goto('./#/memory')
  const tree = page.getByRole('navigation', { name: 'Memory vault' })
  await expect(tree.getByRole('button', { name: '00 Read me' })).toBeVisible()
  await page.evaluate(() => localStorage.setItem('lp.lang', JSON.stringify('tr')))
  await page.reload()
  const agac = page.getByRole('navigation', { name: 'Hafıza kasası' })
  await expect(agac.getByRole('button', { name: '00 Read me' })).toBeVisible()
  await expect(agac.getByRole('button', { name: '00 Beni oku' })).toHaveCount(0)
  await page.goto('./#/settings')
  await page.getByRole('button', { name: 'Tüm verileri sıfırla' }).click()
  await page.getByRole('button', { name: /Bu cihazdaki tüm ilerleme/ }).click()
  await page.goto('./#/memory')
  await expect(agac.getByRole('button', { name: '00 Beni oku' })).toBeVisible()
  await expect(agac.getByRole('button', { name: '00 Read me' })).toHaveCount(0)
})

test('Maymun fills the vault as the learner talks, without showing its memory block', async ({ page }) => {
  const stepNote = 'Games/Snake/Steps/01 Find the canvas.md'
  const statusNote = 'Games/Snake/Current status.md'
  const sent: { messages: { role: string; content: string }[] }[] = []
  const memory = JSON.stringify([
    { file: stepNote, section: 'struggled', add: 'Thought the canvas draws by itself; it needs ctx.' },
    { file: statusNote, section: 'now', set: 'Painting the board, step 1.' },
    { file: statusNote, section: 'progress', set: 'not Maymun’s to write' },
  ])
  const answer = `The canvas is paper, **ctx** is the brush.\n\n<memory>${memory}</memory>`
  const summary = JSON.stringify({ asked: ['What ctx is'], learned: ['ctx is the brush'], hard: [], done: ['Painted the board'], next: 'Draw the grid.' })
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON() as { messages: { role: string; content: string }[] }
    const summing = body.messages[0].content.startsWith('You sum up a finished tutoring session')
    if (!summing) sent.push(body)
    const text = summing ? summary : answer
    const pieces = [text.slice(0, 50), text.slice(50, 70), text.slice(70)]
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: pieces.map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`).join('') + 'data: [DONE]\n\n',
    })
  })
  await page.goto('./#/games/snake/01-canvas')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } })))
  await page.reload()
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  await popup.getByRole('textbox', { name: 'Your question' }).fill('What is ctx?')
  await popup.getByRole('textbox', { name: 'Your question' }).press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('The canvas is paper, ctx is the brush.')
  await expect(popup.locator('.markdown').filter({ hasText: '<memory' })).toHaveCount(0)
  await expect(popup).toContainText('Noted in memory:')

  // The model got the notes and where it may write.
  const system = sent[0].messages[0].content
  expect(system).toContain(`<note path="${stepNote}">`)
  expect(system).toContain(`- ${statusNote}: now (set), next (set), questions (add)`)

  // What Maymun wrote is in the vault; what it may not write is not.
  await popup.getByRole('link', { name: '01 Find the canvas' }).click()
  const note = page.getByRole('main').last()
  await expect(note).toContainText('Thought the canvas draws by itself; it needs ctx.')
  await page.goto('./#/memory?f=' + encodeURIComponent(statusNote))
  await expect(note).toContainText('Painting the board, step 1.')
  await expect(note).not.toContainText('not Maymun’s to write')
  await expect(note).toContainText('0/28')

  // A new chat sums up the session into a note next to the project's status, linked from it. The chat stayed open
  // on the memory pages (one conversation for the whole app).
  await page.goto('./#/games/snake/01-canvas')
  await expect(popup).toBeVisible()
  await popup.getByRole('button', { name: 'New chat (Maymun still remembers the earlier pages)' }).click()
  await page.goto('./#/memory?f=' + encodeURIComponent(statusNote))
  await expect(note).toContainText('Draw the grid.')
  await note.getByRole('link', { name: /^\d{4}-\d{2}-\d{2} \d{2}\.\d{2}$/ }).click()
  await expect(note).toContainText('What ctx is')
  await expect(note).toContainText('Painted the board')
  const session = decodeURIComponent(new URL(page.url()).hash.split('f=')[1])

  // Resetting all data takes back what Maymun wrote, the session note and the conversation.
  await popup.getByRole('button', { name: 'Close' }).click()
  await page.goto('./#/settings')
  await page.getByRole('button', { name: 'Reset all data' }).click()
  await page.getByRole('button', { name: /Delete all progress/ }).click()
  await page.goto('./#/memory?f=' + encodeURIComponent(stepNote))
  await expect(note).toContainText('⏳ Not started')
  await expect(note).not.toContainText('Thought the canvas draws by itself')
  await page.goto('./#/memory?f=' + encodeURIComponent(statusNote))
  await expect(note).toContainText('0/28')
  await expect(note).not.toContainText('Painting the board, step 1.')
  await expect(note).not.toContainText('Draw the grid.')
  await page.goto('./#/memory?f=' + encodeURIComponent(session))
  await expect(note).not.toContainText('What ctx is')
  await page.goto('./#/games/snake/01-canvas')
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  await expect(popup.locator('.markdown')).toHaveCount(0)
})

test('the live Obsidian copy: notes go to the folder, My notes written there come back', async ({ page }) => {
  test.skip(isMobile(page), 'one run is enough')
  // It copies and reads back the whole vault several times: slow when the machine is busy with other tests.
  test.slow()
  // The bridge is a plain script served with the site; it has no type declarations.
  // @ts-expect-error untyped module
  const { createBridge, parseArgs, VAULT_FOLDER } = await import('../public/maymun-bridge.mjs')
  const { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const vault = mkdtempSync(join(tmpdir(), 'lp-obsidian-'))
  const key = 'maymun-e2e-key'
  const bridge = createBridge(parseArgs(['--vault', vault]), key)
  const port: number = await new Promise((resolve) => bridge.listen(0, '127.0.0.1', () => resolve(bridge.address().port)))
  try {
    // The app talks to the bridge on its usual port; this test's bridge listens on another one.
    await page.route('http://127.0.0.1:8787/v1/vault', (route) => route.continue({ url: `http://127.0.0.1:${port}/v1/vault` }))
    await page.goto('./#/memory')
    // A key saved back when the bridge was one of Maymun's services still works.
    await page.evaluate((key) => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'bridge', keys: { bridge: key } })), key)
    await page.reload()
    await expect(page.getByLabel('Bridge key')).toHaveValue(key)
    // It is kept under the copy's own name, so it stays after Maymun's settings drop the old service.
    expect(await page.evaluate(() => localStorage.getItem('lp.vault.mirror'))).toContain(key)
    await expect(page.getByRole('link', { name: 'maymun-bridge.mjs' })).toHaveAttribute('download', '')
    await page.getByRole('button', { name: 'Turn on' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Copying into' })).toContainText(VAULT_FOLDER)
    const root = join(vault, VAULT_FOLDER)
    const snakeStatus = join(root, 'Games', 'Snake', 'Current status.md')
    await expect.poll(() => existsSync(snakeStatus), { timeout: 15_000 }).toBe(true)
    expect(existsSync(join(vault, '.obsidian', 'graph.json'))).toBe(true)

    // Written in Obsidian, read back when the page is opened again.
    const disk = readFileSync(snakeStatus, 'utf8')
    writeFileSync(snakeStatus, disk.replace(/## My notes\n[\s\S]*$/, '## My notes\nFrom Obsidian.\n'))
    await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Current status.md'))
    await page.reload()
    // Reading back goes through every note in the folder: give it time on a busy machine.
    await expect(page.getByRole('main').last().getByLabel('My notes')).toHaveValue('From Obsidian.', { timeout: 15_000 })

    // Written in the app, copied to the folder.
    const note = page.getByRole('main').last()
    await note.getByLabel('My notes').fill('From the app.')
    await note.getByRole('button', { name: 'Save my notes' }).click()
    await expect.poll(() => readFileSync(snakeStatus, 'utf8'), { timeout: 15_000 }).toContain('From the app.')

    // Written in Obsidian while the app writes the same note before reading that back: neither is lost.
    writeFileSync(snakeStatus, readFileSync(snakeStatus, 'utf8').replace(/## My notes\n[\s\S]*$/, '## My notes\nObsidian again.\n'))
    await note.getByLabel('My notes').fill('App again.')
    await note.getByRole('button', { name: 'Save my notes' }).click()
    await expect(note.getByRole('status')).toBeVisible()
    expect(readFileSync(snakeStatus, 'utf8')).toContain('Obsidian again.')
    // Coming back to the page reads the folder at once.
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(note.getByLabel('My notes')).toHaveValue('App again.\n\nObsidian again.', { timeout: 15_000 })
    await expect.poll(() => readFileSync(snakeStatus, 'utf8'), { timeout: 15_000 }).toContain('App again.\n\nObsidian again.')

    // Resetting all data starts the folder over: the skeleton comes back, anything else in it goes.
    const stray = join(root, 'Games', 'Snake', 'Sessions', 'old session.md')
    mkdirSync(join(root, 'Games', 'Snake', 'Sessions'), { recursive: true })
    writeFileSync(stray, 'an old session')
    await page.goto('./#/settings')
    await page.getByRole('button', { name: 'Reset all data' }).click()
    await page.getByRole('button', { name: /Delete all progress/ }).click()
    await expect.poll(() => existsSync(stray), { timeout: 15_000 }).toBe(false)
    await expect.poll(() => existsSync(snakeStatus) && readFileSync(snakeStatus, 'utf8'), { timeout: 15_000 }).toContain('0/28')
    expect(readFileSync(snakeStatus, 'utf8')).not.toContain('From the app.')
  } finally {
    bridge.close()
    rmSync(vault, { recursive: true, force: true })
  }
})

test('coming back: where you were, what is next, and a skill due for review', async ({ page }) => {
  const statusNote = 'Games/Snake/Current status.md'
  const memory = JSON.stringify([
    { file: statusNote, section: 'now', set: 'Board painted, grid next.' },
    { file: statusNote, section: 'next', set: 'Step 2: the grid.' },
  ])
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON() as { messages: { content: string }[] }
    const summing = body.messages[0].content.startsWith('You sum up')
    const text = summing ? '{"asked": [], "learned": [], "hard": [], "done": ["Board"], "next": "Step 2: the grid."}' : `Nice.\n<memory>${memory}</memory>`
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`,
    })
  })
  // The first step was passed ten days ago, so its skills are due for review.
  await page.goto('./#/games/snake/01-canvas')
  await page.evaluate(() => {
    const at = new Date(Date.now() - 10 * 86_400_000).toISOString()
    localStorage.setItem('lp.progress.v1', JSON.stringify({ version: 1, challenges: { 'game:snake/01-canvas': { status: 'passed', passedAt: at, updatedAt: at } } }))
    localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } }))
  })
  await page.reload()
  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const open = async () => {
    if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
    await cat.click()
  }
  await open()
  const welcome = popup.getByRole('note')
  await expect(welcome).toContainText('Welcome back!')
  await expect(welcome).toContainText('Time to review')
  await welcome.getByRole('button', { name: 'One quick question' }).first().click()
  await expect(popup.getByRole('textbox', { name: 'Your question' })).toHaveValue(/^Ask me one quick review question about /)

  // A conversation ends the greeting; after a new chat, it comes back with what Maymun noted.
  await popup.getByRole('textbox', { name: 'Your question' }).press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Nice.')
  await expect(welcome).toHaveCount(0)
  await popup.getByRole('button', { name: 'New chat (Maymun still remembers the earlier pages)' }).click()
  await popup.getByRole('button', { name: 'Close' }).click()
  await open()
  await expect(welcome).toContainText('Last time: Board painted, grid next.')
  await expect(welcome).toContainText('Next: Step 2: the grid.')
  await welcome.getByRole('button', { name: 'Hide' }).click()
  await expect(welcome).toHaveCount(0)
})
