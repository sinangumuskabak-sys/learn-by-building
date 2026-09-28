import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'
import { loadGamesFromDisk } from '../src/games/load-node.ts'

const { games } = loadGamesFromDisk(resolve(import.meta.dirname, '../content'))

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

async function tab(page: Page, name: 'Task' | 'Code' | 'Game') {
  if (isMobile(page)) await page.getByRole('tab', { name, exact: true }).click()
}

async function setCode(page: Page, code: string) {
  await tab(page, 'Code')
  const editor = page.locator('.monaco-editor').first()
  await expect(editor).toBeVisible()
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
  await page.goto('./#/games')
  await page.getByRole('link', { name: /Snake/ }).first().click()
  await expect(page).toHaveURL(/#\/games\/snake\/01-canvas$/)

  await setCode(page, "const canvas = document.getElementById('game')\n")
  await run(page)
  await expect(page.getByRole('status').filter({ hasText: /checks failing/ })).toBeVisible()

  await setCode(page, step1)
  await run(page)
  await expect(passedBanner(page)).toBeVisible()

  await page.getByRole('link', { name: /Next step/ }).last().click()
  await expect(page).toHaveURL(/#\/games\/snake\/02-grid$/)
  await tab(page, 'Code')
  await expect(page.locator('.monaco-editor .view-lines')).toContainText('my own step one')

  await page.goto('./#/games')
  await expect(page.getByText('1/11')).toBeVisible()
})

test('a crashing game shows the error with its line number', async ({ page }) => {
  await page.goto('./#/games/snake/01-canvas')
  await setCode(page, 'const a = 1\nmissingFunction()\n')
  await run(page)
  await tab(page, 'Game')
  const alert = page.getByRole('alert').filter({ hasText: 'Your game hit an error' })
  await expect(alert).toContainText('missingFunction is not defined')
  await expect(alert).toContainText('line 2')
})

test('the finished game plays with the real keyboard', async ({ page }) => {
  test.skip(isMobile(page), 'keyboard play is a desktop check')
  const snake = games.find((g) => g.id === 'snake')!
  const last = snake.steps.at(-1)!
  await page.goto(`./#/games/snake/${last.id}`)
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
    await page.goto(`./#/games/${game.id}/${game.steps[game.steps.length - 1].id}`)
    await tab(page, 'Code')
    await page.getByRole('button', { name: 'Show solution' }).click()
    await page.getByRole('button', { name: /Replace your code/ }).click()
    await run(page)
    await tab(page, 'Game')
    await expect(page.frameLocator('iframe[title="Game"]').locator('canvas')).toBeVisible()
    await page.waitForTimeout(500)
    await expect(page.getByRole('alert').filter({ hasText: 'Your game hit an error' })).toHaveCount(0)
    expect(errors).toEqual([])
  })

  for (const step of game.steps) {
    test(`reference solution passes in the browser: ${game.id}/${step.id}`, async ({ page }) => {
      await page.goto(`./#/games/${game.id}/${step.id}`)
      await tab(page, 'Code')
      await page.getByRole('button', { name: 'Show solution' }).click()
      await page.getByRole('button', { name: /Replace your code/ }).click()
      await run(page)
      await expect(passedBanner(page)).toBeVisible({ timeout: 15_000 })
    })
  }
}

test('no horizontal scroll on the games pages', async ({ page }) => {
  for (const path of ['./#/games', './#/games/snake/01-canvas']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('a step opens at the end of its text and code, where the newest part is', async ({ page }) => {
  await page.goto('/#/games/snake/06-body')
  const text = page.locator('[data-maymun="task"]')
  await expect
    .poll(() => text.evaluate((el) => Math.round(el.scrollHeight - el.scrollTop - el.clientHeight)))
    .toBeLessThanOrEqual(1)
  await tab(page, 'Code')
  // The last line of the code (the loop starting the game) is on screen, the first comment is scrolled away.
  const code = page.locator('[data-maymun="code"] .view-lines')
  await expect(code.getByText('requestAnimationFrame(loop)').last()).toBeInViewport()
  await expect(code.getByText('// Snake, step by step.')).not.toBeInViewport()
})

test('Maymun stays in the middle of the right edge, its popup stays on screen, and it can be hidden', async ({ page }) => {
  await page.goto('/#/games/snake/01-canvas')
  const cat = page.getByRole('button', { name: 'Ask Maymun about this panel' })
  await expect(cat).toBeVisible()
  const viewport = page.viewportSize()!

  // The cat stays put at the middle of the right edge wherever the pointer goes; only its eyes follow.
  const middle = async () => {
    const box = (await cat.boundingBox())!
    return { right: Math.round(box.x + box.width), centre: Math.round(box.y + box.height / 2) }
  }
  const start = await middle()
  expect(start.right).toBeGreaterThanOrEqual(viewport.width)
  expect(Math.abs(start.centre - viewport.height / 2)).toBeLessThanOrEqual(2)
  await page.mouse.move(20, viewport.height - 20)
  await page.mouse.move(viewport.width / 2, 100, { steps: 3 })
  expect(await middle()).toEqual(start)

  // The chat is about the panel the learner last clicked in (on phones, the open tab).
  await tab(page, 'Code')
  if (!isMobile(page)) {
    const code = (await page.locator('[data-maymun="code"]').boundingBox())!
    await page.mouse.click(code.x + code.width / 2, code.y + code.height / 2)
  }
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

  await page.goto('/#/settings')
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
      await page.mouse.click(code.x + code.width / 2, code.y + code.height / 2)
    }
    await cat.click()
  }
  await page.goto('/#/games/snake/01-canvas')
  await askAboutCode()
  const popup = page.getByRole('dialog', { name: 'Maymun' })
  const question = popup.getByRole('textbox', { name: 'Your question' })
  await expect(question).toBeDisabled()

  // First time: pick a service and add a key right in the chat.
  await popup.getByLabel('API key').fill('sk-or-test')
  await popup.getByRole('button', { name: 'Save' }).click()
  await question.fill('What do I do here?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Try moving the snake.')
  await expect(popup.locator('.markdown strong')).toHaveText('moving')
  const first = sent[0] as { model: string; messages: { role: string; content: string }[] }
  expect(first.model).toBe('openrouter/auto')
  expect(first.messages[0].role).toBe('system')
  expect(first.messages[0].content).toContain('Code (game.js)')
  expect(first.messages[1]).toEqual({ role: 'user', content: 'What do I do here?' })

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
  expect(shotContent[0]).toEqual({ type: 'text', text: 'Look at this picture.' })
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
  await page.goto('/#/settings')
  await expect(popup).toHaveCount(0)
  const setup = page.locator('#main form').filter({ has: page.getByLabel('API key') })
  await setup.getByLabel('Service').selectOption('anthropic')
  await setup.getByLabel('API key').fill('sk-ant-test')
  await setup.getByRole('button', { name: 'Save' }).click()
  await page.goto('/#/games/snake/01-canvas')
  await askAboutCode()
  await question.fill('And now?')
  await question.press('Enter')
  await expect(popup.locator('.markdown').last()).toHaveText('Claude says hi.')
  const claude = sent[2] as { model: string; system: string; messages: { role: string; content: string }[] }
  expect(claude.model).toBe('claude-opus-5')
  expect(claude.system).toContain('Code (game.js)')
  expect(claude.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user'])

  await popup.getByRole('button', { name: 'Clear the conversation' }).click()
  await expect(popup.locator('.markdown')).toHaveCount(0)
})

test('Maymun talks to a server on the learner’s computer (OmniRoute, Ollama, the bridge)', async ({ page }) => {
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
    await page.goto('/#/games/snake/01-canvas')
    await tab(page, 'Code')
    if (!isMobile(page)) {
      const code = (await page.locator('[data-maymun="code"]').boundingBox())!
      await page.mouse.click(code.x + code.width / 2, code.y + code.height / 2)
    }
    await cat.click()
  }

  // An OpenAI-compatible server with its own address and model, and no key.
  await page.goto('/#/settings')
  const setup = page.locator('#main form').filter({ has: page.getByLabel('Service') })
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

  // The bridge: its setup says how to start it, and a bridge that is not running is named as the problem.
  await page.goto('/#/settings')
  await setup.getByLabel('Service').selectOption('bridge')
  await expect(setup.getByRole('link', { name: 'maymun-bridge.mjs' })).toHaveAttribute('download', '')
  await expect(setup.getByText('node maymun-bridge.mjs', { exact: true })).toBeVisible()
  await setup.getByLabel('Bridge key').fill('maymun-test')
  await setup.getByRole('button', { name: 'Save' }).click()
  const script = await page.request.get('/maymun-bridge.mjs')
  expect(await script.text()).toContain('export function createBridge')
  await askAboutCode()
  await question.fill('Hi again')
  await question.press('Enter')
  await expect(popup.getByRole('alert')).toContainText('Could not reach http://127.0.0.1:8787/v1')
})
