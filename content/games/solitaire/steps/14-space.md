---
title: Space turns a card
title_tr: Boşluk kart çevirir
skills: [game.input]
---

# --goal--

Pressing Space calls `flipStock`. Space normally scrolls the page, so we tell the browser not to, but only for the keys the
game uses.

# --goal-tr--

**Boşluk** tuşuna basınca `flipStock` çalışsın. Tarayıcıya "bir tuşa basılınca haber ver" diyeceğiz (olay dinleyicisi).

Küçük bir sorun: Boşluk normalde sayfayı **aşağı kaydırır**. Oyunun kullandığı tuşlarda bu davranışı durduracağız;
diğer tuşlara ise hiç dokunmayacağız.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') flipStock()
  else return
  event.preventDefault()
})
```

# --meaning--

- The function runs on every key press; `event.key` is the key's name, `' '` for Space.
- For any other key, `else return` leaves at once.
- `event.preventDefault()` stops the browser's own action for the key (scrolling).

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → sayfada bir tuşa **basıldığında** içindeki fonksiyonu
  çalıştır. `event` basılan tuşun bilgilerini taşır.
- `if (event.key === ' ') flipStock()` → basılan tuş **Boşluk** (`' '`, tırnak içinde bir boşluk) ise kart çevir.
- `else return` → başka bir tuşsa fonksiyondan **hemen çık**; altındaki satıra inilmez.
- `event.preventDefault()` → tarayıcının bu tuş için yapacağı **kendi işini** (sayfayı kaydırmak) engeller. Buraya
  yalnız oyunun tuşları ulaşır.

# --task--

Above `function drawCardAt(...)` write the listener, with an empty line between them. Run, click the game and press
Space a few times.

# --task-tr--

1. `function drawCardAt(card, x, y) {` satırının **üstüne** dinleyiciyi yaz; aralarında bir boş satır kalsın.
2. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin) ve birkaç kez **Boşluk**'a bas: destenin yanında açık
   kartlar belirmeli.

# --hint--

Space is `' '`: a quote, one space, a quote.

# --hint-tr--

Boşluk tuşunun adı `' '`: tırnak, bir boşluk, tırnak.

# --tests--

Space should turn a card over onto the waste.
tr: Boşluk atığa bir kart çevirmeli.

```js
$.press(' ')
assert.lengthOf(piles.waste, 1)
$.press(' ')
assert.lengthOf(piles.waste, 2)
assert.lengthOf(piles.stock, 22)
```

Other keys should do nothing.
tr: Başka tuşlar hiçbir şey yapmamalı.

```js
$.press('a')
$.press('Enter')
assert.lengthOf(piles.waste, 0)
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CW = 56 // card width
const CH = 78
const LEFT = 16
const COL = 64 // distance between columns
const TOP_Y = 40 // the stock, the waste and the foundations
const TAB_Y = 136 // the seven tableau columns
const DOWN_STEP = 8 // how much of a face-down card shows under the next one
const UP_STEP = 22

let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

const isRed = (card) => card.suit === 1 || card.suit === 2
const last = (pile) => pile[pile.length - 1]
const colX = (i) => LEFT + i * COL

function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Column i gets i + 1 cards, the last one face up; the rest is the stock.
function deal() {
  const deck = newDeck()
  piles = { stock: [], waste: [] }
  for (let f = 0; f < 4; f++) piles['f' + f] = []
  for (let i = 0; i < 7; i++) {
    piles['t' + i] = deck.splice(0, i + 1)
    last(piles['t' + i]).up = true
  }
  piles.stock = deck
}

// Where each pile sits on the table.
function pileX(key) {
  if (key === 'stock') return colX(0)
  if (key === 'waste') return colX(1)
  if (key[0] === 'f') return colX(3 + Number(key[1]))
  return colX(Number(key[1]))
}

// The y of card `index` in a tableau column: face-down cards overlap more than face-up ones.
function cardY(key, index) {
  if (key[0] !== 't') return TOP_Y
  let y = TAB_Y
  const pile = piles[key]
  for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP
  return y
}

function flipStock() {
  if (piles.stock.length) {
    const card = piles.stock.pop()
    card.up = true
    piles.waste.push(card)
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') flipStock()
  else return
  event.preventDefault()
})

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
  if (!card.up) return
  ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const [key, pile] of Object.entries(piles)) {
    const x = pileX(key)
    // An empty place shows as an outline.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, cardY(key, i))
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
