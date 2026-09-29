---
title: Cards
title_tr: Kartlar
skills: [game.canvas, prog.arrays]
---

# --goal--

We are building Blackjack: get closer to 21 than the dealer without going over. First the pieces: the 13 ranks, the 4
suits, a small function that makes a card object, and a green table.

# --goal-tr--

**Blackjack** yapıyoruz: kartlarının toplamını 21'i **geçmeden** krupiyeden daha çok 21'e yaklaştır. Sonunda nasıl
olacağını **Bitmiş hâlini gör** ile görebilirsin.

Önce parçalar: 13 **değer** (as, 2–10, vale, kız, papaz), 4 **renk** (maça, kupa, karo, sinek), bir kart nesnesi yapan
küçük bir fonksiyon ve yeşil bir masa.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']

const card = (rank, suit) => ({ rank, suit })

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `RANKS` and `SUITS` are lists of text; the suits are real card symbols.
- `card('K', '♥')` makes `{ rank: 'K', suit: '♥' }`. The parentheses around `{ ... }` make the arrow return an object.

# --meaning-tr--

- `RANKS` → değerler: `'A'` as, `'J'` vale, `'Q'` kız, `'K'` papaz. `SUITS` → gerçek kart sembolleri.
- `card('K', '♥')` → `{ rank: 'K', suit: '♥' }` nesnesini yapar (kupa papazı). `{ rank, suit }` → `{ rank: rank,
  suit: suit }`'un kısası.
- `({ ... })` → ok fonksiyonu bir **nesne** döndürsün diye süslü parantezler normal parantez içinde; yoksa JavaScript
  onları fonksiyon gövdesi sanardı.
- `draw()` → şimdilik yalnız yeşil masa.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: yeşil bir masa görmelisin.

# --tests--

The table should be green, and card should make a card object.
tr: Masa yeşil olmalı, card bir kart nesnesi yapmalı.

```js
assert.deepEqual($.rects('#166534'), [{ x: 0, y: 0, w: 480, h: 460, color: '#166534' }])
assert.deepEqual(card('K', '♥'), { rank: 'K', suit: '♥' })
assert.lengthOf(RANKS, 13)
assert.lengthOf(SUITS, 4)
```

# --seed--

```js
// Blackjack, step by step.
// The page already has <canvas id="game" width="480" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// Blackjack, step by step.
// The page already has <canvas id="game" width="480" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']

const card = (rank, suit) => ({ rank, suit })

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
