---
title: Keep drawing
title_tr: Çizmeye devam
skills: [game.loop]
---

# --goal--

Cards will be added while you play, so the table is redrawn about 60 times a second by a loop.

# --goal-tr--

Oynarken ele kart eklenecek; masa bir **döngüyle** saniyede ~60 kez yeniden çizilsin.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` asks the browser to call `loop` again before the next screen refresh.

# --meaning-tr--

- `loop` → çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste. En alttaki satır başlatır.

# --task--

Replace `draw()` at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

En alttaki `draw()` satırını sil; `newDeck()`'in üstüne `loop` fonksiyonunu, `deal()`'ın altına `requestAnimationFrame(loop)` yaz. **Çalıştır**.

# --tests--

A card added to a hand should appear on the next frame.
tr: Ele eklenen kart bir sonraki karede görünmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
player.push(card('5', '♦'))
$.tick()
assert.lengthOf($.rects('#ffffff'), 5)
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
const CARD_W = 64
const CARD_H = 90
const DEALER_Y = 70
const PLAYER_Y = 250

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

function drawCard(c, x, y) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
  ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(c.rank, x + 6, y + 22)
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
}

function drawHand(hand, y) {
  hand.forEach((c, i) => drawCard(c, 20 + i * (CARD_W + 8), y))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawHand(dealer, DEALER_Y)
  drawHand(player, PLAYER_Y)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newDeck()
deal()
requestAnimationFrame(loop)
```
