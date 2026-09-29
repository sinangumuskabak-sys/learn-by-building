---
title: "Build it yourself: your best game"
title_tr: "Kendin yap: en iyi oyunun"
skills: [game.state]
---

# --goal--

Your game, your idea. Remember your best game: the fewest moves you needed to find all pairs. Save it in
`localStorage` under `'memory-best'`, so it survives a reload, and show it next to the move counter.

# --goal-tr--

Oyun senin! **En iyi oyununu** hatırla: bütün eşleri bulmak için gereken **en az** hamle sayısı. Sayfayı yenilesen de
kaybolmasın diye tarayıcının defterine, `localStorage`'a `'memory-best'` adıyla kaydet; üstteki şeritte, hamle sayacının
yanında göster.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `won()`, `moves`, `localStorage.setItem` ve `getItem`, `fillText`...
Kontroller çalıştığında yeşile döner.

# --task--

When the last pair is found, save the number of moves if there is no best yet or it beat the best. Show `Best: 12`
(the real number) in the top strip once there is a best.

# --task-tr--

- Son eş bulununca (oyun kazanılınca) hamle sayısını, henüz rekor yoksa ya da rekordan **azsa**, `'memory-best'` adıyla
  `localStorage`'a kaydet.
- Rekor varsa üst şeritte `Best: 12` gibi (gerçek sayıyla) göster. Yeni oyunda da görünsün.
- Daha kötü bir oyun rekoru bozmasın. (Rekor en **az** hamle: küçük sayı daha iyi!)

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

The moment to save is when a pair is found and `won()` is true, inside `flip`. Keep the best in a variable too, read
from `localStorage` at the start (like `Number(localStorage.getItem('memory-best')) || 0`).

# --hint-tr--

Kaydetme anı: `flip` içinde bir eş bulunduğunda ve `won()` doğru olduğunda. Rekoru bir değişkende de tut; oyun başında
`localStorage`'dan oku (`Number(localStorage.getItem('memory-best')) || 0` gibi). 0 "henüz rekor yok" demek; o yüzden
karşılaştırırken `best === 0 || moves < best` gibi iki durumu birden sor.

# --tests--

Winning should save the number of moves.
tr: Kazanmak hamle sayısını kaydetmeli.

```js
for (const card of cards) card.matched = card.faceUp = card.symbol !== cards[0].symbol
moves = 11
const [a, b] = cards.filter((c) => !c.matched)
flip(a)
flip(b)
assert.isTrue(won())
assert.strictEqual(localStorage.getItem('memory-best'), '12')
```

Only a better (smaller) number should replace the best.
tr: Rekorun yerini yalnız daha iyi (küçük) bir sayı almalı.

```js
const winWith = (n) => {
  newGame()
  for (const card of cards) card.matched = card.faceUp = card.symbol !== cards[0].symbol
  moves = n - 1
  const [a, b] = cards.filter((c) => !c.matched)
  flip(a)
  flip(b)
}
winWith(12)
winWith(20)
assert.strictEqual(localStorage.getItem('memory-best'), '12', 'a worse game keeps the best')
winWith(9)
assert.strictEqual(localStorage.getItem('memory-best'), '9', 'a better game replaces it')
```

The best should be shown in the top strip, also in the next game.
tr: Rekor üst şeritte, sonraki oyunda da görünmeli.

```js
for (const card of cards) card.matched = card.faceUp = card.symbol !== cards[0].symbol
moves = 11
const [a, b] = cards.filter((c) => !c.matched)
flip(a)
flip(b)
newGame()
$.tick(1)
assert.match($.texts().join(' '), /best\D*12/i)
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
let best = Number(localStorage.getItem('memory-best')) || 0 // fewest moves, 0 = none yet

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
    if (won() && (best === 0 || moves < best)) {
      best = moves
      localStorage.setItem('memory-best', best)
    }
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
  if (best > 0) ctx.fillText('Best: ' + best, 150, 22)

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
