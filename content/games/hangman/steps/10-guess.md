---
title: A guess
title_tr: Bir tahmin
skills: [prog.functions, game.state]
---

# --goal--

A guess is one letter. `guess(letter)` adds it to the Set; the loop then shows it wherever it is in the word.

# --goal-tr--

Bir tahmin = bir harf. `guess` (tahmin et) adında bir fonksiyon yazacağız: ona bir harf **veririz**, o da harfi
denenenler kümesine ekler. Döngü her karede çizdiği için harf kelimede varsa hemen görünür.

Bu fonksiyon öncekilerden farklı: parantezinin içinde bir **parametre** var. Parametre, fonksiyona dışarıdan
verilen bilgidir.

# --code--

```js
function guess(letter) {
  guessed.add(letter)
}
```

# --meaning--

- `letter` is a parameter: whatever we pass in `guess('A')` is `letter` inside the function.
- `guessed.add(letter)` puts the letter in the Set. Adding a letter that is already there changes nothing.

# --meaning-tr--

- `function guess(letter) {` → `letter` bir **parametre**: `guess('A')` diye çağırınca fonksiyonun içinde
  `letter` `'A'` olur; `guess('E')` diye çağırınca `'E'`. Aynı tarif, farklı malzeme.
- `guessed.add(letter)` → harfi kümeye **ekler**. Küme her değeri bir kez tuttuğu için aynı harfi ikinci kez
  eklemek bir şey değiştirmez.

# --task--

Write `guess` under the `newWord` function, with an empty line between them. Press **Run**.

# --task-tr--

`guess` fonksiyonunu `newWord` fonksiyonunun kapanan `}`'sinin altına, bir boş satır bırakarak yaz. **Çalıştır**.
Henüz klavyeyi dinlemiyoruz; kontroller fonksiyonu kendileri çağırıp deniyor.

# --tests--

`guess(letter)` should add the letter to `guessed`.
tr: `guess(letter)` harfi `guessed`'e eklemeli.

```js
guess('A')
assert.isTrue(guessed.has('A'))
```

A guessed letter should appear in the word.
tr: Tahmin edilen harf kelimede görünmeli.

```js
word = 'CASTLE'
guess('A')
guess('T')
$.tick(1)
assert.include($.texts(), '_ A _ T _ _')
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

let word
let guessed // a Set of the letters tried so far

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
}

function guess(letter) {
  guessed.add(letter)
}

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
