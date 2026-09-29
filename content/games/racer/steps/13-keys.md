---
title: Which keys are down?
title_tr: Hangi tuşlar basılı?
skills: [game.input]
---

# --goal--

The arrow keys will be the pedals. We keep the keys that are held down in an object, `keys`: `true` while a key is down,
`false` after it is released. Then `update` can ask every frame whether up is held.

# --goal-tr--

Ok tuşları pedallarımız olacak. Hangi tuşların **basılı** olduğunu `keys` (tuşlar) adlı bir nesnede tutacağız: tuşa
basılınca `true`, bırakılınca `false`. Böylece `update` her karede "yukarı ok basılı mı?" diye sorabilecek.

Ekranda bir şey değişmez; klavyeyi dinlemeye başlıyoruz.

# --code--

```js
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the function whenever a key is pressed; `event.key` is its name, like
  `'ArrowUp'`.
- `keys[event.key] = true` writes into the field with that name; `keyup` writes `false`.
- `preventDefault()` stops the arrow keys from scrolling the page.

# --meaning-tr--

- `const keys = {}` → boş bir nesne. Tuş adları içine alan olarak eklenecek.
- `document.addEventListener('keydown', (event) => { ... })` → "bir tuşa basılınca şu fonksiyonu çalıştır". Tarayıcı
  fonksiyona olayı anlatan bir `event` (olay) nesnesi verir.
- `event.key` → basılan tuşun adı: `'ArrowUp'`, `'ArrowDown'`, `'a'`...
- `keys[event.key] = true` → köşeli parantez, adı bir değişkenden gelen alana yazar. `keys['ArrowUp'] = true` ile
  `keys.ArrowUp = true` aynı şey.
- `event.key.startsWith('Arrow')` → "ad `Arrow` ile mi başlıyor?" Öyleyse `event.preventDefault()` tarayıcının kendi
  işini, yani **sayfayı kaydırmayı** engeller.
- `'keyup'` → tuş bırakılınca; o tuşa `false` yazar.

# --task--

1. Under `let speed` write `const keys = {}`.
2. Above `function update() {` write the two listeners, followed by an empty line.

# --task-tr--

1. `let speed` satırının altına `const keys = {}` yaz.
2. `function update() {` satırının **üstüne** iki olay dinleyicisini (`keydown` ve `keyup`) yaz; `update` ile arada bir
   boş satır kalsın.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

Pressing and releasing a key should be recorded in `keys`.
tr: Tuşa basmak ve bırakmak `keys` içine yazılmalı.

```js
$.press('ArrowUp')
assert.isTrue(keys.ArrowUp)
$.release('ArrowUp')
assert.isFalse(keys.ArrowUp)
$.press('ArrowLeft')
assert.isTrue(keys.ArrowLeft)
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
const keys = {}

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

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

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
