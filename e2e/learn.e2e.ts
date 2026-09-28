import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'
import { loadContentFromDisk } from '../src/content/load-node.ts'
import { runnableTypes } from '../src/content/schema.ts'

const { content } = loadContentFromDisk(resolve(import.meta.dirname, '../content'))
const runnable = content.challenges.filter((c) => runnableTypes.includes(c.type))

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

async function openCodeTab(page: Page) {
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
}

/** Replaces the editor contents. insertText skips Monaco's auto-closing brackets, so the code lands verbatim. */
async function setCode(page: Page, code: string) {
  await openCodeTab(page)
  const editor = page.locator('.monaco-editor').first()
  await expect(editor).toBeVisible()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(code)
}

async function runTests(page: Page) {
  await page.getByRole('button', { name: /Run tests/ }).click()
}

test('the catalog lists all 14 categories', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const categories = page.locator('a[href^="#/c/"]')
  await expect(categories).toHaveCount(14)
})

test('a quiz: a wrong answer shows a hint, other verdicts stay put, passing shows the next challenge', async ({ page }) => {
  await page.goto('./#/learn/loop-basics-quiz')
  const q1 = page.getByRole('group', { name: /How many times/ })
  const q2 = page.getByRole('group', { name: /only even numbers/ })
  await q1.getByLabel('3').check()
  await q2.getByLabel('i += 2').check()
  await page.getByRole('button', { name: 'Check answers' }).click()
  await expect(q1.getByText('Not quite — try again')).toBeVisible()
  await expect(q1.getByText(/grows by 3 each time/)).toBeVisible()
  await expect(q2.getByText('Correct')).toBeVisible()
  const before = (await q2.boundingBox())!.y
  await q1.getByLabel('4').check()
  // Changing an answer hides only that question's verdict and keeps its line, so the questions below do not move.
  expect((await q2.boundingBox())!.y).toBe(before)
  await expect(q2.getByText('Correct')).toBeVisible()
  await page.getByRole('button', { name: 'Check answers' }).click()
  await expect(page.getByText('All answers correct!')).toBeVisible()
  await expect(page.getByRole('link', { name: /Next challenge/ })).toBeInViewport()
})

test('catalog → challenge → failing code → passing code → progress survives a reload', async ({ page }) => {
  await page.goto('./')
  await page.locator('a[href="#/c/programming-fundamentals"]').click()
  await page.getByRole('link', { name: /Iterate odd numbers/ }).click()
  await expect(page).toHaveURL(/#\/learn\/iterate-odd-numbers$/)

  await setCode(page, 'const odds = []\n\n// Only change code below this line\nfor (let i = 0; i < 10; i += 2) odds.push(i)\n')
  await runTests(page)
  await expect(page.getByRole('status').filter({ hasText: /tests failing/ }).first()).toBeVisible()

  await setCode(page, 'const odds = []\n\n// Only change code below this line\nfor (let i = 1; i < 10; i += 2) odds.push(i)\n')
  await runTests(page)
  await expect(page.getByRole('status').filter({ hasText: 'All tests passed' }).first()).toBeVisible()

  await page.reload()
  await openCodeTab(page)
  await expect(page.locator('.monaco-editor .view-lines')).toContainText('i = 1')
  await page.goto('./#/c/programming-fundamentals')
  const row = page.getByRole('link', { name: /Iterate odd numbers/ })
  await expect(row.getByRole('img', { name: 'Completed' })).toBeVisible()
})

for (const challenge of runnable) {
  test(`reference solution passes in the browser: ${challenge.id}`, async ({ page }) => {
    await page.goto(`./#/learn/${challenge.id}`)
    await openCodeTab(page)
    const showSolution = page.getByRole('button', { name: 'Show solution' })
    await showSolution.click()
    await page.getByRole('button', { name: /Replace your code/ }).click()
    await runTests(page)
    await page.getByRole('tab', { name: 'Tests', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: 'All tests passed' }).first()).toBeVisible({
      timeout: 30_000,
    })
  })
}

for (const path of ['./', './#/c/software-architecture', './#/learn/iterate-odd-numbers', './#/skills', './#/settings']) {
  test(`no horizontal scroll: ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('a web challenge’s page cannot reach the site’s storage', async ({ page }) => {
  await page.goto('./#/learn/accessible-button')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-secret' } })))
  await page.reload()
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await page.getByRole('tab', { name: 'index.js' }).click()
  const editor = page.locator('.monaco-editor').first()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(
    "let leak = 'blocked'\ntry { leak = String(parent.localStorage.getItem('lp.maymun.ai')) } catch (e) {}\ntry { leak += ' / ' + localStorage.getItem('lp.maymun.ai') } catch (e) { leak += ' / blocked' }\ndocument.querySelector('#status').textContent = leak\n",
  )
  await page.getByRole('button', { name: /^Run tests/ }).click()
  await expect(page.frameLocator('iframe[title="Preview"]').locator('#status')).toHaveText('blocked / blocked')
})
