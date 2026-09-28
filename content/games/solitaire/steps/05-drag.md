---
title: Drag and drop
title_tr: Sürükle ve bırak
skills: [game.input, game.canvas]
---

# --explanation--

Tapping picks the first legal place, but sometimes you want a different one, like the second of two kings. So cards can also be
**dragged**.

Dragging needs to remember three things while the pointer is down:

- **what** is held: the pile and the index, as before;
- **where it was grabbed**: `dx, dy`, the pointer's offset from the card's corner, so the card does not jump to put its corner under
  your finger;
- **whether it moved** at all: a press and release in place (less than 4 pixels) is still a tap.

While dragging, the source pile is drawn **without** the held cards, and the held cards are drawn last, at the pointer, so they
float over everything.

On release, the target is the pile under the **middle** of the held card, not under the pointer: that feels right however you
grabbed it. If `tryMove` refuses, nothing changes, and the cards simply appear back where they were, because they never left the
pile.

# --explanation-tr--

**Bu adımda:** kartları **sürükleyebileceksin**. Bir karta basılı tutup çekince kart (ve üstündeki kartlar) parmağını ya
da fareyi izleyecek; istediğin yığının üstünde bırakınca oraya konacak. Kurala uymuyorsa kartlar yerine geri dönecek.
Sadece dokunup bırakmak eskisi gibi otomatik taşıyacak.

**Neden?** Dokunmak ilk uygun yeri seçer, ama bazen başka bir yer istersin; örneğin iki papazdan ikincisinin üstünü.

**Sürüklerken üç şeyi hatırlamak gerekir:**

- **ne** tutuluyor: yığın ve sıra numarası (önceki gibi `from`, `index`);
- **nereden tutuldu**: `dx`, `dy`, parmağın kartın sol üst köşesine uzaklığı. Böylece kart, köşesi parmağının altına
  gelecek şekilde zıplamaz;
- **hareket etti mi**: yerinde basıp bırakmak (4 pikselden az) hâlâ bir dokunuştur (`moved: false`).

**Hareket olayı.** `pointermove`, parmak ya da fare hareket ettikçe gelen olaydır. Her seferinde `drag.x`, `drag.y`'yi
yeni konuma güncelleriz. `Math.hypot(a, b)` iki nokta arasındaki düz mesafeyi verir (Pisagor): son konumdan 4 pikselden
fazla kaydıysa `moved = true`.

**Parçalara ayırmak.** `const { from, index, moved } = drag` → `drag` nesnesinin üç alanını aynı adlı üç sabite çıkarır;
`const from = drag.from` ... yazmanın kısasıdır.

**Nereye bırakıldı?** Hedef, parmağın değil tutulan kartın **ortasının** altındaki yığındır: kartı nereden tutarsan tut
doğal hissettirir. Kartın sol üst köşesi `drag.x - drag.dx`'tir; ortası ise ona yarım en (`CW / 2`) eklenmiş hâlidir.
`tryMove` reddederse hiçbir şey değişmez: kartlar zaten yığından hiç çıkmamıştı, sadece başka yerde çizilmişlerdi.

**Çizim.** Sürüklerken kaynak yığın tutulan kartlar **olmadan** çizilir: `hidden` (gizli), kaç kartın çizileceğidir.
`drag && drag.from === key ? drag.index : pile.length` → sürükleme varsa **ve** bu yığından ise sadece `drag.index`'e
kadar, değilse hepsi. Tutulan kartlar en son, parmağın yanında çizilir ki her şeyin üstünde yüzsünler; her biri bir
öncekinden `UP_STEP` (22) aşağıda. `forEach((card, i) => ...)` listedeki her kart için çalışır, `i` sıra numarasıdır.

# --task--

1. On `pointerdown`, `drag` also stores `dx`, `dy` (pointer minus the card's corner), `x`, `y` (the pointer) and `moved: false`.
2. On `pointermove` while dragging, update `x` and `y`, and set `moved` once the pointer is more than 4 pixels from the press.
3. On release: not moved means a tap (`autoMove`); otherwise `tryMove` to the pile hit by the held card's middle,
   `(x - dx + CW / 2, y - dy + CH / 2)`.
4. While dragging, draw the source pile only up to `drag.index`, then the held cards at `(x - dx, y - dy)`, each `UP_STEP` lower
   than the one before.

# --task-tr--

1. `let drag` satırının yorumunu güncelle:

   ```js
   let drag // { from, index, dx, dy, x, y, moved } while a card is held
   ```

2. `pointerdown` dinleyicisinde `drag = { from: h.key, index: h.index }` satırını sil ve yerine üç satır yaz. Hemen
   altına (`})`'den sonra) `pointermove` dinleyicisini ekle:

   ```js
     if (h.key === 'waste' || h.key[0] === 'f') h.index = pile.length - 1 // only the top card of these
     const cx = pileX(h.key)                                                                               // ← yeni
     const cy = cardY(h.key, h.index)                                                                      // ← yeni
     drag = { from: h.key, index: h.index, dx: p.x - cx, dy: p.y - cy, x: p.x, y: p.y, moved: false }       // ← değişti
   })

   canvas.addEventListener('pointermove', (event) => {                                                     // ← yeni
     if (!drag) return
     const p = toCanvas(event)
     if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true
     drag.x = p.x
     drag.y = p.y
   })
   ```

3. `pointerup` dinleyicisini değiştir. Tamamen şöyle olmalı:

   ```js
   document.addEventListener('pointerup', () => {
     if (!drag) return
     const { from, index, moved } = drag                                        // ← yeni
     if (!moved) autoMove(from, index)                                          // ← değişti
     else {                                                                     // ← yeni
       // Drop on the pile under the middle of the held card.
       const target = hit(drag.x - drag.dx + CW / 2, drag.y - drag.dy + CH / 2)  // ← yeni
       if (target) tryMove(from, index, target.key)                             // ← yeni
     }                                                                          // ← yeni
     drag = null
   })
   ```

4. `draw()` içindeki yığın döngüsünü değiştir ve döngüden sonra tutulan kartları çiz. `for (const [key, pile] ...`
   satırından `Moves` yazısının üstündeki boş satıra kadar şöyle olmalı:

   ```js
     for (const [key, pile] of Object.entries(piles)) {
       const x = pileX(key)
       // An empty place shows as an outline.
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
       ctx.lineWidth = 2
       ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
       const hidden = drag && drag.from === key ? drag.index : pile.length      // ← yeni
       // The stock, the waste and the foundations only need their top card.
       const first = key[0] === 't' ? 0 : Math.max(0, hidden - 1)              // ← değişti
       for (let i = first; i < hidden; i++) drawCardAt(pile[i], x, cardY(key, i))   // ← değişti
     }
     // The held cards follow the pointer, on top of everything.
     if (drag) {                                                               // ← yeni
       piles[drag.from].slice(drag.index).forEach((card, i) => drawCardAt(card, drag.x - drag.dx, drag.y - drag.dy + i * UP_STEP))
     }                                                                         // ← yeni
   ```

5. **Çalıştır**'a bas. Açık bir kartı basılı tutup başka bir sütunun üstüne sürükle ve bırak: kural uyuyorsa orada
   kalmalı, uymuyorsa yerine dönmeli. Sadece tıklamak eskisi gibi çalışmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A dragged card should follow the pointer and land on the pile it is dropped on.
tr: Sürüklenen bir kart işaretçiyi izlemeli ve bırakıldığı yığına inmeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t2 = [c(13, 3)]
piles.t4 = [c(12, 1)]
$.pointerDown(16 + 256 + 20, 136 + 20)
$.move(16 + 128 + 20, 136 + 40)
$.move(16 + 128 + 25, 136 + 45)
$.tick(1)
assert.deepInclude($.rects('#ffffff').map(({ x, y }) => ({ x, y })), { x: 16 + 128 + 5, y: 136 + 25 }, 'the card follows the pointer')
$.pointerUp(16 + 128 + 25, 136 + 45)
assert.lengthOf(piles.t2, 2, 'dropped onto the second king, not the first')
assert.lengthOf(piles.t0, 1)
```

A whole run should move together to where it is dropped.
tr: Bütün bir dizi bırakıldığı yere birlikte gitmeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(3, 0, false), c(12, 1), c(11, 0)]
piles.t3 = [c(13, 3)]
$.pointerDown(16 + 64 + 20, 136 + 8 + 10)
$.move(16 + 192 + 20, 136 + 30)
$.pointerUp(16 + 192 + 20, 136 + 30)
assert.deepEqual(piles.t3.map((card) => card.rank), [13, 12, 11], 'a whole run moves together')
assert.isTrue(piles.t1[0].up)
```

An illegal drop should put the cards back.
tr: Kurala aykırı bir bırakış kartları geri koymalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t1 = [c(12, 1)]
piles.t3 = [c(13, 1)]
$.pointerDown(16 + 64 + 20, 136 + 20)
$.move(16 + 192 + 20, 136 + 30)
$.pointerUp(16 + 192 + 20, 136 + 30)
assert.lengthOf(piles.t1, 1, 'red on red: it goes back')
assert.isNull(drag)
assert.strictEqual(moves, 0)
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
let drag // { from, index, dx, dy, x, y, moved } while a card is held
let moves

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
  drag = null
  moves = 0
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
  moves += 1
}

// Move cards from index onwards of pile `from` to pile `to`, if the rules allow it.
function tryMove(from, index, to) {
  const cards = piles[from].slice(index)
  if (from === to || !cards.length) return false
  const allowed = to[0] === 'f' ? cards.length === 1 && canFound(cards[0], piles[to]) : to[0] === 't' && canStack(cards[0], piles[to])
  if (!allowed) return false
  piles[to].push(...piles[from].splice(index))
  const exposed = last(piles[from])
  if (from[0] === 't' && exposed) exposed.up = true
  moves += 1
  return true
}

// A tap sends a card to the best place it can go: a foundation first, then a tableau column.
function autoMove(from, index) {
  const targets = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6']
  return targets.some((to) => tryMove(from, index, to))
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
  if (!h) return
  if (h.key === 'stock') return flipStock()
  const pile = piles[h.key]
  if (h.index < 0 || !pile[h.index] || !pile[h.index].up) return
  if (h.key === 'waste' || h.key[0] === 'f') h.index = pile.length - 1 // only the top card of these
  const cx = pileX(h.key)
  const cy = cardY(h.key, h.index)
  drag = { from: h.key, index: h.index, dx: p.x - cx, dy: p.y - cy, x: p.x, y: p.y, moved: false }
})

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return
  const p = toCanvas(event)
  if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true
  drag.x = p.x
  drag.y = p.y
})

document.addEventListener('pointerup', () => {
  if (!drag) return
  const { from, index, moved } = drag
  if (!moved) autoMove(from, index)
  else {
    // Drop on the pile under the middle of the held card.
    const target = hit(drag.x - drag.dx + CW / 2, drag.y - drag.dy + CH / 2)
    if (target) tryMove(from, index, target.key)
  }
  drag = null
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
    const hidden = drag && drag.from === key ? drag.index : pile.length
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, hidden - 1)
    for (let i = first; i < hidden; i++) drawCardAt(pile[i], x, cardY(key, i))
  }
  // The held cards follow the pointer, on top of everything.
  if (drag) {
    piles[drag.from].slice(drag.index).forEach((card, i) => drawCardAt(card, drag.x - drag.dx, drag.y - drag.dy + i * UP_STEP))
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 24)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
