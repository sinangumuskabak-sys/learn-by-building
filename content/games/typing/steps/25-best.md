---
title: Best score
title_tr: Rekor
skills: [game.state]
---

# --goal--

The best score is saved in `localStorage` when the game ends, so it is still there next time, and shown next to the
hearts.

# --goal-tr--

Rekorunu kırmak istersin; ama sayfayı kapatınca her değişken silinir. Tarayıcının küçük bir **kalıcı defteri** var:
`localStorage`. Oraya yazılan, sayfa kapansa da kalır. Oyun bitince puan rekordan büyükse deftere yazacağız ve
kalplerin yanında göstereceğiz: `♥♥♥  Best 42`.

# --code--

```js
let best = Number(localStorage.getItem('typing-best')) || 0

function gameOver() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('typing-best', best)
  }
}

  ctx.fillText('♥'.repeat(lives) + '  Best ' + best, canvas.width - 10, 22)
```

# --meaning--

- `getItem` reads the saved text (or `null`); `Number(...) || 0` makes it a number, 0 the first time.
- `gameOver` saves a better score with `setItem`.

# --meaning-tr--

- `localStorage.getItem('typing-best')` → defterden `'typing-best'` kaydını okur; yoksa `null`.
- `Number(...)` → yazıyı sayıya çevirir. `|| 0` → ilk kez oynuyorsan 0.
- `gameOver` içinde: puan rekordan büyükse `best`'i güncelle ve `localStorage.setItem` ile deftere yaz.
- Kalp satırının sonuna `'  Best ' + best` eklendi.

# --task--

1. Under `let state` write `let best`.
2. In `gameOver`, under `state = 'over'`, write the `if` block.
3. In `draw`, add the best score to the hearts text.

# --task-tr--

1. `let state ...` satırının altına `let best = ...` yaz.
2. `gameOver` içinde `state = 'over'` satırının altına `if (score > best) { ... }` bloğunu yaz.
3. `draw` içinde kalp yazısını `'♥'.repeat(lives) + '  Best ' + best` yap.
4. **Çalıştır**, bir oyun bitir, sayfayı yenile: rekor yerinde durmalı.

# --tests--

The best score should be saved when the game ends.
tr: Oyun bittiğinde en iyi puan kaydedilmeli.

```js
spawnTimer = 100000
assert.strictEqual(best, 0)
score = 42
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(best, 42)
assert.strictEqual(localStorage.getItem('typing-best'), '42')
$.tick(1)
assert.include($.texts(), 'Best 42')
assert.include($.texts(), 'Score 42 Level 1')
```

A lower score should not replace the best.
tr: Daha düşük bir puan rekorun yerini almamalı.

```js
spawnTimer = 100000
best = 100
score = 42
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(best, 100)
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
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let score
let level
let cleared // words typed this game
let spawnTimer
let state // 'playing' or 'over'
let best = Number(localStorage.getItem('typing-best')) || 0

// Faster and more often as the level goes up.
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)

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
  level = 1
  cleared = 0
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
    score += target.text.length * level
    cleared += 1
    if (cleared % 10 === 0) level += 1
    target = null
  }
}

function gameOver() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('typing-best', best)
  }
}

function update() {
  if (state !== 'playing') return
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = spawnEvery()
  }
  for (const w of words) w.y += speed()
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
  if (state === 'over' && event.key === 'Enter') return reset()
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
  ctx.fillText('Score ' + score + '  Level ' + level, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives) + '  Best ' + best, canvas.width - 10, 22)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
    ctx.fillRect(40, 105, canvas.width - 80, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 140)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Enter to play again', canvas.width / 2, 175)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
