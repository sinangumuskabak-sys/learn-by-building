import type { TestCase } from '../content/schema.ts'
import { errorMessage, runJsTests } from './js-core.ts'
import type { RunResult, SqlTable } from './types.ts'

export interface SqlRunInput {
  query: string
  setup: string
  tests: TestCase[]
}

/**
 * Runs the learner's SQL against a fresh in-memory Postgres (PGlite) prepared by the challenge setup.
 * Tests are JavaScript and see `rows` (objects from the last statement), `columns`, and `query(sql)` for
 * checking the database state afterwards.
 */
export async function runSqlTests(input: SqlRunInput): Promise<RunResult> {
  // Loaded lazily: the WebAssembly Postgres is large and only SQL challenges need it.
  const { PGlite } = await import('@electric-sql/pglite')
  const db = new PGlite()
  try {
    if (input.setup.trim()) await db.exec(input.setup)

    let last: { fields: { name: string }[]; rows: Record<string, unknown>[] } | undefined
    try {
      const results = await db.exec(input.query)
      last = results.findLast((r) => r.fields.length > 0) as typeof last
    } catch (error) {
      return {
        tests: input.tests.map((t) => ({ text: t.text, passed: false })),
        logs: [],
        error: errorMessage(error),
      }
    }

    const rows = last?.rows ?? []
    const columns = last?.fields.map((f) => f.name) ?? []
    const table: SqlTable = { columns, rows: rows.map((row) => columns.map((c) => row[c])) }
    const query = async (sql: string) => (await db.query<Record<string, unknown>>(sql)).rows

    const result = await runJsTests({
      code: '',
      rawCode: input.query,
      setup: '',
      tests: input.tests,
      globals: { rows, columns, query },
    })
    return { ...result, table }
  } finally {
    await db.close()
  }
}
