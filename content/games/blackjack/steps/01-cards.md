---
title: A deck of cards
title_tr: Bir deste kart
skills: [prog.arrays, game.canvas]
---

# --explanation--

Blackjack is played with a normal deck: 13 **ranks** (A, 2 to 10, J, Q, K) in 4 **suits** (♠ ♥ ♦ ♣), 52 cards in all.
A card is a tiny object, `{ rank: 'Q', suit: '♥' }`, and two nested loops build every combination:

```js
for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
```

Then we shuffle. The fair way is **Fisher–Yates**: go from the last card down, and swap each card with a random card at or
before it. Every order of the 52 cards is then exactly as likely as any other.

Dealing takes cards off the **end** of the array with `pop()`, which is fast and removes the card from the deck, so a card can
never be dealt twice. The player gets two cards and the dealer two.

Suit symbols are just text: `'♥'` can be drawn with `fillText` like any letter. Hearts and diamonds are red. A face-down card
is drawn as a blue back, which we will need soon for the dealer's hidden card.

# --explanation-tr--

Blackjack normal bir desteyle oynanır: 4 **renkte** (♠ ♥ ♦ ♣) 13 **değer** (A, 2'den 10'a, J, Q, K), toplam 52 kart. Bir
kart küçücük bir nesnedir, `{ rank: 'Q', suit: '♥' }`, ve iç içe iki döngü her birleşimi kurar:

```js
for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
```

Sonra karıştırırız. Adil yol **Fisher–Yates**'tir: son karttan geriye doğru git ve her kartı kendisinde ya da öncesindeki
rastgele bir kartla takas et. Böylece 52 kartın her sırası diğerleri kadar olasıdır.

Dağıtmak, kartları dizinin **sonundan** `pop()` ile alır; bu hızlıdır ve kartı desteden çıkarır, yani bir kart hiçbir zaman iki
kez dağıtılamaz. Oyuncu iki kart, krupiye iki kart alır.

Renk simgeleri yalnızca metindir: `'♥'` her harf gibi `fillText` ile çizilebilir. Kupa ve karo kırmızıdır. Kapalı bir kart
mavi bir arka yüz olarak çizilir; buna yakında krupiyenin gizli kartı için ihtiyacımız olacak.

# --task--

1. Add `RANKS`, `SUITS = ['♠', '♥', '♦', '♣']`, `CARD_W = 64`, `CARD_H = 90`, `DEALER_Y = 70`, `PLAYER_Y = 250` and
   `card(rank, suit)`.
2. Write `newDeck()` (all 52 cards, shuffled with Fisher–Yates) and `nextCard()`, which pops a card off the deck.
3. Write `deal()`: a new deck if fewer than 15 cards are left, then two cards each for `player` and `dealer`. `reset()` makes a
   new deck and deals.
4. Write `drawCard(c, x, y, hidden)`: a white `CARD_W` by `CARD_H` card with a `'#0f172a'` outline, its rank at
   `(x + 6, y + 22)` in `'bold 18px sans-serif'` and its suit centered at `(x + CARD_W / 2, y + 64)` in `'34px sans-serif'`,
   red (`'#dc2626'`) for ♥ and ♦, otherwise `'#0f172a'`. A hidden card is `'#1d4ed8'` with a `'#93c5fd'` frame 6 pixels in.
5. Write `drawHand(hand, y, hideSecond)`: the cards from `x = 20`, `CARD_W + 8` apart (closer when the hand is long). Fill the
   table with `'#166534'` and draw the dealer's hand at `DEALER_Y` and yours at `PLAYER_Y`.

# --task-tr--

1. `RANKS`, `SUITS = ['♠', '♥', '♦', '♣']`, `CARD_W = 64`, `CARD_H = 90`, `DEALER_Y = 70`, `PLAYER_Y = 250` ve
   `card(rank, suit)` ekle.
2. `newDeck()` (52 kartın hepsi, Fisher–Yates ile karıştırılmış) ve desteden bir kart çeken `nextCard()` yaz.
3. `deal()` yaz: 15'ten az kart kaldıysa yeni bir deste, sonra `player` ve `dealer` için ikişer kart. `reset()` yeni bir deste
   yapar ve dağıtır.
4. `drawCard(c, x, y, hidden)` yaz: `'#0f172a'` çerçeveli, `CARD_W`'ye `CARD_H` beyaz bir kart; değeri `(x + 6, y + 22)`'de
   `'bold 18px sans-serif'` ile, rengi `(x + CARD_W / 2, y + 64)`'te ortalı `'34px sans-serif'` ile; ♥ ve ♦ için kırmızı
   (`'#dc2626'`), değilse `'#0f172a'`. Gizli bir kart, 6 piksel içeride `'#93c5fd'` çerçeveli `'#1d4ed8'`'dir.
5. `drawHand(hand, y, hideSecond)` yaz: kartlar `x = 20`'den, `CARD_W + 8` aralıkla (el uzunsa daha sık). Masayı `'#166534'`
   ile doldur ve krupiyenin elini `DEALER_Y`'ye, seninkini `PLAYER_Y`'ye çiz.

# --tests--

A new deck should hold all 52 different cards, shuffled.
tr: Yeni bir deste 52 farklı kartın hepsini karıştırılmış olarak tutmalı.

```js
newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((c) => c.rank + c.suit)), 52, 'no card twice')
for (const suit of SUITS) assert.lengthOf(deck.filter((c) => c.suit === suit), 13)
const first = deck.map((c) => c.rank + c.suit).join()
newDeck()
assert.notStrictEqual(deck.map((c) => c.rank + c.suit).join(), first, 'shuffled')
```

Each hand should get two cards off the end of the deck.
tr: Her el destenin sonundan iki kart almalı.

```js
assert.lengthOf(player, 2)
assert.lengthOf(dealer, 2)
assert.lengthOf(deck, 48)
const top = deck[deck.length - 1]
assert.strictEqual(nextCard(), top, 'cards come off the end of the deck')
assert.lengthOf(deck, 47)
```

Cards should be drawn in place, hearts and diamonds in red, and a hidden card as its back.
tr: Kartlar yerlerinde çizilmeli, kupa ve karo kırmızı, gizli bir kart da arka yüzüyle.

```js
player = [card('Q', '♥'), card('7', '♣')]
dealer = [card('A', '♠'), card('10', '♦')]
$.tick(1)
const whites = $.rects('#ffffff')
assert.deepInclude(whites, { x: 20, y: 250, w: 64, h: 90, color: '#ffffff' })
assert.deepInclude(whites, { x: 92, y: 250, w: 64, h: 90, color: '#ffffff' })
assert.deepInclude(whites, { x: 20, y: 70, w: 64, h: 90, color: '#ffffff' })
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.strictEqual(texts.find((c) => c.args[0] === 'Q').fill, '#dc2626', 'hearts are red')
assert.strictEqual(texts.find((c) => c.args[0] === '7').fill, '#0f172a', 'clubs are black')
assert.include(texts.map((c) => c.args[0]), '♦')
drawCard(card('K', '♠'), 300, 100, true)
assert.deepInclude($.rects('#1d4ed8'), { x: 300, y: 100, w: 64, h: 90, color: '#1d4ed8' }, 'a hidden card shows its back')
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
  if (deck.length < 15) newDeck()
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
}

function reset() {
  newDeck()
  deal()
}

function drawCard(c, x, y, hidden) {
  ctx.fillStyle = hidden ? '#1d4ed8' : '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
  if (hidden) {
    ctx.strokeStyle = '#93c5fd'
    ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12)
    return
  }
  ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(c.rank, x + 6, y + 22)
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
}

// Cards overlap a little so a long hand still fits.
function drawHand(hand, y, hideSecond) {
  const step = Math.min(CARD_W + 8, (canvas.width - 40 - CARD_W) / Math.max(1, hand.length - 1))
  hand.forEach((c, i) => drawCard(c, 20 + i * step, y, hideSecond && i === 1))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawHand(dealer, DEALER_Y, false)
  drawHand(player, PLAYER_Y, false)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
