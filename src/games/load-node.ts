import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { parseGameStep } from './parse.ts'
import { gameMetaSchema, projectFile, type Game, type GameStep } from './schema.ts'

/**
 * Reads `content/games/<id>/game.json` and `steps/*.md` (Node only; the browser gets games through the
 * `virtual:games` module). Steps are ordered by file name, so number them: `01-canvas.md`, `02-loop.md`, ...
 */
export function loadGamesFromDisk(contentRoot: string): { games: Game[]; problems: string[] } {
  const root = join(contentRoot, 'games')
  const problems: string[] = []
  const games: Game[] = []
  if (!existsSync(root)) return { games, problems }
  const rel = (path: string) => relative(contentRoot, path).split(sep).join('/')

  for (const dir of readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const gameDir = join(root, dir.name)
    const metaPath = join(gameDir, 'game.json')
    let meta
    try {
      const parsed = gameMetaSchema.safeParse(JSON.parse(readFileSync(metaPath, 'utf8')))
      if (!parsed.success) {
        problems.push(`${rel(metaPath)}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
        continue
      }
      meta = parsed.data
    } catch (error) {
      problems.push(`${rel(metaPath)}: ${(error as Error).message}`)
      continue
    }
    if (meta.id !== dir.name) problems.push(`${rel(metaPath)}: id "${meta.id}" must match the folder name`)

    const steps: GameStep[] = []
    const stepsDir = join(gameDir, 'steps')
    const files = existsSync(stepsDir) ? readdirSync(stepsDir).filter((f) => f.endsWith('.md')).sort() : []
    for (const file of files) {
      const path = join(stepsDir, file)
      try {
        steps.push(parseGameStep(rel(path), file.slice(0, -3), readFileSync(path, 'utf8'), projectFile(meta.kind).lang))
      } catch (error) {
        problems.push((error as Error).message)
      }
    }
    games.push({ ...meta, steps })
  }
  games.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  return { games, problems }
}
