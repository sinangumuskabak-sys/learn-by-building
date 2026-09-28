// A stand-in for Gemini CLI in the bridge tests: answers with what it was given, as plain text in two pieces.
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
let input = ''
process.stdin.on('data', (data) => (input += data))
process.stdin.on('end', () => {
  const report = JSON.stringify({ system: readFileSync(process.env.GEMINI_SYSTEM_MD, 'utf8'), args, input })
  process.stdout.write(report.slice(0, 20))
  setTimeout(() => process.stdout.write(report.slice(20)), 20)
})
