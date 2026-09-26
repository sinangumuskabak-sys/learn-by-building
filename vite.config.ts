/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { loadContentFromDisk } from './src/content/load-node.ts'
import { validateContent } from './src/content/validate.ts'

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

// Relative base + hash routing lets the build run from any static host (GitHub Pages, forks, file server).
export default defineConfig({
  base: './',
  plugins: [contentPlugin(), react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
