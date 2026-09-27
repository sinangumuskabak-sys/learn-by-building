---
title: Animate the flip
title_tr: Çevirmeyi canlandır
skills: [game.loop, game.state]
---

# --explanation--

Cards snap face up instantly. A short flip animation makes the game feel alive, and it teaches a fundamental idea:
**separate the target state from the displayed state**.

- `card.faceUp` is the truth: the rules only look at this, exactly as before.
- `card.flip` is a number from `0` (showing its back) to `1` (showing its face) that **chases** the truth a little
  every frame:
  ```js
  card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  ```

Moving a displayed value gradually toward a target is called **tweening**, and nearly every animation in games and
user interfaces works this way.

To fake a 3D turn in 2D, squeeze the card horizontally. `Math.cos` does it naturally: as `flip` goes from 0 to 1,
`Math.abs(Math.cos(flip * Math.PI))` goes 1 → 0 → 1, so the card narrows to a line and widens again. Show the back
while `flip < 0.5` and the face after, and the swap happens exactly when the card is edge-on.

Animation means the picture changes between clicks, so the game now needs a **loop** after all. The click handler and
the timer just change state; the loop draws. It is the same structure as every other game here.

# --explanation-tr--

Kartlar bir anda açılıyor. Kısa bir çevirme animasyonu oyuna hayat verir ve temel bir fikri öğretir: **hedef durumu
gösterilen durumdan ayır**.

- `card.faceUp` gerçeğin kendisi: kurallar, tıpkı önceki gibi, yalnızca buna bakar.
- `card.flip`, `0`'dan (arkası görünür) `1`'e (yüzü görünür) giden ve her karede gerçeği biraz **kovalayan** bir
  sayı:
  ```js
  card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  ```

Gösterilen bir değeri bir hedefe doğru yavaş yavaş kaydırmaya **ara değerleme** (tweening) denir; oyunlardaki ve
arayüzlerdeki animasyonların neredeyse hepsi böyle çalışır.

2D'de 3D bir dönüşü taklit etmek için kartı yatayda sıkıştır. `Math.cos` bunu doğal olarak yapar: `flip` 0'dan 1'e
giderken `Math.abs(Math.cos(flip * Math.PI))` 1 → 0 → 1 gider; kart bir çizgiye daralır ve yeniden genişler. `flip < 0.5`
iken arkasını, sonra yüzünü göster; değişim tam da kart yan döndüğü anda olur.

Animasyon, resmin tıklamalar arasında değişmesi demek; bu yüzden oyunun sonuçta bir **döngüye** ihtiyacı var. Tıklama
işleyicisi ve zamanlayıcı yalnızca durumu değiştirir; döngü çizer. Buradaki diğer bütün oyunlarla aynı yapı.

# --task--

1. Give every new card `flip: 0`.
2. Add a `loop()` that, every frame, moves each card's `flip` 0.1 toward its target (1 if `faceUp`, else 0, never past
   the ends), then calls `draw()` and requests the next frame. Start it instead of calling `draw()` once, and remove
   the `draw()` calls from the click handler and the timer.
3. In `draw()`, draw each card `width = CARD * Math.abs(Math.cos(card.flip * Math.PI))` wide, centered on the card's
   usual center (`x + (CARD - width) / 2`). Show the face (background and symbol) when `card.flip >= 0.5`, the back
   otherwise.

# --task-tr--

1. Her yeni karta `flip: 0` ver.
2. Her karede her kartın `flip`'ini hedefine (`faceUp` ise 1, değilse 0; uçları asla geçmeden) 0.1 yaklaştıran, sonra
   `draw()` çağırıp sonraki kareyi isteyen bir `loop()` ekle. `draw()`'u bir kez çağırmak yerine onu başlat; tıklama
   işleyicisindeki ve zamanlayıcıdaki `draw()` çağrılarını kaldır.
3. `draw()` içinde her kartı `width = CARD * Math.abs(Math.cos(card.flip * Math.PI))` genişliğinde, kartın her
   zamanki merkezine ortalayarak (`x + (CARD - width) / 2`) çiz. `card.flip >= 0.5` ise yüzünü (arka plan ve sembol),
   değilse arkasını göster.

# --tests--

New cards should start with `flip` at 0, and the game should run a loop.
tr: Yeni kartlar `flip` 0 ile başlamalı ve oyun bir döngü çalıştırmalı.

```js
assert.isTrue(cards.every((c) => c.flip === 0))
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

`flip` should move 0.1 per frame toward the card's side.
tr: `flip` her karede kartın tarafına doğru 0.1 ilerlemeli.

```js
flip(cards[0])
$.tick(3)
assert.closeTo(cards[0].flip, 0.3, 0.001)
$.tick(20)
assert.strictEqual(cards[0].flip, 1)
cards[0].faceUp = false
$.tick(4)
assert.closeTo(cards[0].flip, 0.6, 0.001)
$.tick(20)
assert.strictEqual(cards[0].flip, 0)
```

A turning card should narrow, stay centered, and swap sides halfway.
tr: Dönen bir kart daralmalı, ortalı kalmalı ve yarı yolda taraf değiştirmeli.

```js
flip(cards[0])
$.tick(2)
const back = $.rects('#6366f1').find((r) => r.w < 85)
assert.closeTo(back.w, 85 * Math.cos(0.2 * Math.PI), 0.01)
assert.closeTo(back.x + back.w / 2, 12 + 85 / 2, 0.01)
$.tick(5)
const face = $.rects('#f8fafc').find((r) => r.w < 85)
assert.closeTo(face.w, 85 * Math.abs(Math.cos(0.7 * Math.PI)), 0.01)
assert.include($.texts(), cards[0].symbol)
```

The rules should be unchanged: a wrong pair still turns back after 800 ms.
tr: Kurallar değişmemeli: yanlış bir çift yine 800 ms sonra geri dönmeli.

```js
const a = cards[0]
const b = cards.find((c) => c.symbol !== a.symbol)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
$.run(1)
assert.isFalse(a.faceUp || b.faceUp)
$.run(0.5)
assert.strictEqual(a.flip, 0)
assert.lengthOf($.rects('#6366f1'), 16)
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards
let opened // the cards turned over this turn (0, 1 or 2)
let moves

// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function newGame() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
    flip: 0, // 0 = showing its back, 1 = showing its face; follows faceUp over a few frames
  }))
  opened = []
  moves = 0
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function cardAt(x, y) {
  return cards.find((card) => {
    const left = cardX(card)
    const top = cardY(card)
    return x >= left && x < left + CARD && y >= top && y < top + CARD
  })
}

function won() {
  return cards.every((card) => card.matched)
}

function flip(card) {
  if (!card || card.faceUp || opened.length === 2) return
  card.faceUp = true
  opened.push(card)
  if (opened.length < 2) return

  moves += 1
  const [a, b] = opened
  if (a.symbol === b.symbol) {
    a.matched = true
    b.matched = true
    opened = []
  } else {
    // Give the player time to see the second card before hiding both again.
    setTimeout(() => {
      a.faceUp = false
      b.faceUp = false
      opened = []
    }, 800)
  }
}

canvas.addEventListener('click', (event) => {
  if (won()) {
    newGame()
    return
  }
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  flip(cardAt(x, y))
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Moves: ' + moves, GAP, 22)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    // Squeeze the card horizontally to fake a 3D turn: full width, a thin line halfway, full width again.
    const width = CARD * Math.abs(Math.cos(card.flip * Math.PI))
    const x = cardX(card) + (CARD - width) / 2
    const y = cardY(card)
    if (card.flip >= 0.5) {
      ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
      ctx.fillRect(x, y, width, CARD)
      ctx.fillText(card.symbol, cardX(card) + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, width, CARD)
    }
  }

  if (won()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('You found them all!', canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 270)
  }
}

function loop() {
  for (const card of cards) {
    card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
