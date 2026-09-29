---
title: Freeze the game
title_tr: Oyunu dondur
skills: [game.state]
---

# --goal--

When the game is over, `update` returns at once, so the words freeze where they are, and `type` ignores keys.

# --goal-tr--

Oyun bitince her şey **donsun**: kelimeler olduğu yerde kalsın, tuşlar hiçbir şey yapmasın. Bunun için iki
fonksiyonun başına aynı nöbetçiyi koyuyoruz: "oyun sürmüyorsa dur".

# --code--

```js
function type(key) {
  if (state !== 'playing') return

function update() {
  if (state !== 'playing') return
```

# --meaning--

- `!==` means "not equal": when the state is not `'playing'`, both functions stop before doing anything.

# --meaning-tr--

- `if (state !== 'playing') return` → durum `'playing'` **değilse** (`!==`) fonksiyondan hemen çık.
- `update`'in başında → kelimeler düşmez, yenisi gelmez.
- `type`'ın başında → basılan harfler sayılmaz.

# --task--

Write the line at the top of `type` and at the top of `update`.

# --task-tr--

`type` fonksiyonunun ve `update` fonksiyonunun **ilk satırı** olarak `if (state !== 'playing') return` yaz.
**Çalıştır**.

# --tests--

After the game is over, nothing should move and keys should do nothing.
tr: Oyun bittikten sonra hiçbir şey kıpırdamamalı ve tuşlar bir şey yapmamalı.

```js
spawnTimer = 100000
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(state, 'over')
words = [{ text: 'sun', x: 10, y: 50 }]
$.tick(100)
assert.strictEqual(words[0].y, 50, 'nothing moves after the game is over')
$.press('s')
assert.isNull(target, 'keys do nothing')
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
let score
let spawnTimer
let state // 'playing' or 'over'

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
  score = 0
  spawnTimer = 0
  state = 'playing'
}

function type(key) {
  if (state !== 'playing') return
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
    score += target.text.length
    target = null
  }
}

function gameOver() {
  state = 'over'
}

function update() {
  if (state !== 'playing') return
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
  if (lives <= 0) {
    lives = 0
    gameOver()
  }
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
  ctx.fillText('Score ' + score, 10, 22)
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
