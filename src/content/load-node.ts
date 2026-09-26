import { readdirSync, readFileSync } from 'node:fs'
import { basename, join, relative, sep } from 'node:path'
import { parseChallenge } from './parse.ts'
import { curriculumSchema, skillsFileSchema, type Challenge } from './schema.ts'
import type { ContentSet } from './validate.ts'

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}

/**
 * Reads the whole content tree from disk (Node only; the browser bundles content through Vite).
 * Errors are collected rather than thrown so one bad file does not hide the others.
 */
export function loadContentFromDisk(root: string): { content: ContentSet; problems: string[] } {
  const problems: string[] = []
  const curriculum = curriculumSchema.safeParse(readJson(join(root, 'curriculum.json')))
  const skills = skillsFileSchema.safeParse(readJson(join(root, 'skills.json')))
  if (!curriculum.success) problems.push(`curriculum.json: ${curriculum.error.message}`)
  if (!skills.success) problems.push(`skills.json: ${skills.error.message}`)

  const challenges: Challenge[] = []
  for (const path of markdownFiles(join(root, 'challenges'))) {
    const source = relative(root, path).split(sep).join('/')
    try {
      const challenge = parseChallenge(source, readFileSync(path, 'utf8'))
      if (basename(path, '.md') !== challenge.id) problems.push(`${source}: file name must be "${challenge.id}.md"`)
      challenges.push(challenge)
    } catch (error) {
      problems.push((error as Error).message)
    }
  }

  return {
    content: {
      curriculum: curriculum.success ? curriculum.data : { categories: [] },
      skills: skills.success ? skills.data : [],
      challenges,
    },
    problems,
  }
}
