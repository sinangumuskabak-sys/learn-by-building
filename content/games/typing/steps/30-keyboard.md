---
title: Draw the keyboard
title_tr: Klavyeyi çiz
skills: [game.canvas, prog.loops]
---

# --goal--

Each key is a dark box with its letter in the middle. `forEach` goes over the rows, and a `for` loop over the letters
of each row.

# --goal-tr--

Şimdi klavyeyi çiziyoruz: her tuş koyu bir kutu, ortasında harfi. Sıraları `forEach` ile, her sıranın harflerini de
bir `for` döngüsüyle geziyoruz.

# --code--

```js
ctx.textAlign = 'center'
ctx.font = 'bold 18px sans-serif'
ROWS.forEach((keys, row) => {
  for (let i = 0; i < keys.length; i++) {
    const k = keyRect(row, i)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
    ctx.fillStyle = '#e2e8f0'
    ctx.fillText(keys[i], k.x + KEY_W / 2, k.y + 23)
  }
})
```

# --meaning--

- `ROWS.forEach((keys, row) => ...)` runs once per row: `keys` is its text, `row` its number.
- A text works like a list: `keys[i]` is its `i`th letter and `keys.length` how many there are.
- The letter is centred in the box (`KEY_W / 2`), with its baseline 23 pixels from the top.

# --meaning-tr--

- `ROWS.forEach((keys, row) => { ... })` → `forEach`, listenin **her elemanı için** içini çalıştırır: `keys` o sıranın
  yazısı (`'asdfghjkl'`), `row` sırası (0, 1, 2).
- `for (let i = 0; i < keys.length; i++)` → sıradaki her harf. Bir yazı liste gibi davranır: `keys[i]` `i`. harf.
- `const k = keyRect(row, i)` → tuşun sol üst köşesi.
- Koyu kutu (`'#1e293b'`), sonra açık renkli harf, kutunun **ortasında** (`k.x + KEY_W / 2`, `textAlign` ortalı).
  `k.y + 23` harflerin oturduğu çizgi.
- Klavye `draw`'un **en sonunda**: oyun bitti kartından sonra, ama kartla çakışmaz; kart üstte, klavye altta.

# --task--

At the end of `draw`, after the game over block, leave an empty line and write the keyboard lines.

# --task-tr--

`draw`'un sonunda, `if (state === 'over') { ... }` bloğunun kapanan `}`'sinin altında bir boş satır bırak ve klavye
satırlarını yaz; fonksiyonun son `}`'si altta kalsın. **Çalıştır**: zeminin altında bir klavye görmelisin.

# --tests--

Every letter should be drawn on a key.
tr: Her harf bir tuşun üstünde çizilmeli.

```js
$.tick(1)
for (const k of 'qwertyuiopasdfghjklzxcvbnm') assert.include($.texts(), k)
const keys = $.rects('#1e293b')
assert.lengthOf(keys, 26)
assert.deepInclude(keys, { x: 6.5, y: 350, w: 44, h: 34, color: '#1e293b' })
const q = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'q')
assert.deepEqual(q.args.slice(1, 3), [28.5, 373])
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
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
      ctx.fillStyle = '#e2e8f0'
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
