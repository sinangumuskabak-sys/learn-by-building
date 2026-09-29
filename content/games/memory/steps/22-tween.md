---
title: A number that follows
title_tr: Peşinden giden bir sayı
skills: [game.loop, game.state]
---

# --goal--

To animate a turn, we separate the truth from what is shown. `card.faceUp` stays the rule; a new number `card.flip`
goes from 0 (back) to 1 (face) and chases `faceUp` by 0.1 every frame.

# --goal-tr--

Kartlar şu an **anında** açılıyor. Gerçekten **dönsünler** istiyoruz. Bunun için önemli bir fikir: **gerçek durum** ile
**görünen durum** ayrı.

- `card.faceUp` **gerçek**: kurallar yalnız buna bakar, eskisi gibi.
- `card.flip` ise 0 (arka yüz) ile 1 (ön yüz) arasında bir sayı ve her karede gerçeği biraz **kovalar**. Bir kedinin
  oyuncağın peşinden gitmesi gibi: oyuncak (gerçek) zıplar, kedi (görünen) adım adım yetişir.

Bu adımda sayıyı yürütüyoruz; çizime bir sonraki adımda bağlayacağız.

# --code--

```js
    flip: 0, // 0 = showing its back, 1 = showing its face; follows faceUp over a few frames

function loop() {
  for (const card of cards) {
    card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  }
  draw()
```

# --meaning--

- Every new card starts with `flip: 0`.
- Each frame, a face-up card's `flip` grows by 0.1, a face-down card's shrinks by 0.1.
- `Math.min(1, ...)` never lets it pass 1, `Math.max(0, ...)` never below 0. It takes 10 frames to turn.

# --meaning-tr--

- `flip: 0,` → her yeni kartın görünen hâli: arka yüz. Sondaki yorum ne anlama geldiğini söylüyor.
- `loop` içinde her karede, her kart için:
  - `card.faceUp ? ... : ...` → kart (gerçekte) açıksa ilk kısım, kapalıysa ikinci kısım.
  - `Math.min(1, card.flip + 0.1)` → 0.1 artır, ama `Math.min` iki sayıdan **küçüğünü** seçtiği için 1'i asla geçme.
  - `Math.max(0, card.flip - 0.1)` → 0.1 azalt, ama `Math.max` **büyüğünü** seçtiği için 0'ın altına inme.
- 10 karede (saniyenin altıda biri) dönüş tamamlanır. Görünen bir değeri hedefe doğru azar azar yürütmeye **tweening**
  denir; oyunlardaki animasyonların neredeyse hepsi böyledir.

# --task--

1. In `newGame`, under `matched: false,`, write the `flip` line.
2. In `loop`, above `draw()`, write the `for` loop.

# --task-tr--

1. `newGame` içinde `matched: false,` satırının altına `flip: 0, ...` satırını yaz.
2. `loop` içinde `draw()` satırının **üstüne** `for` döngüsünü yaz.
3. **Çalıştır**: ekran aynı; kontroller sayının yürüdüğüne bakacak.

# --tests--

New cards should start with `flip` at 0.
tr: Yeni kartlar `flip` 0 ile başlamalı.

```js
assert.isTrue(cards.every((c) => c.flip === 0))
```

`flip` should move 0.1 per frame toward the card's side, and stop at the ends.
tr: `flip` her karede kartın tarafına doğru 0.1 ilerlemeli ve uçlarda durmalı.

```js
flip(cards[0])
$.tick(3)
assert.closeTo(cards[0].flip, 0.3, 0.001)
$.tick(20)
assert.strictEqual(cards[0].flip, 1)
cards[0].faceUp = false
$.tick(4)
assert.closeTo(cards[0].flip, 0.6, 0.001)
$.tick(20)
assert.strictEqual(cards[0].flip, 0)
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
