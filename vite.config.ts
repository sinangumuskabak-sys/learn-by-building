/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { loadContentFromDisk } from './src/content/load-node.ts'
import { validateContent } from './src/content/validate.ts'
import { loadGamesFromDisk } from './src/games/load-node.ts'
import { validateGames } from './src/games/validate.ts'

const contentRoot = resolve(import.meta.dirname, 'content')

function contentFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? contentFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

/**
 * Exposes the parsed and validated `content/` folder as `virtual:content`. Parsing at build time keeps the
 * Markdown/YAML parser out of the browser bundle, and broken content fails the build instead of the page.
 * (Checking that solutions pass their tests stays in `npm run validate`, which needs the runners.)
 */
function contentPlugin(): Plugin {
  const id = 'virtual:content'
  const resolvedId = `\0${id}`
  return {
    name: 'learn-platform-content',
    resolveId: (source) => (source === id ? resolvedId : undefined),
    load(moduleId) {
      if (moduleId !== resolvedId) return
      for (const file of contentFiles(contentRoot)) this.addWatchFile(file)
      const { content, problems } = loadContentFromDisk(contentRoot)
      problems.push(...validateContent(content))
      if (problems.length > 0) this.error(`Invalid content:\n  - ${problems.join('\n  - ')}`)
      return `export default ${JSON.stringify(content)}`
    },
  }
}

/** Same idea for `content/games/` as `virtual:games`; only the lazily loaded game pages import it. */
function gamesPlugin(): Plugin {
  const id = 'virtual:games'
  const resolvedId = `\0${id}`
  return {
    name: 'learn-platform-games',
    resolveId: (source) => (source === id ? resolvedId : undefined),
    load(moduleId) {
      if (moduleId !== resolvedId) return
      for (const file of contentFiles(contentRoot)) this.addWatchFile(file)
      const { content, problems } = loadContentFromDisk(contentRoot)
      const { games, problems: gameProblems } = loadGamesFromDisk(contentRoot)
      problems.push(...gameProblems, ...validateGames(games, new Set(content.skills.map((s) => s.id))))
      if (problems.length > 0) this.error(`Invalid games:\n  - ${problems.join('\n  - ')}`)
      return `export default ${JSON.stringify({ games })}`
    },
  }
}

// Relative base + hash routing lets the build run from any static host (GitHub Pages, forks, file server).
export default defineConfig({
  base: './',
  plugins: [contentPlugin(), gamesPlugin(), react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
