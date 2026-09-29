---
title: Click to turn a card
title_tr: Tıkla, kartı çevir
skills: [game.input]
---

# --goal--

On a click, we turn the click into canvas pixels, find the card there, and turn it face up. The loop draws the change.

# --goal-tr--

Şimdi kartlara tıklayabileceğiz. Tarayıcıya "canvas'a **tıklanınca** bana haber ver" deriz. Buna **olay dinlemek**
(event listener) denir: kapı zili gibi, çalınca ne yapacağını önceden söylersin.

Tıklamanın yeri **sayfaya göre** gelir; canvas ise sayfanın köşesinde başlamaz ve ekranda farklı boyda gösterilebilir.
Önce tıklamayı canvas piksellerine çevirir, sonra `cardAt` ile kartı buluruz.

# --code--

```js
canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const card = cardAt(x, y)
  if (card) card.faceUp = true
})
```

# --meaning--

- `addEventListener('click', ...)` runs the function on every click on the canvas; `event` carries the mouse position.
- `getBoundingClientRect()` gives where the canvas is and how big it is shown. Subtract its left/top, then scale by
  `canvas.width / rect.width`.
- `if (card) card.faceUp = true`: a click in a gap finds no card and does nothing. The loop shows the change.

# --meaning-tr--

- `canvas.addEventListener('click', (event) => { ... })` → canvas'a her tıklandığında içini çalıştır. `event` olayın
  bilgisi: `event.clientX`, `event.clientY` farenin **sayfadaki** yeri.
- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki **dikdörtgeni**: nerede başladığı (`left`, `top`) ve ekranda ne
  kadar büyük gösterildiği (`width`, `height`).
- `(event.clientX - rect.left)` → canvas'ın başladığı yeri çıkar: canvas içindeki konum.
- `* (canvas.width / rect.width)` → **ölçekle**: canvas iki kat büyük gösteriliyorsa 0.5 ile çarp. Bu adımı atlamak
  yaygın bir hatadır: kendi ekranında çalışır, telefonda yanlış karta düşer.
- `const card = cardAt(x, y)` → o noktadaki kart (ya da `undefined`).
- `if (card) card.faceUp = true` → kart bulunduysa **aç**. Tek komutluk `if`'te süslü parantez gerekmez. Ekranı döngü
  günceller; `draw()` çağırmamıza gerek yok.

# --task--

Above `function draw`, write the click listener, then an empty line. Run and click a few cards.

# --task-tr--

1. `function draw() {` satırının **üstüne** tıklama dinleyicisini yaz; arada bir boş satır kalsın.
2. Sondaki `})` önemli: `}` fonksiyonu, `)` ise `addEventListener(` parantezini kapatır.
3. **Çalıştır** ve kartlara tıkla: meyveler görünmeli (şimdilik açık kalıyorlar; eşleştirme sonra).

# --hint--

If clicks land on the wrong card, check the `* (canvas.width / rect.width)` parts.

# --hint-tr--

Tıklamalar yanlış karta düşüyorsa `* (canvas.width / rect.width)` kısımlarını kontrol et.

# --tests--

Clicking a card should turn it face up and show it.
tr: Bir karta tıklamak onu açmalı ve göstermeli.

```js
$.click(250, 190)
$.tick(1)
assert.isTrue(cards[6].faceUp)
assert.strictEqual(cards.filter((c) => c.faceUp).length, 1)
assert.include($.texts(), cards[6].symbol)
```

A click in a gap should do nothing.
tr: Boşluğa tıklamak hiçbir şey yapmamalı.

```js
$.click(100, 90)
assert.strictEqual(cards.filter((c) => c.faceUp).length, 0)
```

Clicks should be scaled when the canvas is shown at a different size.
tr: Canvas farklı boyda gösterildiğinde tıklamalar ölçeklenmeli.

```js
// Pretend the canvas is shown twice as big, starting 10px from the left of the page.
$.canvas.getBoundingClientRect = () => ({ left: 10, top: 0, x: 10, y: 0, width: 800, height: 880, right: 810, bottom: 880 })
$.click(10 + 700, 800)
assert.isTrue(cards[15].faceUp, 'a click at (700, 800) on the big canvas is the bottom-right card')
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

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const card = cardAt(x, y)
  if (card) card.faceUp = true
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textBaseline = 'middle'
  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = '#f8fafc'
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
