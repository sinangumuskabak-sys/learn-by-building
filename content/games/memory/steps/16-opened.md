---
title: Two cards at a time
title_tr: Aynı anda iki kart
skills: [game.state, prog.arrays]
---

# --goal--

A turn is two cards. We keep the cards turned over this turn in a small array, `opened`, and refuse a third card while
two are open.

# --goal-tr--

Bir tur **iki karttan** oluşur. Bu turda açılan kartları küçük bir listede tutacağız: `opened` (açılanlar). Liste
doluyken (iki kart) üçüncü kart açılmayacak.

Bu adımdan sonra iki kart açınca oyun **takılacak**: kartlar kapanmıyor, üçüncüsü açılmıyor. Doğru! Eşleştirmeyi bir
sonraki adımda ekleyeceğiz.

# --code--

```js
let opened // the cards turned over this turn (0, 1 or 2)

  opened = []

function flip(card) {
  if (!card || card.faceUp || opened.length === 2) return
  card.faceUp = true
  opened.push(card)
}
```

# --meaning--

- `opened` starts empty in every new game.
- `opened.length === 2` is one more reason to refuse: two cards are already showing.
- `opened.push(card)` remembers the card turned over.

# --meaning-tr--

- `let opened` → bu turda açılan kartlar; `newGame` içinde `opened = []` (boş liste) ile başlar.
- `opened.length === 2` → `===` "eşit mi?". "Listede zaten 2 kart var mı?" Varsa üçüncü kart açılmaz.
- `opened.push(card)` → `push` kartı listenin **sonuna ekler**.

# --task--

1. Under `let cards`, write `let opened`.
2. At the end of `newGame`, write `opened = []`.
3. In `flip`, add `|| opened.length === 2` to the `if`, and `opened.push(card)` at the end.

# --task-tr--

1. `let cards` satırının altına `let opened ...` satırını yaz.
2. `newGame` içinde `}))` satırının altına `opened = []` yaz.
3. `flip` içindeki `if` satırının sonuna, `return`'den önce ` || opened.length === 2` ekle.
4. `flip`'in sonuna `opened.push(card)` yaz.
5. **Çalıştır**, iki kart aç, üçüncüye tıkla: açılmamalı.

# --predict--

You turn over two cards that are not a pair. What happens next?
- [ ] They turn back over after a moment
- [x] They stay open, and no other card can be turned: the game is stuck for now
  Nothing empties `opened` yet; that comes in the next step.
- [ ] A third card can be opened

# --predict-tr--

Eş olmayan iki kart açıyorsun. Sonra ne olur?
- [ ] Bir an sonra geri kapanırlar
- [x] Açık kalırlar ve başka kart açılamaz: oyun şimdilik takılır
  `opened` listesini henüz kimse boşaltmıyor; o bir sonraki adımda.
- [ ] Üçüncü bir kart açılabilir

# --tests--

A third card should be ignored while two are showing.
tr: İki kart açıkken üçüncü kart görmezden gelinmeli.

```js
const [a, b, c] = cards
flip(a)
flip(b)
flip(c)
assert.isTrue(a.faceUp && b.faceUp)
assert.isFalse(c.faceUp)
assert.deepEqual(opened, [a, b])
```

A new game should start with nothing opened.
tr: Yeni oyun hiçbir şey açılmamış olarak başlamalı.

```js
assert.deepEqual(opened, [])
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
