---
title: Words per minute
title_tr: Dakikada kelime
skills: [game.state, prog.functions]
---

# --goal--

Typists measure themselves in **words per minute** (WPM). Words have different lengths, so every five letters count
as one word. The time comes from the frames: at 60 frames a second, a minute is 3600 frames.

# --goal-tr--

Daktilocular kendilerini **dakikada kelime** (WPM, words per minute) ile ölçer. Kelimelerin boyu farklı olduğu için
alışılmış kural şudur: her **beş harf** bir kelime sayılır.

Zamanı karelerden hesaplarız: saniyede 60 kare, yani bir dakika **3600 kare**. Oyun sürerken geçen kareleri sayacağız.

# --code--

```js
let frames

  frames = 0

  if (state !== 'playing') return
  frames += 1

// Words per minute counts five letters as one word, the usual way.
const wpm = () => (frames === 0 ? 0 : Math.round(letters / 5 / (frames / 3600)))
```

# --meaning--

- `frames` counts the frames played; it stops with the game because it is under the guard.
- `letters / 5` is the words typed, `frames / 3600` the minutes played; words divided by minutes is WPM.
- At frame 0 it would divide by zero, so it returns 0.

# --meaning-tr--

- `let frames` → oynanan kare sayısı; `reset` içinde `0`.
- `update` içinde nöbetçinin **altında** `frames += 1` → yalnız oyun sürerken sayar; oyun bitince durur.
- `letters / 5` → yazılan "kelime". `frames / 3600` → geçen dakika. Kelime ÷ dakika = **dakikada kelime**.
  50 harf bir dakikada → 10 kelime/dakika.
- `frames === 0 ? 0 : ...` → en başta sıfıra bölmemek için 0 ver.

# --task--

1. Above `let letters` write `let frames`; in `reset`, above `letters = 0`, write `frames = 0`.
2. In `update`, under the guard line, write `frames += 1`.
3. Above `const accuracy` write the comment and `wpm`.

# --task-tr--

1. `let letters ...` satırının **üstüne** `let frames` yaz; `reset` içinde `letters = 0` satırının **üstüne**
   `frames = 0` yaz.
2. `update` içinde `if (state !== 'playing') return` satırının altına `frames += 1` yaz.
3. `const accuracy = ...` satırının **üstüne** yorum satırını ve `wpm` satırını yaz.
4. **Çalıştır**.

# --tests--

`frames` should count the frames played.
tr: `frames` oynanan kareleri saymalı.

```js
assert.strictEqual(frames, 0)
$.tick(60)
assert.strictEqual(frames, 60)
```

WPM should count five letters as a word, and be 0 at the start.
tr: WPM beş harfi bir kelime saymalı ve başta 0 olmalı.

```js
assert.strictEqual(wpm(), 0)
letters = 50
frames = 3600
assert.strictEqual(wpm(), 10, '50 letters in a minute is 10 words')
frames = 1800
assert.strictEqual(wpm(), 20)
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
let frames
let letters // correct letters typed
let mistakes
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
  frames = 0
  letters = 0
  mistakes = 0
}

function type(key) {
  if (state !== 'playing') return
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) {
      mistakes += 1
      return
    }
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) {
    mistakes += 1
    return
  }
  typed += 1
  letters += 1
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
  frames += 1
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

// Words per minute counts five letters as one word, the usual way.
const wpm = () => (frames === 0 ? 0 : Math.round(letters / 5 / (frames / 3600)))
const accuracy = () => (letters + mistakes === 0 ? 100 : Math.round((100 * letters) / (letters + mistakes)))

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
