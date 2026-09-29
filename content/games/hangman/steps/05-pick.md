---
title: Pick a random word
title_tr: Rastgele bir kelime seç
skills: [prog.arrays, prog.functions]
---

# --goal--

Each game needs one secret word. `newWord` picks a random item of `WORDS` and keeps it in `word`.

# --goal-tr--

Her oyunun **bir** gizli kelimesi olur. Listeden **rastgele** bir kelime seçip `word` (kelime) adlı bir değişkende
tutacağız. Torbadan göz kapalı bir kâğıt çekmek gibi.

Seçmeyi bir fonksiyona koyuyoruz: `newWord` (yeni kelime). Oyun bitip yenisi başlarken onu tekrar çağıracağız.

# --code--

```js
let word

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
}

newWord()
draw()
```

# --meaning--

- `let word` makes a variable whose value can change. It is empty (`undefined`) until `newWord` fills it.
- `WORDS.length` is the number of words (50). `WORDS[0]` is the first word, `WORDS[49]` the last.
- `Math.random()` gives a random number from 0 up to (not including) 1. Times 50, it is from 0 up to 50.
- `Math.floor` rounds down, so the index is a whole number from 0 to 49.
- `newWord()` is called once at the start, before `draw()`.

# --meaning-tr--

- `let word` → bir **değişken** açar: değeri **sonradan değişebilen** bir ad (`const`'tan farkı bu). Şimdilik
  boş; `newWord` onu dolduracak.
- `WORDS.length` → listedeki eleman sayısı (50).
- `WORDS[...]` → köşeli parantez içine bir **sıra numarası** (index) yazınca o elemanı verir. Sayma **0'dan**
  başlar: `WORDS[0]` ilk kelime (`'APPLE'`), `WORDS[49]` sonuncusu.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı: `0.37` gibi.
- `Math.random() * WORDS.length` → 50 ile çarpınca 0 ile 50 arası (50 hariç): `18.5` gibi.
- `Math.floor(...)` → **aşağı yuvarlar**: `18.5` → `18`. Böylece 0 ile 49 arası tam bir sıra numarası çıkar.
- En alttaki `newWord()` → oyun başlarken bir kelime seç (`draw()`'dan önce).

# --task--

1. Under the list's closing `]`, leave an empty line and write `let word` and the `newWord` function.
2. At the bottom, write `newWord()` above `draw()`. Press **Run**.

# --task-tr--

1. Listeyi kapatan `]` satırının altına bir boş satır bırak; `let word` satırını ve `newWord` fonksiyonunu yaz
   (aralarında bir boş satır).
2. En alttaki `draw()` satırının **üstüne** `newWord()` yaz.
3. **Çalıştır**. Kelime henüz görünmüyor; kontroller yeşilse seçim çalışıyor.

# --predict--

What will you see after Run?
- [ ] The secret word in the middle of the canvas
- [x] Nothing new
  We picked a word, but no line draws it yet.
- [ ] An error, because the word is secret

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] Gizli kelimeyi tuvalin ortasında
- [x] Yeni bir şey görmeyeceksin
  Kelimeyi seçtik ama onu çizen bir satır henüz yok.
- [ ] Bir hata, çünkü kelime gizli

# --hint--

`Math.floor` has a capital `M`; the parentheses close in this order: `Math.floor(Math.random() * WORDS.length)`.

# --hint-tr--

`Math` büyük `M` ile yazılır. Parantezler şöyle kapanır: `Math.floor(Math.random() * WORDS.length)`.

# --tests--

`word` should be one of the `WORDS`.
tr: `word`, `WORDS` listesinden biri olmalı.

```js
assert.include(WORDS, word)
```

`newWord()` should pick a random word each time.
tr: `newWord()` her seferinde rastgele bir kelime seçmeli.

```js
const seen = new Set()
for (let i = 0; i < 200; i++) {
  newWord()
  assert.include(WORDS, word)
  seen.add(word)
}
assert.isAbove(seen.size, 20, 'the words are picked at random')
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

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
}

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

newWord()
draw()
```
