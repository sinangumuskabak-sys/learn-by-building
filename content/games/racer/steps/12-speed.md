---
title: Moving is one number
title_tr: Hareket tek bir sayı
skills: [game.state, game.physics]
---

# --goal--

Everything in `draw` is worked out from `position`. Make `position` a little bigger every frame and the segments slide
towards you: the road moves. How much bigger is the `speed`. `update` does this, and wraps back to the start at the end
of the track: the track is a loop.

# --goal-tr--

Yol nasıl hareket edecek? Dikkat et: `draw` içindeki her şey `position`'a göre hesaplanıyor. `position`'ı her karede
biraz büyütürsek parçalar sana doğru kayar ve yol **akar**. Araba aslında yerinde duruyor; değişen tek şey bir sayı.

Her karede ne kadar büyüyeceğini `speed` (hız) söyleyecek. Bu işi `update` (güncelle) fonksiyonu yapacak. Pistin
sonuna gelince de başa dönecek: pist bir **tur**.

# --code--

```js
let speed

  speed = 0

function update() {
  position += speed
  if (position >= trackLength) position -= trackLength
}
```

# --meaning--

- `speed` is how many units we move per frame; `reset` sets it to 0.
- `position += speed` adds the speed to the position.
- Past the end of the track, subtracting `trackLength` brings the camera back near the start.

# --meaning-tr--

- `let speed` → hız: her karede kaç birim ilerlediğimiz. `reset` içindeki `speed = 0` ile yarış duran arabayla başlar.
- `position += speed` → `position = position + speed`'in kısası: konuma hızı ekle.
- `if (position >= trackLength) position -= trackLength` → pistin sonunu geçtiysek pist uzunluğunu çıkar; araba başa
  döner. `-=` çıkarıp sonucu aynı değişkene yazar. Tek satırlık `if`'te süslü paranteze gerek yok.

# --task--

1. Under `let position` write `let speed`.
2. In `reset`, under `position = 0`, write `speed = 0`.
3. Under `reset`, above the `// Perspective` comment, write `update`, followed by an empty line.

# --task-tr--

1. `let position ...` satırının altına `let speed` yaz.
2. `reset` içinde `position = 0` satırının altına `speed = 0` yaz.
3. `reset` fonksiyonunun altına, `// Perspective: ...` yorumunun **üstüne** `update` fonksiyonunu yaz; altında bir boş
   satır kalsın.
4. **Çalıştır**.

# --predict--

Will the road move after Run?
- [ ] Yes, slowly
- [x] No
  `speed` is 0, and nothing calls `update()` yet.
- [ ] Yes, but backwards

# --predict-tr--

Çalıştır'a basınca yol hareket edecek mi?
- [ ] Evet, yavaşça
- [x] Hayır
  `speed` 0 ve `update()`'i henüz kimse çağırmıyor.
- [ ] Evet, ama geriye doğru

# --tests--

`update()` should move the camera forward by `speed`.
tr: `update()` kamerayı `speed` kadar ileri taşımalı.

```js
assert.strictEqual(speed, 0)
speed = 30
update()
assert.strictEqual(position, 30)
```

Past the end of the track, the camera should come back to the start.
tr: Pistin sonu geçilince kamera başa dönmeli.

```js
position = trackLength - 10
speed = 30
update()
assert.strictEqual(position, 20)
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
let speed

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
  speed = 0
}

function update() {
  position += speed
  if (position >= trackLength) position -= trackLength
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
