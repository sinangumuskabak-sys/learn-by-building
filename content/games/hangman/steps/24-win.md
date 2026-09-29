---
title: Winning
title_tr: Kazanmak
skills: [game.state, prog.arrays]
---

# --goal--

You win when every letter of the word has been guessed. Arrays have a method that asks exactly that: `every`.

# --goal-tr--

Kazanmak: kelimenin **her** harfi tahmin edildiyse kazandın. Bu "hepsi mi?" sorusudur ve dizilerin tam bunu soran
bir komutu var: `every` (her biri).

# --code--

```js
function guess(letter) {
  // ...
  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
  }
```

# --meaning--

- `[...word].every((l) => guessed.has(l))` runs the test for each letter and is `true` only if it is true for all.
- `else if` means: if we did not win, check whether the misses ran out.

# --meaning-tr--

- `[...word]` → kelimenin harfleri, liste olarak.
- `.every((l) => guessed.has(l))` → her harf için "tahmin edildi mi?" diye sorar. **Hepsi** `true` derse sonuç
  `true`; bir tane bile `false` varsa `false`.
- `state = 'won'` → kazandın.
- `} else if (...) {` → "**değilse**, şunu sor": kazanmadıysan ıskalar doldu mu diye bak. Aynı tahmin hem
  kazandırıp hem kaybettiremez.

# --task--

In `guess`, above `if (wrong === MAX_WRONG) {`, write the `every` block, joining them with `} else`. Press **Run**.

# --task-tr--

`guess` içindeki `if (wrong === MAX_WRONG) {` satırını şöyle değiştir: önce `every` ile başlayan `if` bloğu, sonra
`} else if (wrong === MAX_WRONG) {`. Kod bloğundaki beş satırın aynısı olmalı. **Çalıştır** ve bir kelime bulmaya
çalış: bulunca artık harf kabul edilmemeli.

# --hint--

`every` needs the letters as an array, hence `[...word]`, and `guessed.has(l)` inside the arrow function.

# --hint-tr--

`every` bir liste ister, bu yüzden `[...word]`; ok fonksiyonunun içinde de `guessed.has(l)`.

# --tests--

Guessing every letter should win.
tr: Her harfi tahmin etmek kazandırmalı.

```js
word = 'TIGER'
for (const key of 'tigxe') $.press(key)
assert.strictEqual(state, 'playing')
$.press('r')
assert.strictEqual(state, 'won')
$.press('b')
assert.isFalse(guessed.has('B'), 'no guessing after the end')
```

Six misses should still lose.
tr: Altı ıska yine kaybettirmeli.

```js
word = 'TIGER'
for (const key of 'abcdfh') $.press(key)
assert.strictEqual(state, 'lost')
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
  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
  } else if (wrong === MAX_WRONG) {
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
