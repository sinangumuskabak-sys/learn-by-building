---
title: One place for the rules
title_tr: Kurallar için tek yer
skills: [prog.functions]
---

# --goal--

Turning a card over is about to get rules: pairs, a limit of two cards, moves. We give it its own function, `flip`,
and the click only calls it. It refuses a missing card or one that is already face up.

# --goal-tr--

Kart çevirmenin birazdan **kuralları** olacak: eşler, aynı anda en fazla iki kart, hamle sayısı. Bu kuralları tıklama
dinleyicisinin içine doldurmak yerine ayrı bir fonksiyonda topluyoruz: `flip` (çevir). Tıklama yalnız onu çağıracak.

Şimdilik iki kural: kart yoksa ya da zaten açıksa **hiçbir şey yapma**.

# --code--

```js
function flip(card) {
  if (!card || card.faceUp) return
  card.faceUp = true
}

  flip(cardAt(x, y))
```

# --meaning--

- `!card` means "there is no card". `||` means "or".
- `return` leaves the function at once, so the card is only turned when both checks pass.
- The click now just calls `flip(cardAt(x, y))`.

# --meaning-tr--

- `if (!card || card.faceUp) return` → `!` "**değil**": `!card` "kart yoksa". `||` "**veya**": biri doğruysa yeter.
  "Kart yoksa veya zaten açıksa, `return`: hemen çık."
- `card.faceUp = true` → kartı aç.
- Tıklama dinleyicisindeki iki satır (`const card = ...` ve `if (card) ...`) tek satıra iner: `flip(cardAt(x, y))`.
  `cardAt`'in cevabı doğrudan `flip`'e verilir.
- Kural yeri tek: ileride klavyeyle oynamak istesen de aynı `flip`'i çağırırsın.

# --task--

1. Above the click listener, write `flip` and an empty line.
2. In the listener, replace the last two lines with `flip(cardAt(x, y))`.

# --task-tr--

1. Tıklama dinleyicisinin **üstüne** `flip` fonksiyonunu ve bir boş satır yaz.
2. Dinleyicinin içindeki `const card = cardAt(x, y)` ve `if (card) card.faceUp = true` satırlarını sil; yerine
   `flip(cardAt(x, y))` yaz.
3. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --tests--

`flip()` should turn a face-down card over, and ignore a missing card.
tr: `flip()` kapalı kartı açmalı, olmayan kartı görmezden gelmeli.

```js
flip(cards[3])
assert.isTrue(cards[3].faceUp)
flip(undefined)
assert.strictEqual(cards.filter((c) => c.faceUp).length, 1)
```

Clicking should go through `flip`.
tr: Tıklama `flip` üzerinden gitmeli.

```js
$.click(250, 190)
assert.isTrue(cards[6].faceUp)
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

function flip(card) {
  if (!card || card.faceUp) return
  card.faceUp = true
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
