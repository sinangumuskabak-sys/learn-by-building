import type { CanvasSize } from './sim.ts'

/**
 * The page the game runs in for real play: a canvas scaled to fit the frame, plus a small bridge that reports
 * console output, errors (with line numbers in the learner's code) and focus to the parent, and keeps arrow keys
 * and space from scrolling the frame.
 */
export function buildPlayDocument(code: string, canvas: CanvasSize): string {
  const safe = code.replace(/<\/script/gi, '<\\/script')
  const head = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #2b303b; }
  body { display: grid; place-items: center; }
  canvas { display: block; width: min(calc(100vw - 24px), calc((100vh - 24px) * ${canvas.width} / ${canvas.height})); height: auto;
    outline: none; touch-action: none; box-shadow: 0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 30px rgb(0 0 0 / 0.35); }
</style>
<script>
  (function () {
    var send = function (kind, text) { parent.postMessage({ __lpGame: kind, text: String(text) }, '*') }
    ;['log', 'info', 'warn', 'error'].forEach(function (k) {
      var original = console[k]
      console[k] = function () {
        var parts = Array.prototype.map.call(arguments, function (a) {
          try { return typeof a === 'string' ? a : JSON.stringify(a) } catch (e) { return String(a) }
        })
        send('log', parts.join(' '))
        original.apply(console, arguments)
      }
    })
    window.addEventListener('error', function (e) {
      var line = e.lineno ? ' (line ' + (e.lineno - __FIRST_LINE__ + 1) + ')' : ''
      send('error', (e.error && e.error.name ? e.error.name + ': ' : '') + String(e.message).replace(/^Uncaught (\\w+: )?/, '') + line)
    })
    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send('run', 1); return }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1) e.preventDefault()
    })
    window.addEventListener('focus', function () { send('focus', 1) })
    window.addEventListener('blur', function () { send('blur', 1) })
  })()
</script>
</head>
<body>
<canvas id="game" width="${canvas.width}" height="${canvas.height}" tabindex="0"></canvas>
<script>
`
  const firstLine = head.split('\n').length
  return `${head.replace('__FIRST_LINE__', String(firstLine))}${safe}</script>
</body>
</html>`
}
