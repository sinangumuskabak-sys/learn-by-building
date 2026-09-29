---
title: Only letters count
title_tr: Sadece harfler sayılır
skills: [game.input]
---

# --goal--

Not every key is a letter: `'Enter'`, `'1'`, `'Shift'`... We guess only when the key is one character long and one
of the 26 letters.

# --goal-tr--

Her tuş bir harf değil: `'Enter'`, `'1'`, `'Shift'`, ok tuşları... Bunlar tahmin sayılmamalı.

Kuralımız: tuşun adı **tek karakterse** ve **26 harften biriyse** tahmin et. 26 harfi bir yazıda toplayacağız:
`LETTERS`.

# --code--

```js
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
```

# --meaning--

- `LETTERS` holds the 26 capital letters.
- `letter.length === 1` asks: is it one character long? (`'ENTER'` is 5.)
- `LETTERS.includes(letter)` asks: is it one of the 26 letters? (`'1'` is not.)
- `&&` means "and": both must be true to call `guess`.

# --meaning-tr--

- `const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'` → 26 büyük harf, tek bir yazıda.
- `letter.length === 1` → "yazı **tek karakter** mi?" Yazılarda da `.length` uzunluktur: `'ENTER'` 5, `'A'` 1.
  `===` "tam olarak eşit mi?" diye sorar (tek `=` "değer ver" demek; karıştırma).
- `LETTERS.includes(letter)` → "harfler yazısında bu **var mı**?" `'1'` tek karakter ama harf değil; bu soru onu eler.
- `&&` → "**ve**": iki koşul da doğruysa.
- `if (koşul) guess(letter)` → koşul doğruysa tahmin et. Tek komutluk `if` süslü parantezsiz yazılabilir.

# --task--

1. Under the list's closing `]` write the `LETTERS` line.
2. In the listener, replace `guess(letter)` with the `if` line. Press **Run**.

# --task-tr--

1. Kelime listesini kapatan `]` satırının hemen altına `LETTERS` satırını yaz.
2. Dinleyicinin içindeki `guess(letter)` satırını `if (...) guess(letter)` satırıyla değiştir.
3. **Çalıştır**, oyuna tıkla; harfler yine çalışmalı, `Enter` ya da `1` hiçbir şey yapmamalı.

# --tests--

Other keys (Enter, digits, Shift, arrows) should not be guessed.
tr: Diğer tuşlar (Enter, rakamlar, Shift, oklar) tahmin sayılmamalı.

```js
for (const key of ['Enter', '1', 'Shift', 'ArrowUp', ' ', '?']) $.press(key)
assert.strictEqual(guessed.size, 0, 'only letters count')
```

Letters should still be guessed, in either case.
tr: Harfler büyük ya da küçük, yine tahmin edilmeli.

```js
$.press('b')
$.press('Q')
assert.isTrue(guessed.has('B'))
assert.isTrue(guessed.has('Q'))
```

`LETTERS` should be the 26 capital letters.
tr: `LETTERS` 26 büyük harf olmalı.

```js
assert.strictEqual(LETTERS, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
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

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
}

function guess(letter) {
  guessed.add(letter)
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
