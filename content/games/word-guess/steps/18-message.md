---
title: A message line
title_tr: Mesaj satırı
skills: [game.state]
---

# --goal--

A line under the grid tells the player what is happening: an invitation while playing, the result when it is over.
After a loss it reveals the answer; never finding out would be frustrating.

# --goal-tr--

Izgaranın altına bir **mesaj satırı**: oynarken bir davet (`Guess the five-letter word`, beş harfli kelimeyi bul),
oyun bitince sonuç. Kaybedince cevabı **göster**: hiç öğrenememek can sıkar.

# --code--

```js
ctx.font = 'bold 16px sans-serif'
ctx.fillStyle = 'white'
let message = 'Guess the five-letter word'
if (state === 'won') message = 'You got it! Enter for a new word'
if (state === 'lost') message = 'It was ' + answer.toUpperCase() + '. Enter for a new word'
ctx.fillText(message, canvas.width / 2, 393)
```

# --meaning--

- `message` starts as the invitation; each `if` replaces it for the end states.
- The answer is shown in capitals: `'It was CRANE. Enter for a new word'`.
- The text is centered under the grid (`textAlign` is still `'center'`).

# --meaning-tr--

- `let message = '...'` → önce davet yazısı. `let`, çünkü birazdan değişebilir.
- `if (state === 'won') message = ...` → kazandıysan mesajı değiştir. Kaybettiysen başka bir mesaj.
- `'It was ' + answer.toUpperCase() + '. Enter for a new word'` → cevabı büyük harfle ortaya koyar:
  `'It was CRANE. Enter for a new word'`.
- `ctx.fillText(message, canvas.width / 2, 393)` → ızgaranın altında, ortada. Hiza yukarıda `'center'` yapılmıştı.

# --task--

In `draw`, under the grid loops, leave an empty line and write the six lines. Press **Run**.

# --task-tr--

`draw` içinde ızgara döngülerini kapatan `}` satırının altına bir boş satır bırakıp altı satırı yaz. **Çalıştır**:
altta davet yazısı görünmeli; bir oyunu bitirince sonuç.

# --tests--

While playing, the message should invite the player.
tr: Oynarken mesaj oyuncuyu davet etmeli.

```js
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Guess the five-letter word')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [180, 393])
```

A win and a loss should be announced, and a loss should show the answer.
tr: Kazanç ve kayıp duyurulmalı; kayıp cevabı göstermeli.

```js
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
$.tick(1)
assert.include($.texts(), 'You got it! Enter for a new word')
$.press('Enter')
answer = 'crane'
for (let i = 0; i < 6; i++) {
  for (const k of 'stool') $.press(k)
  $.press('Enter')
}
$.tick(1)
assert.include($.texts(), 'It was CRANE. Enter for a new word')
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
