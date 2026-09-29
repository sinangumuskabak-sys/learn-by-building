---
title: Put the piles on the table
title_tr: Yığınları masaya koy
skills: [game.canvas, prog.loops]
---

# --goal--

Now `draw` goes through every pile and draws its cards: the top row at `TOP_Y`, the tableau columns lower, at `TAB_Y`.
The test card goes away.

# --goal-tr--

Kartları sonunda masada göreceğiz! `draw` her yığını tek tek gezecek ve kartlarını çizecek: üst sıra (deste, açılan
kartlar, temeller) `TOP_Y`'de, yedi sütun daha aşağıda, `TAB_Y`'de.

Deste gibi yığınlarda yalnız **en üstteki** kart görünür, altındakileri çizmeye gerek yok. Sütunlarda ise hepsini
çiziyoruz. Test kartının işi bitti, onu siliyoruz.

# --code--

```js
const TOP_Y = 40 // the stock, the waste and the foundations
const TAB_Y = 136 // the seven tableau columns

  for (const [key, pile] of Object.entries(piles)) {
    const x = pileX(key)
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, key[0] === 't' ? TAB_Y : TOP_Y)
  }
```

# --meaning--

- `Object.entries(piles)` turns the object into a list of `[name, pile]` pairs; `for (const [key, pile] of ...)`
  runs once per pair, putting the name in `key` and the array in `pile`.
- `first` is where drawing starts: 0 for a column (every card), the last index for the other piles.
  `Math.max(0, ...)` keeps it from going below 0 for an empty pile.
- Every card of a column is drawn at the same `TAB_Y` for now.

# --meaning-tr--

- `TOP_Y = 40`, `TAB_Y = 136` → üst sıranın ve sütunların y'si.
- `Object.entries(piles)` → nesneyi `[ad, değer]` çiftlerinden oluşan bir **listeye** çevirir:
  `[['stock', [...]], ['waste', []], ['f0', []], ...]`.
- `for (const [key, pile] of ...)` → her çift için bir kez döner; çiftin adını `key`'e, kart dizisini `pile`'a koyar.
  (Köşeli parantezle bir diziyi parçalarına ayırmaya **dizi ayrıştırma** denir.)
- `const x = pileX(key)` → bu yığının x'i.
- `const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)` → çizime hangi karttan başlanacak: sütunsa
  0'dan (hepsi), değilse yalnız son karttan. `Math.max(0, ...)` iki sayıdan büyüğünü seçer; boş yığında −1'e düşmeyi
  önler.
- `for (let i = first; i < pile.length; i++) drawCardAt(...)` → kartları çiz. y: sütunsa `TAB_Y`, değilse `TOP_Y`.

# --task--

1. Under `COL` write `TOP_Y` and `TAB_Y`.
2. In `draw`, replace the test card line with the `for` loop. Press **Run**.

# --task-tr--

1. `const COL = 64 ...` satırının altına `TOP_Y` ve `TAB_Y` satırlarını yaz.
2. `draw` içindeki test kartı satırını (`drawCardAt({ rank: 12, ...`) **sil**; yerine `for` döngüsünü yaz.
3. **Çalıştır**: sol üstte mavi bir deste, altta yedi açık kart görmelisin.

# --predict--

In a column of 5 cards (4 face down, 1 face up), what will you see?
- [ ] Five cards fanned out downwards
- [x] Only the face-up card
  All five are drawn at the same place, `TAB_Y`, and the last one covers the others.
- [ ] Only a blue card

# --predict-tr--

5 kartlık bir sütunda (4 kapalı, 1 açık) ne göreceksin?
- [ ] Aşağı doğru kaydırılmış beş kart
- [x] Yalnız açık kartı
  Beşi de aynı yere, `TAB_Y`'ye çiziliyor; en son çizilen açık kart ötekileri örtüyor.
- [ ] Yalnız mavi bir kart

# --tests--

The top of the stock should be drawn face down at (16, 40), and the test card should be gone.
tr: Destenin üst kartı (16, 40)'ta kapalı çizilmeli; test kartı kalkmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#1d4ed8'), { x: 16, y: 40, w: 56, h: 78, color: '#1d4ed8' })
assert.notDeepInclude($.rects('#ffffff'), { x: 16, y: 40, w: 56, h: 78, color: '#ffffff' }, 'remove the test card')
```

Each tableau column should show its face-up card at `TAB_Y`.
tr: Her sütun açık kartını `TAB_Y`'de göstermeli.

```js
$.tick(1)
const white = $.rects('#ffffff')
assert.lengthOf(white, 7)
for (let i = 0; i < 7; i++) assert.deepInclude(white, { x: 16 + i * 64, y: 136, w: 56, h: 78, color: '#ffffff' })
```

The stock should only draw its top card.
tr: Deste yalnız en üstteki kartını çizmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#1d4ed8').filter((r) => r.y === 40), 1)
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
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, key[0] === 't' ? TAB_Y : TOP_Y)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
