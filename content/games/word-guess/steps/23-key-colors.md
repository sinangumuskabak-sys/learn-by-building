---
title: Keys that remember
title_tr: Hatırlayan tuşlar
skills: [prog.arrays, game.state]
---

# --goal--

The on-screen keyboard can do what a real one cannot: colour each key with the best thing known about its letter, so
you see at a glance which letters are left. Green beats yellow beats gray, so each mark gets a rank.

# --goal-tr--

Ekran klavyesi gerçek klavyenin yapamadığı bir şey yapabilir: her tuşu o harf hakkında **bildiklerinle** boyamak. Böylece
hangi harflerin denenmediğini bir bakışta görürsün.

Bir harf bir tahminde sarı, sonra yeşil olabilir; tuş **en iyi** bilgiyi göstermeli. "En iyi"nin bir sırası var:
yeşil > sarı > gri. Her işarete bir **puan** vereceğiz ve daha yüksek puanlı işaret eskisinin yerini alacak.

# --code--

```js
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

  const known = letterColors()

    ctx.fillStyle = known[k.key] ? COLORS[known[k.key]] : '#71717a'
```

# --meaning--

- `rank` orders the marks. `known` maps a letter to its best mark so far.
- For every letter of every guess: if nothing is known yet, or this mark ranks higher, it becomes the known mark.
- A key is drawn in its letter's colour, or grey if nothing is known (`OK` and `DEL` never are).

# --meaning-tr--

- `const rank = { gray: 1, yellow: 2, green: 3 }` → işaretlerin **puanı**.
- `const known = {}` → harften en iyi işarete bir tablo: `{ r: 'green', h: 'gray' }` gibi.
- `for (const g of guesses)` → her tahmin; içteki `forEach` o tahminin her harfi (`letter`) ve sırası (`i`).
- `!known[letter] || rank[mark] > rank[known[letter]]` → bu harf hakkında **hiçbir şey bilinmiyorsa** ya da yeni
  işaretin puanı eskisinden **yüksekse**: `known[letter] = mark`.
- `return known` → tabloyu ver.
- Çizimde `known[k.key] ? COLORS[known[k.key]] : '#71717a'` → harf biliniyorsa işaretinin rengi, değilse gri. `OK` ve
  `DEL`'in `key`'leri (`'Enter'`, `'Backspace'`) tabloda hiç olmadığı için hep gri.

# --task--

1. Above `function draw() {`, write the comment and `letterColors`, and leave an empty line.
2. In `draw`, above `ctx.font = 'bold 14px sans-serif'`, write `const known = letterColors()`.
3. In the key loop, change the first `fillStyle` line. Press **Run** and send a guess.

# --task-tr--

1. `function draw() {` satırının **üstüne** yorum satırını ve `letterColors` fonksiyonunu yaz; arada bir boş satır
   kalsın.
2. `draw` içinde `ctx.font = 'bold 14px sans-serif'` satırının **üstüne** `const known = letterColors()` yaz.
3. Tuş döngüsündeki ilk `ctx.fillStyle = '#71717a'` satırını kod bloğundaki satırla değiştir.
4. **Çalıştır** ve bir tahmin gönder: tuşlar renklenmeli.

# --predict--

You guessed `reach` (r is yellow) and then `crate` (r is green). What colour is the R key?
- [ ] Yellow, the first thing we learned
- [x] Green
  Green ranks 3, higher than yellow's 2, so it replaces it.
- [ ] Half yellow, half green

# --predict-tr--

Önce `reach` (r sarı), sonra `crate` (r yeşil) tahmin ettin. R tuşu ne renk olur?
- [ ] Sarı, ilk öğrendiğimiz
- [x] Yeşil
  Yeşilin puanı 3, sarınınki 2; yüksek olan eskisinin yerini alır.
- [ ] Yarısı sarı, yarısı yeşil

# --tests--

Keys should show the best thing known about each letter.
tr: Tuşlar her harf hakkında bilinen en iyi şeyi göstermeli.

```js
answer = 'crane'
for (const k of 'reach') $.press(k)
$.press('Enter')
for (const k of 'crate') $.press(k)
$.press('Enter')
const known = letterColors()
assert.strictEqual(known.r, 'green', 'yellow first, green later')
assert.strictEqual(known.h, 'gray')
assert.isUndefined(known.z)
$.tick(1)
const key = (letter) => keyRects().find((k) => k.key === letter)
const colorOf = (letter) => $.rects().find((r) => r.x === key(letter).x && r.y === key(letter).y).color
assert.strictEqual(colorOf('r'), '#16a34a')
assert.strictEqual(colorOf('h'), '#3f3f46')
assert.strictEqual(colorOf('z'), '#71717a')
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
