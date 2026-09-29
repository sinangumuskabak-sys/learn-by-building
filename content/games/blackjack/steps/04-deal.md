---
title: Deal
title_tr: Dağıt
skills: [prog.arrays, prog.functions]
---

# --goal--

You and the dealer each get two cards from the top of the deck. The top is the end of the list: `pop` takes it off.

# --goal-tr--

Sen (`player`) ve krupiye (`dealer`) desteden ikişer kart alıyorsunuz. Destenin üstü listenin **sonu**: `pop` oradan
bir kart çekip çıkarır.

# --code--

```js
let player
let dealer

const nextCard = () => deck.pop()

function deal() {
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
}

deal()
```

# --meaning--

- `pop` removes the last card of the list and returns it, so the deck gets smaller.
- A hand is just a list of cards.

# --meaning-tr--

- `deck.pop()` → listenin son elemanını **çıkarır** ve verir: deste bir kart küçülür.
- `nextCard` → tek satırlık ok fonksiyonu; okunması "sıradaki kart" diye kolay olsun.
- Bir el sadece kartlardan oluşan bir liste: `[kart, kart]`.

# --task--

1. Under `deck`, write `player` and `dealer`.
2. Under `newDeck`, write `nextCard` and `deal`.
3. At the bottom, call `deal()` after `newDeck()`.

# --task-tr--

1. `let deck` satırının altına `player` ve `dealer` yaz.
2. `newDeck`'in altına `nextCard` ve `deal` yaz.
3. En altta `newDeck()` satırının altına `deal()` yaz. **Çalıştır**.

# --tests--

Both hands should get two cards from the top of the deck.
tr: İki el de destenin üstünden ikişer kart almalı.

```js
assert.lengthOf(player, 2)
assert.lengthOf(dealer, 2)
assert.lengthOf(deck, 48)
newDeck()
const top = deck.slice(-4)
deal()
assert.deepEqual(player, [top[3], top[2]])
assert.deepEqual(dealer, [top[1], top[0]])
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
let player
let dealer

const card = (rank, suit) => ({ rank, suit })

// A new shuffled deck of 52 cards (Fisher–Yates).
function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

const nextCard = () => deck.pop()

function deal() {
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

newDeck()
deal()
draw()
```
