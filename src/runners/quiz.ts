import type { QuizQuestion } from '../content/schema.ts'

export type QuizAnswers = Record<number, number[]>

/** A question is correct when exactly the correct options are selected. */
export function gradeQuiz(questions: QuizQuestion[], answers: QuizAnswers): boolean[] {
  return questions.map((question, index) => {
    const selected = new Set(answers[index] ?? [])
    return question.options.every((option, i) => option.correct === selected.has(i))
  })
}
