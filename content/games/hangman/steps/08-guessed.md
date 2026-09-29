---
title: Remember the guesses
title_tr: Tahminleri hatırla
skills: [prog.arrays, game.state]
---

# --goal--

The letters you have tried go into a `Set`. `masked()` then shows a letter if it is in the Set, and `_` if not.

# --goal-tr--

Tahmin ettiğin harfleri bir yerde **hatırlamalıyız**; doğru tahmin edilen harfler boşlukların yerine geçecek.

Bunun için **`Set`** (küme) kullanacağız. `Set` bir liste gibidir ama her değeri **en fazla bir kez** tutar ve
"bu harf içinde var mı?" sorusunu çok hızlı cevaplar. Tahmin için ikisi de tam aradığımız şey.

# --code--

```js
let word
let guessed // a Set of the letters tried so far

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
}
```

# --meaning--

- `let guessed` will hold the letters tried so far; `new Set()` in `newWord` starts it empty for every word.
- `guessed.has(letter)` is `true` if the letter was tried.
- `condition ? a : b` is a short if: `a` when the condition is true, `b` otherwise. So a tried letter shows itself,
  an untried one shows `_`.

# --meaning-tr--

- `let guessed` → denenen harfleri tutacak değişken. `//` sonrası bir **yorum**: bilgisayar atlar, bize not.
- `guessed = new Set()` → `newWord` içinde, her yeni kelimede **boş bir küme** oluşturur. `new` "yenisini yap" demek.
- `guessed.has(letter)` → "bu harf kümede var mı?" Cevap `true` (evet) ya da `false` (hayır).
- `koşul ? a : b` → kısa bir **if**: koşul doğruysa `a`, değilse `b`. Burada: harf denendiyse **harfin kendisi**,
  denenmediyse `'_'`. Artık `letter` işe yarıyor.
- Ternary kısmının etrafındaki parantezler şart değil, okumayı kolaylaştırır.
- Üstteki yorum satırı fonksiyonun ne yaptığını bir örnekle anlatıyor.

# --task--

1. Under `let word` write `let guessed ...`.
2. Write the comment above `masked`, and change its `'_'` to the `? :` form.
3. In `newWord`, under the `word = ...` line, write `guessed = new Set()`. Press **Run**.

# --task-tr--

1. `let word` satırının altına `let guessed // a Set of the letters tried so far` satırını yaz.
2. `masked` satırının üstüne yorum satırını yaz; `masked` içindeki `'_'` kısmını
   `(guessed.has(letter) ? letter : '_')` yap.
3. `newWord` içinde `word = ...` satırının altına `guessed = new Set()` yaz.
4. **Çalıştır**. Ekran aynı: henüz hiçbir harf denenmedi, küme boş.

# --try--

Under `guessed = new Set()` add `guessed.add('E')` and run a few times: every E shows up. Then delete that line.

# --try-tr--

`guessed = new Set()` satırının altına geçici olarak `guessed.add('E')` yaz ve birkaç kez çalıştır: kelimedeki bütün
E'ler görünür. Sonra o satırı sil.

# --tests--

`guessed` should start as an empty `Set`, and `newWord()` should empty it.
tr: `guessed` boş bir `Set` olarak başlamalı; `newWord()` onu boşaltmalı.

```js
assert.instanceOf(guessed, Set)
assert.strictEqual(guessed.size, 0)
guessed.add('A')
newWord()
assert.strictEqual(guessed.size, 0)
```

`masked()` should show the guessed letters and hide the others.
tr: `masked()` tahmin edilen harfleri göstermeli, diğerlerini gizlemeli.

```js
word = 'CASTLE'
guessed = new Set(['A', 'E', 'Z'])
assert.strictEqual(masked(), '_ A _ _ _ E')
guessed = new Set(['C', 'A', 'S', 'T', 'L', 'E'])
assert.strictEqual(masked(), 'C A S T L E')
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

newWord()
draw()
```
