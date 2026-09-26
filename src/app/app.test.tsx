import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { catalog } from '../content/catalog.ts'
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

describe('catalog page', () => {
  it('lists every category with its progress', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Learn software engineering by writing code' })).toBeInTheDocument()
    for (const category of catalog.curriculum.categories) {
      expect(screen.getByRole('heading', { name: category.title.en })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Start learning/ })).toHaveAttribute('href', `/learn/${catalog.order[0]}`)
  })

  it('searches challenges by title', () => {
    renderAt('/')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'odd numbers' } })
    expect(screen.getByRole('link', { name: /Iterate odd numbers/ })).toBeInTheDocument()
  })

  it('switches the interface language', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: 'Türkçe' }))
    expect(screen.getByRole('heading', { name: 'Yazılım mühendisliğini kod yazarak öğren' })).toBeInTheDocument()
    expect(screen.getByText('Programlama Temelleri')).toBeInTheDocument()
  })
})

describe('category page', () => {
  it('shows modules and challenges in order', () => {
    renderAt('/c/programming-fundamentals')
    expect(screen.getByRole('heading', { name: 'Programming Fundamentals', level: 1 })).toBeInTheDocument()
    const loops = screen.getByRole('heading', { name: 'Loops' }).closest('li')!
    const titles = within(loops).getAllByRole('link').map((link) => link.textContent)
    expect(titles[0]).toContain('Loop basics')
  })

  it('shows a not-found page for unknown categories', () => {
    renderAt('/c/nope')
    expect(screen.getByRole('heading', { name: 'Category not found' })).toBeInTheDocument()
  })
})

describe('quiz challenge', () => {
  it('grades answers and records a pass', async () => {
    renderAt('/learn/loop-basics-quiz')
    const check = await screen.findByRole('button', { name: 'Check answers' })
    expect(check).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: '3' }))
    fireEvent.click(screen.getByRole('radio', { name: 'i++' }))
    fireEvent.click(check)
    expect(screen.getAllByText('Not quite — try again')).toHaveLength(2)
    expect(progressStore.get().challenges['loop-basics-quiz']).toBeUndefined()

    fireEvent.click(screen.getByRole('radio', { name: '4' }))
    fireEvent.click(screen.getByRole('radio', { name: 'i += 2' }))
    fireEvent.click(check)
    expect(screen.getByText('All answers correct!')).toBeInTheDocument()
    expect(progressStore.get().challenges['loop-basics-quiz']?.status).toBe('passed')
    expect(screen.getByRole('link', { name: /Next challenge/ })).toBeInTheDocument()
  })
})

describe('design challenge', () => {
  it('requires an answer and every rubric item before completing', async () => {
    renderAt('/learn/design-cache-policy')
    const done = await screen.findByRole('button', { name: 'Mark as complete' })
    expect(done).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Shared Redis cache with a 1 hour TTL, refreshed by a webhook when prices change.' },
    })
    for (const box of screen.getAllByRole('checkbox')) fireEvent.click(box)
    expect(done).toBeEnabled()
    fireEvent.click(done)
    expect(progressStore.get().challenges['design-cache-policy']?.status).toBe('passed')
  })
})

describe('skill map', () => {
  it('derives levels from completed challenges', async () => {
    act(() => progressActions.markPassed('iterate-odd-numbers'))
    renderAt('/skills')
    const loops = (await screen.findByText('prog.loops')).closest('li')!
    expect(within(loops).getByText('L3')).toBeInTheDocument()
    expect(within(loops).getByRole('link', { name: 'Iterate odd numbers with a for loop' })).toBeInTheDocument()
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
