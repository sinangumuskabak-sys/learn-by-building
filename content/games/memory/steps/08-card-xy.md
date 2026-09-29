---
title: A card's corner
title_tr: Kartın köşesi
skills: [prog.functions]
---

# --goal--

Two small functions turn a card's column and row into pixels: `cardX` and `cardY` return the card's left and top
edges, with the formulas from the grid loops.

# --goal-tr--

Kartın sütunundan ve satırından piksel konumuna geçmek için iki küçük fonksiyon yazıyoruz: `cardX` kartın **sol**
kenarını, `cardY` **üst** kenarını verir. Formüller ızgara döngüsündekilerin aynısı.

Bu fonksiyonlar bir **cevap geri verir**: `cardX(card)` yazdığın yerde bir sayı gibi kullanılır.

# --code--

```js
function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}
```

# --meaning--

- `card` is a parameter: the card object given to the function.
- `return` gives the computed number back to whoever called the function.

# --meaning-tr--

- `function cardX(card)` → parantezdeki `card` bir **parametre**: fonksiyona verilen kart nesnesi.
- `card.col` → kartın sütunu (nokta ile nesnenin alanı okunur).
- `return ...` → hesaplanan sayıyı **geri ver** ve fonksiyondan çık. `cardX(cards[6])` → 206.
- `cardY` aynı kalıp, satır ve üst şeritle.

# --task--

Under `newGame`, write `cardX` and `cardY` with empty lines between them. Press **Run**.

# --task-tr--

`newGame` fonksiyonunun altına bir boş satır bırak ve `cardX` ile `cardY` fonksiyonlarını yaz; aralarında boş satır kalsın. **Çalıştır**.

# --tests--

`cardX` and `cardY` should give a card's left and top edges.
tr: `cardX` ve `cardY` kartın sol ve üst kenarını vermeli.

```js
assert.deepEqual([cardX(cards[0]), cardY(cards[0])], [12, 52])
assert.deepEqual([cardX(cards[6]), cardY(cards[6])], [206, 149])
assert.deepEqual([cardX(cards[15]), cardY(cards[15])], [303, 343])
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
  const deck = [...SYMBOLS, ...SYMBOLS]
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
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
