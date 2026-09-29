---
title: Cards on the table
title_tr: Masadaki kartlar
skills: [game.canvas]
---

# --goal--

Each card is a white rectangle with a thin dark border. A hand is drawn as a row of cards, 8 pixels apart: the
dealer's at the top, yours below.

# --goal-tr--

Her kart ince koyu çerçeveli **beyaz bir dikdörtgen**. Bir el yan yana, aralarında 8 piksel olan kartlar olarak
çiziliyor: krupiyeninki üstte, seninki altta. Kartların yüzünü sonraki adımda yazacağız.

# --code--

```js
const CARD_W = 64
const CARD_H = 90
const DEALER_Y = 70
const PLAYER_Y = 250

function drawCard(c, x, y) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
}

function drawHand(hand, y) {
  hand.forEach((c, i) => drawCard(c, 20 + i * (CARD_W + 8), y))
}

  drawHand(dealer, DEALER_Y)
  drawHand(player, PLAYER_Y)
```

# --meaning--

- `strokeRect` draws only the outline of a rectangle, in `strokeStyle`.
- `forEach((c, i) => ...)` gives each card with its position in the hand; card `i` is `i × 72` pixels to the right.

# --meaning-tr--

- `strokeRect` → dikdörtgenin yalnız **çerçevesini** `strokeStyle` renginde çizer; `lineWidth` kalınlığı.
- `hand.forEach((c, i) => ...)` → her kartı eldeki **sırasıyla** verir. `i`. kart soldan 20 + i × 72 piksel.
- `drawCard(c, x, y)` → `c` kartı şimdilik kullanılmıyor; yüzü yazarken lazım olacak.

# --task--

1. Under `SUITS`, write the four size and position constants.
2. Above `draw`, write `drawCard` and `drawHand`.
3. In `draw`, draw both hands after the table.

# --task-tr--

1. `SUITS` satırının altına dört boyut ve konum sabitini yaz.
2. `draw` fonksiyonunun üstüne `drawCard` ve `drawHand` yaz.
3. `draw`'da masadan sonra, bir boş satırla iki eli çizen satırları yaz. **Çalıştır**.

# --tests--

Two cards for the dealer and two for you should be drawn.
tr: Krupiyeye iki, sana iki kart çizilmeli.

```js
assert.deepEqual($.rects('#ffffff').map((r) => [r.x, r.y, r.w, r.h]), [[20, 70, 64, 90], [92, 70, 64, 90], [20, 250, 64, 90], [92, 250, 64, 90]])
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

newDeck()
deal()
draw()
```
