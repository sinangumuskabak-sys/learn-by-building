---
title: A deck
title_tr: Deste
skills: [prog.arrays, prog.loops]
---

# --goal--

A deck has one card of every rank in every suit: 4 × 13 = 52. Two loops, one inside the other, make them all.

# --goal-tr--

Bir destede her rengin her değerinden **bir** kart var: 4 × 13 = **52**. İç içe iki döngü hepsini yapıyor.

# --code--

```js
let deck

function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
}

newDeck()
```

# --meaning--

- `deck = []` starts empty, so calling `newDeck` again gives a fresh deck, not a double one.
- For each suit, the inner loop goes through all 13 ranks.

# --meaning-tr--

- `deck = []` → önce boşalt: `newDeck` tekrar çağrılınca 104 değil, yine 52 kart olsun.
- `for (const suit of SUITS) for (const rank of RANKS) ...` → her renk için 13 değerin hepsi. Tek satırlık döngüler
  süslü parantezsiz iç içe yazılabilir.
- Deste şimdilik **sıralı**: maça ası, maça 2, …, sinek papazı.

# --task--

1. Under `SUITS`, write `let deck` (with an empty line before and after it).
2. Under `card`, write `newDeck`.
3. At the bottom, call `newDeck()` above `draw()`.

# --task-tr--

1. `SUITS` satırının altına, önünde ve arkasında birer boş satırla `let deck` yaz.
2. `card` satırının altına `newDeck` fonksiyonunu yaz.
3. En alttaki `draw()` satırının üstüne `newDeck()` yaz. **Çalıştır**.

# --tests--

The deck should have all 52 cards in order.
tr: Destede 52 kartın hepsi sırayla olmalı.

```js
assert.lengthOf(deck, 52)
assert.deepEqual(deck[0], { rank: 'A', suit: '♠' })
assert.deepEqual(deck[51], { rank: 'K', suit: '♣' })
newDeck()
assert.lengthOf(deck, 52)
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

let deck

const card = (rank, suit) => ({ rank, suit })

function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

newDeck()
draw()
```
