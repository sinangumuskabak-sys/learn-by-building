---
title: Draw one card
title_tr: Bir kart çiz
skills: [game.canvas, prog.functions]
---

# --goal--

A card is a small object: `{ rank, suit, up }`. `drawCardAt` draws one at a given place: white if it is face up, blue if
it is face down, with a thin dark border. We try it on one test card.

# --goal-tr--

Oyunun her kartı küçük bir **nesne** olacak: `{ rank, suit, up }` → değeri, rengi (maça, kupa...) ve açık mı
kapalı mı olduğu. Bu adımda tek bir kartı istediğimiz yere çizen `drawCardAt` (kartı şurada çiz) fonksiyonunu
yazıyoruz.

Açık kart **beyaz**, kapalı kart (arkası dönük) **mavi** olacak. Denemek için masanın sol üstüne geçici bir test
kartı çizeceğiz.

# --code--

```js
const CW = 56 // card width
const CH = 78

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
}

  drawCardAt({ rank: 12, suit: 1, up: true }, 16, 40)
```

# --meaning--

- `CW` and `CH` are the card's width and height, named once.
- `card.up ? '#ffffff' : '#1d4ed8'` is the conditional operator: white if `card.up` is true, blue otherwise.
- `strokeRect` draws only the outline of a rectangle, in `strokeStyle`, `lineWidth` pixels thick.
- The call in `draw` draws a face-up test card (a queen of hearts) at `(16, 40)`. It is temporary.

# --meaning-tr--

- `const CW = 56` ve `const CH = 78` → kartın **eni** ve **boyu** (piksel). Sayıları bir kez adlandırıyoruz.
- `function drawCardAt(card, x, y)` → üç şey alır: çizilecek kart ve sol üst köşesinin yeri.
- `card.up ? '#ffffff' : '#1d4ed8'` → **koşul işleci**: `koşul ? evetse : hayırsa`. Kart açıksa (`card.up`
  doğruysa) beyaz, değilse mavi. Kısa bir `if`/`else` gibi düşün.
- `ctx.fillRect(x, y, CW, CH)` → kartın gövdesi.
- `ctx.strokeStyle`, `ctx.lineWidth`, `ctx.strokeRect(...)` → `fillRect` içini doldurur, `strokeRect` ise yalnız
  **çerçeve** çizer: rengi `strokeStyle`, kalınlığı `lineWidth` (1 piksel).
- `drawCardAt({ rank: 12, suit: 1, up: true }, 16, 40)` → `draw` içinde, masanın hemen ardından **geçici** bir test
  kartı: açık bir kart, `(16, 40)` noktasında. (12 kız, 1 kupa demek; birazdan göreceğiz.)

# --task--

1. Under `const ctx = ...` leave an empty line and write `CW` and `CH`.
2. Above `function draw() {` write `drawCardAt`, with an empty line between them.
3. Inside `draw`, after the `fillRect` line, leave an empty line and write the test call. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırak ve `CW`, `CH` satırlarını yaz.
2. `function draw() {` satırının **üstüne** `drawCardAt` fonksiyonunu yaz; aralarında bir boş satır kalsın.
3. `draw` içinde `ctx.fillRect(...)` satırının altına bir boş satır bırak ve test kartı satırını yaz (iki boşluk
   içeriden).
4. **Çalıştır**: sol üstte beyaz, çerçeveli bir kart görmelisin.

# --hint--

The test card must be drawn **after** the green `fillRect`, or the table paints over it.

# --hint-tr--

Test kartı yeşil `fillRect`'ten **sonra** çizilmeli; yoksa masa onun üstünü boyar.

# --try--

Change `up: true` to `up: false` in the test card and run: the card turns blue. Put `true` back.

# --try-tr--

Test kartında `up: true`'yu `up: false` yap ve çalıştır: kart maviye döner (arkası dönük). Sonra `true`'ya geri al.

# --tests--

A white 56×78 card should be drawn at (16, 40).
tr: (16, 40) noktasına beyaz, 56×78'lik bir kart çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#ffffff'), { x: 16, y: 40, w: 56, h: 78, color: '#ffffff' })
```

A face-down card should be blue with a dark border.
tr: Kapalı bir kart koyu çerçeveli ve mavi olmalı.

```js
drawCardAt({ rank: 1, suit: 0, up: false }, 100, 200)
assert.deepInclude($.rects('#1d4ed8'), { x: 100, y: 200, w: 56, h: 78, color: '#1d4ed8' })
const border = $.screen().filter((c) => c.op === 'strokeRect' && c.args[0] === 100 && c.args[1] === 200)
assert.lengthOf(border, 1, 'strokeRect(x, y, CW, CH)')
assert.strictEqual(border[0].stroke, '#0f172a')
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CW = 56 // card width
const CH = 78

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
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
