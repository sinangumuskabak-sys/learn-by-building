---
title: Count the misses
title_tr: Iskaları say
skills: [game.state]
---

# --goal--

A guess that is not in the word is a miss. `wrong` counts them; it starts at 0 for every word.

# --goal-tr--

Kelimede olmayan bir harf **ıska**dır (yanlış tahmin). Iskalar önemli: her ıska çöp adama bir parça ekleyecek ve
altı ıskada oyun bitecek. Onları `wrong` (yanlış) değişkeninde sayacağız.

# --code--

```js
let wrong

function newWord() {
  // ...
  wrong = 0
}

function guess(letter) {
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}
```

# --meaning--

- `wrong` counts misses; `newWord` resets it to 0.
- `word.includes(letter)` is true if the word contains the letter; `!` turns true into false and back, so
  `!word.includes(letter)` means "the word does not contain it".
- `wrong += 1` adds one.

# --meaning-tr--

- `let wrong` → ıska sayacı.
- `wrong = 0` → `newWord` içinde: her yeni kelime **sıfır** ıskayla başlar. (Koddaki `// ...` "buradaki satırlar
  aynı kalıyor" demek; onu yazma.)
- `word.includes(letter)` → "kelime bu harfi **içeriyor mu**?" `includes` yazılarda da çalışır.
- `!` → "**değil**": doğruyu yanlışa, yanlışı doğruya çevirir. `!word.includes(letter)` → "kelimede **yoksa**".
- `wrong += 1` → "wrong'a 1 ekle" (`wrong = wrong + 1`'in kısası).

# --task--

1. Under `let guessed ...` write `let wrong`.
2. In `newWord`, under `guessed = new Set()`, write `wrong = 0`.
3. In `guess`, under `guessed.add(letter)`, write the `if` line. Press **Run**.

# --task-tr--

1. `let guessed` satırının altına `let wrong` yaz.
2. `newWord` içinde `guessed = new Set()` satırının altına `wrong = 0` yaz.
3. `guess` içinde `guessed.add(letter)` satırının altına `if (!word.includes(letter)) wrong += 1` yaz.
4. **Çalıştır**. Sayacı henüz ekranda göstermiyoruz; kontroller sayıyı kendileri okuyor.

# --tests--

`wrong` should start at 0, and `newWord()` should reset it.
tr: `wrong` 0'dan başlamalı; `newWord()` onu sıfırlamalı.

```js
assert.strictEqual(wrong, 0)
wrong = 3
newWord()
assert.strictEqual(wrong, 0)
```

A letter not in the word should add a miss; a letter in it should not.
tr: Kelimede olmayan harf bir ıska eklemeli; olan eklememeli.

```js
word = 'CASTLE'
$.press('z')
assert.strictEqual(wrong, 1)
$.press('a')
assert.strictEqual(wrong, 1, 'A is in CASTLE')
$.press('q')
assert.strictEqual(wrong, 2)
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
