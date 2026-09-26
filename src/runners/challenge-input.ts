import type { Challenge, CodeFile } from '../content/schema.ts'
import { transpileTs, type JsRunInput } from './js-core.ts'
import type { SqlRunInput } from './sql-core.ts'

function joinFiles(files: CodeFile[], lang?: string): string {
  return files
    .filter((f) => lang === undefined || f.lang === lang)
    .map((f) => f.contents)
    .join('\n')
}

/** Builds the JS runner input for `code-js` / `code-ts` challenges. */
export function jsInput(challenge: Challenge, files: CodeFile[]): JsRunInput {
  const rawCode = joinFiles(files)
  const isTs = challenge.type === 'code-ts'
  const setup = joinFiles(challenge.setup)
  return {
    code: isTs ? transpileTs(rawCode) : rawCode,
    rawCode,
    setup: isTs ? transpileTs(setup) : setup,
    tests: challenge.tests,
  }
}

export function sqlInput(challenge: Challenge, files: CodeFile[]): SqlRunInput {
  return { query: joinFiles(files, 'sql'), setup: joinFiles(challenge.setup, 'sql'), tests: challenge.tests }
}

export { buildDocument } from './web-document.ts'
export { gradeQuiz, type QuizAnswers } from './quiz.ts'
