import { expect, test, type Page } from '@playwright/test'
import { go } from './nav.ts'
import { resolve } from 'node:path'
import { loadGamesFromDisk } from '../src/games/load-node.ts'

const { games } = loadGamesFromDisk(resolve(import.meta.dirname, '../content'))

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

async function tab(page: Page, name: 'Task' | 'Code' | 'Game' | 'Page') {
  if (isMobile(page)) await page.getByRole('tab', { name, exact: true }).click()
}

async function setCode(page: Page, code: string) {
  await tab(page, 'Code')
  const editor = page.locator('.monaco-editor').first()
  await expect(editor).toBeVisible()
  // The finished parts of a step are locked; replacing the whole file needs the lock off.
  const unlock = page.getByRole('button', { name: 'Unlock the whole file' })
  if (await unlock.isVisible()) await unlock.click()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(code)
}

async function run(page: Page) {
  await page.getByRole('button', { name: /^Run/ }).click()
}

const passedBanner = (page: Page) => page.getByRole('status').filter({ hasText: 'Step complete!' })

const step1 = `const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
// my own step one
ctx.fillStyle = '#111'
ctx.fillRect(0, 0, 400, 400)
`

test('games list → step → failing code → passing code → next step keeps my code', async ({ page }) => {
  await go(page, '/games')
  await page.getByRole('link', { name: /Snake/ }).first().click()
  await expect(page).toHaveURL(/\/games\/snake\/01-canvas$/)

  await setCode(page, "const canvas = document.querySelector('p')\n")
  await run(page)
  await expect(page.getByRole('status').filter({ hasText: /checks failing/ })).toBeVisible()

  await setCode(page, step1)
  await run(page)
  await expect(passedBanner(page)).toBeVisible()

  await page.getByRole('link', { name: /Next step/ }).last().click()
  await expect(page).toHaveURL(/\/games\/snake\/02-context$/)
  await tab(page, 'Code')
  await expect(page.locator('.monaco-editor .view-lines')).toContainText('my own step one')

  await go(page, '/games')
  await expect(page.getByText(`1/${games.find((g) => g.id === 'snake')!.steps.length}`)).toBeVisible()
})

test('a crashing game shows the error with its line number', async ({ page }) => {
  await go(page, '/games/snake/01-canvas')
  await setCode(page, 'const a = 1\nmissingFunction()\n')
  await run(page)
  await tab(page, 'Game')
  const alert = page.getByRole('alert').filter({ hasText: 'Your game hit an error' })
  await expect(alert).toContainText('missingFunction is not defined')
  await expect(alert).toContainText('line 2')
})

test('the game cannot reach the site’s storage, but keeps its own saved values between runs', async ({ page }) => {
  await go(page, '/games/snake/01-canvas')
  await page.evaluate(() => {
    localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-secret' } }))
    localStorage.removeItem('runs')
  })
  await setCode(
    page,
    [
      "let leak = 'blocked'",
      "try { leak = String(parent.localStorage.getItem('lp.maymun.ai')) } catch (e) {}",
      "localStorage.setItem('leak', leak + ' / ' + localStorage.getItem('lp.maymun.ai'))",
      "localStorage.setItem('lp.progress.v1', 'overwritten')",
      "localStorage.setItem('runs', String(Number(localStorage.getItem('runs') || 0) + 1))",
      '',
    ].join('\n'),
  )
  await run(page)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('runs'))).toBe('1')
  expect(await page.evaluate(() => localStorage.getItem('leak'))).toBe('blocked / null')
  expect(await page.evaluate(() => localStorage.getItem('lp.progress.v1'))).not.toBe('overwritten')
  // The next run starts with the value the game saved.
  await run(page)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('runs'))).toBe('2')
  await page.evaluate(() => ['leak', 'runs', 'lp.maymun.ai'].forEach((k) => localStorage.removeItem(k)))
})

test('Maymun’s picture of the screen shows the game, which draws its own picture', async ({ page }) => {
  test.skip(isMobile(page), 'the game and the chat are on different tabs on phones')
  await page.route('https://openrouter.ai/api/v1/chat/completions', (route) =>
    route.fulfill({ headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: 'data: [DONE]\n\n' }),
  )
  await go(page, '/games/snake/01-canvas')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } })))
  await page.reload()
  await setCode(page, step1)
  await run(page)
  const frame = page.locator('iframe[title="Game"]')
  const game = (await frame.boundingBox())!
  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  await expect(page.frameLocator('iframe[title="Game"]').locator('canvas')).toBeVisible()
  await expect(async () => {
    await page.mouse.move(game.x + game.width / 2 + Math.random() * 20, game.y + game.height / 2)
    expect((await cat.boundingBox())?.x ?? 0).toBeGreaterThan(game.x + game.width - 100)
  }).toPass({ timeout: 10_000 })
  await cat.click()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  await popup.getByRole('button', { name: 'Take a picture of the screen' }).click()
  await page.getByRole('dialog', { name: 'Choose what to take a picture of' }).click({ position: { x: 20, y: 20 } })
  const shot = popup.getByRole('img', { name: 'Take a picture of the screen' })
  await expect(shot).toBeVisible({ timeout: 15_000 })
  const viewport = page.viewportSize()!
  const pixel = await shot.evaluate(async (img: HTMLImageElement, spot) => {
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0)
    const d = g.getImageData(Math.round(spot.x * c.width), Math.round(spot.y * c.height), 1, 1).data
    return [d[0], d[1], d[2]]
  }, { x: (game.x + game.width / 2) / viewport.width, y: (game.y + game.height / 2) / viewport.height })
  // The board is #111 after Run; without the frame's own picture that spot would not be the game.
  expect(Math.max(...pixel)).toBeLessThan(30)
})

test('the finished game plays with the real keyboard', async ({ page }) => {
  test.skip(isMobile(page), 'keyboard play is a desktop check')
  const snake = games.find((g) => g.id === 'snake')!
  const last = snake.steps.at(-1)!
  await go(page, `/games/snake/${last.id}`)
  await setCode(page, last.solution)
  await run(page)
  await expect(passedBanner(page)).toBeVisible()
  const frame = page.frameLocator('iframe[title="Game"]')
  await expect(frame.locator('canvas')).toBeVisible()
  const game = page.frames().find((f) => f !== page.mainFrame())!
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(600)
  // Top-level `let` is not a window property; a string expression is evaluated in the frame's global scope.
  expect(await game.evaluate('snake[0].y')).toBeGreaterThan(5)
})

for (const game of games) {
  // The checks run in a simulator; this runs the finished game in the real page, where e.g. `let top` throws.
  test(`finished game runs in the real page without errors: ${game.id}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await go(page, `/games/${game.id}/${game.steps[game.steps.length - 1].id}`)
    await tab(page, 'Code')
    await page.getByRole('button', { name: 'Show solution' }).click()
    await page.getByRole('button', { name: /Replace your code/ }).click()
    await run(page)
    await tab(page, game.kind === 'web' ? 'Page' : 'Game')
    if (game.kind === 'web') await expect(page.frameLocator('iframe[title="Page"]').locator('body > *').first()).toBeVisible()
    else await expect(page.frameLocator('iframe[title="Game"]').locator('canvas')).toBeVisible()
    await page.waitForTimeout(500)
    await expect(page.getByRole('alert').filter({ hasText: 'Your game hit an error' })).toHaveCount(0)
    expect(errors).toEqual([])
  })

  for (const step of game.steps) {
    test(`reference solution passes in the browser: ${game.id}/${step.id}`, async ({ page }) => {
      await go(page, `/games/${game.id}/${step.id}`)
      await tab(page, 'Code')
      await page.getByRole('button', { name: 'Show solution' }).click()
      await page.getByRole('button', { name: /Replace your code/ }).click()
      await run(page)
      await expect(passedBanner(page)).toBeVisible({ timeout: 15_000 })
    })
  }
}

test('no horizontal scroll on the games pages', async ({ page }) => {
  for (const path of ['/games', '/games/snake/01-canvas']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('a step opens in four parts, one after another, and the code opens where this step is written', async ({ page }) => {
  await go(page, '/games/snake/06-draw')
  await expect(page.getByTestId('step-part-1')).toContainText('What we are doing')
  await expect(page.getByTestId('step-part-2')).toHaveCount(0)
  for (const [part, title] of [[2, 'The code'], [3, 'What it means'], [4, 'Your turn']] as const) {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByTestId(`step-part-${part}`)).toContainText(title)
  }
  await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0)
  // The newest part is scrolled into view.
  const text = page.locator('[data-maymun="task"]')
  await expect
    .poll(() => text.evaluate((el) => Math.round(el.scrollHeight - el.scrollTop - el.clientHeight)))
    .toBeLessThanOrEqual(1)
  // Opened parts stay open when coming back to the step.
  await go(page, '/games/snake/05-head')
  await go(page, '/games/snake/06-draw')
  await expect(page.getByTestId('step-part-4')).toBeVisible()

  await tab(page, 'Code')
  const code = page.locator('[data-maymun="code"] .view-lines')
  // (Monaco puts a color swatch inside '#111', and a narrow screen wraps the line, so it is found by its start.)
  await expect(code.locator('.view-line').filter({ hasText: 'ctx.fillRect(0, 0' })).toBeInViewport({ timeout: 15_000 })
})

test('the last step is built without given code: only the goal, then the learner’s turn', async ({ page }) => {
  const snake = games.find((g) => g.id === 'snake')!
  await go(page, `/games/snake/${snake.steps.at(-1)!.id}`)
  await expect(page.getByTestId('step-part-1')).toContainText('Build it yourself')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByTestId('step-part-2')).toContainText('Your turn')
  await expect(page.getByTestId('step-part-2')).toContainText('No code is given in this step')
  await expect(page.getByTestId('step-part-3')).toHaveCount(0)
  await expect(page.getByText('The code', { exact: true })).toHaveCount(0)
})

test('a guess before running shows whether it was right, and a failing check comes with a hint', async ({ page }) => {
  await go(page, '/games/snake/08-loop')
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue' }).click()
  const predict = page.getByTestId('predict')
  await predict.getByRole('button', { name: 'Walk slowly to the right' }).click()
  await expect(predict.getByRole('status')).toContainText('Not quite.')
  await predict.getByRole('button', { name: 'Shoot off to the right in a blink' }).click()
  await expect(predict.getByRole('status')).toContainText('Right!')
  await run(page)
  await tab(page, 'Game')
  await expect(page.getByTestId('hint-box')).toContainText('requestAnimationFrame(loop)')
})

test('the finished parts of the code are locked until the learner unlocks them', async ({ page }) => {
  await go(page, '/games/snake/02-context')
  await tab(page, 'Code')
  const code = page.locator('[data-maymun="code"] .view-lines')
  await code.getByText('// Snake, step by step.').click()
  await page.keyboard.type('zz')
  await expect(page.locator('.monaco-editor .monaco-editor-overlaymessage')).toContainText('This part is already done')
  await expect(code).not.toContainText('zz')
  // A new line can be opened right after the finished code.
  await page.locator('[data-maymun="code"] .view-line').last().click()
  await page.keyboard.press('ArrowLeft') // to the end of the last finished line
  await page.keyboard.press('Enter')
  await page.keyboard.insertText('// a new line')
  await expect(code).toContainText('// a new line')
  // The empty line under the finished code is where this step is written.
  await page.locator('[data-maymun="code"] .view-line').last().click()
  await page.keyboard.insertText("const ctx = canvas.getContext('2d')")
  await run(page)
  await expect(passedBanner(page)).toBeVisible()

  await tab(page, 'Code')
  await page.getByRole('button', { name: 'Unlock the whole file' }).click()
  await code.getByText('// Snake, step by step.').click()
  await page.keyboard.press('End')
  await page.keyboard.insertText(' zz')
  await expect(code).toContainText('step by step. zz')
})

test('a web project shows the page as it is typed and checks it in the page itself', async ({ page }) => {
  await go(page, '/games/business-card/01-heading')
  await tab(page, 'Code')
  await page.locator('[data-maymun="code"] .view-line').nth(7).click()
  await page.keyboard.insertText('<h1>Grace Hopper</h1>')
  await tab(page, 'Page')
  await expect(page.frameLocator('iframe[title="Page"]').locator('h1')).toHaveText('Grace Hopper')
  await run(page)
  await expect(passedBanner(page)).toBeVisible()
  // The finished card can be seen before starting.
  await tab(page, 'Task')
  await page.getByRole('button', { name: 'See the finished project' }).click()
  await expect(page.frameLocator('dialog iframe').locator('.card h1')).toHaveText('Ada Lovelace')
})

test('Maymun peeks into the panel under the pointer at its middle, its popup stays on screen, and it can be hidden', async ({ page }) => {
  await go(page, '/games/snake/01-canvas')
  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  await expect(cat).toBeVisible()
  const viewport = page.viewportSize()!

  if (!isMobile(page)) {
    // The cat follows the pointer to the game panel (inside the iframe) and to the checks below it, and sits at the
    // middle of the panel's height wherever the pointer is inside it.
    const game = page.locator('[data-maymun="game"]')
    const gameBox = (await game.boundingBox())!
    const catMiddle = async () => {
      const box = (await cat.boundingBox())!
      return Math.round(box.y + box.height / 2)
    }
    // The game frame reports the pointer once its page has loaded; keep moving until it does.
    await expect(page.frameLocator('iframe[title="Game"]').locator('canvas')).toBeVisible()
    await expect(async () => {
      await page.mouse.move(gameBox.x + gameBox.width / 2 + Math.random() * 20, gameBox.y + 60)
      expect((await cat.boundingBox())?.x ?? 0).toBeGreaterThan(gameBox.x + gameBox.width - 100)
    }).toPass({ timeout: 10_000 })
    await expect.poll(catMiddle).toBeCloseTo(gameBox.y + gameBox.height / 2, -1)
    await page.mouse.move(gameBox.x + gameBox.width / 2, gameBox.y + gameBox.height - 20, { steps: 4 })
    await expect.poll(catMiddle).toBeCloseTo(gameBox.y + gameBox.height / 2, -1)
    const checks = (await page.locator('[data-maymun="results"]').boundingBox())!
    await page.mouse.move(checks.x + 40, checks.y + checks.height - 10)
    await expect.poll(async () => (await cat.boundingBox())!.y).toBeGreaterThan(checks.y)
  }

  // On phones the cat moves along with the tabs.
  await tab(page, 'Code')
  // Opened from wherever the cat is, the whole popup is visible.
  await cat.click()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  await expect(popup).toContainText('Code (game.js)')
  const box = (await popup.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)

  await popup.getByRole('button', { name: 'Hide Maymun' }).click()
  await expect(cat).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.maymun-head')).toHaveCount(0)

  await go(page, '/settings')
  await page.getByRole('radiogroup', { name: 'Maymun the cat' }).getByRole('radio', { name: 'Show' }).click()
  await expect(page.getByRole('button', { name: 'Ask Maymun about this panel' })).toBeVisible()
})

test('Maymun chats about the panel with the learner’s own key, keeps the conversation and its size', async ({ page }) => {
  const sse = (events: object[]) => events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('')
  const sent: Record<string, unknown>[] = []
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    sent.push(route.request().postDataJSON())
    expect(route.request().headers().authorization).toBe('Bearer sk-or-test')
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: sse([{ choices: [{ delta: { content: 'Try **moving** ' } }] }, { choices: [{ delta: { content: 'the snake.' } }] }]) + 'data: [DONE]\n\n',
    })
  })
  await page.route('https://api.anthropic.com/v1/messages*', async (route) => {
    sent.push(route.request().postDataJSON())
    expect(route.request().headers()['x-api-key']).toBe('sk-ant-test')
    const message = { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } }
    const events = [
      { type: 'message_start', message },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Claude says hi.' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 4 } },
      { type: 'message_stop' },
    ]
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''),
    })
  })

  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  // Opens the chat about the code: on desktop the pointer goes over the editor first, on phones the tab does it.
  const askAboutCode = async () => {
    await tab(page, 'Code')
    if (!isMobile(page)) {
      const code = (await page.locator('[data-maymun="code"]').boundingBox())!
      await page.mouse.move(code.x + code.width / 2, code.y + code.height / 2)
      await expect.poll(async () => (await cat.boundingBox())?.x ?? 0).toBeGreaterThan(code.x + code.width - 100)
    }
    await cat.click()
  }
  await go(page, '/games/snake/01-canvas')
  await askAboutCode()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  await expect(question).toBeDisabled()

  // First time: pick a service and add a key right in the chat.
  await popup.getByLabel('Service').selectOption('openrouter')
  await popup.getByLabel('API key').fill('sk-or-test')
  await popup.getByRole('button', { name: 'Save' }).click()
  await question.fill('What do I do here?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Try moving the snake.')
  await expect(popup.locator('.markdown strong')).toHaveText('moving')
  const first = sent[0] as { model: string; messages: { role: string; content: string }[] }
  expect(first.model).toBe('openrouter/free')
  expect(first.messages[0].role).toBe('system')
  expect(first.messages[0].content).toContain('Code (game.js)')
  expect(first.messages[0].content).toContain('# This project: Snake')
  // Each question carries where it was asked.
  expect(first.messages[1]).toEqual({ role: 'user', content: '[code panel, step 01-canvas, page "Snake"] What do I do here?' })

  // A picture of the screen goes along with the next question (a click takes the whole screen); Escape only cancels it.
  const camera = popup.getByRole('button', { name: 'Take a picture of the screen' })
  await camera.click()
  const snip = page.getByRole('dialog', { name: 'Choose what to take a picture of' })
  await page.keyboard.press('Escape')
  await expect(snip).toHaveCount(0)
  await expect(popup).toBeVisible()
  await camera.click()
  await expect(popup).toBeHidden()
  await snip.click({ position: { x: 20, y: 20 } })
  await expect(popup.getByText('This picture goes with your next question:')).toBeVisible({ timeout: 15_000 })
  await question.press('Enter')
  await expect(popup.locator('.markdown')).toHaveCount(2)
  const withShot = sent[1] as { messages: { content: unknown }[] }
  const shotContent = withShot.messages.at(-1)!.content as { type: string; text?: string; image_url?: { url: string } }[]
  expect(shotContent[0]).toEqual({ type: 'text', text: '[code panel, step 01-canvas, page "Snake"] Look at this picture.' })
  expect(shotContent[1].image_url!.url).toMatch(/^data:image\/(png|jpeg);base64,/)

  // Resizing from the lower left corner grows the box to the left, and the size is kept.
  const before = (await popup.boundingBox())!
  if (!isMobile(page)) {
    const grip = popup.getByRole('separator', { name: 'Resize the chat box' })
    const g = (await grip.boundingBox())!
    await page.mouse.move(g.x + 8, g.y + 8)
    await page.mouse.down()
    await page.mouse.move(g.x - 92, g.y + 48, { steps: 5 })
    await page.mouse.up()
    await expect.poll(async () => Math.round((await popup.boundingBox())!.width)).toBe(Math.round(before.width) + 100)
  }
  const size = (await popup.boundingBox())!

  // After a reload the conversation and the size are still there.
  await page.reload()
  await askAboutCode()
  await expect(popup.locator('.markdown').last()).toHaveText('Try moving the snake.')
  // The picture itself is gone after a reload (it is big); the chat still says there was one.
  await expect(popup.getByText('Screenshot (kept only until the page is closed)')).toBeVisible()
  const after = (await popup.boundingBox())!
  expect(Math.round(after.width)).toBe(Math.round(size.width))
  expect(Math.round(after.height)).toBe(Math.round(size.height))

  // Claude through Anthropic's SDK in the browser: the whole conversation goes along.
  // The chat stays open on another page (one conversation for the whole app); close it to use the settings.
  await go(page, '/settings')
  await expect(popup).toBeVisible()
  await popup.getByRole('button', { name: 'Close' }).click()
  const setup = page.locator('#main form').filter({ has: page.getByLabel('API key') })
  await setup.getByLabel('Service').selectOption('anthropic')
  await setup.getByLabel('API key').fill('sk-ant-test')
  await setup.getByRole('button', { name: 'Save' }).click()
  await go(page, '/games/snake/01-canvas')
  await askAboutCode()
  await question.fill('And now?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Claude says hi.')
  const claude = sent[2] as { model: string; system: string; messages: { role: string; content: string }[] }
  expect(claude.model).toBe('claude-opus-5')
  expect(claude.system).toContain('Code (game.js)')
  expect(claude.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user'])

  // A new chat keeps every message on screen; only what goes to the model word for word starts over.
  await popup.getByRole('button', { name: 'New chat (Maymun still remembers the earlier pages)' }).click()
  await expect(popup.getByRole('separator').filter({ hasText: 'New chat' })).toHaveCount(0)
  await question.fill('Fresh start?')
  await question.press('Enter')
  await expect(popup.getByRole('separator').filter({ hasText: 'New chat' })).toBeVisible()
  await expect(popup.locator('.markdown')).toHaveCount(4)
  const fresh = sent.at(-1) as { messages: { role: string; content: string }[] }
  expect(fresh.messages).toEqual([{ role: 'user', content: '[code panel, step 01-canvas, page "Snake"] Fresh start?' }])
})

test('Maymun knows when the learner moves to another page, and what that page is for', async ({ page }) => {
  const sent: { messages: { role: string; content: string }[] }[] = []
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    sent.push(route.request().postDataJSON())
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: `data: ${JSON.stringify({ choices: [{ delta: { content: 'ok' } }] })}\n\ndata: [DONE]\n\n`,
    })
  })
  await go(page, '/')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } })))
  await page.reload()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  const ask = async (text: string) => {
    await question.fill(text)
    await question.press('Enter')
    await expect(popup.locator('.markdown').last()).toHaveText('ok')
  }
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  await ask('What is here?')
  expect(sent[0].messages[0].content).toContain('The Workshop (home page)')

  // The chat stays open on another page of the app, and knows it: the header, the page's text and what it is for.
  await go(page, '/settings')
  await expect(popup).toContainText('Settings')
  // The page's title is set once it has rendered; on a busy machine that can come after the chat's header.
  await expect(page).toHaveTitle('Settings · Learn by Building')
  await ask('And what can I do here?')
  const system = sent[1].messages[0].content
  expect(system).toContain('"Settings" (/settings): Settings: theme, language')
  expect(system).toContain('They moved here from "Workshop" since their previous question.')
  expect(system).toContain('Reset all data')
  expect(sent[1].messages.at(-1)!.content).toBe('[page panel, page "Settings"] And what can I do here?')

  // Into a game: still the same conversation, open, with a line where the project changed.
  await go(page, '/games/snake/01-canvas')
  await expect(page).toHaveTitle('Snake · Learn by Building')
  await expect(popup).toBeVisible()
  await expect(popup.getByText('What is here?')).toBeVisible()
  await ask('And in the game?')
  await expect(popup.getByRole('separator').filter({ hasText: 'Snake' })).toBeVisible()
  expect(sent[2].messages.map((m) => m.content).slice(1)).toEqual([
    '[page panel, page "Workshop"] What is here?',
    'ok',
    '[page panel, page "Settings"] And what can I do here?',
    'ok',
    expect.stringMatching(/, page "Snake"\] And in the game\?$/),
  ])
  await page.reload()
  if (isMobile(page)) await tab(page, 'Code')
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  await expect(popup.getByText('What is here?')).toBeVisible()
})

test('Maymun asks for the map of the whole app when the question needs it, and answers with it', async ({ page }) => {
  const systems: string[] = []
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const system = (route.request().postDataJSON() as { messages: { content: string }[] }).messages[0].content
    systems.push(system)
    // Without the map, this model asks for it (in two pieces, as a stream may cut it); with it, it answers.
    const pieces = system.includes('# Learn by Building: the map of the app') ? ['Try [Snake](/games/snake).'] : ['<app-', 'map/>']
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: [...pieces.map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`), 'data: [DONE]\n\n'].join(''),
    })
  })
  await go(page, '/')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } })))
  await page.reload()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  const question = popup.getByRole('textbox', { name: 'Your question' })
  await question.fill('Which game should I play to learn?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Try Snake.')
  await expect(popup.getByRole('link', { name: 'Snake' })).toHaveAttribute('href', '/games/snake')
  await expect(popup).not.toContainText('app-map')
  // Only the second request carries the map, and it lists the games with their links.
  expect(systems).toHaveLength(2)
  expect(systems[0]).toContain('answer with exactly `<app-map/>`')
  expect(systems[0]).not.toContain('# Learn by Building: the map of the app')
  expect(systems[1]).toContain('(/games/snake)')
  expect(systems[1]).toContain('do not ask for it again')
})

test('OmniRoute: models grouped by connection, the best active one answers, the next takes over', async ({ page }) => {
  const asked: string[] = []
  await page.route('http://localhost:20128/v1/models', (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: { object: 'list', data: ['cc/claude-sonnet-4-5', 'cc/claude-opus-4-7', 'gemini-cli/gemini-3.1-pro', 'gemini-cli/gemini-2.5-flash'].map((id) => ({ id, object: 'model' })) },
    }),
  )
  await page.route('http://localhost:20128/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON() as { model: string }
    asked.push(body.model)
    expect(route.request().headers().authorization).toBe('Bearer omni-key')
    // Claude's connection in OmniRoute is down: the next active model takes over.
    if (body.model.startsWith('cc/')) return route.fulfill({ status: 503, headers: { 'access-control-allow-origin': '*' }, json: { error: { message: 'Claude connection unavailable' } } })
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: `data: ${JSON.stringify({ choices: [{ delta: { content: 'Gemini here.' } }] })}\n\ndata: [DONE]\n\n`,
    })
  })
  await go(page, '/settings')
  const setup = page.locator('#main form').filter({ has: page.getByLabel('Service') })
  await setup.getByLabel('Service').selectOption('omniroute')
  await expect(setup.getByRole('link', { name: 'OmniRoute is open source: its page on GitHub' })).toHaveAttribute('href', 'https://github.com/diegosouzapw/OmniRoute')
  await setup.getByLabel('API key').fill('omni-key')
  await setup.getByRole('button', { name: 'Save' }).click()
  const claude = setup.locator('fieldset').filter({ hasText: 'Claude (Claude Code)' })
  const gemini = setup.locator('fieldset').filter({ hasText: 'Gemini (Gemini CLI)' })
  await claude.getByRole('button', { name: 'all' }).click()
  await gemini.getByRole('button', { name: 'all' }).click()
  await expect(setup).toContainText('Order: cc/claude-opus-4-7 → gemini-cli/gemini-3.1-pro → cc/claude-sonnet-4-5 → gemini-cli/gemini-2.5-flash')
  // Turning one off takes it out of the order.
  await claude.getByRole('checkbox', { name: 'cc/claude-sonnet-4-5' }).uncheck()
  await expect(setup).toContainText('Order: cc/claude-opus-4-7 → gemini-cli/gemini-3.1-pro → gemini-cli/gemini-2.5-flash')

  await go(page, '/games/snake/01-canvas')
  if (isMobile(page)) await tab(page, 'Code')
  // The step's panels first: the cat opens a chat about the panel it sits on.
  await expect(page.locator('[data-maymun="code"]')).toBeVisible()
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  await popup.getByRole('textbox', { name: 'Your question' }).fill('Hello?')
  await popup.getByRole('textbox', { name: 'Your question' }).press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Gemini here.')
  await expect(popup).toContainText('answered by gemini-cli/gemini-3.1-pro')
  expect(asked).toEqual(['cc/claude-opus-4-7', 'gemini-cli/gemini-3.1-pro'])
})

test('Maymun keeps one conversation across panels, steps, projects and reloads', async ({ page }) => {
  const sent: { messages: { role: string; content: string }[] }[] = []
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    sent.push(route.request().postDataJSON())
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: `data: ${JSON.stringify({ choices: [{ delta: { content: 'ok' } }] })}\n\ndata: [DONE]\n\n`,
    })
  })
  // The conversation from before projects existed moves into the conversation.
  await go(page, '/games/snake/01-canvas')
  await page.evaluate(() => {
    localStorage.setItem('lp.maymun.chat', JSON.stringify([{ role: 'user', text: 'An old question' }, { role: 'assistant', text: 'An old answer' }]))
    localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } }))
  })
  await page.reload()

  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  const openOn = async (panel: 'task' | 'code', name: 'Task' | 'Code') => {
    await tab(page, name)
    if (!isMobile(page)) {
      const box = (await page.locator(`[data-maymun="${panel}"]`).boundingBox())!
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await expect.poll(async () => (await cat.boundingBox())?.x ?? 0).toBeGreaterThan(box.x + box.width - 100)
    }
    await cat.click()
  }
  const ask = async (text: string) => {
    await question.fill(text)
    await question.press('Enter')
    await expect(popup.locator('.markdown').last()).toHaveText('ok')
  }
  const lastUserMessages = () => sent.at(-1)!.messages.filter((m) => m.role === 'user').map((m) => m.content)

  await openOn('code', 'Code')
  await expect(popup).toContainText('Snake')
  await expect(popup).toContainText('An old question')
  await ask('Why is it black?')
  await popup.getByRole('button', { name: 'Close' }).click()

  // Another panel of the same step: the same conversation, and the model knows where each question came from.
  await openOn('task', 'Task')
  await expect(popup).toContainText('Why is it black?')
  await ask('What does this sentence mean?')
  expect(lastUserMessages()).toEqual([
    'An old question',
    '[code panel, step 01-canvas, page "Snake"] Why is it black?',
    '[task panel, step 01-canvas, page "Snake"] What does this sentence mean?',
  ])

  // The next step of the same game keeps the chat open and the conversation going.
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page).toHaveURL(/02-context/)
  await expect(popup).toBeVisible()
  await ask('And here?')
  expect(lastUserMessages().at(-1)).toMatch(/^\[(task|code) panel, step 02-context, page "Snake"\] And here\?$/)

  // Another game: the same conversation goes on, the chat stays open, a line marks the new project.
  await go(page, '/games/pong/01-court')
  await expect(page).toHaveTitle('Pong · Learn by Building')
  await expect(popup).toBeVisible()
  await expect(popup).toContainText('Why is it black?')
  await ask('Pong question')
  await expect(popup.getByRole('separator').filter({ hasText: 'Pong' })).toBeVisible()
  expect(lastUserMessages().at(-2)).toMatch(/step 02-context, page "Snake"\] And here\?$/)
  expect(lastUserMessages().at(-1)).toMatch(/^\[(task|code) panel, step 01-court, page "Pong"\] Pong question$/)

  // Back in Snake after a reload, everything is still there; a new chat keeps it on screen, the model starts clean.
  await go(page, '/games/snake/02-context')
  await page.reload()
  await openOn('code', 'Code')
  await expect(popup).toContainText('What does this sentence mean?')
  await expect(popup).toContainText('Pong question')
  await popup.getByRole('button', { name: 'New chat (Maymun still remembers the earlier pages)' }).click()
  await ask('Fresh start')
  await expect(popup).toContainText('Why is it black?')
  expect(lastUserMessages()).toEqual(['[code panel, step 02-context, page "Snake"] Fresh start'])
})

test('Maymun talks to a server on the learner’s computer (OmniRoute, Ollama)', async ({ page }) => {
  const sent: { auth?: string; body: { model: string; messages: { role: string; content: string }[] } }[] = []
  await page.route('http://127.0.0.1:11434/v1/chat/completions', async (route) => {
    sent.push({ auth: route.request().headers().authorization, body: route.request().postDataJSON() })
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
      body: 'data: {"choices":[{"delta":{"content":"Local hello."}}]}\n\ndata: [DONE]\n\n',
    })
  })
  await page.route('http://127.0.0.1:8787/v1/chat/completions', (route) => route.abort('connectionrefused'))
  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  const askAboutCode = async () => {
    await go(page, '/games/snake/01-canvas')
    await tab(page, 'Code')
    if (!isMobile(page)) {
      const code = (await page.locator('[data-maymun="code"]').boundingBox())!
      await page.mouse.move(code.x + code.width / 2, code.y + code.height / 2)
      await expect.poll(async () => (await cat.boundingBox())?.x ?? 0).toBeGreaterThan(code.x + code.width - 100)
    }
    await cat.click()
  }

  // An OpenAI-compatible server with its own address and model, and no key.
  await go(page, '/settings')
  const setup = page.locator('#main form').filter({ has: page.getByLabel('Service') })
  // OmniRoute comes first; subscriptions are connected there, not through a service of their own.
  await expect(setup.getByLabel('Service').locator('option').first()).toHaveText('OmniRoute (everything you connected there)')
  await expect(setup.getByLabel('Service').locator('option[value="bridge"]')).toHaveCount(0)
  await setup.getByLabel('Service').selectOption('custom')
  await setup.getByLabel('Address').fill('http://127.0.0.1:11434/v1/')
  await setup.getByLabel('Model').fill('llama3.2')
  await setup.getByRole('button', { name: 'Save' }).click()
  await askAboutCode()
  await question.fill('Hi')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Local hello.')
  expect(sent[0].auth).toBeUndefined()
  expect(sent[0].body.model).toBe('llama3.2')
  // Maymun's teaching instructions go along, with the other panels of the step.
  expect(sent[0].body.messages[0].content).toContain('## How you teach')
  expect(sent[0].body.messages[0].content).toContain('<panel name="task"')

  // A server that is not running is named as the problem. (The chat would stay open across pages: close it.)
  await popup.getByRole('button', { name: 'Close' }).click()
  await go(page, '/settings')
  await setup.getByLabel('Address').fill('http://127.0.0.1:8787/v1')
  await setup.getByRole('button', { name: 'Save' }).click()
  await askAboutCode()
  await question.fill('Hi again')
  await question.press('Enter')
  await expect(popup.getByRole('alert')).toContainText('Could not reach http://127.0.0.1:8787/v1')
})

test('Maymun’s conversation never ends: old pages go as a summary and an index, and it reads one when it needs it', async ({ page }) => {
  const sent: { messages: { role: string; content: string }[] }[] = []
  const summaries: string[] = []
  const reply = (text: string) => ({
    headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' },
    body: `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`,
  })
  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const body = route.request().postDataJSON() as { messages: { role: string; content: string }[] }
    const system = body.messages[0].content
    if (system.startsWith('You keep the running summary')) {
      summaries.push(body.messages[1].content)
      const titles = Object.fromEntries([...body.messages[1].content.matchAll(/<page n="(\d+)"/g)].map((m) => [m[1], `Page ${m[1]} topic`]))
      return route.fulfill(reply(JSON.stringify({ summary: '**Now:** building Snake, closures understood.', titles })))
    }
    sent.push(body)
    // Asked what came first: Maymun asks for page 1, then answers with it.
    const asksFirst = body.messages.at(-1)!.content.endsWith('What did we talk about first?')
    const hasPage = system.includes('# The pages you asked for')
    await route.fulfill(reply(asksFirst && !hasPage ? '<recall pages="1"/>' : hasPage ? 'First we talked about closures.' : 'ok'))
  })
  await go(page, '/')
  // Thirty pages from earlier days, each a question and a long answer.
  await page.evaluate(async () => {
    localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } }))
    const start = Date.now() - 3 * 86_400_000
    const pages = Array.from({ length: 30 }, (_, i) => ({
      n: i + 1,
      messages: [
        { role: 'user', text: i === 0 ? 'What is a closure?' : `Question number ${i}`, tag: { panel: 'code', page: 'Snake', project: 'game:snake' }, at: start + i * 60_000 },
        { role: 'assistant', text: `${i === 0 ? 'A closure keeps its scope. PAGE-ONE-ANSWER ' : ''}${'long answer '.repeat(500)}`, at: start + i * 60_000 + 1 },
      ],
    }))
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lp-maymun', 2)
      request.onupgradeneeded = () => {
        request.result.createObjectStore('threads', { keyPath: 'project' })
        request.result.createObjectStore('pages', { keyPath: 'n' })
        request.result.createObjectStore('meta', { keyPath: 'key' })
      }
      request.onsuccess = () => {
        const tx = request.result.transaction(['pages', 'meta'], 'readwrite')
        for (const p of pages) tx.objectStore('pages').put(p)
        tx.objectStore('meta').put({ key: 'meta', windowFrom: 0, sessionFrom: 60, summary: '', foldedThrough: 0 })
        tx.oncomplete = () => {
          request.result.close()
          resolve()
        }
        tx.onerror = () => reject(tx.error)
      }
    })
  })
  await page.reload()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  // Back after days: the model starts clean; every message is still on screen (the latest pages first).
  await expect(popup.getByText('Question number 29', { exact: true })).toBeVisible()
  await expect(popup.getByText('What is a closure?', { exact: true })).toHaveCount(0)
  await popup.getByRole('button', { name: 'Earlier messages' }).first().click()
  await expect(popup.getByText('Question number 25', { exact: true })).toBeVisible()

  // Opening the chat after the break folds the old pages into the summary in the background, a few at a time.
  await expect.poll(() => summaries.length).toBe(3)
  expect(summaries[0]).toContain('<page n="1"')
  expect(summaries[2]).toContain('<page n="12"')

  await question.fill('What did we talk about first?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('First we talked about closures.')
  await expect(popup.locator('.markdown').filter({ hasText: '<recall' })).toHaveCount(0)
  await expect(popup.getByText('Looked at earlier pages: p.1')).toBeVisible()
  // First request: only the new question word for word; the old pages as the summary and an index (titled where
  // summed up, the start of the question where not yet). Second: page 1 itself.
  const first = sent[0].messages[0].content
  expect(sent[0].messages.slice(1)).toEqual([{ role: 'user', content: '[page panel, page "Workshop"] What did we talk about first?' }])
  expect(first).toContain('**Now:** building Snake, closures understood.')
  expect(first).toMatch(/- p\.1 · \d{4}-\d{2}-\d{2} · Snake · Page 1 topic/)
  expect(first).toMatch(/- p\.30 · \d{4}-\d{2}-\d{2} · Snake · "Question number 29"/)
  expect(first).not.toContain('PAGE-ONE-ANSWER')
  expect(sent[1].messages[0].content).toContain('<page n="1"')
  expect(sent[1].messages[0].content).toContain('PAGE-ONE-ANSWER')

  // The latest exchange goes word for word with the next question.
  await question.fill('And now?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('ok')
  expect(sent.at(-1)!.messages.slice(1).map((m) => m.content)).toContain('First we talked about closures.')

  // A question whose words match an old page takes that page along, without Maymun asking for it.
  await question.fill('Explain the closure scope once more')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('ok')
  expect(sent.at(-1)!.messages[0].content).toContain('## Maybe related to this question (found by its words): page 1')
  expect(sent.at(-1)!.messages[0].content).toContain('PAGE-ONE-ANSWER')
  await expect(popup.getByText('Looked at earlier pages: p.1')).toHaveCount(2)

  // A page can be deleted for good (a second click confirms); it is gone after a reload too.
  await expect(popup.getByText('Question number 29', { exact: true })).toBeVisible()
  await popup.getByRole('button', { name: 'Delete page 30 of the conversation' }).click()
  await popup.getByRole('button', { name: 'Delete page 30 for good' }).click()
  await expect(popup.getByText('Question number 29', { exact: true })).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: 'Ask Maymun about this panel' }).click()
  await expect(popup.getByText('Question number 28', { exact: true })).toBeVisible()
  await expect(popup.getByText('Question number 29', { exact: true })).toHaveCount(0)
})

test('the home page and the top bar link to the code on GitHub and ask for a star', async ({ page }) => {
  await go(page, '/')
  const repo = 'https://github.com/sinangumuskabak-sys/learn-platform'
  await expect(page.getByRole('link', { name: 'Star on GitHub' })).toHaveAttribute('href', repo)
  await expect(page.getByRole('link', { name: 'Learn by Building on GitHub: give it a star' })).toHaveAttribute('href', repo)
  await expect(page.getByRole('complementary')).toContainText('free and open source')
})
