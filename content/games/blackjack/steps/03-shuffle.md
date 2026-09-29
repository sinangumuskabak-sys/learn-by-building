---
title: Shuffle
title_tr: Karıştır
skills: [prog.arrays, prog.loops]
---

# --goal--

A sorted deck is no game. The Fisher–Yates shuffle is the fair way: from the last card down, swap each card with a
random card at or before it.

# --goal-tr--

Sıralı desteyle oyun olmaz. **Fisher–Yates** karıştırması adil yol: son karttan başlayıp aşağı doğru, her kartı
kendisi ya da **önündeki** rastgele bir kartla yer değiştir. Her sıralamanın çıkma şansı eşit olur.

# --code--

```js
// A new shuffled deck of 52 cards (Fisher–Yates).
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
```

# --meaning--

- `i` goes from 51 down to 1; `j` is a random position from 0 to `i`.
- `[deck[i], deck[j]] = [deck[j], deck[i]]` swaps two cards in one line.
- The `;` at the start stops JavaScript from gluing the `[` line to the line before.

# --meaning-tr--

- `i` 51'den 1'e iner; `j` → 0 ile `i` arasında (ikisi dahil) rastgele bir yer.
- `[deck[i], deck[j]] = [deck[j], deck[i]]` → iki kartı tek satırda **takas** eder.
- Baştaki `;` → `[` ile başlayan satır önceki satıra yapışmasın.
- Her turda `i` konumuna kalan kartlardan biri kesinleşir; o yüzden kimse kayırılmaz. "Rastgele iki kartı çok kez
  takas et" gibi kolay görünen yollar bazı sıralamaları daha sık çıkarır.

# --task--

1. Above `newDeck`, write the comment.
2. At the end of `newDeck`, write the shuffle loop.

# --task-tr--

1. `newDeck`'in üstüne yorum satırını yaz.
2. `newDeck`'in sonuna karıştırma döngüsünü yaz. **Çalıştır**.

# --tests--

The deck should still hold 52 different cards, but shuffled.
tr: Destede yine 52 farklı kart olmalı ama karışık.

```js
const names = deck.map((c) => c.rank + c.suit)
assert.strictEqual(new Set(names).size, 52)
const sorted = SUITS.flatMap((s) => RANKS.map((r) => r + s))
assert.notDeepEqual(names, sorted)
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

// A new shuffled deck of 52 cards (Fisher–Yates).
function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

newDeck()
draw()
```
