---
title: A winning streak
title_tr: Galibiyet serisi
skills: [game.state]
---

# --goal--

A streak counts words solved in a row. A win adds one; a loss sets it back to 0.

# --goal-tr--

Oyuna küçük bir hırs katalım: **seri** (streak), art arda kaç kelime bildiğini sayar. Her galibiyet seriyi 1
artırır; bir kayıp seriyi **sıfırlar**. Sağ üstte, ıska sayacının üstünde görünecek.

# --code--

```js
let streak = 0

  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
    streak += 1
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
    streak = 0
  }

  ctx.fillText('Streak ' + streak, 260, 70)
```

# --meaning--

- `streak` starts at 0 once, when the page loads; `newWord` does not touch it, so it lives across words.
- A win adds one, a loss resets it.
- It is drawn above the misses, with the same font and color.

# --meaning-tr--

- `let streak = 0` → seri, sayfa açılınca **bir kez** 0'dan başlar. `newWord` ona dokunmaz; böylece kelimeden
  kelimeye taşınır.
- `streak += 1` → kazanınca bir artır.
- `streak = 0` → kaybedince sıfırla.
- `ctx.fillText('Streak ' + streak, 260, 70)` → ıska sayacının 30 piksel üstüne yazar. Yazı tipi, rengi ve hizası
  bir önceki satırlardan geliyor.

# --task--

1. Under `let state ...` write `let streak = 0`.
2. In `guess`, under `state = 'won'` write `streak += 1`; under `state = 'lost'` write `streak = 0`.
3. In `draw`, above the `Misses` line, write the `Streak` line. Press **Run**.

# --task-tr--

1. `let state` satırının altına `let streak = 0` yaz.
2. `guess` içinde `state = 'won'` satırının altına `streak += 1`, `state = 'lost'` satırının altına `streak = 0` yaz.
3. `draw` içinde `ctx.fillText('Misses ' ...)` satırının **üstüne** `Streak` satırını yaz.
4. **Çalıştır**, iki kelime bul: `Streak 2` görmelisin.

# --tests--

A win should add one to the streak; a loss should reset it.
tr: Kazanmak seriyi bir artırmalı; kaybetmek sıfırlamalı.

```js
assert.strictEqual(streak, 0)
word = 'TIGER'
for (const key of 'tiger') $.press(key)
assert.strictEqual(streak, 1)
newWord()
word = 'ZEBRA'
for (const key of 'zebra') $.press(key)
assert.strictEqual(streak, 2, 'the streak lives across words')
newWord()
word = 'TIGER'
for (const key of 'abcdfh') $.press(key)
assert.strictEqual(streak, 0, 'a loss ends the streak')
```

The streak should be drawn at (260, 70).
tr: Seri (260, 70)'e yazılmalı.

```js
streak = 3
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Streak 3'))
assert.exists(t)
assert.deepEqual(t.args.slice(1), [260, 70])
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

let word
let guessed // a Set of the letters tried so far
let wrong
let state // 'playing', 'won' or 'lost'
let streak = 0

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
  ctx.fillText('Streak ' + streak, 260, 70)
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
