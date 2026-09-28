import type { CanvasSize } from './sim.ts'

/**
 * The page the game runs in for real play: a canvas scaled to fit the frame, plus a small bridge that reports
 * console output, errors (with line numbers in the learner's code), focus and the pointer to the parent, keeps arrow
 * keys and space from scrolling the frame, and answers the parent's requests (focus the canvas, a picture of the
 * frame). The frame is sandboxed without the site's origin, so it gets `localStorage` as a copy of the games' saved
 * values (`storage`) whose changes go to the parent (see frame-storage.ts).
 */
export function buildPlayDocument(code: string, canvas: CanvasSize, storage: Record<string, string> = {}): string {
  const safe = code.replace(/<\/script/gi, '<\\/script')
  const saved = JSON.stringify(storage).replace(/</g, '\\u003c')
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
    // Maymun's eyes follow the pointer inside the game too.
    ;['pointermove', 'pointerdown'].forEach(function (type) {
      window.addEventListener(type, function (e) {
        parent.postMessage({ __lpGame: 'pointer', x: e.clientX, y: e.clientY, down: type === 'pointerdown' }, '*')
      }, { capture: true, passive: true })
    })
    window.addEventListener('message', function (e) {
      var d = e.data
      if (e.source !== parent || !d) return
      if (d.__lpGame === 'focus-canvas') {
        var c = document.querySelector('canvas')
        if (c) c.focus()
      }
      if (d.__lpGame === 'snapshot') {
        // A picture of the whole frame as it looks now, for a question to Maymun.
        var out = document.createElement('canvas')
        out.width = window.innerWidth
        out.height = window.innerHeight
        var g = out.getContext('2d')
        g.fillStyle = getComputedStyle(document.body).backgroundColor
        g.fillRect(0, 0, out.width, out.height)
        var game = document.querySelector('canvas')
        if (game) {
          var r = game.getBoundingClientRect()
          try { g.drawImage(game, r.left, r.top, r.width, r.height) } catch (err) {}
        }
        var url = ''
        try { url = out.toDataURL('image/png') } catch (err) {}
        parent.postMessage({ __lpGame: 'snapshot', id: d.id, url: url }, '*')
      }
    })
    // localStorage: the games' saved values, kept by the parent.
    var saved = ${saved}
    var own = function (k) { return Object.prototype.hasOwnProperty.call(saved, k) }
    var storage = {
      getItem: function (k) { k = String(k); return own(k) ? saved[k] : null },
      setItem: function (k, v) {
        k = String(k); v = String(v); saved[k] = v
        parent.postMessage({ __lpGame: 'storage', key: k, value: v }, '*')
      },
      removeItem: function (k) {
        k = String(k); delete saved[k]
        parent.postMessage({ __lpGame: 'storage', key: k, value: null }, '*')
      },
      clear: function () { Object.keys(saved).forEach(function (k) { storage.removeItem(k) }) },
      key: function (i) { var keys = Object.keys(saved); return i < keys.length ? keys[i] : null },
      get length() { return Object.keys(saved).length },
    }
    try { Object.defineProperty(window, 'localStorage', { value: storage, configurable: true }) } catch (err) {}
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
