import { useEffect, useState } from 'react'

/** The project's code; a star there helps others find it. */
export const REPO = 'sinangumuskabak-sys/learn-by-building'
export const REPO_URL = `https://github.com/${REPO}`

/** The star count, kept for a few hours so pages do not ask GitHub each time. */
const STARS_KEY = 'lp.github.stars'
const STARS_FOR = 6 * 60 * 60 * 1000

function cachedStars(): number | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STARS_KEY) ?? 'null') as { count?: unknown; at?: unknown } | null
    return saved && typeof saved.count === 'number' ? saved.count : null
  } catch {
    return null
  }
}

/** The repository's stars from GitHub (null until known, or when GitHub cannot be reached). */
export function useStars(): number | null {
  const [stars, setStars] = useState(cachedStars)
  useEffect(() => {
    let fresh = false
    try {
      const saved = JSON.parse(localStorage.getItem(STARS_KEY) ?? 'null') as { at?: number } | null
      fresh = !!saved?.at && Date.now() - saved.at < STARS_FOR
    } catch {
      // Ask again.
    }
    // Automated browsers (the tests) leave GitHub alone.
    if (fresh || navigator.webdriver) return
    let live = true
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { stargazers_count?: number } | null) => {
        if (!live || typeof data?.stargazers_count !== 'number') return
        setStars(data.stargazers_count)
        try {
          localStorage.setItem(STARS_KEY, JSON.stringify({ count: data.stargazers_count, at: Date.now() }))
        } catch {
          // Shown for this visit only.
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  return stars
}

/** 1234 → "1.2k". */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n))
