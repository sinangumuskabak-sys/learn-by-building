---
title: Move cards by the rules
title_tr: Kurala göre taşı
skills: [prog.arrays, game.state]
---

# --goal--

`tryMove(from, index, to)` moves the card at `index` **and every card on top of it** from one pile to another, if the
rules allow it: to a foundation only one card that `canFound`, to a column a card that `canStack`, never onto the stock or
the waste.

# --goal-tr--

Kurallar hazır; şimdi kartları **taşıyan** fonksiyon: `tryMove` (taşımayı dene). Üç şey alır: hangi yığından (`from`),
kaçıncı karttan başlayarak (`index`) ve hangi yığına (`to`).

Sütunda bir kartı taşırken **üstündeki bütün kartlar** da onunla gelir; zaten sıralı oldukları için birlikte taşınırlar.
Kurallar:

- temele yalnız **tek kart**, `canFound` izin verirse;
- sütuna `canStack` izin verirse;
- desteye ya da açılan kartlara **asla**.

Kural izin vermezse hiçbir şey değişmez ve cevap `false` olur.

# --code--

```js
// Move cards from index onwards of pile `from` to pile `to`, if the rules allow it.
function tryMove(from, index, to) {
  const cards = piles[from].slice(index)
  if (from === to || !cards.length) return false
  const allowed = to[0] === 'f' ? cards.length === 1 && canFound(cards[0], piles[to]) : to[0] === 't' && canStack(cards[0], piles[to])
  if (!allowed) return false
  piles[to].push(...piles[from].splice(index))
  return true
}
```

# --meaning--

- `slice(index)` copies the cards from `index` to the end without changing the pile; we only look at them.
- Moving onto the same pile, or moving nothing, is not allowed.
- `allowed`: to a foundation, one card that `canFound`; otherwise it must be a column and `canStack`. The stock and the
  waste fail both.
- `splice(index)` cuts those cards off the source; `push(...cards)` adds them one by one to the target (`...` spreads the
  array into separate items).

# --meaning-tr--

- `const cards = piles[from].slice(index)` → `slice(index)` o karttan sona kadar olan kartların **kopyası**. Yığın
  değişmez; yalnız bakmak için.
- `if (from === to || !cards.length) return false` → aynı yığına taşımak **veya** hiç kart olmaması: izin yok.
- `const allowed = ...` → uzun bir koşul işleci:
  - `to[0] === 'f' ? ...` → hedef bir **temelse**: `cards.length === 1 && canFound(...)`: tek kart ve kural uygun.
  - `: to[0] === 't' && canStack(...)` → değilse, hedef bir **sütun olmalı** ve `canStack` uygun demeli. Deste ve
    açılan kartlar ikisini de geçemez.
- `if (!allowed) return false` → izin yoksa çık.
- `piles[from].splice(index)` → kartları kaynak yığından **kesip alır** (kaynak kısalır).
- `piles[to].push(...)` → hedefin sonuna ekler. `...` (yayma) diziyi **tek tek elemanlara** açar: `push(...[a, b])`
  → `push(a, b)`. Onsuz hedefe tek bir dizi eklenirdi.
- `return true` → taşındı.

# --task--

Above the `hit` comment line (`// Which card, ...`), write `tryMove` with its comment and leave an empty line after it.

# --task-tr--

`hit` fonksiyonunun yorum satırının (`// Which card, or which empty pile, ...`) **üstüne**, yorumuyla birlikte
`tryMove` fonksiyonunu yaz; altında bir boş satır kalsın. **Çalıştır**.

# --hint--

Without the `...` in `push(...)`, the target gets one array instead of the cards.

# --hint-tr--

`push(...)` içindeki `...` olmazsa hedefe kartlar değil, tek bir dizi eklenir.

# --tests--

A legal move should move the card and return `true`.
tr: Kurala uygun bir hamle kartı taşımalı ve `true` vermeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(12, 1)]
assert.isTrue(tryMove('t1', 0, 't0'))
assert.lengthOf(piles.t0, 2)
assert.lengthOf(piles.t1, 0)
```

A whole run should move together.
tr: Bütün bir dizi birlikte taşınmalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(12, 1), c(11, 0)]
assert.isTrue(tryMove('t1', 0, 't0'))
assert.deepEqual(piles.t0.map((card) => card.rank), [13, 12, 11])
```

An illegal move should change nothing and return `false`.
tr: Kurala aykırı bir hamle hiçbir şeyi değiştirmemeli ve `false` vermeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(12, 0)]
assert.isFalse(tryMove('t1', 0, 't0'), 'black on black')
assert.isFalse(tryMove('t1', 0, 'waste'), 'never onto the waste')
assert.isFalse(tryMove('t1', 0, 't1'), 'not onto itself')
assert.lengthOf(piles.t0, 1)
assert.lengthOf(piles.t1, 1)
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

// Tableau: one lower, the other color; only a king goes into an empty column.
function canStack(card, pile) {
  const under = last(pile)
  if (!under) return card.rank === 13
  return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)
}

// Foundation: same suit, one higher, starting from the ace.
function canFound(card, pile) {
  const under = last(pile)
  if (!under) return card.rank === 1
  return under.suit === card.suit && under.rank === card.rank - 1
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

// Move cards from index onwards of pile `from` to pile `to`, if the rules allow it.
function tryMove(from, index, to) {
  const cards = piles[from].slice(index)
  if (from === to || !cards.length) return false
  const allowed = to[0] === 'f' ? cards.length === 1 && canFound(cards[0], piles[to]) : to[0] === 't' && canStack(cards[0], piles[to])
  if (!allowed) return false
  piles[to].push(...piles[from].splice(index))
  return true
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
