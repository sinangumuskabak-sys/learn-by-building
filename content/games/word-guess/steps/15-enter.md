---
title: Enter sends the guess
title_tr: Enter tahmini gönderir
skills: [game.input, prog.arrays]
---

# --goal--

Enter with five letters typed turns them into a finished guess: `{ word, marks }` goes into the `guesses` list and
typing starts again from empty.

# --goal-tr--

Beş harf yazınca **Enter** tahmini göndersin. Gönderilen tahmin puanlanır ve bir listeye girer: `guesses` (tahminler).
Her tahmin iki bilgili bir nesne: `word` (kelime) ve `marks` (işaretler). Sonra yazı temizlenir; sıradaki tahmine
geçilir.

# --code--

```js
let guesses // the finished guesses, each { word, marks }

  guesses = []

  else if (key === 'Enter' && current.length === 5 && guesses.length < TRIES) {
    guesses.push({ word: current, marks: score(current, answer) })
    current = ''
  }

  if (key === 'Enter' || key === 'Backspace' || /^[a-z]$/.test(key)) {
```

# --meaning--

- `guesses` starts as an empty array in `reset`.
- A third `else if` in `type`: Enter, five letters, and a try left.
- `push` adds `{ word: current, marks: score(current, answer) }` at the end of the list, then `current` is emptied.
- The listener passes Enter on too.

# --meaning-tr--

- `let guesses` → biten tahminlerin listesi; `reset` içinde `guesses = []` (boş liste).
- `else if (key === 'Enter' && current.length === 5 && guesses.length < TRIES)` → Enter, beş harf **ve** hâlâ hak var.
- `guesses.push({ ... })` → listenin **sonuna** ekler. `{ word: current, marks: score(current, answer) }` → yazılan
  kelime ve onun puanı, tek pakette.
- `current = ''` → yazıyı temizle.
- Dinleyicide `key === 'Enter' ||` → Enter da `type`'a gitsin.

# --task--

1. Under `let answer`, write `let guesses ...`; in `reset`, under the `answer` line, write `guesses = []`.
2. In `type`, add the Enter `else if` block at the end.
3. In the listener, add `key === 'Enter' || ` to the `if`. Press **Run**.

# --task-tr--

1. `let answer` satırının altına `let guesses ...` yaz; `reset` içinde `answer = ...` satırının altına `guesses = []` yaz.
2. `type` içinde en sona, harf satırının altına Enter için `else if` bloğunu yaz.
3. Dinleyicideki `if` koşulunun başına `key === 'Enter' || ` ekle.
4. **Çalıştır**. Renkli kareleri bir sonraki adımda çizeceğiz.

# --tests--

Enter should submit a full guess.
tr: Enter dolu bir tahmini göndermeli.

```js
answer = 'crane'
for (const k of 'cap') $.press(k)
$.press('Enter')
assert.lengthOf(guesses, 0, 'not five letters yet')
for (const k of 'er') $.press(k)
$.press('Enter')
assert.lengthOf(guesses, 1)
assert.deepEqual(guesses[0], { word: 'caper', marks: ['green', 'yellow', 'gray', 'yellow', 'yellow'] })
assert.strictEqual(current, '')
```

There should be no more than six guesses.
tr: Altıdan fazla tahmin olmamalı.

```js
answer = 'crane'
for (let i = 0; i < 7; i++) {
  for (const k of 'stool') $.press(k)
  $.press('Enter')
}
assert.lengthOf(guesses, 6)
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

let answer
let guesses // the finished guesses, each { word, marks }
let current // the letters typed so far

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  guesses = []
  current = ''
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
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
  else if (key === 'Enter' && current.length === 5 && guesses.length < TRIES) {
    guesses.push({ word: current, marks: score(current, answer) })
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
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
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
