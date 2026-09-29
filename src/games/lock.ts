/** Lines of a file, without the empty line after a final newline. */
function linesOf(code: string): string[] {
  const lines = code.split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

/**
 * The finished parts of a step's code: the lines at the top and bottom that the step's solution keeps from the code the
 * step starts with. Only those lines between are this step's work. Null when the learner's code no longer has those
 * lines (they changed them with the lock off), so nothing is locked.
 */
export function lockedLines(start: string, solution: string, code: string): { before: number; after: number } | null {
  const from = linesOf(start)
  const to = linesOf(solution)
  const now = linesOf(code)
  let before = 0
  while (before < from.length && before < to.length && from[before] === to[before]) before++
  let after = 0
  while (
    after < from.length - before &&
    after < to.length - before &&
    from[from.length - 1 - after] === to[to.length - 1 - after]
  ) {
    after++
  }
  if (before === 0 && after === 0) return null
  if (now.length < before + after) return null
  for (let i = 0; i < before; i++) if (now[i] !== from[i]) return null
  for (let i = 1; i <= after; i++) if (now[now.length - i] !== from[from.length - i]) return null
  return { before, after }
}

/**
 * When the step only adds lines, there is nothing between the locked parts to type into: give the learner an empty
 * line there.
 */
export function withEditableLine(code: string, lock: { before: number; after: number } | null): string {
  if (!lock) return code
  const lines = linesOf(code)
  if (lines.length > lock.before + lock.after) return code
  lines.splice(lock.before, 0, '')
  return `${lines.join('\n')}\n`
}
