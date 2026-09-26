export interface TestResult {
  text: string
  passed: boolean
  /** Assertion or runtime error message when the test failed. */
  error?: string
}

export interface SqlTable {
  columns: string[]
  rows: unknown[][]
}

export interface RunResult {
  tests: TestResult[]
  /** Captured console output from the learner's code (first run only, to avoid repeats). */
  logs: string[]
  /** Result of the learner's last SQL statement, for the results panel. */
  table?: SqlTable
  /** Set when the learner's code could not run at all (syntax error, timeout). */
  error?: string
}

export function allPassed(result: RunResult): boolean {
  return !result.error && result.tests.length > 0 && result.tests.every((t) => t.passed)
}
