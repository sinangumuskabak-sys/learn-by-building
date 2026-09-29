---
title: One piece of road
title_tr: Bir parça yol
skills: [game.canvas]
---

# --goal--

On screen the road is made of trapezoids: the near edge wide and low, the far edge narrow and higher up. `quad` paints
one. To try it, we draw the piece of road from 1000 to 3000 units in front of the camera.

# --goal-tr--

Yol ekranda **yamuklardan** oluşacak: yakın kenarı geniş ve aşağıda, uzak kenarı dar ve yukarıda. `quad` (dörtgen)
fonksiyonu böyle bir yamuğu boyayacak.

Denemek için kameranın 1000 ile 3000 birim önündeki bir yol parçasını çizeceğiz. `project` ilk kez işe yarıyor: iki
kenarın ekrandaki yerini o hesaplıyor.

# --code--

```js
function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

  const near = project(0, -CAMERA_HEIGHT, 1000)
  const far = project(0, -CAMERA_HEIGHT, 3000)
  quad('#6b7280', near.x, near.y, near.w, far.x, far.y, far.w)
```

# --meaning--

- `quad` takes the middle and half width of a near edge (`x1, y1, w1`) and of a far edge (`x2, y2, w2`).
- `beginPath` starts a shape, `moveTo` puts the pen on the first corner, each `lineTo` draws to the next corner, and
  `fill` paints the inside.
- `near` and `far` are the two edges of the test piece, projected to the screen.

# --meaning-tr--

- `quad(color, x1, y1, w1, x2, y2, w2)` → yakın kenarın ortası `(x1, y1)` ve yarı genişliği `w1`; uzak kenarın ortası
  `(x2, y2)` ve yarı genişliği `w2`.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.moveTo(x1 - w1, y1)` → kalemi kaldırıp ilk köşeye (yakın kenarın soluna) koy.
- `ctx.lineTo(...)` → oradan bir sonraki köşeye çizgi çek. Sırayla: uzak sol, uzak sağ, yakın sağ.
- `ctx.fill()` → dört köşenin çevirdiği şeklin içini `fillStyle` rengiyle boya.
- `near` ve `far` → yolun ortasındaki iki noktanın (1000 ve 3000 birim ileride) ekrandaki yeri. `near.x`, `near.y`,
  `near.w` o nesnenin içindeki değerler.

# --task--

1. Above `function draw() {` write `quad`, with an empty line between.
2. In `draw`, under the green ground line, leave an empty line and write the three test lines.

# --task-tr--

1. `quad` fonksiyonunu `function draw() {` satırının **üstüne** yaz; arada bir boş satır kalsın.
2. `draw` içinde, zemini boyayan `ctx.fillRect(0, H / 2, W, H / 2)` satırının altına bir boş satır bırak ve üç deneme
   satırını yaz.
3. **Çalıştır**: yeşil zeminin üstünde, ufka doğru daralan gri bir yamuk görmelisin.

# --hint--

Nothing appears? `fill()` is what actually paints the shape; check it is the last line of `quad`.

# --hint-tr--

Bir şey görünmüyor mu? Şekli asıl boyayan `fill()`; `quad`'ın son satırında olduğunu kontrol et.

# --try--

Change `3000` to `10000`: the far edge moves up towards the horizon and gets narrower. Put 3000 back.

# --try-tr--

`3000`'i `10000` yap: uzak kenar ufka doğru yükselip daralır. Sonra 3000'e geri al.

# --tests--

`quad` should draw the four corners of the trapezoid and fill it.
tr: `quad` yamuğun dört köşesini çizip içini boyamalı.

```js
quad('red', 100, 200, 50, 120, 100, 20)
const path = $.screen().filter((c) => c.op === 'moveTo' || c.op === 'lineTo').map((c) => c.args)
assert.deepEqual(path, [[50, 200], [100, 100], [140, 100], [150, 200]])
assert.strictEqual($.screen().filter((c) => c.op === 'fill')[0].fill, 'red')
```

A gray piece of road should be drawn every frame.
tr: Her karede gri bir yol parçası çizilmeli.

```js
$.tick(1)
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === '#6b7280'))
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
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view

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

requestAnimationFrame(loop)
```
