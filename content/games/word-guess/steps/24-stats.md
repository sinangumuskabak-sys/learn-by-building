---
title: Keep statistics
title_tr: İstatistik tut
skills: [game.state]
---

# --goal--

Word games live on streaks. Three numbers in one object, `{ played, won, streak }`, are updated and saved in
`localStorage` every time a game ends. Because the end now does more than set `state`, it moves into `finish(result)`,
so both endings go through the same code.

# --goal-tr--

Kelime oyunlarının tadı **seride**: art arda kaç kelime buldun? Üç sayıyı tek bir nesnede tutacağız:
`{ played, won, streak }` (oynanan, kazanılan, seri). Her oyun bitince güncelleyip tarayıcının not defterine,
`localStorage`'a kaydedeceğiz; sayfa kapansa da kalır.

Oyunun sonu artık `state`'i değiştirmekten fazlasını yapıyor; bu yüzden küçük bir fonksiyona taşıyoruz: `finish(result)`.
Kazanma da kaybetme de aynı koddan geçer.

# --code--

```js
let stats = JSON.parse(localStorage.getItem('word-stats') || '{"played":0,"won":0,"streak":0}')

function finish(result) {
  state = result
  stats.played += 1
  if (result === 'won') {
    stats.won += 1
    stats.streak += 1
  } else {
    stats.streak = 0
  }
  localStorage.setItem('word-stats', JSON.stringify(stats))
}

    if (current === answer) finish('won')
    else if (guesses.length === TRIES) finish('lost')
```

# --meaning--

- `localStorage` stores only text, so the object is saved as JSON text and read back with `JSON.parse`. The first time
  there is nothing saved, and `||` falls back to a text of zeros.
- A win adds to all three; a loss adds to `played` and resets the streak.
- `type` calls `finish` instead of setting `state` itself.

# --meaning-tr--

- `localStorage.getItem('word-stats')` → defterden kaydı okur; ilk seferde yoktur (`null`).
- `|| '{"played":0,"won":0,"streak":0}'` → kayıt yoksa sıfırlarla dolu bir **JSON yazısı** kullan.
- `JSON.parse(...)` → yazıyı nesneye çevirir. (Defter sadece yazı saklar; nesneyi yazıya çevirmek için
  `JSON.stringify`.)
- `function finish(result)` → `result` `'won'` ya da `'lost'`: önce `state = result`.
- `stats.played += 1` → her oyun sayılır. Kazanınca `won` ve `streak` de artar; kaybedince `streak = 0`.
- `localStorage.setItem('word-stats', JSON.stringify(stats))` → nesneyi yazıya çevirip kaydet.
- `type` içinde `state = 'won'` yerine `finish('won')`, `state = 'lost'` yerine `finish('lost')`.
- Kazanma oranını saklamıyoruz: `won` ve `played`'den her zaman hesaplanabilir. Hesaplanabileni saklamamak, birbirini
  tutmayan sayıları önler.

# --task--

1. Under `let state ...`, write the `stats` line.
2. Under the `score` function, leave an empty line and write `finish`.
3. In `type`, replace the two `state = ...` with `finish('won')` and `finish('lost')`. Press **Run**.

# --task-tr--

1. `let state ...` satırının altına `stats` satırını yaz.
2. `score` fonksiyonunun altına bir boş satır bırakıp `finish` fonksiyonunu yaz.
3. `type` içindeki `state = 'won'` yerine `finish('won')`, `state = 'lost'` yerine `finish('lost')` yaz.
4. **Çalıştır**. İstatistikleri bir sonraki adımda göstereceğiz.

# --tests--

Wins should build a streak, and be saved.
tr: Galibiyetler seri oluşturmalı ve kaydedilmeli.

```js
assert.deepEqual(stats, { played: 0, won: 0, streak: 0 })
for (let i = 0; i < 2; i++) {
  answer = 'crane'
  for (const k of 'crane') $.press(k)
  $.press('Enter')
  $.press('Enter')
}
assert.deepEqual(stats, { played: 2, won: 2, streak: 2 })
assert.deepEqual(JSON.parse(localStorage.getItem('word-stats')), { played: 2, won: 2, streak: 2 })
```

A loss should end the streak.
tr: Kayıp seriyi bitirmeli.

```js
stats = { played: 2, won: 2, streak: 2 }
answer = 'crane'
for (let i = 0; i < 6; i++) {
  for (const k of 'stool') $.press(k)
  $.press('Enter')
}
assert.strictEqual(state, 'lost')
assert.deepEqual(stats, { played: 3, won: 2, streak: 0 })
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
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'] // > is Enter, < is Backspace
const KEY_W = 32
const KEY_H = 44
const KEYS_TOP = 408

let answer
let guesses // the finished guesses, each { word, marks }
let current // the letters typed so far
let state // 'playing', 'won' or 'lost'
let stats = JSON.parse(localStorage.getItem('word-stats') || '{"played":0,"won":0,"streak":0}')

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

function finish(result) {
  state = result
  stats.played += 1
  if (result === 'won') {
    stats.won += 1
    stats.streak += 1
  } else {
    stats.streak = 0
  }
  localStorage.setItem('word-stats', JSON.stringify(stats))
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
    if (current === answer) finish('won')
    else if (guesses.length === TRIES) finish('lost')
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
    const widths = [...row].map((k) => (k === '>' || k === '<' ? KEY_W * 1.5 : KEY_W))
    const total = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * 4
    let x = (canvas.width - total) / 2
    ;[...row].forEach((k, i) => {
      const [key, label] = { '>': ['Enter', 'OK'], '<': ['Backspace', 'DEL'] }[k] || [k, k]
      rects.push({ key, label, x, y: KEYS_TOP + r * (KEY_H + 6), w: widths[i], h: KEY_H })
      x += widths[i] + 4
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

// The best thing known about each letter so far: green beats yellow beats gray.
function letterColors() {
  const rank = { gray: 1, yellow: 2, green: 3 }
  const known = {}
  for (const g of guesses) {
    ;[...g.word].forEach((letter, i) => {
      const mark = g.marks[i]
      if (!known[letter] || rank[mark] > rank[known[letter]]) known[letter] = mark
    })
  }
  return known
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

  const known = letterColors()
  ctx.font = 'bold 14px sans-serif'
  for (const k of keyRects()) {
    ctx.fillStyle = known[k.key] ? COLORS[known[k.key]] : '#71717a'
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
