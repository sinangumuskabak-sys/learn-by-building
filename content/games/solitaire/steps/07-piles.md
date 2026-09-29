---
title: Piles in one object
title_tr: Yığınlar tek nesnede
skills: [prog.arrays, game.state]
---

# --goal--

Klondike is a game of piles: the **stock** (face down) and the **waste** next to it, four **foundations** where each suit
is built up from the ace, and seven **tableau** columns. We keep them all in one object, `piles`, each pile an array of
cards. `deal` starts with the whole deck in the stock.

# --goal-tr--

Klondike bir **yığınlar** oyunudur. Toplam 13 yığın var:

- **deste** (`stock`, kapalı) ve yanında **açılan kartlar** (`waste`);
- dört **temel** (`f0`–`f3`, foundation): her renk burada as'tan papaza dizilir;
- yedi **sütun** (`t0`–`t6`, tableau): oyunun asıl oynandığı yer.

Hepsini tek bir nesnede, `piles`'ta tutacağız; her yığın bir kart dizisi. Bu adımda `deal` (dağıt) fonksiyonu
bütün desteyi `stock`'a koyacak. Sütunları bir sonraki adımda dolduracağız.

# --code--

```js
let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

function deal() {
  const deck = newDeck()
  piles = { stock: [], waste: [] }
  for (let f = 0; f < 4; f++) piles['f' + f] = []
  piles.stock = deck
}

deal()
```

# --meaning--

- `let piles` is empty until `deal` fills it.
- `piles = { stock: [], waste: [] }` makes an object with two empty piles.
- `piles['f' + f] = []` adds a key made of text: `'f' + 0` is `'f0'`. So the loop adds `f0` to `f3`.
- `piles.stock = deck`: the shuffled deck becomes the stock.
- `deal()` above `requestAnimationFrame(loop)` deals once when the page loads.

# --meaning-tr--

- `let piles` → yığınların değişkeni. `deal` onu dolduracak; `let` çünkü her yeni oyunda baştan kurulacak.
  Yanındaki yorum hangi yığınların olacağını hatırlatıyor.
- `const deck = newDeck()` → karışık yeni bir deste al.
- `piles = { stock: [], waste: [] }` → iki boş yığınlı bir **nesne**. Anahtar `stock`, değeri boş dizi `[]`.
- `for (let f = 0; f < 4; f++) piles['f' + f] = []` → nesneye **köşeli parantezle** yeni anahtar ekler. `'f' + 0`
  → `'f0'`: yazıyla sayı `+` ile birleşir. Döngü `f0`, `f1`, `f2`, `f3` temellerini boş olarak açar.
  (`piles['f0']` ile `piles.f0` aynı şeydir; ad hesaplanacaksa köşeli parantez gerekir.)
- `piles.stock = deck` → bütün deste, desteye (stock) gider.
- En alttaki `deal()` → sayfa açılınca bir kez dağıt. Döngüden **önce** çağrılır ki ilk çizimde yığınlar hazır olsun.

# --task--

1. Under `const CH = 78` leave an empty line and write `let piles ...` with its comment.
2. Under `newDeck`, leave an empty line and write `deal`.
3. Write `deal()` just above the last line, `requestAnimationFrame(loop)`. Press **Run**.

# --task-tr--

1. `const CH = 78` satırının altına bir boş satır bırak ve yorumuyla birlikte `let piles ...` satırını yaz.
2. `newDeck` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve `deal` fonksiyonunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `deal()` yaz.
4. **Çalıştır**: ekran aynı; kontroller yeşil olmalı.

# --hint--

`piles` must be filled before the first frame: `deal()` goes **above** `requestAnimationFrame(loop)`.

# --hint-tr--

`piles` ilk kareden önce dolmalı: `deal()` satırı `requestAnimationFrame(loop)` satırının **üstünde** olmalı.

# --tests--

`deal()` should put all 52 cards in the stock and open empty waste and foundations.
tr: `deal()` 52 kartın hepsini desteye koymalı; atık ve temeller boş açılmalı.

```js
assert.hasAllKeys(piles, ['stock', 'waste', 'f0', 'f1', 'f2', 'f3'])
assert.lengthOf(piles.stock, 52)
assert.lengthOf(piles.waste, 0)
for (let f = 0; f < 4; f++) assert.lengthOf(piles['f' + f], 0)
```

Calling `deal()` again should start from a new deck.
tr: `deal()` yeniden çağrılınca yeni bir desteyle başlamalı.

```js
piles.stock.pop()
deal()
assert.lengthOf(piles.stock, 52)
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

let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

const isRed = (card) => card.suit === 1 || card.suit === 2

function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function deal() {
  const deck = newDeck()
  piles = { stock: [], waste: [] }
  for (let f = 0; f < 4; f++) piles['f' + f] = []
  piles.stock = deck
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

  drawCardAt({ rank: 12, suit: 1, up: true }, 16, 40)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
