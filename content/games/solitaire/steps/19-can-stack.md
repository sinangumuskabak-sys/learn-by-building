---
title: "Rule 1: building a column"
title_tr: "Kural 1: sütuna dizmek"
skills: [prog.functions]
---

# --goal--

In a tableau column a card goes on a face-up card **one rank higher** and of the **other color**: a red 9 on a black 10.
Only a king may start an empty column. `canStack` answers "may this card go on this pile?" and changes nothing.

# --goal-tr--

Şimdi oyunun **kurallarını** yazıyoruz. Birinci kural, sütunlar için: bir kart, **bir büyük** değerdeki ve **öteki
renkteki** açık bir kartın üstüne konabilir. Kırmızı 9, siyah 10'un üstüne gider; siyah 9 gitmez.

Boş bir sütuna ise yalnız **papaz** (13) konabilir.

`canStack` (dizilebilir mi?) yalnız soruyu cevaplar, hiçbir şeyi değiştirmez. Böyle fonksiyonlara **saf fonksiyon**
denir: denemesi kolaydır ve oyunun her yeri onlara güvenebilir.

# --code--

```js
// Tableau: one lower, the other color; only a king goes into an empty column.
function canStack(card, pile) {
  const under = last(pile)
  if (!under) return card.rank === 13
  return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)
}
```

# --meaning--

- `under` is the card it would go on. For an empty pile it is `undefined`, so `!under` is true: only a king.
- Three conditions joined with `&&` must all be true: `under` is face up, one rank higher, and of the other color.
- `isRed(under) !== isRed(card)`: two true/false values differ exactly when one card is red and the other is not.

# --meaning-tr--

- `const under = last(pile)` → kartın üstüne konacağı kart: yığının son kartı. Yığın boşsa `last` **`undefined`**
  (tanımsız) verir.
- `if (!under) return card.rank === 13` → üstüne konacak kart yoksa (boş sütun) cevap: "kart papaz mı?".
  `card.rank === 13` kendisi `true` ya da `false`tur; onu doğrudan geri veririz.
- `return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)` → üç koşul `&&` (ve) ile bağlı;
  **hepsi** doğruysa cevap `true`:
  - `under.up` → alttaki kart açık,
  - `under.rank === card.rank + 1` → alttaki bir büyük (9'un altı 10),
  - `isRed(under) !== isRed(card)` → renkler **farklı**. İkisi de kırmızıysa `true !== true` → yanlış; biri kırmızı biri
    siyahsa `true !== false` → doğru. Renk farkını söylemenin kısa yolu.

# --task--

Under `cardY`, leave an empty line and write `canStack` with its comment.

# --task-tr--

`cardY` fonksiyonunun altına bir boş satır bırak ve yorumuyla birlikte `canStack` fonksiyonunu yaz. **Çalıştır**:
ekran aynı, kontroller yeşil.

# --predict--

What changes on the table after this step?
- [ ] Cards jump to where they fit
- [x] Nothing: `canStack` only answers a question
  It is a rule. The next steps use it to move cards.
- [ ] Face-down cards turn over

# --predict-tr--

Bu adımdan sonra masada ne değişir?
- [ ] Kartlar uydukları yere zıplar
- [x] Hiçbir şey: `canStack` yalnız bir soruyu cevaplar
  Bu bir kural. Kartları taşımak için sonraki adımlarda kullanacağız.
- [ ] Kapalı kartlar açılır

# --tests--

`canStack` should need one rank higher, the other color, and a face-up card.
tr: `canStack` bir değer yüksek, diğer renk ve açık bir kart istemeli.

```js
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
