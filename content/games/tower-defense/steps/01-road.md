---
title: Measure the map
title_tr: Haritayı ölç
skills: [game.canvas]
---

# --goal--

We are building a tower defense game: enemies walk along a road, and the towers you build beside it shoot them. First
the measures: a map of 12 × 9 tiles of 40 pixels, with a strip on top for gold, lives and buttons. Then a dark
background.

# --goal-tr--

Bir **kule savunması** oyunu yapıyoruz: düşmanlar bir yol boyunca yürür, sen yolun kenarına kuleler kurarsın, kuleler
onları vurur. Oyun **canvas** (tuval) üzerine çizilir: 480 × 440 piksellik bir resim alanı.

Önce ölçüler: 12 sütun, 9 satır, her kare (tile) 40 piksel. Üstte 40 piksellik bir şerit altın, can ve kule düğmeleri
için; en altta da bir şerit kalacak. Sonra bütün tuvali koyu renge boyuyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `getElementById('game')` finds the canvas; `getContext('2d')` gives `ctx`, the object with the drawing commands.
- 12 × 40 = 480 pixels wide. The map is 9 × 40 = 360 tall, from `TOP` (40) down to 400; the last 40 pixels are for a
  bottom bar later.
- `fillRect(x, y, width, height)` paints a rectangle in the `fillStyle` color; `(0, 0)` is the top-left corner and `y`
  grows downwards.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan öğeyi, yani canvas'ı bulur.
- `canvas.getContext('2d')` → canvas'ın **2B çizim kalemi**: `ctx`. Bütün çizim komutları `ctx.` ile başlar.
- `TILE`, `COLS`, `ROWS` → kare boyu (40 piksel), sütun (12) ve satır (9) sayısı. 12 × 40 = 480: tuvalin eni.
- `const TOP = 40` → haritanın yukarıdan ne kadar aşağıda başladığı. Harita 9 × 40 = 360 piksel: 40'tan 400'e.
  Alttaki son 40 piksel ileride bir düğme şeridi olacak.
- `ctx.fillStyle = '#0f172a'` → kalemin rengi: çok koyu lacivert.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst köşeden (canvas'ta **(0, 0) sol üst köşedir**, `x`
  sağa, `y` aşağı büyür) tuvalin tam boyu kadar dikdörtgen: bütün tuval boyanır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan baştan
sona koyu laciverte boyanmalı.

# --hint--

`getElementById` has a capital `E`, `B` and `I`; `'game'` is in quotes.

# --hint-tr--

`getElementById` içinde büyük `E`, `B` ve `I` var; `'game'` tırnak içinde olmalı.

# --tests--

The map should be 12 by 9 tiles of 40 pixels, under a 40-pixel strip.
tr: Harita, 40 piksellik şeridin altında 12 × 9 tane 40 piksellik kare olmalı.

```js
assert.deepEqual([TILE, COLS, ROWS, TOP], [40, 12, 9, 40])
assert.strictEqual(COLS * TILE, canvas.width)
```

The whole canvas should be painted `#0f172a`.
tr: Bütün canvas `#0f172a` ile boyanmalı.

```js
assert.deepInclude($.rects('#0f172a'), { x: 0, y: 0, w: 480, h: 440, color: '#0f172a' })
```

# --seed--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
