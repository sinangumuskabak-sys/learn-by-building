---
title: Kerbs and a center line
title_tr: Bordür ve orta çizgi
skills: [game.canvas]
---

# --goal--

Race tracks have red and white kerbs at the edges and a dashed line in the middle. Both are trapezoids too: the kerb a
little wider than the road and painted before it, the center line very thin and painted after it.

# --goal-tr--

Yarış pistlerinin kenarında **kırmızı-beyaz bordürler**, ortasında **kesik beyaz bir çizgi** olur. İkisini de aynı
`quad` ile çizeceğiz. Bordür, yoldan biraz **daha geniş** bir yamuk; orta çizgi ise çok **ince** bir yamuk.

Sıra önemli: önce bordür, **üstüne** yol. Yol bordürün ortasını örter; geriye iki kenarda ince birer şerit kalır.

# --code--

```js
const light = Math.floor(index / 3) % 2 === 0
quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
```

# --meaning--

- The kerb is 1.15 times as wide as the road, white on light segments and red on dark ones. The road covers its middle.
- On light segments only, a white line 0.03 times the road's width is painted on top: light and dark take turns, so the
  line is dashed.

# --meaning-tr--

- İlk `quad` → **bordür**: yarı genişliği `near.w * 1.15`, yani yoldan %15 geniş. Açık parçada beyaz (`'#f8fafc'`),
  koyu parçada kırmızı (`'#dc2626'`).
- İkinci `quad` → yol; bordürün **üstüne** boyanır ve ortasını örter.
- `if (light) quad(...)` → sadece açık parçalarda, yolun %3'ü genişliğinde beyaz bir çizgi. Açık ve koyu parçalar sırayla
  geldiği için çizgi **kesik kesik** görünür.

# --task--

In the second loop, write the kerb line above the road `quad` and the center line below it.

# --task-tr--

İkinci döngüde:
1. Yolu boyayan `quad(light ? '#6b7280' ...` satırının **üstüne** bordür satırını yaz.
2. Aynı satırın **altına** orta çizgi satırını yaz.
3. **Çalıştır**: yolun kenarlarında kırmızı-beyaz bordürler, ortasında kesik beyaz çizgi görmelisin.

# --hint--

Order matters: kerb, then road, then center line. If the road is all white or red, the kerb line is below the road line.

# --hint-tr--

Sıra önemli: bordür, sonra yol, sonra orta çizgi. Yol baştan sona beyaz ya da kırmızıysa bordür satırı yol satırının altında kalmıştır.

# --tests--

A kerb 1.15 times as wide as the road should be painted under every piece of road.
tr: Her yol parçasının altına yoldan 1.15 kat geniş bir bordür boyanmalı.

```js
$.tick(1)
const calls = $.screen()
const shapes = []
let path = []
for (const c of calls) {
  if (c.op === 'moveTo') path = [c.args]
  else if (c.op === 'lineTo') path.push(c.args)
  else if (c.op === 'fill') shapes.push({ color: c.fill, x: (path[0][0] + path[3][0]) / 2, y: path[0][1], w: path[3][0] - path[0][0] })
}
const roads = shapes.filter((s) => s.color === '#6b7280' || s.color === '#646b75')

assert.lengthOf(roads, 99)
shapes.forEach((s, i) => {
  if (!roads.includes(s)) return
  const kerb = shapes[i - 1]
  assert.include(['#f8fafc', '#dc2626'], kerb.color)
  assert.closeTo(kerb.w / s.w, 1.15, 1e-9)
})
assert.strictEqual(shapes.filter((s) => s.color === '#dc2626').length, roads.filter((r) => r.color === '#646b75').length, 'a red kerb on every dark piece')
```

Every light piece should get a thin white center line on top.
tr: Her açık parçanın üstüne ince beyaz bir orta çizgi gelmeli.

```js
$.tick(1)
const calls = $.screen()
const shapes = []
let path = []
for (const c of calls) {
  if (c.op === 'moveTo') path = [c.args]
  else if (c.op === 'lineTo') path.push(c.args)
  else if (c.op === 'fill') shapes.push({ color: c.fill, x: (path[0][0] + path[3][0]) / 2, y: path[0][1], w: path[3][0] - path[0][0] })
}
const roads = shapes.filter((s) => s.color === '#6b7280' || s.color === '#646b75')

const lightRoads = shapes.map((s, i) => [s, i]).filter(([s]) => s.color === '#6b7280')
assert.isAbove(lightRoads.length, 10)
for (const [road, i] of lightRoads) {
  const line = shapes[i + 1]
  assert.strictEqual(line.color, '#f8fafc')
  assert.closeTo(line.w / road.w, 0.03, 1e-9)
}
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
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) shown.push({ index, near, far })
  }

  // Paint from far to near, so nearer road covers what is behind it.
  for (let i = shown.length - 1; i >= 0; i--) {
    const { index, near, far } = shown[i]
    const light = Math.floor(index / 3) % 2 === 0
    quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
    if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
