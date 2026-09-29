---
title: The face of a card
title_tr: Kartın ön yüzü
skills: [game.canvas, game.state]
---

# --goal--

A face-up card is a white square with its fruit in the middle; a face-down card stays purple. `if ... else` picks one
of the two ways to draw it.

# --goal-tr--

Açık bir kart nasıl görünecek? **Beyaz** bir kare ve ortasında **meyvesi**. Kapalı kart ise eskisi gibi mor.

Her kart için "açık mı?" diye soracağız ve cevaba göre iki yoldan birini seçeceğiz: `if` (eğer) ... `else` (değilse).
Kartlar henüz kapalı başladığı için ekran aynı görünecek; denemesi aşağıda.

# --code--

```js
ctx.textBaseline = 'middle'
ctx.font = '44px sans-serif'
ctx.textAlign = 'center'
for (const card of cards) {
  const x = cardX(card)
  const y = cardY(card)
  if (card.faceUp) {
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(x, y, CARD, CARD)
    ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
  } else {
    ctx.fillStyle = '#6366f1'
    ctx.fillRect(x, y, CARD, CARD)
  }
}
```

# --meaning--

- The three `ctx` lines set a 44 pixel font and make the given point the middle of the text.
- `if (card.faceUp) { ... } else { ... }`: face up draws white plus the fruit, otherwise purple.
- `x + CARD / 2`, `y + CARD / 2` is the card's center.

# --meaning-tr--

- `ctx.textBaseline = 'middle'` ve `ctx.textAlign = 'center'` → verilen nokta yazının **tam ortası** olsun (dikeyde ve
  yatayda).
- `ctx.font = '44px sans-serif'` → 44 piksel boyunda yazı: meyveler büyük görünsün.
- `if (card.faceUp) { ... } else { ... }` → **koşul**: kart açıksa ilk bloğu, değilse `else` bloğunu çalıştır.
- `ctx.fillStyle = '#f8fafc'` → neredeyse beyaz: kartın ön yüzü.
- `ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)` → meyveyi kartın **ortasına** yaz. `/` bölme: `CARD / 2`
  kartın yarısı (42.5).
- `else` bloğu eski iki satır: kapalı kart mor.

# --task--

In `draw`, replace the card loop with the new lines (the three `ctx` lines go above the `for`).

# --task-tr--

1. `draw` içindeki kart döngüsünün **üstüne** üç `ctx` satırını yaz.
2. Döngünün içindeki iki mor satırı `if ... else` yapısına al: `if (card.faceUp) {` ile başla, beyaz kare ve meyveyi
   yaz, `} else {` de, iki mor satırı içeri al, `}` ile kapat.
3. **Çalıştır**: kartlar kapalı olduğu için ekran aynı kalır.

# --try--

In `newGame`, change `faceUp: false` to `faceUp: true` and run: every fruit shows. Put `false` back.

# --try-tr--

`newGame` içinde `faceUp: false` kısmını `faceUp: true` yap ve çalıştır: bütün meyveler görünür. Sonra `false`'a geri al.

# --tests--

A face-up card should show its fruit on a white square.
tr: Açık bir kart beyaz kare üstünde meyvesini göstermeli.

```js
cards[5].faceUp = true
$.tick(1)
assert.deepEqual($.texts(), [cards[5].symbol])
assert.deepEqual($.rects('#f8fafc'), [{ x: 109, y: 149, w: 85, h: 85, color: '#f8fafc' }])
assert.lengthOf($.rects('#6366f1'), 15)
```

The fruit should be centered on the card.
tr: Meyve kartın ortasında olmalı.

```js
cards[0].faceUp = true
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText')
assert.deepEqual(text.args.slice(1, 3), [12 + 42.5, 52 + 42.5])
assert.strictEqual(ctx.textAlign, 'center')
assert.strictEqual(ctx.textBaseline, 'middle')
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

function newGame() {
  const deck = [...SYMBOLS, ...SYMBOLS]
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textBaseline = 'middle'
  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
