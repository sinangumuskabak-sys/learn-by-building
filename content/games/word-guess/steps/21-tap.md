---
title: Tap a key
title_tr: Tuşa dokun
skills: [game.input]
---

# --goal--

A tap finds the key under the pointer in the same `keyRects()` list and types it. A tap anywhere else after the game
starts a new word.

# --goal-tr--

Şimdi tuşlara **dokunmak** yazsın. Dokunulan noktayı tuval piksellerine çevirip `keyRects()` listesinde "bu nokta
hangi tuşun içinde?" diye arayacağız. Tuş bulunursa `type` ile yazarız; klavyeden gelen harflerle aynı yol.

Oyun bittiyse tuş dışında bir yere dokunmak yeni kelime başlatsın.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const hit = keyRects().find((k) => x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h)
  if (hit) type(hit.key)
  else if (state !== 'playing') reset()
})
```

# --meaning--

- `pointerdown` fires for a mouse button or a finger.
- The canvas may be shown at another size, so the position is scaled into canvas pixels.
- `find` returns the first key whose rectangle holds the point, or `undefined`.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → tuvale fareyle basıldığında ya da parmakla **dokunulduğunda**.
- `canvas.getBoundingClientRect()` → tuvalin ekrandaki yeri ve boyu. Tuval ekranda küçülebilir (telefonda); konumu
  oranlayıp **tuval pikseline** çeviririz.
- `keyRects().find((k) => ...)` → koşulu tutan **ilk** tuşu bulur; yoksa `undefined`.
- `x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h` → nokta tuşun sol ve sağ kenarı **arasında ve** üst ve alt
  kenarı arasında mı? Tuşlar arasındaki boşluk hiçbir tuşa ait değil.
- `if (hit) type(hit.key)` → tuşun `key`'ini yaz.
- `else if (state !== 'playing') reset()` → tuş yoksa ve oyun bittiyse yeni kelime.

# --task--

Above `function draw() {`, write the listener and leave an empty line. Press **Run** and tap the keys.

# --task-tr--

`function draw() {` satırının **üstüne** dinleyiciyi yaz; arada bir boş satır kalsın. **Çalıştır** ve fareyle tuşlara
tıkla: harfler yazılmalı.

# --tests--

Tapping letter keys should type.
tr: Harf tuşlarına dokunmak yazmalı.

```js
for (const letter of 'caperx') {
  const k = keyRects().find((r) => r.key === letter)
  $.click(k.x + 10, k.y + 10)
}
assert.strictEqual(current, 'caper', 'the sixth letter does not fit')
$.click(1, 430)
assert.strictEqual(current, 'caper', 'a tap beside the keys types nothing')
```

A tap on the board after the game should start a new word.
tr: Oyun bitince tahtaya dokunmak yeni kelime başlatmalı.

```js
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
assert.strictEqual(state, 'won')
$.click(180, 200)
assert.strictEqual(state, 'playing')
assert.lengthOf(guesses, 0)
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const hit = keyRects().find((k) => x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h)
  if (hit) type(hit.key)
  else if (state !== 'playing') reset()
})

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
