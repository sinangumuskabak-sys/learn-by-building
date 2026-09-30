import { expect, test, type Page } from '@playwright/test'
import { go } from './nav.ts'

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024

/** Replaces a project's code (with the lock on the finished parts turned off). */
async function setCode(page: Page, code: string) {
  if (isMobile(page)) await page.getByRole('tab', { name: 'Code', exact: true }).click()
  const editor = page.locator('.monaco-editor').first()
  await expect(editor).toBeVisible()
  const unlock = page.getByRole('button', { name: 'Unlock the whole file' })
  if (await unlock.isVisible()) await unlock.click()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(code)
}

test('the home page is the workshop, and the old catalog addresses lead there', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Workshop', level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Catalog' })).toHaveCount(0)
  await go(page, '/learn/iterate-odd-numbers')
  await expect(page).toHaveURL(/\/games$/)
})

for (const path of ['./', '/skills', '/settings']) {
  test(`no horizontal scroll: ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('a web project’s page cannot reach the site’s storage', async ({ page }) => {
  await go(page, '/games/business-card/01-heading')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-secret' } })))
  await page.reload()
  await setCode(
    page,
    "<p id=\"status\"></p>\n<script>\nlet leak = 'blocked'\ntry { leak = String(parent.localStorage.getItem('lp.maymun.ai')) } catch (e) {}\ntry { leak += ' / ' + localStorage.getItem('lp.maymun.ai') } catch (e) { leak += ' / blocked' }\ndocument.querySelector('#status').textContent = leak\n</script>\n",
  )
  await page.getByRole('button', { name: /^Run/ }).click()
  if (isMobile(page)) await page.getByRole('tab', { name: 'Page', exact: true }).click()
  await expect(page.frameLocator('iframe[title="Page"]').locator('#status')).toHaveText('blocked / blocked')
})

test('Maymun’s picture of the screen shows a web project’s page, which draws its own picture', async ({ page }) => {
  test.skip(isMobile(page), 'the page and the chat are on different tabs on phones')
  await go(page, '/games/business-card/01-heading')
  await page.evaluate(() => localStorage.setItem('lp.maymun.ai', JSON.stringify({ provider: 'openrouter', keys: { openrouter: 'sk-or-test' } })))
  await page.reload()
  await setCode(page, '<body style="margin:0;min-height:100vh;background:rgb(0, 200, 0)"></body>\n')
  const preview = page.locator('iframe[title="Page"]')
  await expect(page.frameLocator('iframe[title="Page"]').locator('body')).toHaveCSS('background-color', 'rgb(0, 200, 0)')
  const box = (await preview.boundingBox())!
  await page.getByRole('button', { name: /^Ask Maymun/ }).first().click()
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
  }, { x: (box.x + box.width / 2) / viewport.width, y: (box.y + box.height - 20) / viewport.height })
  // Without the page's own picture that spot would be empty.
  expect(pixel[1]).toBeGreaterThan(150)
  expect(pixel[0]).toBeLessThan(60)
})

test('a page that fails to load says so and leads back', async ({ page }) => {
  await page.route('**/*SettingsPage*', (route) => route.abort())
  await go(page, '/settings')
  await expect(page.getByRole('heading', { name: 'This page ran into a problem' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reload the page' })).toBeVisible()
  await page.unroute('**/*SettingsPage*')
  await page.getByRole('link', { name: 'Back to the workshop' }).click()
  await expect(page.getByRole('heading', { name: 'Workshop', level: 1 })).toBeVisible()
})
