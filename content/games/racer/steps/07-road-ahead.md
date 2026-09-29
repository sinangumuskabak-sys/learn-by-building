---
title: The road ahead
title_tr: Öndeki yol
skills: [prog.loops, game.canvas]
---

# --goal--

Now the real road replaces the test piece: for each of the next 100 segments we project its near and far edge and paint
a trapezoid. Laid end to end they make a road running to the horizon.

# --goal-tr--

Şimdi deneme parçasının yerine **gerçek yolu** çizeceğiz. Kameranın önündeki 100 parçanın her biri için yakın ve uzak
kenarı `project` ile hesaplayıp bir yamuk boyayacağız. Uç uca eklenen yamuklar ufka kadar uzanan bir yol olur.

Yakındaki parçalar kocaman (hatta ekrandan taşar), uzaktakiler ince bir çizgi kadar; ama hepsi aynı 200 birimlik
parça. Perspektif bu.

# --code--

```js
const DRAW = 100 // segments drawn

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  for (let i = 0; i < DRAW; i++) {
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) quad('#6b7280', near.x, near.y, near.w, far.x, far.y, far.w)
  }
```

# --meaning--

- `DRAW` is how many segments we draw; further away they would be dots anyway.
- `base` is the segment the camera is on (0 for now; it grows when we drive). `Math.floor` rounds down.
- `z` is how far the start of segment `base + i` is in front of the camera.
- `near` and `far` are its two edges on screen. `if (z > 0)` skips a segment at or behind the camera (`DEPTH / 0` would
  be infinite).

# --meaning-tr--

- `DRAW = 100` → ekrana kaç parça çizeceğimiz. Daha uzağı zaten ufukta nokta kadar kalır.
- `Math.floor(position / SEG)` → kameranın **kaçıncı parçada** olduğu. `Math.floor` aşağı yuvarlar: 3.7 → 3. Şimdi
  `position` 0, yani `base` de 0; araba ilerleyince büyüyecek.
- `for (let i = 0; i < DRAW; i++)` → 100 kez: öndeki 1., 2., 3.... parça için.
- `z = (base + i) * SEG - position` → o parçanın başlangıcının kameraya **uzaklığı**.
- `near` ve `far` → parçanın yakın (`z`) ve uzak (`z + SEG`) kenarının ekrandaki yeri.
- `if (z > 0) quad(...)` → sadece kameranın **önündeki** parçayı çiz. `z` 0 ya da eksiyse parça kameranın altında ya
  da arkasında kalmıştır (üstelik `DEPTH / 0` sonsuz olur).

# --task--

1. Under the `DEPTH` line write the `DRAW` line.
2. In `draw`, delete the three test lines and write the comment, `base` and the `for` loop in their place.

# --task-tr--

1. `const DEPTH = ...` satırının altına `DRAW` satırını yaz.
2. `draw` içindeki üç deneme satırını (`const near`, `const far`, `quad(...)`) **sil**. Yerine yorum satırını, `base`
   satırını ve `for` döngüsünü yaz.
3. **Çalıştır**: gri yol ekranın altından ufka kadar uzanmalı.

# --predict--

The road is made of 99 trapezoids. Will you see the joins between them?
- [ ] Yes, thin lines between the pieces
- [x] No, one smooth gray road
  Each piece's far edge is exactly the next one's near edge, and they have the same color.
- [ ] Only the nearest few pieces

# --predict-tr--

Yol 99 yamuktan oluşuyor. Aralarındaki birleşme yerlerini görecek misin?
- [ ] Evet, parçaların arasında ince çizgiler
- [x] Hayır, tek parça düzgün gri bir yol
  Her parçanın uzak kenarı bir sonrakinin yakın kenarıyla tam aynı yerde ve renkleri aynı.
- [ ] Sadece en yakın birkaç parçada

# --tests--

99 pieces of road should be painted (the one under the camera is skipped).
tr: 99 yol parçası boyanmalı (kameranın altındaki atlanır).

```js
assert.strictEqual(DRAW, 100)
$.tick(1)
const roads = $.screen().filter((c) => c.op === 'fill' && c.fill === '#6b7280')
assert.lengthOf(roads, DRAW - 1)
```

The road should reach almost to the horizon.
tr: Yol neredeyse ufka kadar uzanmalı.

```js
$.tick(1)
const ys = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args[1])
assert.isBelow(Math.min(...ys), 170)
assert.isAbove(Math.min(...ys), 160)
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
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) quad('#6b7280', near.x, near.y, near.w, far.x, far.y, far.w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
