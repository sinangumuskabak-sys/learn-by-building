---
title: A landing pad
title_tr: İniş pisti
skills: [prog.arrays, game.canvas]
---

# --goal--

Somewhere among the hills there must be a flat place to land: three points in a row get the same height. That is the
**pad**, drawn as a green bar.

# --goal-tr--

Tepelerin arasında inilebilecek **düz** bir yer olmalı. Rastgele bir yerde yan yana **üç noktaya aynı yüksekliği**
vereceğiz: aralarındaki zemin dümdüz olur. Burası iniş **pisti** (pad). Pistin yerini bir nesnede tutacağız ve onu
yeşil bir çubukla işaretleyeceğiz.

# --code--

```js
let pad // { x1, x2, y }: the flat landing pad

// Random hills, with one flat stretch: the pad.

  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)
```

# --meaning--

- The pad is 2 steps wide (3 points). `start` is a random point from 1, chosen so the pad fits before the right edge.
- The loop sets the heights of points `start` to `start + width` to the same random `y`.
- `pad` keeps the pad's left and right x in pixels and its y. It is drawn as a green bar 4 pixels high on that y.

# --meaning-tr--

- `const width = 2` → pist 2 aralık (80 piksel), yani 3 nokta genişliğinde.
- `const start = 1 + Math.floor(Math.random() * (points - 2 - width))` → pistin ilk noktası: 1'den başlayan rastgele
  bir sıra numarası. `Math.floor` aşağı yuvarlar. Sınır, pistin sağ kenara taşmamasını sağlar.
- `const y = 250 + Math.random() * 70` → pistin yüksekliği: 250 ile 320 arası.
- `for (let i = start; i <= start + width; i++) ground[i] = y` → `start`'tan `start + width`'e kadar (dahil) her
  noktanın yüksekliğini aynı `y` yap. `ground[i] = y` listenin `i`. elemanını değiştirir.
- `pad = { x1: ..., x2: ..., y }` → pistin sol ve sağ ucu **piksel** olarak (nokta numarası × 40) ve yüksekliği.
- Çizimde: yeşil, 4 piksel kalınlığında bir çubuk; `pad.y - 2` onu zemin çizgisine ortalar.

# --task--

1. Under `let ground ...` write `let pad` with its comment; above `function makeGround() {` write the comment line.
2. In `makeGround`, under the `ground = ...` line, write the five pad lines.
3. In `draw`, under `ctx.fill()`, write the two green lines.

# --task-tr--

1. `let ground ...` satırının altına yorumuyla `let pad` yaz; `function makeGround() {` satırının **üstüne** yorum
   satırını yaz.
2. `makeGround` içinde `ground = ...` satırının altına pistin beş satırını yaz.
3. `draw` içinde `ctx.fill()` satırının altına yeşil çubuğun iki satırını yaz.
4. **Çalıştır**: tepelerin arasında düz bir yer ve üstünde yeşil bir çubuk görmelisin.

# --hint--

In the `for`, use `<=` so the last point `start + width` is included too.

# --hint-tr--

`for` içinde `<=` kullan ki son nokta (`start + width`) da dahil olsun.

# --tests--

The pad should be flat, 80 pixels wide and inside the screen.
tr: Pist düz, 80 piksel genişliğinde ve ekranın içinde olmalı.

```js
assert.strictEqual(pad.x2 - pad.x1, 80)
assert.isTrue(pad.x1 >= 40 && pad.x2 <= 480)
assert.isTrue(pad.y >= 250 && pad.y <= 320)
const first = pad.x1 / 40
assert.deepEqual([ground[first], ground[first + 1], ground[first + 2]], [pad.y, pad.y, pad.y])
```

The pad should be drawn as a green bar.
tr: Pist yeşil bir çubuk olarak çizilmeli.

```js
assert.deepEqual($.rects('#22c55e').map((r) => [r.x, r.y, r.w, r.h]), [[pad.x1, pad.y - 2, 80, 4]])
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)
}

makeGround()
draw()
```
