---
title: Leave shortcuts alone
title_tr: Kısayollara dokunma
skills: [game.input]
---

# --goal--

Ctrl+R should still reload the page, and Ctrl+C copy. Keys held with Ctrl, Cmd or Alt are not for the game, so the
listener returns at once for them.

# --goal-tr--

Bir sorun var: **Ctrl+R** ile sayfayı yenilemeye çalışınca oyun `r` yazıyor ve `preventDefault` yenilemeyi engelliyor!
Ctrl, Cmd (Mac) ya da Alt ile basılan tuşlar **kısayoldur**; oyuna ait değiller. Onlar için dinleyici hiçbir şey
yapmadan çıksın.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
```

# --meaning--

- `event.ctrlKey`, `metaKey` (Cmd on a Mac) and `altKey` are `true` while those keys are held.
- Returning before `preventDefault()` leaves the shortcut to the browser.

# --meaning-tr--

- `event.ctrlKey` → Ctrl basılı mı? `event.metaKey` → Mac'teki Cmd (Windows tuşu) basılı mı? `event.altKey` → Alt?
- `||` → biri bile basılıysa `return`: dinleyici hemen biter, `preventDefault` hiç çalışmaz; tarayıcı kısayolu yapar.

# --task--

In the listener, write the new line at the very top. Press **Run**.

# --task-tr--

Dinleyicinin **en üstüne**, `(event) => {` satırının hemen altına yeni satırı yaz. **Çalıştır**.

# --tests--

Keys held with Ctrl should not type and should be left to the browser.
tr: Ctrl ile basılan tuşlar yazmamalı ve tarayıcıya bırakılmalı.

```js
const shortcut = (key, mod) => {
  const event = { type: 'keydown', key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, stopPropagation() {} }
  event[mod] = true
  document.dispatchEvent(event)
  return event
}
const reload = shortcut('r', 'ctrlKey')
assert.strictEqual(current, '', 'Ctrl+R is not a letter')
assert.isFalse(reload.defaultPrevented, 'the browser may still reload')
shortcut('c', 'metaKey')
shortcut('x', 'altKey')
assert.strictEqual(current, '')
$.press('r')
assert.strictEqual(current, 'r', 'a plain R still types')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
