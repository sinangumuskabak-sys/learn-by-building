---
title: A hidden word
title_tr: Gizli bir kelime
skills: [prog.arrays, prog.functions]
---

# --explanation--

Hangman is a word game: the computer picks a secret word and shows only a row of blanks, one per letter. You guess letters;
right ones are filled in, wrong ones slowly draw a stick figure on the gallows.

The secret word comes from a list: `WORDS[Math.floor(Math.random() * WORDS.length)]` picks any index from `0` to
`WORDS.length - 1`.

The letters you have tried go into a **`Set`**. A `Set` is like an array that holds each value at most once, and asking
`guessed.has('E')` is instant. Both are exactly what guessing needs.

The blanks come from one line. Spread the word into letters, show each letter if it has been guessed and `_` if not, and join
them with spaces so `_ _` does not look like one long line:

```js
[...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')
```

A **monospace** font gives every character the same width, so the blanks and the letters line up whatever the word is.

# --explanation-tr--

Adam asmaca bir kelime oyunudur: bilgisayar gizli bir kelime seçer ve yalnızca her harf için bir tane olmak üzere bir boşluk
sırası gösterir. Harf tahmin edersin; doğrular doldurulur, yanlışlar darağacında yavaş yavaş bir çöp adam çizer.

Gizli kelime bir listeden gelir: `WORDS[Math.floor(Math.random() * WORDS.length)]`, `0`'dan `WORDS.length - 1`'e herhangi bir
sırayı seçer.

Denediğin harfler bir **`Set`**'e gider. `Set`, her değeri en fazla bir kez tutan bir dizi gibidir ve `guessed.has('E')` diye
sormak anlıktır. İkisi de tahminin tam olarak ihtiyaç duyduğu şeylerdir.

Boşluklar tek satırdan gelir. Kelimeyi harflere yay, her harfi tahmin edildiyse göster, edilmediyse `_`, ve `_ _` tek uzun bir
çizgi gibi görünmesin diye aralarına boşluk koyarak birleştir:

```js
[...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')
```

**Eş aralıklı** (monospace) bir yazı tipi her karaktere aynı genişliği verir; böylece kelime ne olursa olsun boşluklar ve
harfler hizalanır.

# --task--

1. Add a `WORDS` list of at least 40 words in capital letters (A to Z only).
2. Write `newWord()`: pick a random `word` and start `guessed` as an empty `Set`. Call it at the start.
3. Write `masked()`: the word with every letter not in `guessed` shown as `_`, separated by spaces.
4. Each frame fill the canvas with `'#fefce8'` and draw `masked()` centered at `y = 340`, `'bold 32px monospace'`,
   `'#1f2937'`.

# --task-tr--

1. Yalnızca büyük harflerden (A'dan Z'ye) en az 40 kelimelik bir `WORDS` listesi ekle.
2. `newWord()` yaz: rastgele bir `word` seç ve `guessed`'ı boş bir `Set` olarak başlat. Başta çağır.
3. `masked()` yaz: `guessed` içinde olmayan her harfin `_` gösterildiği, boşluklarla ayrılmış kelime.
4. Her karede canvas'ı `'#fefce8'` ile doldur ve `masked()`'i `y = 340`'ta ortalı, `'bold 32px monospace'`, `'#1f2937'`
   ile çiz.

# --tests--

The words should be capital letters, and a random one should be picked.
tr: Kelimeler büyük harf olmalı ve rastgele biri seçilmeli.

```js
assert.isAtLeast(WORDS.length, 40)
for (const w of WORDS) assert.match(w, /^[A-Z]+$/, 'capital letters only')
assert.include(WORDS, word)
assert.strictEqual(guessed.size, 0)
const seen = new Set()
for (let i = 0; i < 200; i++) {
  newWord()
  seen.add(word)
}
assert.isAbove(seen.size, 20, 'the words are picked at random')
```

`masked` should show guessed letters and hide the others.
tr: `masked` tahmin edilen harfleri göstermeli, diğerlerini gizlemeli.

```js
word = 'CASTLE'
guessed = new Set()
assert.strictEqual(masked(), '_ _ _ _ _ _')
guessed = new Set(['A', 'E', 'Z'])
assert.strictEqual(masked(), '_ A _ _ _ E')
guessed = new Set([...'CASTLE'])
assert.strictEqual(masked(), 'C A S T L E')
```

The masked word should be drawn.
tr: Gizlenmiş kelime çizilmeli.

```js
word = 'TIGER'
guessed = new Set(['I'])
$.tick(1)
assert.include($.texts(), '_ I _ _ _')
```

# --seed--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
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
