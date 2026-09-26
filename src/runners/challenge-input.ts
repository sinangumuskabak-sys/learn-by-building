import type { Challenge, CodeFile, QuizQuestion } from '../content/schema.ts'
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

/**
 * Combines a web challenge's files into one HTML document: styles go into <head>, scripts at the end of
 * <body>, in file order.
 */
export function buildDocument(files: CodeFile[]): string {
  const html = joinFiles(files, 'html') || '<!doctype html><html><head></head><body></body></html>'
  const styles = files
    .filter((f) => f.lang === 'css')
    .map((f) => `<style data-file="${f.name}">\n${f.contents}</style>`)
    .join('\n')
  const scripts = files
    .filter((f) => f.lang === 'js')
    .map((f) => `<script data-file="${f.name}">\n${f.contents.replace(/<\/script/gi, '<\\/script')}</script>`)
    .join('\n')
  const withStyles = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${styles}\n</head>`) : `${styles}\n${html}`
  return /<\/body>/i.test(withStyles)
    ? withStyles.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${scripts}\n</body>`)
    : `${withStyles}\n${scripts}`
}

export type QuizAnswers = Record<number, number[]>

/** A question is correct when exactly the correct options are selected. */
export function gradeQuiz(questions: QuizQuestion[], answers: QuizAnswers): boolean[] {
  return questions.map((question, index) => {
    const selected = new Set(answers[index] ?? [])
    return question.options.every((option, i) => option.correct === selected.has(i))
  })
}
