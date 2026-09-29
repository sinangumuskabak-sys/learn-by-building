---
title: Show moves and pairs
title_tr: Hamleleri ve eşleri göster
skills: [game.canvas]
---

# --goal--

The top strip shows `Moves: 3`, and a found pair turns light green, so you can tell it from the cards you just opened.

# --goal-tr--

İki küçük dokunuş:

- Üstteki şeride hamle sayısını yaz: `Moves: 3`.
- Bulunan eşler **açık yeşil** olsun; böylece az önce açtığın kartlarla karışmazlar.

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = '18px sans-serif'
ctx.textAlign = 'left'
ctx.textBaseline = 'middle'
ctx.fillText('Moves: ' + moves, GAP, 22)

ctx.font = '44px sans-serif'
ctx.textAlign = 'center'

    ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
```

# --meaning--

- Three new lines above `textBaseline` set white, 18 px, left-aligned text; the line under it writes the counter at
  (12, 22), in the middle of the strip.
- `card.matched ? '#bbf7d0' : '#f8fafc'` picks light green for a pair, white otherwise.

# --meaning-tr--

- `ctx.fillStyle = 'white'`, `ctx.font = '18px sans-serif'`, `ctx.textAlign = 'left'` → beyaz, 18 piksel, sola
  hizalı yazı. `ctx.textBaseline = 'middle'` satırı zaten vardı; artık bu grubun içinde.
- `ctx.fillText('Moves: ' + moves, GAP, 22)` → `+` yazı ile sayıyı yapıştırır: `'Moves: 3'`. Soldan 12, yukarıdan 22:
  şeridin ortası.
- Sonra boş bir satır: kartların yazı ayarları (`44px`, `center`) kendi grubunda kalır.
- `card.matched ? '#bbf7d0' : '#f8fafc'` → **kısa soru**: soru işaretinden önce soru, iki noktanın iki yanında iki cevap.
  "Eşleşti mi? Evetse açık yeşil, değilse beyaz."

# --task--

1. In `draw`, write the three text lines above `ctx.textBaseline = 'middle'`, and the `Moves` line plus an empty line
   under it.
2. In the face-up branch, change the white `fillStyle` as shown.

# --task-tr--

1. `draw` içinde `ctx.textBaseline = 'middle'` satırının **üstüne** üç yazı satırını yaz.
2. `ctx.textBaseline = 'middle'` satırının **altına** `Moves` satırını ve bir boş satır yaz.
3. Açık kart bölümündeki `ctx.fillStyle = '#f8fafc'` satırını `ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'` yap.
4. **Çalıştır** ve oyna: üstte hamle sayısı artmalı, bulduğun eşler yeşile dönmeli.

# --tests--

The move counter should be drawn in the top strip.
tr: Hamle sayacı üst şeride yazılmalı.

```js
moves = 3
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Moves: 3')
assert.exists(text, 'Moves: 3 should be drawn')
assert.deepEqual(text.args.slice(1, 3), [12, 22])
assert.strictEqual(text.fill, 'white')
```

Clicking a pair should show it in green and count the move.
tr: Bir çifte tıklamak onu yeşil göstermeli ve hamleyi saymalı.

```js
const [a, b] = cards.filter((c) => c.symbol === cards[0].symbol)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
$.tick(1)
assert.lengthOf($.rects('#bbf7d0'), 2)
assert.include($.texts(), 'Moves: 1')
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
let opened // the cards turned over this turn (0, 1 or 2)
let moves

// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function newGame() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
  opened = []
  moves = 0
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function cardAt(x, y) {
  return cards.find((card) => {
    const left = cardX(card)
    const top = cardY(card)
    return x >= left && x < left + CARD && y >= top && y < top + CARD
  })
}

function flip(card) {
  if (!card || card.faceUp || opened.length === 2) return
  card.faceUp = true
  opened.push(card)
  if (opened.length < 2) return

  moves += 1
  const [a, b] = opened
  if (a.symbol === b.symbol) {
    a.matched = true
    b.matched = true
    opened = []
  } else {
    // Give the player time to see the second card before hiding both again.
    setTimeout(() => {
      a.faceUp = false
      b.faceUp = false
      opened = []
    }, 800)
  }
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  flip(cardAt(x, y))
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Moves: ' + moves, GAP, 22)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
