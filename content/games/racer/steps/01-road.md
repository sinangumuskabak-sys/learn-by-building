---
title: A road drawn with perspective
title_tr: Perspektifle çizilen bir yol
skills: [game.canvas]
---

# --explanation--

Arcade racers of the eighties had no 3D hardware, yet their roads rushed towards you. The trick is **perspective
projection**: things twice as far away look half as big. A point on the road `dz` in front of the camera, `dx` to the side
and `dy` above the camera, lands on the screen at:

```js
const scale = DEPTH / dz                  // smaller when further away
x = W / 2 + scale * dx * (W / 2)
y = H / 2 - scale * dy * (H / 2)          // the camera is above the road, so dy is negative: below the horizon
```

`DEPTH` sets the field of view. The road itself is a long list of short **segments**. Each one becomes a trapezoid on the
screen: the near edge is wide and low, the far edge narrow and higher, and as the segments get further away they squeeze
towards the horizon in the middle.

Draw them **from far to near** (the painter's algorithm): nearer road is painted over whatever is behind it, so there is
never a question of what hides what. Alternating the colors every three segments (grass, red and white kerbs, road, a
center line) is what will make the road look like it is moving.

# --explanation-tr--

Seksenlerin atari yarış oyunlarında 3B donanım yoktu, yine de yolları üstüne doğru akıyordu. Hile **perspektif izdüşümüdür**:
iki kat uzaktaki şeyler yarım büyüklükte görünür. Yolda kameranın `dz` önünde, `dx` yanında ve kameranın `dy` üstündeki bir nokta
ekranda şuraya düşer:

```js
const scale = DEPTH / dz                  // uzaklaştıkça küçük
x = W / 2 + scale * dx * (W / 2)
y = H / 2 - scale * dy * (H / 2)          // kamera yolun üstünde, yani dy negatif: ufkun altında
```

`DEPTH` görüş alanını ayarlar. Yolun kendisi kısa **parçalardan** oluşan uzun bir listedir. Her biri ekranda bir yamuk olur: yakın
kenar geniş ve alçak, uzak kenar dar ve daha yüksek; parçalar uzaklaştıkça ortadaki ufka doğru sıkışır.

Onları **uzaktan yakına** çiz (ressam algoritması): yakındaki yol arkasındakinin üstüne boyanır; böylece neyin neyi örttüğü hiç
soru olmaz. Renkleri her üç parçada bir değiştirmek (çimen, kırmızı-beyaz bordürler, yol, orta çizgi) yolun hareket ediyormuş gibi
görünmesini sağlayacak şeydir.

# --task--

1. Add the constants from the solution (`SEG`, `ROAD`, `CAMERA_HEIGHT`, `DEPTH`, `DRAW`) and `buildTrack()`, which fills
   `segments` with 800 straight segments `{ curve: 0 }` and sets `trackLength`. `reset()` builds it and sets `position = 0`.
2. Write `project(dx, dy, dz)` returning `{ x, y, w }`, where `w` is the half width of the road at that distance
   (`scale * ROAD * (W / 2)`), and `quad(color, x1, y1, w1, x2, y2, w2)` that fills the trapezoid between the two edges.
3. Fill the whole canvas with a `'#7dd3fc'` sky and its lower half with `'#15803d'` ground, then work out the near and far edge of the next `DRAW` segments (skipping
   any that start behind the camera) and paint them from far to near: a grass band across the whole width, the kerb
   (1.15 × the road width), the road and, on light segments, a center line (0.03 × the width). Light segments are those with
   `Math.floor(index / 3)` even; see the solution for the colors.

# --task-tr--

1. Çözümdeki sabitleri (`SEG`, `ROAD`, `CAMERA_HEIGHT`, `DEPTH`, `DRAW`) ve `segments`'ı 800 düz parça `{ curve: 0 }` ile dolduran,
   `trackLength`'i ayarlayan `buildTrack()`'i ekle. `reset()` onu kurar ve `position = 0` yapar.
2. `{ x, y, w }` döndüren `project(dx, dy, dz)` (`w` o uzaklıkta yolun yarı genişliği: `scale * ROAD * (W / 2)`) ve iki kenar
   arasındaki yamuğu dolduran `quad(color, x1, y1, w1, x2, y2, w2)` yaz.
3. Bütün canvas'ı `'#7dd3fc'` bir gökyüzüyle, alt yarısını `'#15803d'` zeminle doldur, sonra sonraki `DRAW` parçanın yakın ve uzak kenarını hesapla (kameranın
   arkasında başlayanları atla) ve onları uzaktan yakına boya: bütün genişlikte bir çimen şeridi, bordür (yol genişliğinin
   1.15 katı), yol ve açık parçalarda bir orta çizgi (genişliğin 0.03 katı). Açık parçalar `Math.floor(index / 3)` çift olanlardır;
   renkler için çözüme bak.

# --tests--

Points further away should be drawn smaller and closer to the horizon.
tr: Daha uzaktaki noktalar daha küçük ve ufka daha yakın çizilmeli.

```js
const near = project(0, -CAMERA_HEIGHT, 1000)
const far = project(0, -CAMERA_HEIGHT, 4000)
const s = DEPTH / 1000
assert.closeTo(near.y, 160 + s * 1000 * 160, 1e-9)
assert.closeTo(near.w, s * 1000 * 240, 1e-9)
assert.closeTo(far.w, near.w / 4, 1e-9)
assert.isBelow(far.y, near.y)
assert.isAbove(far.y, 160)
assert.strictEqual(project(1000, -CAMERA_HEIGHT, 1000).x, 240 + s * 1000 * 240)
```

The road should be painted from far to near.
tr: Yol uzaktan yakına boyanmalı.

```js
$.tick(1)
const calls = $.screen()
const roads = calls.filter((c) => c.op === 'fill' && (c.fill === '#6b7280' || c.fill === '#646b75'))
assert.lengthOf(roads, DRAW - 1)
const starts = calls.filter((c, i) => c.op === 'moveTo' && calls.slice(i, i + 5).some((d) => d.op === 'fill' && (d.fill === '#6b7280' || d.fill === '#646b75')))
assert.isBelow(starts[0].args[1], starts[starts.length - 1].args[1], 'the first road drawn is the one nearest the horizon')
assert.strictEqual(trackLength, 800 * SEG)
```

# --seed--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
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
    ctx.fillStyle = light ? '#16a34a' : '#15803d'
    ctx.fillRect(0, far.y, W, near.y - far.y + 1)
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
