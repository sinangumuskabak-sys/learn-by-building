---
title: Guessing letters
title_tr: Harf tahmin etmek
skills: [game.input, game.state]
---

# --explanation--

Every key press is a guess, but not every key is a letter. `event.key` is `'a'` for the A key, but also `'Enter'`, `'1'` or
`'Shift'`. So we turn it to capitals and keep it only if it is **one character long** and one of the 26 letters:

```js
const letter = event.key.toUpperCase()
if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
```

A letter you already tried should cost nothing, so `guess` returns early when `guessed.has(letter)`. Otherwise it remembers
the letter, and if the word does not contain it, that is a miss.

After `MAX_WRONG` misses the game is over for now, so `guess` stops listening. We also show the misses, so you do not waste a
guess on a letter you already know is wrong. The wrong letters are the guessed ones **not** in the word:
`[...guessed].filter((l) => !word.includes(l))`.

# --explanation-tr--

Her tuş basışı bir tahmindir ama her tuş bir harf değildir. `event.key`, A tuşu için `'a'`'dır ama `'Enter'`, `'1'` ya da
`'Shift'` de olabilir. Bu yüzden onu büyük harfe çeviririz ve yalnızca **bir karakter uzunluğundaysa** ve 26 harften biriyse
tutarız:

```js
const letter = event.key.toUpperCase()
if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
```

Zaten denediğin bir harf hiçbir şeye mal olmamalı; bu yüzden `guessed.has(letter)` olduğunda `guess` erken döner. Değilse
harfi hatırlar ve kelime onu içermiyorsa bu bir ıskadır.

`MAX_WRONG` ıskadan sonra oyun şimdilik biter, bu yüzden `guess` dinlemeyi bırakır. Iskaları da gösteririz; böylece yanlış
olduğunu zaten bildiğin bir harfe tahmin harcamazsın. Yanlış harfler, kelimede **olmayan** tahmin edilmiş harflerdir:
`[...guessed].filter((l) => !word.includes(l))`.

# --task--

1. Add `LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`, `MAX_WRONG = 6` and `wrong` (`0` in `newWord()`).
2. Write `guess(letter)`: do nothing if it was already guessed or `wrong` has reached `MAX_WRONG`; otherwise add it to
   `guessed`, and add 1 to `wrong` if the word does not contain it.
3. On `keydown`, guess the key if it is a single letter (in either case).
4. Draw `Misses 2 / 6` at `(260, 100)` (`'bold 16px sans-serif'`, `'#1f2937'`, left-aligned) and the wrong letters, joined
   with spaces, at `(260, 130)` in `'#b91c1c'`.

# --task-tr--

1. `LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`, `MAX_WRONG = 6` ve `wrong` (`newWord()`'de `0`) ekle.
2. `guess(letter)` yaz: zaten tahmin edildiyse ya da `wrong` `MAX_WRONG`'a ulaştıysa hiçbir şey yapma; değilse onu `guessed`'a
   ekle ve kelime onu içermiyorsa `wrong`'a 1 ekle.
3. `keydown`'da tuş tek bir harfse (büyük ya da küçük) onu tahmin et.
4. `(260, 100)`'e `Misses 2 / 6` (`'bold 16px sans-serif'`, `'#1f2937'`, sola hizalı) ve boşluklarla birleştirilmiş yanlış
   harfleri `(260, 130)`'a `'#b91c1c'` ile çiz.

# --tests--

Letters should be guessed in either case; a repeated letter and other keys should cost nothing.
tr: Harfler büyük ya da küçük tahmin edilebilmeli; tekrarlanan bir harf ve diğer tuşlar hiçbir şeye mal olmamalı.

```js
word = 'CASTLE'
$.press('a')
assert.isTrue(guessed.has('A'))
assert.strictEqual(wrong, 0)
$.press('Z')
assert.strictEqual(wrong, 1)
$.press('z')
assert.strictEqual(wrong, 1, 'the same letter twice costs nothing')
$.press('1')
$.press('Enter')
assert.strictEqual(guessed.size, 2, 'only letters count')
```

After six misses no more guesses should count.
tr: Altı ıskadan sonra başka tahmin sayılmamalı.

```js
word = 'CASTLE'
for (const key of 'bdfghijk') $.press(key)
assert.strictEqual(wrong, MAX_WRONG)
assert.strictEqual(guessed.size, 6, 'no more guesses after the last miss')
```

The misses should be counted and listed.
tr: Iskalar sayılmalı ve listelenmeli.

```js
word = 'CASTLE'
$.press('c')
$.press('q')
$.press('x')
$.tick(1)
assert.include($.texts(), 'C _ _ _ _ _')
assert.include($.texts(), 'Misses 2 / 6')
assert.include($.texts(), 'Q X')
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
