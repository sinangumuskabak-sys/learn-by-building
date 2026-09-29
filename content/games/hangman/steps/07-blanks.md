---
title: Hide it behind blanks
title_tr: Boşluklarla gizle
skills: [prog.arrays, prog.functions]
---

# --goal--

Now we hide the word: one `_` per letter, with spaces between them. `masked()` builds that text.

# --goal-tr--

Şimdi kelimeyi gizliyoruz: her harfin yerine bir `_` çizgi. Aralarına boşluk koyacağız ki `______` tek uzun bir
çizgi gibi görünmesin: `_ _ _ _ _`.

Bu yazıyı üreten küçük bir fonksiyon yazacağız: `masked` ("maskelenmiş", gizlenmiş). Tek satır, ama içinde üç yeni
fikir var; aşağıda parça parça açıklıyoruz.

# --code--

```js
let word

const masked = () => [...word].map((letter) => '_').join(' ')

  ctx.fillText(masked(), canvas.width / 2, 340)
```

# --meaning--

- `() => ...` is a short function (an arrow function). `masked()` runs it and gets back what is after the arrow.
- `[...word]` spreads the word into its letters: `'TIGER'` → `['T', 'I', 'G', 'E', 'R']`.
- `.map((letter) => '_')` makes a new array with one item per letter, here always `'_'`.
- `.join(' ')` glues the items into one text with a space between them: `'_ _ _ _ _'`.
- `draw` now writes `masked()` instead of `word`.

# --meaning-tr--

- `const masked = () => ...` → **ok fonksiyonu** (arrow function): fonksiyonun kısa yazılışı. `()` parametre
  yok demek; oktan (`=>`) sonrası fonksiyonun **sonucu**. `masked()` diye çağırınca o sonucu geri verir.
- `[...word]` → üç nokta kelimeyi **harflerine dağıtır** ve köşeli parantez onları bir listeye koyar:
  `'TIGER'` → `['T', 'I', 'G', 'E', 'R']`.
- `.map((letter) => '_')` → listenin **her elemanı için** küçük fonksiyonu çalıştırır ve sonuçlardan **yeni bir
  liste** yapar. Her harf için sonuç `'_'`: `['_', '_', '_', '_', '_']`. (`letter` şimdilik kullanılmıyor; bir
  sonraki adımda işe yarayacak.)
- `.join(' ')` → listeyi aralarına **boşluk** koyarak tek bir yazıya çevirir: `'_ _ _ _ _'`.
- `draw` içinde `word` yerine artık `masked()` yazıyoruz.

# --task--

1. Under `let word`, leave an empty line and write the `masked` line.
2. In `draw`, replace `word` in `fillText(word, ...)` with `masked()`. Press **Run**.

# --task-tr--

1. `let word` satırının altına bir boş satır bırakıp `masked` satırını yaz.
2. `draw` içindeki `ctx.fillText(word, ...)` satırında `word` yerine `masked()` yaz (parantezleriyle).
3. **Çalıştır**: kelimenin yerinde `_ _ _ _ _` gibi çizgiler görmelisin; her çalıştırmada sayıları değişebilir.

# --predict--

The word is `'CASTLE'`. What does `masked()` give?
- [ ] `'______'`
- [x] `'_ _ _ _ _ _'`
  `join(' ')` puts one space between the six blanks.
- [ ] `'CASTLE'`

# --predict-tr--

Kelime `'CASTLE'`. `masked()` ne verir?
- [ ] `'______'`
- [x] `'_ _ _ _ _ _'`
  `join(' ')` altı çizginin arasına birer boşluk koyar.
- [ ] `'CASTLE'`

# --hint--

Do not forget the parentheses: `masked()` runs the function; `masked` alone is the function itself.

# --hint-tr--

Parantezleri unutma: `masked()` fonksiyonu çalıştırır; tek başına `masked` fonksiyonun kendisidir, yazı değil.

# --tests--

`masked()` should give one `_` per letter, with spaces between.
tr: `masked()` her harf için bir `_` vermeli, aralarında boşlukla.

```js
word = 'CASTLE'
assert.strictEqual(masked(), '_ _ _ _ _ _')
word = 'OCEAN'
assert.strictEqual(masked(), '_ _ _ _ _')
```

`draw()` should show the blanks, not the word.
tr: `draw()` kelimeyi değil boşlukları göstermeli.

```js
word = 'TIGER'
draw()
assert.include($.texts(), '_ _ _ _ _')
assert.notInclude($.texts(), 'TIGER')
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

const masked = () => [...word].map((letter) => '_').join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
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
