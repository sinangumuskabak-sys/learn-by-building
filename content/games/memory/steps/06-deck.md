---
title: Every fruit twice
title_tr: Her meyveden iki tane
skills: [prog.arrays, prog.functions]
---

# --goal--

Under the cards there are 8 fruits, each twice. `SYMBOLS` lists the 8 fruits, and `newGame` builds the 16 cards by
putting the list twice into one array.

# --goal-tr--

Kartların altında ne var? **8 meyve**, her birinden **iki** tane: toplam 16. Meyveleri bir **listede** (dizi) tutacağız.

Yeni oyunu hazırlayan bir **fonksiyon** da yazıyoruz: `newGame`. Şimdilik tek işi, listeyi iki kez yan yana koyup 16
kartlık desteyi yapmak. Ekranda bir şey değişmeyecek; kartlar hâlâ kapalı.

# --code--

```js
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards

function newGame() {
  cards = [...SYMBOLS, ...SYMBOLS]
}

newGame()
```

# --meaning--

- `[ ... ]` is an array: a list in order. Emoji are text, so they are in quotes.
- `...SYMBOLS` spreads the list's items into the new array; twice gives 16 items.
- `function newGame() { ... }` defines the recipe; `newGame()` at the bottom runs it.

# --meaning-tr--

- `const SYMBOLS = [ ... ]` → köşeli parantez bir **dizi** açar: sıralı bir liste, elemanlar virgülle ayrılır. Emojiler
  de yazıdır, bu yüzden tırnak içinde. Sayma **0'dan** başlar: `SYMBOLS[0]` elma. `SYMBOLS.length` eleman sayısı (8).
- `let cards` → kartları tutacak değişken; değerini `newGame` verecek.
- `function newGame() { ... }` → bir **fonksiyon**: işe ad verip sonra istediğin zaman çalıştırırsın. Tarif yazmak
  (tanımlamak) ile yemeği pişirmek (çağırmak) ayrı şeyler.
- `[...SYMBOLS, ...SYMBOLS]` → üç nokta (`...`) "bu listenin elemanlarını buraya **dök**" demek. İki kez dökünce her
  meyveden iki tane olan 16'lık bir liste çıkar.
- En alttaki `newGame()` → tarifi çalıştırır.

# --task--

1. Under `TOP`, write `SYMBOLS`, then `let cards` and `newGame` with empty lines between them.
2. At the very end, leave an empty line and write `newGame()`.

# --task-tr--

1. `const TOP = 40 ...` satırının hemen altına `SYMBOLS` satırını yaz. Emojileri yazmak zorsa buradan kopyalayıp
   yapıştırabilirsin.
2. Bir boş satırdan sonra `let cards`, bir boş satırdan sonra `newGame` fonksiyonunu yaz.
3. Dosyanın **en sonuna**, bir boş satırdan sonra `newGame()` yaz.
4. **Çalıştır**: ekran aynı kalmalı.

# --hint--

If `cards` is empty, you probably forgot the `newGame()` call at the very end.

# --hint-tr--

`cards` boşsa büyük ihtimalle en alttaki `newGame()` çağrısını unuttun.

# --tests--

`SYMBOLS` should list the 8 fruits.
tr: `SYMBOLS` 8 meyveyi listelemeli.

```js
assert.deepEqual(SYMBOLS, ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑'])
```

`cards` should hold every fruit twice.
tr: `cards` her meyveyi iki kez tutmalı.

```js
assert.lengthOf(cards, 16)
assert.sameMembers(cards.map((c) => c.symbol ?? c), [...SYMBOLS, ...SYMBOLS])
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards

function newGame() {
  cards = [...SYMBOLS, ...SYMBOLS]
}

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}

newGame()
```
