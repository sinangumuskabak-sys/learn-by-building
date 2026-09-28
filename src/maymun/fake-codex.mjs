// A stand-in for Codex CLI in the bridge tests: writes what it was given as its last message (-o file).
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
let input = ''
process.stdin.on('data', (data) => (input += data))
process.stdin.on('end', () => {
  writeFileSync(args[args.indexOf('-o') + 1], JSON.stringify({ args, input }))
  process.stdout.write('progress output that is not the answer')
})
