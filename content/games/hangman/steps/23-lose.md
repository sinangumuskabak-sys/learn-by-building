---
title: Losing
title_tr: Kaybetmek
skills: [game.state]
---

# --goal--

A `state` says which part of the game we are in: `'playing'`, `'won'` or `'lost'`. The sixth miss sets `'lost'`, and
`guess` only works while `'playing'`.

# --goal-tr--

Oyunun **aşamasını** bir değişkende tutacağız: `state` (durum). Üç değeri olabilir: `'playing'` (oynanıyor), `'won'`
(kazandın), `'lost'` (kaybettin).

Bu adımda kaybetmeyi yazıyoruz: altıncı ıskada `state` `'lost'` olur. `guess` da artık "ıskalar doldu mu?" yerine
daha genel bir soru sorar: "oyun sürüyor mu?"

# --code--

```js
let state // 'playing', 'won' or 'lost'

function newWord() {
  // ...
  state = 'playing'
}

function guess(letter) {
  if (state !== 'playing' || guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
  if (wrong === MAX_WRONG) {
    state = 'lost'
  }
}
```

# --meaning--

- `state` holds the stage of the game as text. Every new word starts `'playing'`.
- `!==` means "is not equal to". `guess` now returns when the game is not being played, which also covers the old
  `wrong === MAX_WRONG` check.
- The sixth miss sets `state` to `'lost'`.

# --meaning-tr--

- `let state` → oyunun aşaması, bir yazı olarak. Yorum olası değerleri hatırlatıyor.
- `state = 'playing'` → `newWord` içinde: her yeni kelimede oyun **başlar**.
- `state !== 'playing'` → `!==` "**eşit değil**". "Oyun sürmüyorsa" çık. Kaybedince `state` `'lost'` olacağı için
  eski `wrong === MAX_WRONG` sorusuna gerek kalmadı; onu siliyoruz.
- `if (wrong === MAX_WRONG) { state = 'lost' }` → ıska sayısı altıya ulaştıysa **kaybettin**.

# --task--

1. Under `let wrong` write `let state ...`.
2. In `newWord`, at the end, write `state = 'playing'`.
3. In `guess`, change the first line to `if (state !== 'playing' || guessed.has(letter)) return`.
4. At the end of `guess`, write the `if (wrong === MAX_WRONG)` block. Press **Run**.

# --task-tr--

1. `let wrong` satırının altına `let state // 'playing', 'won' or 'lost'` yaz.
2. `newWord` içinde en sona (`wrong = 0`'ın altına) `state = 'playing'` yaz.
3. `guess`'in ilk satırını `if (state !== 'playing' || guessed.has(letter)) return` yap.
4. `guess`'in sonuna, `wrong += 1` satırının altına `if (wrong === MAX_WRONG) { ... }` bloğunu yaz.
5. **Çalıştır**. Altı ıskadan sonra tahminler yine sayılmamalı; bu sefer sebebi `state`.

# --tests--

A new word should start with `state` = `'playing'`.
tr: Yeni kelime `state` = `'playing'` ile başlamalı.

```js
assert.strictEqual(state, 'playing')
state = 'lost'
newWord()
assert.strictEqual(state, 'playing')
```

The sixth miss should lose, and after that no guess should count.
tr: Altıncı ıska kaybettirmeli; ondan sonra hiçbir tahmin sayılmamalı.

```js
word = 'TIGER'
for (const key of 'abcdf') $.press(key)
assert.strictEqual(state, 'playing')
$.press('h')
assert.strictEqual(state, 'lost')
$.press('t')
assert.isFalse(guessed.has('T'), 'no guessing after the end')
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

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
  state = 'playing'
}

function guess(letter) {
  if (state !== 'playing' || guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
  if (wrong === MAX_WRONG) {
    state = 'lost'
  }
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
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
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(masked(), canvas.width / 2, 340)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
