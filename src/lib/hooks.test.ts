import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDebouncedEffect } from './hooks.ts'

describe('useDebouncedEffect', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls once with the latest value after the delay', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(({ value }) => useDebouncedEffect(value, 400, fn), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    vi.advanceTimersByTime(399)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledExactlyOnceWith('b')
  })

  it('flushes a pending call on unmount and on pagehide when asked to', () => {
    const fn = vi.fn()
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebouncedEffect(value, 400, fn, { flushOnLeave: true }),
      { initialProps: { value: 'a' } },
    )
    vi.advanceTimersByTime(400)
    rerender({ value: 'b' })
    window.dispatchEvent(new Event('pagehide'))
    expect(fn).toHaveBeenLastCalledWith('b')
    rerender({ value: 'c' })
    unmount()
    expect(fn).toHaveBeenLastCalledWith('c')
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('drops a pending call on unmount by default', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useDebouncedEffect('a', 400, fn))
    unmount()
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })
})
