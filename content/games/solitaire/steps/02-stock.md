---
title: Turning over the stock
title_tr: Desteyi çevirmek
skills: [game.input, prog.arrays]
---

# --explanation--

Tapping the stock turns its top card over onto the waste. When the stock is empty, a tap turns the whole waste back over into a
new stock, so you can go through it again.

Order matters here. The stock hands out cards from its end (`pop`), and the waste collects them at its end (`push`), so the first
card turned over ends up at the **start** of the waste. Turning the waste back over is literally flipping the pile: `reverse()` puts
that first card at the end of the new stock, so it comes out first again. Every pass through the stock shows the cards in the same
order, as with real cards.

To know what was tapped we need `hit(x, y)`: which pile, and which card in it, is under a point? In a tableau column the cards
overlap, so we test from the **last** card down: the one drawn last is the one on top, and the first match wins. For the other
piles only the top card matters. An empty column still counts, so a card can later be dropped there.

# --explanation-tr--

**Bu adımda:** desteyi açacağız. Sol üstteki mavi desteye tıklayınca (ya da Boşluk'a basınca) en üstteki kart yanındaki
yere açık olarak çevrilecek. Deste bitince bir tıklama bütün açık kartları kapalı olarak desteye geri koyacak, böylece
destenin içinden yeniden geçebileceksin.

**Listenin sonu: `pop` ve `push`.** Deste kartları **sonundan** verir: `piles.stock.pop()` listenin son kartını çıkarır
ve geri verir. Açık kartlar yığını onları **sonuna** toplar: `piles.waste.push(card)`. Böylece ilk çevrilen kart, açık
kartlar yığınının **başında** kalır.

**Desteyi yeniden kurmak.** Açık kartları desteye geri çevirmek gerçekten yığını ters çevirmektir:

```js
piles.stock = piles.waste.reverse().map((card) => ({ ...card, up: false }))
```

- `reverse()` listeyi ters çevirir: ilk çevrilen kart yeni destenin sonuna gelir ve yine ilk o çıkar. Her geçişte kartlar
  gerçek kartlardaki gibi aynı sırayla gelir.
- `map(...)` listenin her elemanını dönüştürüp yeni bir liste yapar.
- `{ ...card, up: false }` → kartın bütün bilgilerini (`...` "hepsini buraya kopyala") alıp `up`'ı `false` (kapalı)
  yapan yeni bir kart. Nesneyi `=>`'dan hemen sonra yazarken normal parantez içine alırız: `({ ... })`.

`if (piles.stock.length)` → listede kart varsa (uzunluk 0 değilse) doğrudur. `else` ("yoksa") bloğu deste boşken
çalışır.

**Neye tıklandı? `hit(x, y)`.** Bir noktanın altında hangi yığın, hangi kart var?

- `Object.keys(piles)` yığınların adlarının listesidir (`'stock'`, `'waste'`, `'f0'`...). `for (const key of ...)` her
  ad için bir kez döner.
- Nokta yığının sütununda değilse (`x`, yığının solunda **veya** sağında) `continue` ile sıradakine geç.
- Sütunlarda kartlar üst üste biner. En son çizilen kart en üsttedir; bu yüzden **son karttan başa doğru**
  (`i--`) bakarız ve ilk tutan kart kazanır. Nokta kartın üst ve alt kenarı arasındaysa (`>=`, `<=`, `&&`)
  `{ key, index: i }` döneriz.
- Boş bir sütun da sayılır (ileride oraya kart bırakacağız): `!pile.length` "liste boşsa" demektir.
- Diğer yığınlarda sadece en üstteki kart önemlidir: `index: pile.length - 1`.
- Hiçbir şey bulunmazsa `null` ("hiçbir şey") döneriz.

**Ekran pikselinden canvas pikseline.** Telefonda canvas küçültülmüş olabilir. `toCanvas(event)` tıklamanın ekrandaki
yerini (`event.clientX`, `event.clientY`) canvas'ın kendi ölçüsüne çevirir: `getBoundingClientRect()` canvas'ın ekrandaki
yeri ve boyudur; önce canvas'ın köşesine göre konumu buluruz, sonra gerçek boy / görünen boy ile büyütürüz.

**Olaylar.** Tarayıcı, canvas'a dokunulunca `pointerdown`, tuşa basılınca `keydown` **olayı** gönderir.
`addEventListener('olay', (event) => { ... })` ile "bu olay olunca şunu yap" deriz. `h && h.key === 'stock'` → bir şey
bulunduysa **ve** o şey desteyse. Boşluk tuşunun adı tek boşluktur (`' '`). `event.preventDefault()` Boşluk'un
sayfayı kaydırmasını engeller; başka tuşlarda `else return` ile hemen çıkarız ki onlar normal çalışsın.

# --task--

1. Write `flipStock()`: move the stock's last card onto the waste, face up; if the stock is empty, the stock becomes the reversed
   waste, all face down, and the waste empties.
2. Write `hit(x, y)`: for the pile whose column contains `x`, return `{ key, index }` of the card under the point (tableau: the top
   card first; empty column: index 0; other piles: the last index), or `null`.
3. Write `toCanvas(event)`. A `pointerdown` on the stock calls `flipStock()`, and so does Space (`preventDefault()`).

# --task-tr--

1. `cardY` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function drawCardAt`'ın **üstüne**) desteyi
   çeviren fonksiyonu yaz:

   ```js
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
   ```

2. Bir boş satır bırak ve noktadaki kartı bulan fonksiyonu yaz:

   ```js
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
   ```

3. Bir boş satır bırak ve dokunuşu canvas ölçüsüne çeviren fonksiyonu yaz (ikinci satır uzun ama tek satırdır):

   ```js
   function toCanvas(event) {
     const rect = canvas.getBoundingClientRect()
     return { x: ((event.clientX - rect.left) * canvas.width) / rect.width, y: ((event.clientY - rect.top) * canvas.height) / rect.height }
   }
   ```

4. Bir boş satır bırak ve dokunuş ile Boşluk tuşu dinleyicilerini yaz:

   ```js
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
   ```

5. **Çalıştır**'a bas. Sol üstteki mavi desteye tıkla: yanına açık bir kart gelmeli. Boşluk tuşu da aynısını yapmalı
   (önce oyuna tıkla). Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `{ ...card, up: false }`'yu saran
   normal parantezleri kontrol et.

# --tests--

Tapping the stock or pressing Space should turn a card over onto the waste.
tr: Desteye dokunmak ya da Boşluk'a basmak atığa bir kart çevirmeli.

```js
const card = piles.stock[piles.stock.length - 1]
flipStock()
assert.lengthOf(piles.stock, 23)
assert.strictEqual(piles.waste[0], card)
assert.isTrue(card.up)
$.press(' ')
assert.lengthOf(piles.waste, 2)
$.click(16 + 28, 40 + 39)
assert.lengthOf(piles.waste, 3, 'a tap on the stock turns a card over')
```

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

`hit` should find the card on top, the edge of a covered card, and an empty column.
tr: `hit` üstteki kartı, örtülü bir kartın kenarını ve boş bir sütunu bulmalı.

```js
assert.deepEqual(hit(44, 60), { key: 'stock', index: 23 })
assert.deepEqual(hit(16 + 128 + 10, 136 + 4), { key: 't2', index: 0 }, 'the visible edge of a covered card')
assert.deepEqual(hit(16 + 128 + 10, 136 + 16 + 40), { key: 't2', index: 2 }, 'the card on top wins')
assert.isNull(hit(16 + 58, 300), 'the gap between columns')
piles.t0 = []
assert.deepEqual(hit(30, 150), { key: 't0', index: 0 }, 'an empty column')
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
