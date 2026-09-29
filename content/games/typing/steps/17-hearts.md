---
title: Hearts
title_tr: Kalpler
skills: [game.canvas]
---

# --goal--

The lives are shown as hearts at the top right: `'♥'.repeat(lives)` makes a text of that many hearts.

# --goal-tr--

Canları sağ üstte **kalp** olarak gösteriyoruz: 3 can `♥♥♥`, 2 can `♥♥`. Bir yazıyı istediğimiz kadar tekrar eden
hazır bir araç var: `repeat`.

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = 'bold 16px sans-serif'
ctx.textAlign = 'right'
ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)
```

# --meaning--

- `'♥'.repeat(3)` is `'♥♥♥'`.
- `textAlign = 'right'` puts the text's right end at `x`, 10 pixels from the right edge, so it never runs off.

# --meaning-tr--

- `'♥'.repeat(lives)` → kalp işaretini `lives` kez yan yana koyar: `'♥'.repeat(3)` → `'♥♥♥'`.
- `ctx.textAlign = 'right'` → yazının **sağ ucu** `x`'e gelir; `canvas.width - 10` sağ kenardan 10 piksel içeri.
  Kalp sayısı ne olursa olsun kenardan taşmaz.
- Kalemi yeniden ayarlıyoruz: beyaz, kalın 16 piksel, düz yazı tipi (`sans-serif`).

# --task--

In `draw`, after the words loop, leave an empty line and write the four lines.

# --task-tr--

`draw` içinde kelime döngüsünün kapanan `}`'sinin altında bir boş satır bırak ve dört satırı yaz; fonksiyonun son `}`'si
altta kalsın. **Çalıştır**: sağ üstte üç kalp. Bir kelimeyi kaçır ve bir kalbin gittiğini gör.

# --hint--

`♥` is a character like any other; you can copy it from here.

# --hint-tr--

`♥` da diğerleri gibi bir karakter; buradan kopyalayabilirsin.

# --tests--

The lives should be drawn as hearts at the top right.
tr: Canlar sağ üste kalp olarak çizilmeli.

```js
$.tick(1)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '♥♥♥')
assert.exists(call, 'three hearts')
assert.deepEqual(call.args.slice(1, 3), [470, 22])
lives = 1
$.tick(1)
assert.include($.texts(), '♥')
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'cat', 'sun', 'code', 'game', 'jump', 'fast', 'loop', 'byte', 'star', 'tree', 'rain', 'blue', 'fire', 'wind', 'moon',
  'array', 'pixel', 'mouse', 'score', 'level', 'robot', 'light', 'music', 'space', 'river', 'green', 'cloud', 'train',
  'planet', 'rocket', 'string', 'number', 'button', 'screen', 'window', 'random', 'object', 'player', 'dragon', 'puzzle',
  'keyboard', 'function', 'variable', 'computer', 'triangle', 'elephant', 'mountain', 'sandwich',
]
const GROUND = 330 // a word that falls past this line costs a life
const SPEED = 0.35
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  target = null
  typed = 0
  lives = 3
  spawnTimer = 0
}

function type(key) {
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) return
  typed += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    target = null
  }
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  const landed = words.filter((w) => w.y > GROUND)
  if (landed.length === 0) return
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
  lives -= landed.length
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  for (const w of words) {
    // The typed part in yellow, the rest in white right after it.
    const done = w === target ? w.text.slice(0, typed) : ''
    ctx.fillStyle = '#facc15'
    ctx.fillText(done, w.x, w.y)
    ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
    ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
