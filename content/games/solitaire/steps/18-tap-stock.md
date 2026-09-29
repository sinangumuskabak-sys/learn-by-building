---
title: Tap the stock
title_tr: Desteye dokun
skills: [game.input]
---

# --goal--

A tap (or click) on the stock turns a card over. `pointerdown` works for mouse, pen and finger. The page may show the
canvas smaller or larger than 480×560, so `toCanvas` turns the event's position into canvas pixels.

# --goal-tr--

Desteye **dokununca** (ya da tıklayınca) kart çevrilsin. `pointerdown` olayı fare, kalem ve parmak için aynı çalışır.

Bir incelik var: sayfa canvas'ı ekrana 480×560'tan **küçük ya da büyük** gösterebilir (telefonda küçülür). Olayın verdiği
nokta ekran pikseli; bizim hesaplarımız canvas pikseli. `toCanvas` bu çeviriyi yapacak.

# --code--

```js
function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return { x: ((event.clientX - rect.left) * canvas.width) / rect.width, y: ((event.clientY - rect.top) * canvas.height) / rect.height }
}

canvas.addEventListener('pointerdown', (event) => {
  const p = toCanvas(event)
  const h = hit(p.x, p.y)
  if (!h) return
  if (h.key === 'stock') return flipStock()
})
```

# --meaning--

- `getBoundingClientRect()` tells where the canvas is on the screen and how big it is shown.
- `event.clientX - rect.left` is the distance from the canvas's left edge in screen pixels; times `canvas.width / rect.width`
  it becomes canvas pixels.
- The listener finds what was hit; nothing means `return`; on the stock it turns a card over.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki **yeri ve gösterilen boyu**: `left`, `top`, `width`, `height`.
- `event.clientX - rect.left` → dokunulan noktanın canvas'ın sol kenarından uzaklığı (ekran pikseli).
- `* canvas.width / rect.width` → ekran pikselini canvas pikseline çevirir. Canvas yarı boyda gösteriliyorsa oran 2'dir:
  ekranda 100 piksel, canvas'ta 200.
- `y` aynı hesap, yükseklikle.
- `canvas.addEventListener('pointerdown', ...)` → canvas'a basıldığında çalışır.
- `const h = hit(p.x, p.y)` → orada ne var?
- `if (!h) return` → hiçbir şey yoksa (`null`) çık.
- `if (h.key === 'stock') return flipStock()` → desteyse kart çevir ve çık.

# --task--

Above the `keydown` listener write `toCanvas` and the `pointerdown` listener. Run and click the stock.

# --task-tr--

1. `document.addEventListener('keydown', ...)` satırının **üstüne** `toCanvas` fonksiyonunu ve `pointerdown`
   dinleyicisini yaz; aralarında ve altlarında birer boş satır kalsın.
2. **Çalıştır** ve desteye tıkla: her tıklamada bir kart çevrilmeli.

# --tests--

A tap on the stock should turn a card over.
tr: Desteye dokunmak bir kart çevirmeli.

```js
$.click(16 + 28, 40 + 39)
assert.lengthOf(piles.waste, 1)
$.click(16 + 28, 40 + 39)
assert.lengthOf(piles.waste, 2)
```

A tap on the table or on a column should not turn a card.
tr: Masaya ya da bir sütuna dokunmak kart çevirmemeli.

```js
$.click(300, 500)
$.click(16 + 20, 136 + 30)
assert.lengthOf(piles.waste, 0)
```

`toCanvas` should give canvas pixels.
tr: `toCanvas` canvas pikseli vermeli.

```js
assert.deepEqual(toCanvas({ clientX: 30, clientY: 45 }), { x: 30, y: 45 })
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
  } else {
    // An empty stock takes the waste back, face down, in the same order as before.
    piles.stock = piles.waste.reverse().map((card) => ({ ...card, up: false }))
    piles.waste = []
  }
}

// Which card, or which empty pile, is at (x, y)? The card drawn last, on top, wins.
function hit(x, y) {
  for (const key of Object.keys(piles)) {
    const px = pileX(key)
    if (x < px || x > px + CW) continue
    const pile = piles[key]
    if (key[0] === 't') {
      for (let i = pile.length - 1; i >= 0; i--) {
        const cy = cardY(key, i)
        if (y >= cy && y <= cy + CH) return { key, index: i }
      }
    } else if (y >= TOP_Y && y <= TOP_Y + CH) return { key, index: pile.length - 1 }
  }
  return null
}

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return { x: ((event.clientX - rect.left) * canvas.width) / rect.width, y: ((event.clientY - rect.top) * canvas.height) / rect.height }
}

canvas.addEventListener('pointerdown', (event) => {
  const p = toCanvas(event)
  const h = hit(p.x, p.y)
  if (!h) return
  if (h.key === 'stock') return flipStock()
})

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
