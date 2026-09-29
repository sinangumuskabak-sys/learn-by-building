---
title: Tap the keys
title_tr: Tuşlara dokun
skills: [game.input]
---

# --goal--

A tap on a key calls the same `type(key)` as the real keyboard, so every rule works the same on both. After the game,
a tap plays again.

# --goal-tr--

Ekrandaki tuşa **dokunmak** o harfi yazsın. Dokunuş da gerçek klavyeyle **aynı** `type(key)`'i çağıracak; böylece
kilitlenme, hatalar, puan her şey iki yolda da aynı çalışır. Oyun bittikten sonra bir dokunuş yeniden başlatsın.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state === 'over') return reset()
  ROWS.forEach((keys, row) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keyRect(row, i)
      if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) type(keys[i])
    }
  })
})

    ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 205)
```

# --meaning--

- `pointerdown` fires for a mouse button or a finger. `getBoundingClientRect()` gives the canvas's box on the page; the
  two formulas turn the page position into canvas pixels, even when the canvas is shown smaller on a phone.
- The loops go over every key with the same `keyRect`; if the point is inside a key's box, its letter is typed.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → canvas'a fareyle ya da parmakla **basıldığında**.
- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki kutusu: `left`, `top` (kenarları), `width`, `height`
  (ekranda göründüğü boy).
- `((event.clientX - rect.left) * canvas.width) / rect.width` → `event.clientX` dokunuşun **sayfadaki** yeri. Önce
  canvas'ın kenarını çıkarırız, sonra ekran pikselini canvas pikseline çeviririz (telefonda canvas küçültülmüş
  olabilir). `y` için aynısı.
- `if (state === 'over') return reset()` → oyun bittiyse yeniden başlat.
- Döngüler **çizimdekiyle aynı**: her tuş için `keyRect`. `x >= k.x && x < k.x + KEY_W && ...` → nokta bu tuşun
  kutusunun içinde mi? İçindeyse `type(keys[i])`.
- Kartın son yazısı artık dokunmayı da söylüyor.

# --task--

1. Above `function draw() {` write the `pointerdown` listener, with an empty line after it.
2. Change the last panel text to `'Press Enter or tap to play again'`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `pointerdown` dinleyicisini yaz; altında bir boş satır kalsın.
2. Kartın son yazısını `'Press Enter or tap to play again'` yap.
3. **Çalıştır** ve ekrandaki tuşlara tıklayarak yaz. Oyun tamam!

# --tests--

Tapping keys should type.
tr: Tuşlara dokunmak yazmalı.

```js
spawnTimer = 100000
words = [{ text: 'cat', x: 10, y: 50 }]
$.click(77 + 2 * 47 + 22, 432 + 17)
assert.strictEqual(target.text, 'cat', 'tapping c')
$.click(30 + 22, 391 + 17)
assert.strictEqual(typed, 2)
$.click(240, 200)
assert.strictEqual(typed, 2, 'a tap outside the keys does nothing')
```

A tap after the game is over should start again.
tr: Oyun bittikten sonra bir dokunuş yeniden başlatmalı.

```js
spawnTimer = 100000
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND + 1 }))
$.tick(1)
assert.strictEqual(state, 'over')
$.tick(1)
assert.include($.texts(), 'Press Enter or tap to play again')
$.click(240, 200)
assert.strictEqual(state, 'playing', 'a tap starts again')
$.tick(1)
assert.include($.texts(), 'Score 0 Level 1')
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state === 'over') return reset()
  ROWS.forEach((keys, row) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keyRect(row, i)
      if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) type(keys[i])
    }
  })
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
    ctx.fillText(wpm() + ' words per minute, ' + accuracy() + '% accurate', canvas.width / 2, 175)
    ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 205)
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
