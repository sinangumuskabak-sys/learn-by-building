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
