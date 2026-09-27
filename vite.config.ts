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

/**
 * Games as `virtual:games`: a light list for the games page (no step texts, tests or solutions) plus one lazily loaded
 * module per game, `virtual:game/<id>`, so the list stays small however many games there are.
 */
function gamesPlugin(): Plugin {
  const listId = 'virtual:games'
  const gamePrefix = 'virtual:game/'
  const load = (addWatchFile: (file: string) => void, error: (message: string) => never) => {
    for (const file of contentFiles(contentRoot)) addWatchFile(file)
    const { content, problems } = loadContentFromDisk(contentRoot)
    const { games, problems: gameProblems } = loadGamesFromDisk(contentRoot)
    problems.push(...gameProblems, ...validateGames(games, new Set(content.skills.map((s) => s.id))))
    if (problems.length > 0) error(`Invalid games:\n  - ${problems.join('\n  - ')}`)
    return games
  }
  return {
    name: 'learn-platform-games',
    resolveId: (source) => (source === listId || source.startsWith(gamePrefix) ? `\0${source}` : undefined),
    load(moduleId) {
      if (moduleId === `\0${listId}`) {
        const games = load(this.addWatchFile.bind(this), this.error.bind(this))
        const summaries = games.map((game) => ({
          ...game,
          steps: game.steps.map(({ id, title, skills }) => ({ id, title, skills })),
        }))
        const loaders = games.map((game) => `${JSON.stringify(game.id)}: () => import(${JSON.stringify(gamePrefix + game.id)})`)
        return `export default ${JSON.stringify({ games: summaries })}
const loaders = { ${loaders.join(', ')} }
export function loadGame(id) {
  return loaders[id] ? loaders[id]().then((module) => module.default) : Promise.resolve(undefined)
}`
      }
      if (moduleId.startsWith(`\0${gamePrefix}`)) {
        const id = moduleId.slice(`\0${gamePrefix}`.length)
        const game = load(this.addWatchFile.bind(this), this.error.bind(this)).find((g) => g.id === id)
        if (!game) this.error(`Unknown game "${id}"`)
        return `export default ${JSON.stringify(game)}`
      }
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
