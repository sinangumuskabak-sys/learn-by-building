---
title: Winning
title_tr: Kazanmak
skills: [game.state]
---

# --explanation--

The game is won when all four foundations hold 13 cards. The only move that can win is one onto a foundation, so `tryMove` checks
after every move, which is simpler than trying to guess which move might be the last.

A clock counts the frames of the game and stops when it is won. Your fastest win (in seconds) is kept in `localStorage`, so there
is always a time to beat.

After a win a tap deals a new game, and N starts a new one at any time, since not every Klondike deal can be won. Even with perfect
play, a few percent of deals are impossible, and a simple "always take the obvious move" player wins only about one game in four.

# --explanation-tr--

**Bu adımda:** oyun kazanılabilir olacak. Dört temelin her birinde 13 kart olunca ortada "You won in 120 moves!"
yazan bir panel çıkacak. Üstte `Moves 12  Time 95` (hamle ve saniye) ve sağda en iyi süren (`Best 95s`) görünecek.
`N` tuşu istediğin an yeni oyun dağıtacak.

**Ne zaman kazanılır?** Dört temelin hepsinde 13 kart olunca. Kazandıran hamle ancak bir temele giden hamle olabilir; bu
yüzden her başarılı `tryMove`'dan sonra kontrol ederiz. Bu, hangi hamlenin son olacağını tahmin etmeye çalışmaktan çok
daha basittir.

```js
['f0', 'f1', 'f2', 'f3'].every((f) => piles[f].length === 13)
```

`every` (hepsi) listedeki her eleman için soruyu sorar ve **hepsi** `true` ise `true` verir. 4. adımdaki `some`'ın
kardeşidir: `some` "en az biri", `every` "hepsi".

**Saat.** `frames`, oyun başladığından beri geçen kare sayısıdır. `loop` her karede, kazanılmadıysa (`!won`) bir artırır.
Saniyede ~60 kare olduğu için `Math.floor(frames / 60)` geçen saniyedir (`Math.floor` küsuratı atar).

**En iyi süre: `localStorage`.** Tarayıcının bu site için tuttuğu, sayfa kapanınca silinmeyen küçük bir not defteridir.
`localStorage.setItem('solitaire-best', best)` kaydeder, `getItem` okur (yazı olarak; hiç yoksa `null`). `Number(...)`
yazıyı sayıya çevirir, `|| 0` "işe yaramazsa 0 kullan" demektir. `best` 0 ise henüz hiç kazanılmamıştır; bu yüzden
"hiç yoksa (`best === 0`) **veya** (`||`) yeni süre daha kısaysa (`<`)" kaydederiz.

**Yeni oyun.** Kazandıktan sonra bir dokunuş yeni oyun dağıtır: `if (won) return deal()` ("kazanıldıysa dağıt ve dur").
`N` tuşu her an yeni oyun başlatır, çünkü her Klondike dağıtımı kazanılamaz. Kusursuz oynasan bile dağıtımların
yüzde birkaçı imkânsızdır; "hep bariz hamleyi yap" diyen basit bir oyuncu dört oyundan ancak birini kazanır. Büyük
harf `'N'` de çalışsın diye iki tuşa birden bakarız.

**Yazılar.** `'Best ' + (best ? best + 's' : '-')` → `best` 0 değilse `'Best 95s'`, 0 ise `'Best -'`. Parantez, önce
kısa kararın hesaplanmasını sağlar. `ctx.textAlign = 'right'` verilen `x`'i yazının sağ ucu yapar. Panel yarı saydam
koyu bir dikdörtgendir: `rgba(15, 23, 42, 0.85)` (kırmızı, yeşil, mavi, saydamlık).

# --task--

1. Add `frames`, `won` (`0` and `false` in `deal()`) and `best`, kept in `localStorage` under `'solitaire-best'`. The loop counts
   `frames` while not won.
2. Write `checkWin()`, called after every successful `tryMove`: when all foundations have 13 cards, set `won` and save the time in
   seconds if it beats `best` (or there is none).
3. After a win, a `pointerdown` deals a new game. N deals a new game at any time.
4. Draw `Moves 12  Time 95` on the left and `Best 95s` (or `Best -`) right-aligned at `(canvas.width - LEFT, 24)`, and when won a
   panel with `You won in 120 moves!` and `Tap for a new game`.

# --task-tr--

1. `let moves` satırının altına üç değişken ekle:

   ```js
   let frames
   let won
   let best = Number(localStorage.getItem('solitaire-best')) || 0
   ```

2. `deal()`'ın sonunda, `moves = 0` satırının altına ikisini sıfırla:

   ```js
     moves = 0
     frames = 0                    // ← yeni
     won = false                   // ← yeni
   }
   ```

3. `tryMove()` içinde, `moves += 1` satırının altına (`return true`'nun **üstüne**) kazanma kontrolünü ekle:

   ```js
     moves += 1
     checkWin()                    // ← yeni
     return true
   }
   ```

4. `autoMove()` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`// Which card ...` yorumunun
   **üstüne**) şunu yaz:

   ```js
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
   ```

5. `pointerdown` dinleyicisinde, `const p = toCanvas(event)` satırının hemen altına şunu ekle:

   ```js
     const p = toCanvas(event)
     if (won) return deal()        // ← yeni
     const h = hit(p.x, p.y)
   ```

6. `keydown` dinleyicisine `N` satırını ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === ' ') flipStock()
     else if (event.key === 'n' || event.key === 'N') deal()     // ← yeni
     else return
     event.preventDefault()
   })
   ```

7. `draw()`'un son satırını (`ctx.fillText('Moves ' + moves, LEFT, 24)`) sil ve yerine şunları yaz:

   ```js
     ctx.fillText('Moves ' + moves + '  Time ' + Math.floor(frames / 60), LEFT, 24)   // ← değişti
     ctx.textAlign = 'right'
     ctx.fillText('Best ' + (best ? best + 's' : '-'), canvas.width - LEFT, 24)
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
   ```

   `'  Time '`'ın başında **iki** boşluk var: `Moves 12  Time 95`.

8. `loop()`'un başına saati ekle:

   ```js
   function loop() {
     if (!won) frames += 1         // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

9. **Çalıştır**'a bas. Üstte hamle ve saniye sayacı ile sağda `Best -` görmelisin. Oyuna tıklayıp `N`'ye basınca yeni
   kartlar dağıtılmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

The last card onto a foundation should win and save the best time.
tr: Bir temele giden son kart kazandırmalı ve en iyi süreyi kaydetmeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
for (let f = 0; f < 4; f++) piles['f' + f] = Array.from({ length: 12 }, (_, i) => c(i + 1, f))
for (let f = 0; f < 3; f++) piles['f' + f].push(c(13, f))
piles.t0 = [c(13, 3)]
frames = 60 * 95
assert.isFalse(won)
$.click(16 + 20, 136 + 30)
assert.isTrue(won)
assert.strictEqual(best, 95)
assert.strictEqual(localStorage.getItem('solitaire-best'), '95')
$.tick(1)
assert.include($.texts(), 'You won in 1 moves!')
```

The clock should count and stop after a win, and a tap should deal a new game.
tr: Saat saymalı ve kazandıktan sonra durmalı; bir dokunuş yeni oyun dağıtmalı.

```js
$.tick(120)
assert.include($.texts(), 'Moves 0  Time 2')
won = true
const t = frames
$.tick(30)
assert.strictEqual(frames, t, 'the clock stops after a win')
$.click(200, 300)
assert.isFalse(won, 'a tap deals a new game')
assert.lengthOf(piles.stock, 24)
```

N should deal a new game.
tr: N yeni bir oyun dağıtmalı.

```js
flipStock()
$.press('n')
assert.lengthOf(piles.waste, 0, 'N deals a new game')
assert.strictEqual(moves, 0)
$.tick(1)
assert.include($.texts(), 'Best -')
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
let drag // { from, index, cards, dx, dy, x, y, moved } while a card is held
let moves
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
  if (event.key === ' ') flipStock()
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
  ctx.fillText('Best ' + (best ? best + 's' : '-'), canvas.width - LEFT, 24)
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
