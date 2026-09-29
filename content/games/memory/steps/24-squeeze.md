---
title: Animate the turn
title_tr: Dönüşü canlandır
skills: [game.loop, game.canvas]
---

# --goal--

To fake a 3D turn in 2D we squeeze the card horizontally. As `flip` goes from 0 to 1, `Math.abs(Math.cos(flip * π))`
goes 1 → 0 → 1: full width, a thin line halfway (exactly when the sides swap), full width again.

# --goal-tr--

Son dokunuş: kart **dönüyormuş gibi** görünsün. 2 boyutlu ekranda 3 boyutlu dönüşü taklit etmek için kartı **yatayda
sıkıştırırız**: tam genişlik → ince bir çizgi → yine tam genişlik. Bir kapıyı yandan izlemek gibi: kapandıkça incelir.

Bu genişliği **kosinüs** (`Math.cos`) kendiliğinden verir. En ince anı, tam yüz değiştirdiği an (`flip` = 0.5) olur.

# --code--

```js
// Squeeze the card horizontally to fake a 3D turn: full width, a thin line halfway, full width again.
const width = CARD * Math.abs(Math.cos(card.flip * Math.PI))
const x = cardX(card) + (CARD - width) / 2
const y = cardY(card)
if (card.flip >= 0.5) {
  ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
  ctx.fillRect(x, y, width, CARD)
  ctx.fillText(card.symbol, cardX(card) + CARD / 2, y + CARD / 2)
} else {
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(x, y, width, CARD)
}
```

# --meaning--

- `Math.PI` is π. `Math.cos(flip * Math.PI)` goes from 1 to -1 as `flip` goes 0 to 1; `Math.abs` drops the sign, so
  the width goes 85 → 0 → 85.
- `x` moves right by half of what was squeezed off, so the card stays centered.
- The fruit is still centered on the card's real middle, `cardX(card) + CARD / 2`.

# --meaning-tr--

- `Math.PI` → π sayısı (3.14...). `card.flip * Math.PI` → `flip` 0'dan 1'e giderken 0'dan π'ye.
- `Math.cos(...)` → **kosinüs**: 0'da 1, π/2'de 0, π'de −1. `Math.abs` eksi işaretini atar: 1 → 0 → 1.
- `const width = CARD * ...` → kartın genişliği: 85 → 0 → 85.
- `const x = cardX(card) + (CARD - width) / 2` → sıkışan kısmın yarısı kadar sağa kay: kart **ortada** kalır.
- `fillRect(x, y, width, CARD)` → iki yüzde de yeni genişlik.
- `ctx.fillText(card.symbol, cardX(card) + CARD / 2, ...)` → meyve kartın **gerçek** ortasında (x artık kaydığı için
  `cardX(card)` kullanıyoruz).

# --task--

In `draw`'s card loop, add the comment and `width` line, change `x`, and use `width` in both `fillRect`s and
`cardX(card)` in `fillText`.

# --task-tr--

1. `draw` içindeki kart döngüsünün başına yorum satırını ve `const width = ...` satırını yaz.
2. `const x = cardX(card)` satırını `const x = cardX(card) + (CARD - width) / 2` yap.
3. İki `fillRect` içinde üçüncü sayıyı `CARD` yerine `width` yap.
4. `fillText` içinde `x + CARD / 2` kısmını `cardX(card) + CARD / 2` yap.
5. **Çalıştır** ve oyna: kartlar daralıp genişleyerek dönmeli. Tebrikler, oyunun bitti!

# --try--

Change `0.1` in `loop` to `0.02` (twice) and watch the cards turn in slow motion. Put `0.1` back.

# --try-tr--

`loop` içindeki iki `0.1`'i `0.02` yap ve kartların ağır çekimde dönüşünü izle. Sonra `0.1`'e geri al.

# --tests--

A turning card should narrow, stay centered, and swap sides halfway.
tr: Dönen bir kart daralmalı, ortalı kalmalı ve yarı yolda yüz değiştirmeli.

```js
flip(cards[0])
$.tick(2)
const back = $.rects('#6366f1').find((r) => r.w < 85)
assert.closeTo(back.w, 85 * Math.cos(0.2 * Math.PI), 0.01)
assert.closeTo(back.x + back.w / 2, 12 + 85 / 2, 0.01)
$.tick(5)
const face = $.rects('#f8fafc').find((r) => r.w < 85)
assert.closeTo(face.w, 85 * Math.abs(Math.cos(0.7 * Math.PI)), 0.01)
assert.include($.texts(), cards[0].symbol)
```

The rules should be unchanged: a wrong pair still turns back after 800 ms.
tr: Kurallar değişmemeli: yanlış çift yine 800 ms sonra geri dönmeli.

```js
const a = cards[0]
const b = cards.find((c) => c.symbol !== a.symbol)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
$.run(1)
assert.isFalse(a.faceUp || b.faceUp)
$.run(0.5)
assert.strictEqual(a.flip, 0)
assert.lengthOf($.rects('#6366f1'), 16)
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
    flip: 0, // 0 = showing its back, 1 = showing its face; follows faceUp over a few frames
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

function won() {
  return cards.every((card) => card.matched)
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
  if (won()) {
    newGame()
    return
  }
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
    // Squeeze the card horizontally to fake a 3D turn: full width, a thin line halfway, full width again.
    const width = CARD * Math.abs(Math.cos(card.flip * Math.PI))
    const x = cardX(card) + (CARD - width) / 2
    const y = cardY(card)
    if (card.flip >= 0.5) {
      ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
      ctx.fillRect(x, y, width, CARD)
      ctx.fillText(card.symbol, cardX(card) + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, width, CARD)
    }
  }

  if (won()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('You found them all!', canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 270)
  }
}

function loop() {
  for (const card of cards) {
    card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
