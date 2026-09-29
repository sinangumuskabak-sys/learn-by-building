---
title: Keys that remember
title_tr: Hatırlayan tuşlar
skills: [game.state]
---

# --goal--

The keys show what you know: green if the letter was in the word, grey if it was a miss, light if not tried yet.

# --goal-tr--

Tuşlar bildiklerini de göstersin: denediğin harf kelimede **varsa yeşil**, **yoksa gri**; henüz denenmediyse açık
renk kalsın. Oyuncular buna ıska listesinden daha çok bakar.

# --code--

```js
for (let i = 0; i < LETTERS.length; i++) {
  const letter = LETTERS[i]
  const k = keyRect(i)
  let color = '#e7e5e4'
  if (guessed.has(letter)) color = word.includes(letter) ? '#86efac' : '#a8a29e'
  ctx.fillStyle = color
```

# --meaning--

- `color` starts as the light default.
- If the letter was guessed, it becomes green when the word contains it and grey when it does not.

# --meaning-tr--

- `let color = '#e7e5e4'` → önce varsayılan açık renk. `let`, çünkü birazdan değişebilir.
- `if (guessed.has(letter))` → harf denendiyse:
  - `word.includes(letter) ? '#86efac' : '#a8a29e'` → kelimede varsa **yeşil**, yoksa **gri**.
- `ctx.fillStyle = color` → kutuyu seçilen renkle boya.

# --task--

In the key loop in `draw`, replace `ctx.fillStyle = '#e7e5e4'` with the three lines. Press **Run** and guess a few letters.

# --task-tr--

`draw` içindeki tuş döngüsünde `ctx.fillStyle = '#e7e5e4'` satırını üç satırla değiştir. **Çalıştır**, oyuna tıkla ve
birkaç harf dene: tuşların rengi değişmeli.

# --tests--

Keys should turn green for a hit and grey for a miss.
tr: Tuşlar isabette yeşil, ıskada gri olmalı.

```js
word = 'ZEBRA'
$.press('z')
$.press('q')
$.tick(1)
assert.deepInclude($.rects('#86efac'), { x: 34 + 7 * 52, y: 440, w: 48, h: 34, color: '#86efac' }, 'a hit is green')
assert.deepInclude($.rects('#a8a29e'), { x: 8 + 7 * 52, y: 400, w: 48, h: 34, color: '#a8a29e' }, 'a miss is grey')
assert.lengthOf($.rects('#e7e5e4'), 24)
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_WRONG = 6
const KEY_W = 48
const KEY_H = 34
const KEYS_Y = 360

let word
let guessed // a Set of the letters tried so far
let wrong
let state // 'playing', 'won' or 'lost'
let streak = 0
let best = Number(localStorage.getItem('hangman-best')) || 0

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  let next
  do next = WORDS[Math.floor(Math.random() * WORDS.length)]
  while (next === word) // never the same word twice in a row
  word = next
  guessed = new Set()
  wrong = 0
  state = 'playing'
}

function guess(letter) {
  if (state !== 'playing' || guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
    streak += 1
    if (streak > best) {
      best = streak
      localStorage.setItem('hangman-best', best)
    }
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
    streak = 0
  }
}

document.addEventListener('keydown', (event) => {
  if (state !== 'playing' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    newWord()
    return
  }
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

// The on-screen keyboard: rows of 9 keys, centered.
function keyRect(i) {
  const row = Math.floor(i / 9)
  const inRow = row === 2 ? 8 : 9
  const left = (canvas.width - inRow * (KEY_W + 4) + 4) / 2
  return { x: left + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}

canvas.addEventListener('pointerdown', () => {
  if (state !== 'playing') newWord()
})

function line(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

// One drawing per wrong guess.
const PARTS = [
  () => {
    ctx.beginPath()
    ctx.arc(170, 110, 20, 0, Math.PI * 2) // head
    ctx.stroke()
  },
  () => line(170, 130, 170, 200), // body
  () => line(170, 150, 140, 180), // left arm
  () => line(170, 150, 200, 180), // right arm
  () => line(170, 200, 145, 245), // left leg
  () => line(170, 200, 195, 245), // right leg
]

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The gallows
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 6
  line(40, 270, 220, 270)
  line(80, 270, 80, 50)
  line(80, 50, 170, 50)
  line(170, 50, 170, 90)
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 4
  for (let i = 0; i < wrong; i++) PARTS[i]()

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Streak ' + streak + '  Best ' + best, 260, 70)
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  if (state === 'lost') {
    ctx.fillStyle = '#b91c1c'
    ctx.fillText([...word].join(' '), canvas.width / 2, 340)
  } else {
    ctx.fillStyle = '#1f2937'
    ctx.fillText(masked(), canvas.width / 2, 340)
  }
  if (state !== 'playing') {
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = state === 'won' ? '#15803d' : '#b91c1c'
    ctx.fillText(state === 'won' ? 'You got it! Click for the next word' : 'Hanged! Click to try another', canvas.width / 2, 298)
  }

  for (let i = 0; i < LETTERS.length; i++) {
    const letter = LETTERS[i]
    const k = keyRect(i)
    let color = '#e7e5e4'
    if (guessed.has(letter)) color = word.includes(letter) ? '#86efac' : '#a8a29e'
    ctx.fillStyle = color
    ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(letter, k.x + KEY_W / 2, k.y + 24)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
