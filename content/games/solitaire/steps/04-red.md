---
title: Red and black
title_tr: Kırmızı ve siyah
skills: [prog.functions]
---

# --goal--

Hearts and diamonds are red. A tiny function `isRed` answers that question, and the text color comes from it. The rules
will need `isRed` again later.

# --goal-tr--

Kupa (♥) ve karo (♦) **kırmızı**, maça ve sinek siyahtır. "Bu kart kırmızı mı?" sorusunu cevaplayan minik bir
fonksiyon yazacağız: `isRed`. Yazının rengi ona göre seçilecek.

Bu soru ileride kurallarda da çok lazım olacak: Klondike'ta kartlar **renk değiştirerek** dizilir.

# --code--

```js
const isRed = (card) => card.suit === 1 || card.suit === 2

  ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
```

# --meaning--

- `(card) => ...` is an arrow function: it takes `card` and returns the value after `=>`.
- `||` means "or": suit 1 (♥) or suit 2 (♦) is red.
- The text color is red when `isRed(card)` is true, dark otherwise.

# --meaning-tr--

- `const isRed = (card) => ...` → **ok fonksiyonu**: `function` yazmadan kısa bir fonksiyon. `card` alır ve `=>`'dan
  sonraki değeri **geri verir**. `isRed(card)` yazınca `true` (doğru) ya da `false` (yanlış) döner.
- `card.suit === 1 || card.suit === 2` → `||` "**veya**": renk 1 (kupa) veya 2 (karo) ise doğru.
- `ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'` → koşul işleci yine: kırmızı kartın yazısı kırmızı,
  siyah kartınki koyu.

# --task--

1. Under `const CH = 78` leave an empty line and write `isRed`.
2. In `drawCardAt`, change the line `ctx.fillStyle = '#0f172a'` (the one after `return`) as shown.

# --task-tr--

1. `const CH = 78` satırının altına bir boş satır bırak ve `isRed` satırını yaz.
2. `drawCardAt` içinde, `if (!card.up) return` satırının hemen altındaki `ctx.fillStyle = '#0f172a'` satırını
   kodda görüldüğü gibi değiştir. (Çerçevenin `strokeStyle` satırı aynı kalır.)
3. **Çalıştır**: `Q♥` artık kırmızı.

# --tests--

`isRed` should be true for ♥ and ♦ only.
tr: `isRed` yalnız ♥ ve ♦ için doğru olmalı.

```js
assert.isFalse(isRed({ rank: 1, suit: 0 }))
assert.isTrue(isRed({ rank: 1, suit: 1 }))
assert.isTrue(isRed({ rank: 1, suit: 2 }))
assert.isFalse(isRed({ rank: 1, suit: 3 }))
```

A red card should be written in `#dc2626`, a black one in `#0f172a`.
tr: Kırmızı kart `#dc2626`, siyah kart `#0f172a` ile yazılmalı.

```js
$.tick(1)
drawCardAt({ rank: 1, suit: 0, up: true }, 100, 200)
const color = (text) => $.screen().find((c) => c.op === 'fillText' && c.args[0] === text).fill
assert.strictEqual(color('Q♥'), '#dc2626')
assert.strictEqual(color('A♠'), '#0f172a')
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

const isRed = (card) => card.suit === 1 || card.suit === 2

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

requestAnimationFrame(loop)
```
