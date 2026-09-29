---
title: The face of a card
title_tr: Kartın yüzü
skills: [prog.arrays, game.canvas]
---

# --goal--

A face-up card shows its name in the corner (`Q♥`) and a big suit in the middle. Two arrays turn the numbers in a
card into these symbols.

# --goal-tr--

Açık bir kartın köşesinde adı (`Q♥`), ortasında da büyük bir renk işareti olur. Kartlarda değeri ve rengi
**sayı** olarak tutuyoruz; iki dizi bu sayıları ekrandaki işaretlere çevirecek.

Kapalı kartın ise yüzü görünmez: onda yazı olmayacak.

# --code--

```js
const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  if (!card.up) return
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
```

# --meaning--

- `SUITS[1]` is `'♥'`: suits are numbers 0 to 3. `RANKS[12]` is `'Q'`: ranks go from 1 (ace) to 13 (king); the empty
  `''` only fills place 0 so the numbers match the cards.
- `if (!card.up) return` stops here for a face-down card: no text on its back.
- `fillText(text, x, y)` writes text; `ctx.font` sets its size, `ctx.textAlign` whether `x` is its left edge or its
  center. The big suit is centered on the card: `x + CW / 2`.

# --meaning-tr--

- `const SUITS = ['♠', '♥', '♦', '♣']` → dört rengin işareti: maça, kupa, karo, sinek. Bir kartta renk **sayı**
  olarak durur (0–3); `SUITS[1]` → `'♥'`. Dizide sayma **0'dan** başlar.
- `const RANKS = ['', 'A', '2', ..., 'K']` → değerlerin adları. Kartlarda değer 1 (as) ile 13 (papaz) arası;
  `RANKS[12]` → `'Q'` (kız). Baştaki boş yazı `''` yalnız 0. sırayı doldurur ki numaralar kartlarla uyuşsun.
- `if (!card.up) return` → `!` "değil" demek: kart **açık değilse** fonksiyon burada biter. Kapalı kartın sırtında
  yazı olmaz.
- `ctx.fillStyle = '#0f172a'` → yazı rengi koyu lacivert (bir sonraki adımda kırmızıyı ekleyeceğiz).
- `ctx.font = 'bold 14px sans-serif'` → kalın, 14 piksel yazı.
- `ctx.textAlign = 'left'` → verilen `x` yazının **sol ucu** olsun.
- `ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)` → `'Q' + '♥'` = `'Q♥'`; iki yazıyı `+` uç uca
  ekler. Kartın sol üst köşesinden biraz içeriye yazılır.
- Son üç satır → ortaya büyük (28 piksel) bir işaret. `textAlign = 'center'` ile `x` artık yazının **ortası**;
  `x + CW / 2` kartın tam ortası.

# --task--

1. Above `const CW = 56 ...` write `SUITS` and `RANKS`.
2. In `drawCardAt`, under `ctx.strokeRect(...)`, write the eight new lines. Press **Run**.

# --task-tr--

1. `const CW = 56 ...` satırının **üstüne** `SUITS` ve `RANKS` satırlarını yaz. İşaretleri (`♠ ♥ ♦ ♣`) klavyeden
   yazmak zorsa buradan kopyalayabilirsin.
2. `drawCardAt` içinde `ctx.strokeRect(x, y, CW, CH)` satırının altına sekiz yeni satırı yaz.
3. **Çalıştır**: test kartında sol üstte `Q♥`, ortada büyük bir `♥` görmelisin.

# --hint--

`RANKS[card.rank] + SUITS[card.suit]`: square brackets read from the arrays, `+` joins the two texts.

# --hint-tr--

`RANKS[card.rank] + SUITS[card.suit]`: köşeli parantez diziden okur, `+` iki yazıyı birleştirir.

# --try--

Change the test card to `{ rank: 1, suit: 0, up: true }`: the ace of spades. Then put the queen of hearts back.

# --try-tr--

Test kartını `{ rank: 1, suit: 0, up: true }` yap: maça ası. Sonra kupa kızına geri dön.

# --tests--

A face-up card should show its name in the corner and its suit in the middle.
tr: Açık kart köşesinde adını, ortasında rengini göstermeli.

```js
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
const name = texts.find((c) => c.args[0] === 'Q♥')
assert.exists(name, "'Q♥' in the corner")
assert.deepEqual(name.args.slice(1), [20, 56])
const big = texts.find((c) => c.args[0] === '♥')
assert.exists(big, 'a big ♥ in the middle')
assert.deepEqual(big.args.slice(1), [44, 94])
```

A face-down card should have no text.
tr: Kapalı bir kartta yazı olmamalı.

```js
$.tick(1)
const before = $.texts().length
drawCardAt({ rank: 1, suit: 0, up: false }, 100, 200)
assert.lengthOf($.texts(), before)
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

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
  if (!card.up) return
  ctx.fillStyle = '#0f172a'
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
