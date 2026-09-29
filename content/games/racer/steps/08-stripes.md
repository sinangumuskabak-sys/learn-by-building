---
title: Stripes
title_tr: Şeritler
skills: [game.canvas]
---

# --goal--

A plain gray road will not look like it moves: there is nothing on it for the eye to follow. We paint the segments light
and dark, three at a time. When the road starts moving, these stripes will rush towards you.

# --goal-tr--

Düz gri bir yol hareket etse bile kıpırdamıyor gibi görünür: üstünde gözün takip edeceği bir iz yok. Parçaları
**üçer üçer** bir açık, bir koyu boyayacağız. Yol akmaya başlayınca bu şeritler sana doğru koşacak ve hızı
hissettirecek.

# --code--

```js
for (let i = 0; i < DRAW; i++) {
  const index = (base + i) % segments.length
  const z = (base + i) * SEG - position
  const near = project(0, -CAMERA_HEIGHT, z)
  const far = project(0, -CAMERA_HEIGHT, z + SEG)
  const light = Math.floor(index / 3) % 2 === 0
  if (z > 0) quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
}
```

# --meaning--

- `index` is the segment's number in the list; `%` (remainder) wraps it back to 0 after the last segment.
- `Math.floor(index / 3)` is 0 for segments 0–2, 1 for 3–5, and so on; `% 2 === 0` asks "is it even?". So `light`
  switches every three segments.
- `light ? a : b` picks `a` when `light` is true, otherwise `b`.

# --meaning-tr--

- `index = (base + i) % segments.length` → parçanın listedeki **sıra numarası**. `%` bölümden kalandır (`7 % 3` → 1):
  pistin sonu geçilince numara 800'den 0'a döner.
- `Math.floor(index / 3)` → 0, 1, 2 numaralı parçalarda 0; 3, 4, 5'te 1; 6, 7, 8'de 2... Böylece renk **üç parçada
  bir** değişir.
- `% 2 === 0` → "çift mi?" `===` eşitlik sorusudur; cevap `true` (doğru) ya da `false` (yanlış) olur. `light` (açık)
  bu cevabı tutar.
- `light ? '#6b7280' : '#646b75'` → **üçlü operatör**: `light` doğruysa ilk rengi, değilse ikincisini seç.

# --task--

1. Right under the `for` line write the `index` line.
2. Above the `if (z > 0)` line write the `light` line.
3. In `quad(`, replace `'#6b7280'` with `light ? '#6b7280' : '#646b75'`.

# --task-tr--

1. `for (...)` satırının hemen altına `index` satırını yaz.
2. `if (z > 0)` satırının **üstüne** `light` satırını yaz.
3. Aynı satırda `quad(` içindeki `'#6b7280'` rengini `light ? '#6b7280' : '#646b75'` yap.
4. **Çalıştır**: yolda açık ve koyu şeritler görmelisin. Renkler birbirine yakın, dikkatli bak.

# --try--

To see the stripes clearly, use `'white'` and `'black'` for a moment. Put the two gray colors back afterwards.

# --try-tr--

Şeritleri net görmek için bir anlığına `'white'` ve `'black'` kullan. Sonra iki gri rengi geri koy.

# --tests--

The road should switch between light and dark every three segments.
tr: Yol her üç parçada bir açık ve koyu arasında değişmeli.

```js
$.tick(1)
const fills = $.screen().filter((c) => c.op === 'fill').map((c) => c.fill)
assert.deepEqual(fills.slice(0, 8), ['#6b7280', '#6b7280', '#646b75', '#646b75', '#646b75', '#6b7280', '#6b7280', '#6b7280'])
assert.lengthOf(fills, 99)
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const SEG = 200 // length of one road segment, in world units
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
const DRAW = 100 // segments drawn

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
}

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}

function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    const light = Math.floor(index / 3) % 2 === 0
    if (z > 0) quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
