import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { langStore } from '../i18n/i18n.ts'
import { progressActions, progressStore } from '../progress/progress.ts'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  act(() => {
    langStore.set('en')
    progressActions.resetAll()
  })
})

describe('workshop (home page)', () => {
  it('opens on the workshop: build projects first, then games', async () => {
    const router = renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Workshop', level: 1 }, { timeout: 5000 })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/games')
    const projects = screen.getByRole('heading', { name: /Build projects/ }).closest('section')!
    expect(within(projects).getByRole('link', { name: /My business card/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Games', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /steps Snake Steer/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Catalog' })).not.toBeInTheDocument()
  })

  it('leads the old catalog addresses to the workshop', async () => {
    for (const path of ['/c/programming-fundamentals', '/learn/loop-basics-quiz']) {
      const router = renderAt(path)
      expect(await screen.findByRole('heading', { name: 'Workshop', level: 1 }, { timeout: 5000 })).toBeInTheDocument()
      expect(router.state.location.pathname).toBe('/games')
      cleanup()
    }
  })

  it('switches the interface language', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Workshop', level: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Türkçe' }))
    expect(screen.getByRole('heading', { name: 'Atölye', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Kartvizitim/ })).toBeInTheDocument()
  })
})

describe('skill map', () => {
  it('shows the skills the projects teach, with the steps that prove them', async () => {
    act(() => progressActions.markPassed('game:business-card/01-heading'))
    renderAt('/skills')
    const html = (await screen.findByText('fe.html')).closest('li')!
    expect(within(html).getByText('L3')).toBeInTheDocument()
    expect(within(html).getByRole('link', { name: /My business card/ })).toBeInTheDocument()
    // A skill nothing teaches yet is not listed.
    expect(screen.queryByText('db.joins')).not.toBeInTheDocument()
  })
})

describe('progress store', () => {
  it('keeps a passed challenge passed and round-trips through export/import', () => {
    act(() => {
      progressActions.markPassed('typed-sum')
      progressActions.saveFiles('typed-sum', [{ name: 'index.ts', lang: 'ts', contents: 'x' }])
    })
    expect(progressStore.get().challenges['typed-sum']?.status).toBe('passed')
    const exported = progressActions.exportJson()
    act(() => progressActions.resetAll())
    expect(progressActions.importJson('not json')).toBe(false)
    expect(progressActions.importJson('{"version":2}')).toBe(false)
    act(() => {
      expect(progressActions.importJson(exported)).toBe(true)
    })
    expect(progressStore.get().challenges['typed-sum']?.files?.[0].contents).toBe('x')
  })
})

describe('routing', () => {
  it('renders a not-found page for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
