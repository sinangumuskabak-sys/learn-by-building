---
title: The rules as functions
title_tr: Fonksiyon olarak kurallar
skills: [prog.functions]
---

# --explanation--

Klondike has two rules for where a card may go, and each fits in a small function that looks only at the card and the pile.

**Tableau** (`canStack`): a card goes on a face-up card one rank higher, of the **other color**: a red 9 on a black 10. Only a
king may start an empty column.

**Foundation** (`canFound`): a card goes on the same suit, one rank higher; an empty foundation takes only an ace.

```js
return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)
```

`isRed(under) !== isRed(card)` is a neat way to say "the colors differ": two booleans are unequal exactly when one is red and the
other is not.

Functions like these, which only answer a question and change nothing, are called **pure**. They are easy to test on their own,
and every part of the game that moves cards (taps, dragging, the computer finishing the game) can trust them.

# --explanation-tr--

Klondike'de bir kartın nereye gidebileceği için iki kural vardır ve her biri yalnızca karta ve yığına bakan küçük bir fonksiyona sığar.

**Tablo** (`canStack`): bir kart, bir değer yüksek, **diğer renkte** açık bir kartın üstüne gider: siyah bir 10'un üstüne kırmızı bir
9. Boş bir sütuna yalnızca papaz başlayabilir.

**Temel** (`canFound`): bir kart aynı renkte, bir değer yükseğe gider; boş bir temel yalnızca as alır.

```js
return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)
```

`isRed(under) !== isRed(card)`, "renkler farklı" demenin zarif bir yoludur: iki boolean, tam olarak biri kırmızı diğeri değilken
eşit değildir.

Yalnızca bir soruyu cevaplayan ve hiçbir şeyi değiştirmeyen böyle fonksiyonlara **saf** denir. Tek başlarına test etmeleri kolaydır
ve kart hareket ettiren oyunun her parçası (dokunuşlar, sürükleme, oyunun bitirilmesi) onlara güvenebilir.

# --task--

1. Write `canStack(card, pile)`: an empty pile takes only a king (13); otherwise the top card must be face up, one rank higher and
   of the other color.
2. Write `canFound(card, pile)`: an empty pile takes only an ace (1); otherwise the top card must be the same suit and one rank
   lower.

# --task-tr--

1. `canStack(card, pile)` yaz: boş bir yığın yalnızca papaz (13) alır; değilse üst kart açık, bir değer yüksek ve diğer renkte
   olmalı.
2. `canFound(card, pile)` yaz: boş bir yığın yalnızca as (1) alır; değilse üst kart aynı renk ve bir değer düşük olmalı.

# --tests--

`canStack` should need one rank higher, the other color, and a face-up card.
tr: `canStack` bir değer yüksek, diğer renk ve açık bir kart istemeli.

```js
assert.isTrue(isRed({ rank: 1, suit: 1 }))
assert.isTrue(isRed({ rank: 1, suit: 2 }))
assert.isFalse(isRed({ rank: 1, suit: 0 }))
assert.isTrue(canStack({ rank: 9, suit: 1, up: true }, [{ rank: 10, suit: 0, up: true }]), 'red 9 on black 10')
assert.isFalse(canStack({ rank: 9, suit: 3, up: true }, [{ rank: 10, suit: 0, up: true }]), 'not the same color')
assert.isFalse(canStack({ rank: 8, suit: 1, up: true }, [{ rank: 10, suit: 0, up: true }]), 'only one lower')
assert.isFalse(canStack({ rank: 9, suit: 1, up: true }, [{ rank: 10, suit: 0, up: false }]), 'not onto a face-down card')
```

Only a king should start an empty column.
tr: Boş bir sütuna yalnızca papaz başlayabilmeli.

```js
assert.isTrue(canStack({ rank: 13, suit: 0, up: true }, []), 'a king into an empty column')
assert.isFalse(canStack({ rank: 12, suit: 0, up: true }, []), 'nothing else')
```

Foundations should start with an ace and go up one at a time in one suit.
tr: Temeller asla başlamalı ve tek renkte birer birer yükselmeli.

```js
assert.isTrue(canFound({ rank: 1, suit: 2 }, []), 'an ace starts a foundation')
assert.isFalse(canFound({ rank: 2, suit: 2 }, []))
assert.isTrue(canFound({ rank: 2, suit: 1 }, [{ rank: 1, suit: 1 }]))
assert.isFalse(canFound({ rank: 2, suit: 0 }, [{ rank: 1, suit: 1 }]), 'same suit only')
assert.isFalse(canFound({ rank: 3, suit: 1 }, [{ rank: 1, suit: 1 }]), 'one at a time')
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
      if (!pile.length && y >= TAB_Y && y <= TAB_Y + CH) return { key, index: 0 }
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
  if (h && h.key === 'stock') flipStock()
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
