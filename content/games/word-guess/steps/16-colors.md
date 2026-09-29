---
title: Colour the guesses
title_tr: Tahminleri renklendir
skills: [game.canvas]
---

# --goal--

Each finished guess is drawn as full tiles in its marks' colours, with white letters. Typing goes into the row after
the last guess.

# --goal-tr--

Şimdi ipuçlarını **görelim**. Biten her tahmin kendi satırında, işaretlerinin renginde **dolu** karelerle çizilsin:
yeşil, sarı, gri. Yazdığın harfler de son tahminin **altındaki** satıra gelsin.

Renkleri bir nesnede tutacağız: `COLORS.green` yeşilin kodu. Böylece `COLORS[işaret]` diyerek işaretten renge geçeriz.

# --code--

```js
const COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }

  for (let row = 0; row < TRIES; row++) {
    const guess = guesses[row]
    const letters = guess ? guess.word : row === guesses.length ? current : ''

      if (guess) {
        ctx.fillStyle = COLORS[guess.marks[i]]
        ctx.fillRect(x, y, SIZE, SIZE)
      } else {
        ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      }
```

# --meaning--

- `COLORS` maps a mark to a colour: `COLORS['green']` is `'#16a34a'`.
- `guess` is this row's finished guess, or `undefined` if there is none yet.
- `letters`: the guess's word on a finished row; the typed letters on the first empty row (`row === guesses.length`);
  nothing below.
- A finished row is filled with colours; the others keep their outlines.

# --meaning-tr--

- `const COLORS = { green: ..., yellow: ..., gray: ... }` → işaretten renge bir **tablo** (nesne).
  `COLORS[guess.marks[i]]` → bu harfin işaretinin rengi.
- `const guess = guesses[row]` → bu satırın biten tahmini; o satıra henüz tahmin yoksa `undefined`.
- `guess ? guess.word : row === guesses.length ? current : ''` → iç içe iki kısa `if`: tahmin varsa onun kelimesi;
  yoksa ve bu satır **ilk boş satırsa** (`row === guesses.length`) yazdıkların; o da değilse hiçbir şey.
- `if (guess) { ... } else { ... }` → biten satırda dolu, renkli kare; diğerlerinde eski çerçeve.
- Harfler her iki durumda da beyaz yazılır (altındaki `if (letters[i])` bloğu).

# --task--

1. Under `const TOP = 12`, write `COLORS`.
2. In `draw`, replace the `letters` line with the two lines shown.
3. Wrap the three outline lines in `if (guess) { ... } else { ... }` as shown. Press **Run** and send a guess.

# --task-tr--

1. `const TOP = 12` satırının altına `COLORS` satırını yaz.
2. `draw` içindeki `const letters = ...` satırının yerine kod bloğundaki iki satırı yaz (`guess` ve yeni `letters`).
3. Çerçeveyi çizen üç satırı kod bloğundaki `if (guess) { ... } else { ... }` yapısına al: üç satır `else`'in içine
   girer.
4. **Çalıştır**, beş harf yazıp Enter'a bas: satır renklenmeli.

# --tests--

A finished guess should be drawn in its colours.
tr: Biten tahmin kendi renklerinde çizilmeli.

```js
answer = 'crane'
for (const k of 'caper') $.press(k)
$.press('Enter')
$.tick(1)
assert.deepEqual($.rects('#16a34a').map((r) => [r.x, r.y, r.w]), [[28, 12, 56]])
assert.lengthOf($.rects('#ca8a04'), 3)
assert.lengthOf($.rects('#3f3f46'), 1)
```

Typing should go on in the next row.
tr: Yazı bir sonraki satırda sürmeli.

```js
answer = 'crane'
for (const k of 'caper') $.press(k)
$.press('Enter')
$.press('t')
$.tick(1)
const t = $.screen().filter((c) => c.op === 'fillText').pop()
assert.deepEqual([t.args[0], t.args[2]], ['T', 12 + 62 + 29], 'typing goes on in the second row')
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
