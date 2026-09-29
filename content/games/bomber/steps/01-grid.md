---
title: Measure the arena
title_tr: Arenayı ölç
skills: [game.canvas]
---

# --goal--

We are building a Bomberman-style game: an arena of tiles, bombs, flames and enemies. First the measures: 13 columns
and 11 rows of 32-pixel tiles, with a 32-pixel strip on top for the lives and the time. Then a dark background.

# --goal-tr--

Bomberman tarzı bir oyun yapıyoruz: karelerden bir arena, bombalar, alevler ve düşmanlar. Oyun **canvas** (tuval)
üzerine çizilir: 416 × 384 piksellik bir resim alanı.

Önce arenanın **ölçüleri**: 13 sütun ve 11 satır, her kare (tile) 32 piksel. Üstte 32 piksellik bir şerit canlar ve
süre için boş kalacak. Sonra bütün tuvali koyu renge boyuyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `getElementById('game')` finds the canvas; `getContext('2d')` gives `ctx`, the object with the drawing commands.
- 13 × 32 = 416 pixels wide; 32 + 11 × 32 = 384 pixels tall: the arena fills the canvas under the top strip.
- `fillStyle` picks the color and `fillRect(x, y, width, height)` paints a rectangle; `(0, 0)` is the top-left
  corner, and `y` grows downwards.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan öğeyi, yani canvas'ı bulur.
- `canvas.getContext('2d')` → canvas'ın **2B çizim kalemi**: `ctx`. Bütün çizim komutları `ctx.` ile başlar.
- `const COLS = 13`, `const ROWS = 11` → sütun ve satır sayısı. `const TILE = 32` → bir karenin boyu (piksel).
- `const TOP = 32` → arenanın yukarıdan ne kadar aşağıda başlayacağı. Hesap tutuyor: 13 × 32 = 416 (tuvalin eni),
  32 + 11 × 32 = 384 (tuvalin boyu).
- `ctx.fillStyle = '#0f172a'` → kalemin rengi: çok koyu lacivert.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu dikdörtgen: sol üst köşeden (canvas'ta **(0, 0) sol
  üst köşedir**, `x` sağa, `y` aşağı büyür) tuvalin tam boyu kadar. Bütün tuval boyanır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan
baştan sona koyu laciverte boyanmalı.

# --hint--

`getElementById` has a capital `E`, `B` and `I`; `'game'` is in quotes.

# --hint-tr--

`getElementById` içinde büyük `E`, `B` ve `I` var; `'game'` tırnak içinde olmalı.

# --tests--

The arena should be 13 by 11 tiles of 32 pixels, under a 32-pixel strip.
tr: Arena, 32 piksellik şeridin altında 13 × 11 tane 32 piksellik kare olmalı.

```js
assert.strictEqual(COLS, 13)
assert.strictEqual(ROWS, 11)
assert.strictEqual(TILE, 32)
assert.strictEqual(TOP, 32)
assert.strictEqual(COLS * TILE, canvas.width)
assert.strictEqual(TOP + ROWS * TILE, canvas.height)
```

The whole canvas should be painted `#0f172a`.
tr: Bütün canvas `#0f172a` ile boyanmalı.

```js
assert.deepInclude($.rects('#0f172a'), { x: 0, y: 0, w: 416, h: 384, color: '#0f172a' })
```

# --seed--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
