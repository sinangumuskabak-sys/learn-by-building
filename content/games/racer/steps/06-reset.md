---
title: Where we are on the track
title_tr: Pistte neredeyiz?
skills: [game.state]
---

# --goal--

How far the car has driven is a single number, `position`. A `reset` function puts the game at the start: it builds
the track and sets `position` to 0. Later a new race will call the same function.

# --goal-tr--

Arabanın pistte **ne kadar ilerlediğini** tek bir sayı tutacak: `position` (konum). Başlangıçta 0; araba ilerledikçe
büyüyecek.

Oyunu başa almak için bir de `reset` (sıfırla) fonksiyonu yazıyoruz: pisti kurar ve `position`'ı 0 yapar. İleride yeni
bir yarış başlatmak için de aynı fonksiyonu çağıracağız; oyunun başlangıç hâli tek bir yerde durur.

# --code--

```js
let position // how far along the track the camera is

function reset() {
  buildTrack()
  position = 0
}

reset()
```

# --meaning--

- `position` is the distance the camera has come along the track.
- `reset` builds the track and puts the camera at the start. The call at the bottom now uses `reset()`.

# --meaning-tr--

- `let position` → kameranın pist boyunca geldiği **uzaklık**.
- `function reset()` → oyunun **başlangıç hâli**: pisti kur (`buildTrack()`), en başa koy (`position = 0`).
- En alttaki çağrı artık `buildTrack()` değil `reset()`: pisti o da kuruyor, üstüne konumu da ayarlıyor.

# --task--

1. Under `let trackLength` write `let position`.
2. Under `buildTrack`, after an empty line, write `reset`.
3. Change the `buildTrack()` call at the bottom to `reset()`.

# --task-tr--

1. `let trackLength` satırının altına `let position ...` satırını yaz.
2. `buildTrack` fonksiyonunun kapanış `}`'sinin altına bir boş satır bırakıp `reset` fonksiyonunu yaz.
3. En alttaki `buildTrack()` satırını `reset()` yap.
4. **Çalıştır**: ekran yine değişmez, kontroller yeşil olmalı.

# --tests--

`position` should start at 0.
tr: `position` 0'dan başlamalı.

```js
assert.strictEqual(position, 0)
```

`reset()` should build the track and go back to the start.
tr: `reset()` pisti kurmalı ve başa dönmeli.

```js
segments = []
position = 999
reset()
assert.lengthOf(segments, 800)
assert.strictEqual(position, 0)
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

  const near = project(0, -CAMERA_HEIGHT, 1000)
  const far = project(0, -CAMERA_HEIGHT, 3000)
  quad('#6b7280', near.x, near.y, near.w, far.x, far.y, far.w)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
