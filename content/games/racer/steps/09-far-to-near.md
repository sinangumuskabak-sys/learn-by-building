---
title: Paint from far to near
title_tr: Uzaktan yakına boya
skills: [game.canvas, prog.arrays]
---

# --goal--

We paint near segments first. Later, curves bend the road behind itself and cars sit on it, so the rule must be: paint
the furthest first and the nearest last, so nearer things cover what is behind them (the painter's algorithm). We split
the work into two loops: one works out the segments, the other paints them backwards.

# --goal-tr--

Şu an parçaları **yakından uzağa** boyuyoruz. Düz yolda bunun bir zararı yok. Ama ileride virajda yol kıvrılıp kendi
arkasına geçecek, arabalar da yolun üstüne binecek. Kural şu olmalı: **önce en uzaktakini, en son en yakındakini
boya**; yakındaki, arkasındakinin üstünü örter. Ressamlar da önce arka planı boyar; adı da **ressam algoritması**.

Bunun için işi iki döngüye ayırıyoruz: ilki parçaların yerini **hesaplayıp** bir listeye koyar, ikincisi o listeyi
**sondan başa** boyar.

# --code--

```js
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
  quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
}
```

# --meaning--

- The first loop no longer paints: it collects `{ index, near, far }` for each visible segment in `shown`.
- The second loop counts down from the last element (`i--`), so the furthest segment is painted first.
- `const { index, near, far } = shown[i]` takes the three fields out of the object into three names.

# --meaning-tr--

- `const shown = []` → ekranda görünecek parçaların listesi.
- İlk döngü artık boyamıyor; her görünen parça için `shown.push({ index, near, far })` ile listeye bir nesne ekliyor.
  `{ index, near, far }`, `{ index: index, near: near, far: far }`'ın kısası.
- İkinci döngü **sondan başa** gider: `i` son elemandan (`shown.length - 1`) başlar, `i >= 0` olduğu sürece sürer,
  `i--` her turda 1 **azaltır**. Listenin sonunda en uzak parça var; demek ki önce o boyanır.
- `const { index, near, far } = shown[i]` → nesnenin üç alanını tek satırda üç ayrı ada çıkarır. Buna
  **destructuring** (paketi açmak) denir.
- `light` ve `quad` satırları aynı; sadece ikinci döngüye taşındılar.

# --task--

1. Above the first `for` write `const shown = []`.
2. In the first loop, delete the `light` and `quad` lines and write the `shown.push` line instead.
3. After the loop, leave an empty line and write the comment and the second loop.

# --task-tr--

1. İlk `for` satırının **üstüne** `const shown = []` yaz.
2. İlk döngüdeki `light` ve `if (z > 0) quad(...)` satırlarını sil; yerine `if (z > 0) shown.push({ index, near, far })`
   yaz.
3. İlk döngünün kapanış `}`'sinin altına bir boş satır bırak; yorum satırını ve ikinci döngüyü yaz.
4. **Çalıştır**.

# --predict--

What will change on screen?
- [x] Nothing
  On a straight road no piece covers another, so the order does not show yet. It will matter for curves and cars.
- [ ] The road turns upside down
- [ ] The stripes change color

# --predict-tr--

Ekranda ne değişecek?
- [x] Hiçbir şey
  Düz yolda hiçbir parça bir başkasını örtmüyor, sıra henüz belli olmuyor. Virajlarda ve arabalarda önemli olacak.
- [ ] Yol ters döner
- [ ] Şeritlerin rengi değişir

# --tests--

The road should be painted from far to near.
tr: Yol uzaktan yakına boyanmalı.

```js
$.tick(1)
const calls = $.screen()
const first = calls.findIndex((c) => c.op === 'fill')
const start = calls.slice(0, first).filter((c) => c.op === 'moveTo').pop()
assert.isBelow(start.args[1], 170, 'the first piece painted should be the far one, near the horizon')
assert.lengthOf(calls.filter((c) => c.op === 'fill'), DRAW - 1)
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
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
