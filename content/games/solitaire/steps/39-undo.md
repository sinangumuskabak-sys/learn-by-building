---
title: Undo
title_tr: Geri al
skills: [prog.arrays, game.state]
---

# --goal--

`undo` takes the last snapshot off the stack and turns it back into piles. A stack is exactly right: the last thing done is
the first thing undone. The Z key calls it.

# --goal-tr--

Şimdi fotoğrafları geri yükleyelim. `undo` (geri al) `history`'nin **son** fotoğrafını alır ve masayı ona çevirir.

Yığın bu iş için biçilmiş kaftan: **en son yapılan, ilk geri alınır.** Z'ye art arda basarak oyunda adım adım geri
gidebilirsin. Kazandıktan sonra geri alma yok.

# --code--

```js
function undo() {
  if (!history.length || won) return
  piles = JSON.parse(history.pop())
  moves += 1
}

  if (event.key === 'z' || event.key === 'Z') undo()
  else if (event.key === ' ') flipStock()

  ctx.fillText('Best ' + (best ? best + 's' : '-') + '  Z undo', canvas.width - LEFT, 24)
```

# --meaning--

- Nothing to undo, or a won game: do nothing.
- `history.pop()` takes the last snapshot off; `JSON.parse` turns the text back into brand new arrays and cards. Even a card
  that was turned face up comes back face down, with no special code.
- Undoing counts as a move.

# --meaning-tr--

- `if (!history.length || won) return` → geçmiş boşsa **veya** oyun kazanılmışsa bir şey yapma.
- `history.pop()` → son fotoğrafı yığından **çıkarır**.
- `JSON.parse(...)` → yazıyı yeniden nesneye, dizilere ve kartlara çevirir: **yepyeni** bir masa. Bir hamlenin açtığı
  kart bile, hiç özel kod yazmadan, yeniden kapalı döner; çünkü fotoğrafta kapalıydı.
- `moves += 1` → geri almak da bir hamle sayılır (hile olmasın).
- `keydown` içinde ilk satır → küçük veya büyük `z` geri alır. Eski Boşluk satırı artık `else if` ile başlıyor.
- Sağ üstteki yazının sonuna `'  Z undo'` → oyuncu tuşu öğrensin.

# --task--

1. Under `save`, leave an empty line and write `undo`.
2. In the `keydown` listener, write the Z line first and turn the Space line's `if` into `else if`.
3. Add `+ '  Z undo'` to the `Best` text.

# --task-tr--

1. `const save = ...` satırının altına bir boş satır bırak ve `undo` fonksiyonunu yaz.
2. `keydown` dinleyicisinde Boşluk satırının **üstüne** Z satırını yaz; Boşluk satırının başındaki `if`'i `else if` yap.
3. `draw` içindeki `'Best ' + ...` yazısına `+ '  Z undo'` ekle.
4. **Çalıştır**, birkaç hamle yap ve **Z**'ye bas: hamleler tek tek geri gelmeli.

# --predict--

You move a queen, which turns a card face up, then press Z. What does the uncovered card do?
- [x] It turns face down again
  The snapshot was taken before the move, when that card was still face down.
- [ ] It stays face up
- [ ] It disappears

# --predict-tr--

Bir kızı taşıdın, altındaki kart açıldı; sonra Z'ye bastın. Açılan kart ne olur?
- [x] Yeniden kapanır
  Fotoğraf hamleden önce çekildi; o anda kart hâlâ kapalıydı.
- [ ] Açık kalır
- [ ] Kaybolur

# --tests--

Undo should bring back the moved cards and turn the uncovered card face down again.
tr: Geri alma taşınan kartları geri getirmeli ve açığa çıkan kartı yeniden kapatmalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(5, 2, false), c(12, 1)]
tryMove('t1', 1, 't0')
assert.isTrue(piles.t1[0].up)
undo()
assert.lengthOf(piles.t0, 1, 'the queen is back')
assert.lengthOf(piles.t1, 2)
assert.isFalse(piles.t1[0].up, 'and the card under it is face down again')
```

Z should undo step by step, and do nothing when there is nothing left.
tr: Z adım adım geri almalı ve geriye bir şey kalmayınca hiçbir şey yapmamalı.

```js
const before = JSON.stringify(piles)
flipStock()
flipStock()
$.press('z')
$.press('Z')
assert.strictEqual(JSON.stringify(piles), before, 'undo goes back step by step')
undo()
assert.strictEqual(JSON.stringify(piles), before, 'nothing left to undo')
$.tick(1)
assert.include($.texts(), 'Best - Z undo')
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
let history // earlier positions, for undo
let frames
let won
let best = Number(localStorage.getItem('solitaire-best')) || 0

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
  history = []
  frames = 0
  won = false
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

const save = () => history.push(JSON.stringify(piles))

function undo() {
  if (!history.length || won) return
  piles = JSON.parse(history.pop())
  moves += 1
}

function flipStock() {
  save()
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
  save()
  piles[to].push(...piles[from].splice(index))
  const exposed = last(piles[from])
  if (from[0] === 't' && exposed) exposed.up = true
  moves += 1
  checkWin()
  return true
}

// A tap sends a card to the best place it can go: a foundation first, then a tableau column.
function autoMove(from, index) {
  const targets = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6']
  return targets.some((to) => tryMove(from, index, to))
}

function checkWin() {
  if (['f0', 'f1', 'f2', 'f3'].every((f) => piles[f].length === 13)) {
    won = true
    const seconds = Math.floor(frames / 60)
    if (best === 0 || seconds < best) {
      best = seconds
      localStorage.setItem('solitaire-best', best)
    }
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
  if (won) return deal()
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
  if (event.key === 'z' || event.key === 'Z') undo()
  else if (event.key === ' ') flipStock()
  else if (event.key === 'n' || event.key === 'N') deal()
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
  ctx.fillText('Moves ' + moves + '  Time ' + Math.floor(frames / 60), LEFT, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best ? best + 's' : '-') + '  Z undo', canvas.width - LEFT, 24)
  if (won) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(60, 240, canvas.width - 120, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('You won in ' + moves + ' moves!', canvas.width / 2, 275)
    ctx.font = '15px sans-serif'
    ctx.fillText('Tap for a new game', canvas.width / 2, 302)
  }
}

function loop() {
  if (!won) frames += 1
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
