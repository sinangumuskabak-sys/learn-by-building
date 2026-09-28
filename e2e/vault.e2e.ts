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
  await expect(note).toContainText('0/11')

  // Finishing a step shows in the vault (the app writes the status), and links lead to the step's note.
  await passFirstSnakeStep(page)
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Current status.md'))
  await expect(note).toContainText('1/11')
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
  await expect(note).toContainText('0/11')
  await page.goto('./#/memory?f=' + encodeURIComponent('Games/Snake/Steps/01 Get a canvas to draw on.md'))
  await expect(note).toContainText('⏳ Not started')
  await expect(note.getByLabel('My notes')).toHaveValue('')
})
