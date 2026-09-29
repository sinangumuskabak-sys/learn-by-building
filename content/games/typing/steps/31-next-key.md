---
title: Light up the next key
title_tr: Sıradaki tuşu yak
skills: [game.state]
---

# --goal--

The keyboard also teaches: the key for the next letter of the target lights up yellow. Beginners can follow the light
while their fingers learn where the letters are.

# --goal-tr--

Klavye bir de **öğretsin**: hedefin sıradaki harfinin tuşu **sarı** yansın. Yeni başlayan biri parmakları harflerin
yerini öğrenirken ışığı izleyebilir. Yanlış kelimeye kilitlendiğini fark etmeye de yardım eder.

# --code--

```js
const next = target && target.text[typed] === keys[i]
ctx.fillStyle = next ? '#facc15' : '#1e293b'
ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
ctx.fillStyle = next ? '#020617' : '#e2e8f0'
```

# --meaning--

- `next` is true when there is a target and this key is its next letter. With no target, `target && ...` stops at
  `null`, which counts as false.
- The lit key is yellow with a dark letter.

# --meaning-tr--

- `const next = target && target.text[typed] === keys[i]` → hedef **varsa** ve bu tuş onun sıradaki harfiyse doğru.
  Hedef yoksa `&&` soldaki `null`'da durur (yanlış sayılır); böylece `null.text` gibi bir hatadan kurtuluruz.
- `next ? '#facc15' : '#1e293b'` → sıradaki tuşsa sarı kutu, değilse koyu.
- `next ? '#020617' : '#e2e8f0'` → sarı kutuda harf koyu, okunaklı olsun.

# --task--

In the keyboard loop, under `const k = ...`, write `const next`, and change the two colors as shown.

# --task-tr--

Klavye döngüsünde `const k = keyRect(row, i)` satırının altına `const next = ...` yaz; iki `fillStyle` satırını kodda
görüldüğü gibi değiştir. **Çalıştır**, bir kelimeye kilitlen: sıradaki harfin tuşu sarı yanmalı.

# --tests--

The next letter's key should light up.
tr: Sıradaki harfin tuşu yanmalı.

```js
spawnTimer = 100000
words = [{ text: 'cat', x: 10, y: 50 }]
$.tick(1)
assert.lengthOf($.rects('#facc15'), 0, 'no target, no light')
$.press('c')
$.tick(1)
assert.deepEqual($.rects('#facc15').map(({ x, y }) => ({ x, y })), [{ x: 30, y: 391 }], 'the next letter, a, lights up')
const a = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'a')
assert.strictEqual(a.fill, '#020617')
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
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 44
const KEY_H = 34
const KEYS_Y = 350

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

// The on-screen keyboard, one row under another, each row centered.
function keyRect(row, i) {
  const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2
  return { x: left + i * (KEY_W + 3), y: KEYS_Y + row * (KEY_H + 7) }
}

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
    ctx.fillText(wpm() + ' words per minute, ' + accuracy() + '% accurate', canvas.width / 2, 175)
    ctx.fillText('Press Enter to play again', canvas.width / 2, 205)
  }

  ctx.textAlign = 'center'
  ctx.font = 'bold 18px sans-serif'
  ROWS.forEach((keys, row) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keyRect(row, i)
      const next = target && target.text[typed] === keys[i]
      ctx.fillStyle = next ? '#facc15' : '#1e293b'
      ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
      ctx.fillStyle = next ? '#020617' : '#e2e8f0'
      ctx.fillText(keys[i], k.x + KEY_W / 2, k.y + 23)
    }
  })
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
