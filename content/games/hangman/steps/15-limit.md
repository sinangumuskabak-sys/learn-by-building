---
title: Six misses at most
title_tr: En fazla altı ıska
skills: [game.state]
---

# --goal--

The figure has six parts, so six misses is the most. `MAX_WRONG` names that number, and `guess` stops listening once
`wrong` reaches it.

# --goal-tr--

Çöp adamın **altı** parçası olacak: baş, gövde, iki kol, iki bacak. Yani en fazla altı ıska var; altıncıda oyun
bitecek. Bu sayıya bir ad veriyoruz: `MAX_WRONG`.

Iskalar bu sayıya ulaşınca `guess` artık tahmin kabul etmemeli.

# --code--

```js
const MAX_WRONG = 6

  if (guessed.has(letter) || wrong === MAX_WRONG) return
```

# --meaning--

- `MAX_WRONG` is the number of misses allowed.
- `||` means "or": `guess` returns if the letter was tried **or** the misses are used up.

# --meaning-tr--

- `const MAX_WRONG = 6` → izin verilen ıska sayısı. Oyunu zorlaştırmak ya da kolaylaştırmak istersen tek yeri
  değiştirirsin.
- `||` → "**veya**": iki koşuldan biri doğruysa yeter.
- `guessed.has(letter) || wrong === MAX_WRONG` → "harf denendiyse **veya** ıskalar dolduysa" çık.

# --task--

1. Under the `LETTERS` line write `const MAX_WRONG = 6`.
2. In `guess`, add `|| wrong === MAX_WRONG` to the first `if`. Press **Run**.

# --task-tr--

1. `LETTERS` satırının altına `const MAX_WRONG = 6` yaz.
2. `guess` içindeki ilk `if`'in koşuluna `|| wrong === MAX_WRONG` ekle:
   `if (guessed.has(letter) || wrong === MAX_WRONG) return`.
3. **Çalıştır**.

# --tests--

After six misses no more guesses should count.
tr: Altı ıskadan sonra başka tahmin sayılmamalı.

```js
word = 'CASTLE'
for (const key of 'bdfghijk') $.press(key)
assert.strictEqual(wrong, MAX_WRONG)
assert.strictEqual(guessed.size, 6, 'no more guesses after the last miss')
```

`MAX_WRONG` should be 6.
tr: `MAX_WRONG` 6 olmalı.

```js
assert.strictEqual(MAX_WRONG, 6)
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

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
}

function guess(letter) {
  if (guessed.has(letter) || wrong === MAX_WRONG) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
