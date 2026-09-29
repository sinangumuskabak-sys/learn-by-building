---
title: Pair or no pair
title_tr: Eş mi değil mi
skills: [game.state, game.loop]
---

# --goal--

When the second card is open: the same fruit is a pair, both are `matched` and stay open. Different fruits must turn
back over, but not at once, or the player never sees the second card. `setTimeout` waits 800 ms.

# --goal-tr--

İkinci kart açılınca karar zamanı:

- İki meyve **aynıysa** eştir: ikisi de `matched` (eşleşti) olur ve **açık kalır**.
- **Farklıysa** geri kapanmalılar, ama **hemen değil**; yoksa oyuncu ikinci kartı göremez bile.

Beklemek bir **zamanlayıcının** işi: `setTimeout(fonksiyon, 800)` verdiğin fonksiyonu **800 milisaniye** (0,8 saniye)
sonra bir kez çalıştırır. Bu arada sayfa donmaz; her şey çalışmaya devam eder. Mutfakta zamanlayıcı kurup başka işe
dönmek gibi.

# --code--

```js
  if (opened.length < 2) return

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
```

# --meaning--

- With only one card open, stop here.
- `const [a, b] = opened` names the two open cards.
- A pair is marked `matched` and `opened` is emptied for the next turn.
- Otherwise `setTimeout` turns both back over and empties `opened` 800 ms later. Until then `opened` holds two cards,
  so the rule from the last step keeps a third card closed.

# --meaning-tr--

- `if (opened.length < 2) return` → tek kart açıksa burada dur; ikinci kartı bekle.
- `const [a, b] = opened` → listenin ilk iki elemanına `a` ve `b` adını verir.
- `if (a.symbol === b.symbol) {` → meyveler aynı mı?
  - `a.matched = true`, `b.matched = true` → ikisi de eşleşti; açık kalırlar.
  - `opened = []` → yeni tur için liste boşalır.
- `} else {` → aynı değilse:
  - `setTimeout(() => { ... }, 800)` → içteki fonksiyonu **800 ms sonra** çalıştır: iki kartı kapat (`faceUp = false`)
    ve listeyi boşalt.
- Bu 800 ms boyunca `opened` hâlâ iki kart tutar; önceki adımın kuralı sayesinde üçüncü kart açılmaz. Zaten var olan
  bilgi, yeni bir değişken eklemeden soruyu cevaplar.

# --task--

At the end of `flip`, under `opened.push(card)`, write the new lines, above the function's last `}`.

# --task-tr--

1. `flip` içinde `opened.push(card)` satırının **altına** yeni satırları yaz; fonksiyonun son `}` işareti en altta kalsın.
2. **Çalıştır** ve oyna: eşler açık kalmalı, eş olmayanlar bir an sonra kapanmalı.

# --try--

Change `800` to `3000` and play: a long look at every wrong pair. Put `800` back.

# --try-tr--

`800`'ü `3000` yap ve oyna: her yanlış çifte uzun uzun bakarsın. Sonra `800`'e geri al.

# --tests--

Two cards with the same fruit should stay face up as a pair.
tr: Aynı meyveli iki kart eş olarak açık kalmalı.

```js
const [a, b] = cards.filter((c) => c.symbol === cards[0].symbol)
flip(a)
flip(b)
assert.isTrue(a.matched && b.matched)
assert.deepEqual(opened, [])
$.run(2)
assert.isTrue(a.faceUp && b.faceUp)
```

Two different cards should turn back over after 800 ms.
tr: İki farklı kart 800 ms sonra geri kapanmalı.

```js
const a = cards[0]
const b = cards.find((c) => c.symbol !== a.symbol)
flip(a)
flip(b)
$.run(0.5)
assert.isTrue(a.faceUp && b.faceUp, 'still showing after half a second')
$.run(0.5)
assert.isFalse(a.faceUp || b.faceUp)
assert.isFalse(a.matched || b.matched)
assert.deepEqual(opened, [])
assert.lengthOf($.rects('#6366f1'), 16, 'the board is drawn face down again')
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
