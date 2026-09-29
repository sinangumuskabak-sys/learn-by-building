---
title: A road made of segments
title_tr: Parçalardan bir yol
skills: [prog.arrays, prog.loops]
---

# --goal--

One piece is not a road. The track will be a list of 800 short **segments**, 200 units each, laid end to end. Later
each segment also gets a `curve`; for now they are all straight. Nothing changes on screen: we build the track in memory.

# --goal-tr--

Tek parça yol olmaz. Pist, uç uca dizilmiş 200'er birimlik **800 kısa parçadan** (segment) oluşan bir **liste** olacak.
İleride her parçaya bir **kıvrım** (`curve`) bilgisi de vereceğiz; şimdilik hepsi düz.

Bu adımda ekran değişmez: pisti bellekte kuruyoruz, çizimini sonraki adımlarda yapacağız.

# --code--

```js
const SEG = 200 // length of one road segment, in world units

let segments // the track: { curve } for each segment
let trackLength

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

buildTrack()
```

# --meaning--

- `segments` and `trackLength` are variables that `buildTrack` fills.
- `const add = (count, curve) => { ... }` is an arrow function, a short way to write a function.
- The `for` loop runs `count` times and `push` adds `{ curve }` (short for `{ curve: curve }`) to the end of the list.
- `trackLength` is 800 × 200. The last line builds the track once.

# --meaning-tr--

- `SEG = 200` → bir parçanın uzunluğu.
- `let segments` ve `let trackLength` → değeri sonra verilecek iki **değişken**: parça listesi ve pistin toplam uzunluğu.
- `segments = []` → boş bir **liste** (dizi, array).
- `const add = (count, curve) => { ... }` → **ok fonksiyonu**: `function`'ın kısa yazılışı. `=>` "şunu yap" diye
  okunur. `add(800, 0)` "800 parça ekle, kıvrımları 0" demek.
- `for (let i = 0; i < count; i++)` → **döngü**: `i` 0'dan başlar, `count`'tan küçük olduğu sürece tekrarlar, her
  turda 1 artar (`i++`). Yani tam `count` kez.
- `segments.push({ curve })` → listenin **sonuna** bir parça ekler. `{ curve }`, `{ curve: curve }`'nin kısası:
  kıvrım bilgisini taşıyan küçük bir nesne.
- `trackLength = segments.length * SEG` → `length` listedeki eleman sayısı: 800 × 200 = 160 000.
- En alttaki `buildTrack()` → fonksiyonu **çağırıp** pisti kurar.

# --task--

1. Under `const H = canvas.height` write the `SEG` line.
2. Under the `DEPTH` line leave an empty line, then write the two `let` lines, the comment and `buildTrack`.
3. Above the last line, `requestAnimationFrame(loop)`, write `buildTrack()`.

# --task-tr--

1. `const H = canvas.height` satırının altına `SEG` satırını yaz.
2. `const DEPTH = ...` satırının altına bir boş satır bırak; iki `let` satırını, bir boş satırdan sonra yorum satırını
   ve `buildTrack` fonksiyonunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `buildTrack()` yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

The track should have 800 straight segments.
tr: Pistte 800 düz parça olmalı.

```js
assert.lengthOf(segments, 800)
assert.isTrue(segments.every((s) => s.curve === 0))
```

`trackLength` should be the length of the whole track.
tr: `trackLength` bütün pistin uzunluğu olmalı.

```js
assert.strictEqual(trackLength, 800 * SEG)
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

let segments // the track: { curve } for each segment
let trackLength

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
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

  const near = project(0, -CAMERA_HEIGHT, 1000)
  const far = project(0, -CAMERA_HEIGHT, 3000)
  quad('#6b7280', near.x, near.y, near.w, far.x, far.y, far.w)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

buildTrack()
requestAnimationFrame(loop)
```
