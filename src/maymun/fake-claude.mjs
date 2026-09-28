// A stand-in for the Claude Code CLI in the bridge tests: echoes what it was given as a streamed answer.
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const flag = (name) => args[args.indexOf(name) + 1]
let input = ''
process.stdin.on('data', (data) => (input += data))
process.stdin.on('end', () => {
  const message = JSON.parse(input).message
  const report = {
    system: readFileSync(flag('--system-prompt-file'), 'utf8'),
    model: flag('--model'),
    tools: flag('--tools'),
    safe: args.includes('--safe-mode'),
    content: message.content.map((part) => (part.type === 'text' ? part.text : `[${part.source.media_type}]`)),
  }
  const delta = (text) => ({ type: 'stream_event', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } } })
  const json = JSON.stringify(report)
  for (const event of [{ type: 'system', subtype: 'init' }, delta(json.slice(0, 10)), delta(json.slice(10))]) console.log(JSON.stringify(event))
  if (report.content.some((c) => c.includes('please fail'))) console.log(JSON.stringify({ type: 'result', is_error: true, result: 'Not logged in' }))
  else console.log(JSON.stringify({ type: 'result', is_error: false, result: json }))
})
