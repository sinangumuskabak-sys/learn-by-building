---
title: Draw the keyboard
title_tr: Klavyeyi çiz
skills: [game.canvas]
---

# --goal--

Every rectangle from `keyRects()` becomes a grey key with its label in white capitals.

# --goal-tr--

Listedeki her dikdörtgeni çiziyoruz: gri bir tuş ve üstünde beyaz, büyük harfle yazısı.

# --code--

```js
ctx.font = 'bold 14px sans-serif'
for (const k of keyRects()) {
  ctx.fillStyle = '#71717a'
  ctx.fillRect(k.x, k.y, k.w, k.h)
  ctx.fillStyle = 'white'
  ctx.fillText(k.label.toUpperCase(), k.x + k.w / 2, k.y + k.h / 2)
}
```

# --meaning--

- `for (const k of list)` runs once per key.
- The key is filled grey; its label is centered on it.

# --meaning-tr--

- `for (const k of keyRects())` → **for...of döngüsü**: listedeki her tuş için bir kez; o anki tuşun adı `k`.
- `ctx.fillRect(k.x, k.y, k.w, k.h)` → gri tuş.
- `ctx.fillText(k.label.toUpperCase(), k.x + k.w / 2, k.y + k.h / 2)` → yazısı büyük harfle, tuşun tam ortasında.

# --task--

In `draw`, under the grid loops and above the message lines, leave an empty line and write the keyboard lines.

# --task-tr--

`draw` içinde ızgara döngülerinin altına, mesaj satırlarının (`ctx.font = 'bold 16px sans-serif'`) **üstüne**, bir boş
satır bırakıp klavye satırlarını yaz. Mesajla arada bir boş satır kalsın. **Çalıştır**: altta üç satırlık bir klavye
görmelisin.

# --tests--

Every key should be drawn with its letter.
tr: Her tuş harfiyle çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#71717a'), 26)
assert.deepInclude($.rects('#71717a'), { x: 2, y: 408, w: 32, h: 44, color: '#71717a' })
const q = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Q')
assert.deepEqual(q.args.slice(1), [18, 430])
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
  'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
  'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
  'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
  'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12
const COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 32
const KEY_H = 44
const KEYS_TOP = 408

let answer
let guesses // the finished guesses, each { word, marks }
let current // the letters typed so far
let state // 'playing', 'won' or 'lost'

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  guesses = []
  current = ''
  state = 'playing'
}

// Mark each letter: green in the right place, yellow somewhere else in the word, gray not (or not that many times).
function score(guess, word) {
  const marks = Array(5).fill('gray')
  const left = {} // letters of the word not matched by a green
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) marks[i] = 'green'
    else left[word[i]] = (left[word[i]] || 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] !== 'green' && left[guess[i]] > 0) {
      marks[i] = 'yellow'
      left[guess[i]] -= 1
    }
  }
  return marks
}

function type(key) {
  if (state !== 'playing') {
    if (key === 'Enter') reset()
    return
  }
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
  else if (key === 'Enter' && current.length === 5) {
    guesses.push({ word: current, marks: score(current, answer) })
    if (current === answer) state = 'won'
    else if (guesses.length === TRIES) state = 'lost'
    current = ''
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Enter' || key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

// The on-screen keyboard: each row is centered.
function keyRects() {
  const rects = []
  KEY_ROWS.forEach((row, r) => {
    const total = row.length * KEY_W + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k) => {
      rects.push({ key: k, label: k, x, y: KEYS_TOP + r * (KEY_H + 6), w: KEY_W, h: KEY_H })
      x += KEY_W + 4
    })
  })
  return rects
}

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const guess = guesses[row]
    const letters = guess ? guess.word : row === guesses.length ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      if (guess) {
        ctx.fillStyle = COLORS[guess.marks[i]]
        ctx.fillRect(x, y, SIZE, SIZE)
      } else {
        ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      }
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }

  ctx.font = 'bold 14px sans-serif'
  for (const k of keyRects()) {
    ctx.fillStyle = '#71717a'
    ctx.fillRect(k.x, k.y, k.w, k.h)
    ctx.fillStyle = 'white'
    ctx.fillText(k.label.toUpperCase(), k.x + k.w / 2, k.y + k.h / 2)
  }

  ctx.font = 'bold 16px sans-serif'
  ctx.fillStyle = 'white'
  let message = 'Guess the five-letter word'
  if (state === 'won') message = 'You got it! Enter for a new word'
  if (state === 'lost') message = 'It was ' + answer.toUpperCase() + '. Enter for a new word'
  ctx.fillText(message, canvas.width / 2, 393)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
