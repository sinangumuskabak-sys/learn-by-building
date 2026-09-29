---
title: Winning and losing
title_tr: Kazanmak ve kaybetmek
skills: [game.state]
---

# --goal--

A guess that matches the answer wins; six that do not, lose. A `state` remembers which. Once the game is over, keys do
nothing, except Enter, which starts a new word.

# --goal-tr--

Oyunun sonu: cevapla aynı tahmin **kazandırır**; altı tahminde bulamazsan **kaybedersin**. Bunu bir değişkende
tutacağız: `state` (durum): `'playing'` (oynanıyor), `'won'` (kazandın) ya da `'lost'` (kaybettin).

Oyun bitince harfler artık yazılmamalı; ama bir tuşun anlamı var: **Enter** yeni kelime başlatır. Bu kontrolü `type`'ın
en başına koymak her tuşun anlamını tek yerde tutar.

# --code--

```js
let state // 'playing', 'won' or 'lost'

  state = 'playing'

function type(key) {
  if (state !== 'playing') {
    if (key === 'Enter') reset()
    return
  }

  else if (key === 'Enter' && current.length === 5) {
    guesses.push({ word: current, marks: score(current, answer) })
    if (current === answer) state = 'won'
    else if (guesses.length === TRIES) state = 'lost'
    current = ''
```

# --meaning--

- A new game starts `'playing'`.
- After the game, `type` returns at once; Enter first calls `reset()`.
- After adding a guess: the answer wins; otherwise the sixth guess loses.
- `&& guesses.length < TRIES` can go: after six guesses the state is no longer `'playing'`, so the first check already
  stops a seventh.

# --meaning-tr--

- `let state` → oyunun aşaması; `reset` içinde `state = 'playing'`.
- `if (state !== 'playing') { ... }` → `type`'ın en başında: oyun **bittiyse** (`!==` "eşit değil"): Enter ise
  `reset()` (yeni kelime), sonra her durumda `return`: başka hiçbir tuş işlemez.
- `if (current === answer) state = 'won'` → tahmin cevapsa kazandın.
- `else if (guesses.length === TRIES) state = 'lost'` → değilse ve bu altıncı tahminse kaybettin.
- `&& guesses.length < TRIES` silindi: altıncı tahminden sonra oyun zaten bitiyor; yedinci tahmini en baştaki kontrol
  durdurur.

# --task--

1. Under `let current`, write `let state ...`; in `reset`, under `current = ''`, write `state = 'playing'`.
2. At the top of `type`, write the `if (state !== 'playing')` block.
3. In the Enter block, remove `&& guesses.length < TRIES` and write the two `state` lines under `guesses.push(...)`.

# --task-tr--

1. `let current` satırının altına `let state ...` yaz; `reset` içinde `current = ''` satırının altına
   `state = 'playing'` yaz.
2. `type`'ın **en üstüne** `if (state !== 'playing') { ... }` bloğunu yaz.
3. Enter bloğunun koşulundan `&& guesses.length < TRIES` kısmını sil; `guesses.push(...)` satırının altına iki `state`
   satırını yaz.
4. **Çalıştır**. Mesajı bir sonraki adımda yazacağız.

# --tests--

Guessing the word should win and stop the typing.
tr: Kelimeyi bilmek kazandırmalı ve yazmayı durdurmalı.

```js
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
assert.strictEqual(state, 'won')
$.press('x')
assert.strictEqual(current, '')
```

Six wrong guesses should lose.
tr: Altı yanlış tahmin kaybettirmeli.

```js
answer = 'crane'
for (let i = 0; i < 6; i++) {
  assert.strictEqual(state, 'playing')
  for (const k of 'stool') $.press(k)
  $.press('Enter')
}
assert.strictEqual(state, 'lost')
```

Enter should start a new word when the game is over.
tr: Oyun bitince Enter yeni bir kelime başlatmalı.

```js
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
$.press('Enter')
assert.deepEqual([state, guesses.length, current], ['playing', 0, ''])
assert.include(WORDS, answer)
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
