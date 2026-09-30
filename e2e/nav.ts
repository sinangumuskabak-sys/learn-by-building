import type { Page } from '@playwright/test'

/**
 * Moves within the app as a link does, without loading the page again (open chats, running work and unsaved state
 * stay), in the language the page is in; opens the app when nothing is open yet.
 */
export async function go(page: Page, path: string) {
  if (!page.url().startsWith('http')) {
    await page.goto(path)
    return
  }
  await page.evaluate((to) => {
    const tr = location.pathname === '/tr' || location.pathname.startsWith('/tr/')
    history.pushState(null, '', `${tr ? '/tr' : ''}${to}`)
    dispatchEvent(new PopStateEvent('popstate'))
  }, path)
}
