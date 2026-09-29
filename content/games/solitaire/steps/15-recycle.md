---
title: Go through the stock again
title_tr: Desteyi yeniden kullan
skills: [prog.arrays]
---

# --goal--

When the stock is empty, turning it over again takes the whole waste back, face down, so you can go through it again. It
must come back in the same order, as with real cards: the waste is flipped over like a real pile.

# --goal-tr--

Deste bitince ne olacak? Gerçek oyunda açılan kartların hepsini **ters çevirip** yeniden deste yaparsın ve baştan
geçersin. Kartlar yine **aynı sırayla** gelir.

Dizide bunun karşılığı: açık kartlar dizisini **tersine çevir** ve her kartı kapat.

# --code--

```js
} else {
  // An empty stock takes the waste back, face down, in the same order as before.
  piles.stock = piles.waste.reverse().map((card) => ({ ...card, up: false }))
  piles.waste = []
}
```

# --meaning--

- `reverse()` flips the order of an array: the first card turned over ends up last in the new stock, so it comes out first
  again.
- `map` makes a new array by changing every item; `{ ...card, up: false }` is a copy of the card with `up` set to false.
  The object is in parentheses so the arrow function returns it.
- The waste becomes empty.

# --meaning-tr--

- `else { ... }` → `if` doğru değilse, yani deste **boşsa** burası çalışır.
- `piles.waste.reverse()` → diziyi **tersine çevirir**. Açılan ilk kart atığın **başındaydı**; ters çevirince yeni
  destenin **sonuna**, yani üstüne gelir ve yine ilk o çıkar. Sıra korunur.
- `.map((card) => ...)` → dizinin her elemanını değiştirerek **yeni bir dizi** yapar.
- `({ ...card, up: false })` → `...card` kartın bütün bilgilerini yeni bir nesneye **kopyalar**, `up: false` ise
  kopyada `up`'ı yanlış yapar: kart kapanır. Süslü parantezin etrafındaki `( )` şart: onlarsız JavaScript `{`'i
  fonksiyon gövdesi sanar.
- `piles.waste = []` → açık kartlar boşalır.

# --task--

In `flipStock`, after the `if` block's closing `}`, add the `else` block.

# --task-tr--

`flipStock` içinde `if` bloğunun kapanan `}`'sini `} else {` yap ve altına yorum ile iki satırı yaz; en sona `}` koy.
**Çalıştır** ve Boşluk'a 25 kez bas: deste bitince kartlar geri dönmeli.

# --predict--

Without `reverse()`, which card would come out first on the second pass?
- [ ] The same first card as before
- [x] The last card of the first pass
  The waste's last card is at the end of the array, and the stock gives out its end first.
- [ ] A random card

# --predict-tr--

`reverse()` olmasaydı ikinci turda ilk hangi kart çıkardı?
- [ ] Önceki turun ilk kartı
- [x] Önceki turun son kartı
  Atığın son kartı dizinin sonunda; deste de kartları sonundan verir.
- [ ] Rastgele bir kart

# --tests--

An empty stock should take the waste back, face down, in the same order.
tr: Boş bir deste atığı kapalı olarak aynı sırayla geri almalı.

```js
const first = piles.stock[piles.stock.length - 1]
for (let i = 0; i < 24; i++) flipStock()
assert.lengthOf(piles.stock, 0)
flipStock()
assert.lengthOf(piles.stock, 24, 'the waste goes back')
assert.lengthOf(piles.waste, 0)
assert.isTrue(piles.stock.every((card) => !card.up), 'face down')
flipStock()
assert.deepEqual([piles.waste[0].rank, piles.waste[0].suit], [first.rank, first.suit], 'in the same order as before')
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
