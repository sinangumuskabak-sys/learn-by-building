---
title: Perspective
title_tr: Perspektif
skills: [game.canvas, game.physics]
---

# --goal--

The heart of the trick is **perspective**: something twice as far away looks half as big. A point in the world sits
`dz` in front of the camera, `dx` to the side and `dy` above it. `project` works out where that point lands on the
screen, and how wide the road looks there. Nothing new is drawn yet.

# --goal-tr--

Hilenin kalbi **perspektif**: **iki kat uzaktaki şey yarım büyüklükte görünür.** Tren raylarının uzakta birleşiyor
gibi görünmesi bu yüzden.

Dünyadaki her nokta kameraya göre bir yerde durur: `dz` kadar **önünde**, `dx` kadar **yanında**, `dy` kadar
**yukarısında**. `project` (izdüşür) fonksiyonu böyle bir noktanın **ekranda nereye düştüğünü** ve yolun orada ne kadar
geniş göründüğünü hesaplayacak. Bu adımda ekran değişmez; hesap makinesini kuruyoruz.

# --code--

```js
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}
```

# --meaning--

- `ROAD` is half the road's width and `CAMERA_HEIGHT` the camera's height, in world units.
- `DEPTH` sets the field of view: `Math.tan` wants radians, so degrees are multiplied by `Math.PI / 180`. It is about 0.84.
- `scale = DEPTH / dz` is perspective itself: twice the distance, half the scale.
- `x` starts from the middle of the screen, `y` from the horizon (`H / 2`). The road is below the camera, so `dy` will
  be negative and the point lands below the horizon, closer to it the further away it is.
- `w` is half the road's width on screen at that distance. The function returns all three in one object.

# --meaning-tr--

- `ROAD = 1000` → yolun **yarı** genişliği, dünya birimiyle (metre gibi düşün). `CAMERA_HEIGHT = 1000` → kamera yerden
  1000 birim yukarıda.
- `DEPTH` → kameranın **görüş açısını** ayarlar. `Math.tan` trigonometriden **tanjant** hesabıdır; açıyı derece değil
  **radyan** ister. `* Math.PI / 180` dereceyi radyana çevirir. Sonuç yaklaşık 0.84. Bu satırı olduğu gibi yazman
  yeterli: 100 derecelik geniş bir görüş verir.
- `const scale = DEPTH / dz` → **perspektifin kendisi**: uzaklık (`dz`) iki katına çıkınca `scale` yarıya iner.
- `x: W / 2 + scale * dx * (W / 2)` → ekranın ortasından (`W / 2`) başlar, `dx` kadar yana kayar. Uzaktaki nokta
  daha az kayar.
- `y: H / 2 - scale * dy * (H / 2)` → `H / 2` ufuk çizgisi. Yol kameranın **altında** olduğu için `dy` eksi
  (`-CAMERA_HEIGHT`) verilecek; eksi ile eksi artı yapar, nokta ufkun **altına** düşer. Uzaklaştıkça ufka yaklaşır.
- `w: scale * ROAD * (W / 2)` → o uzaklıkta yolun ekrandaki **yarı genişliği**.
- `return { x: ..., y: ..., w: ... }` → üç sonucu tek bir **nesne** (object) içinde geri verir.

# --task--

1. Under `const H = canvas.height` write the three constants.
2. Above `function draw() {` write the comment and `project`, with an empty line between.

# --task-tr--

1. `const H = canvas.height` satırının altına üç sabiti (`ROAD`, `CAMERA_HEIGHT`, `DEPTH`) yaz.
2. `function draw() {` satırının **üstüne** yorum satırını ve `project` fonksiyonunu yaz; `project`'in kapanış
   `}`'si ile `function draw() {` arasında bir boş satır kalsın.
3. **Çalıştır**: ekran aynı kalır, kontroller yeşil olmalı.

# --predict--

A piece of road 4 times as far away as another: how wide does it look?
- [ ] The same width
- [ ] Half as wide
- [x] A quarter as wide
  `scale` is `DEPTH / dz`: four times the distance, a quarter of the scale.

# --predict-tr--

Bir yol parçası diğerinden 4 kat uzakta. Ekranda ne kadar geniş görünür?
- [ ] Aynı genişlikte
- [ ] Yarı genişlikte
- [x] Dörtte bir genişlikte
  `scale` = `DEPTH / dz`: uzaklık 4 katına çıkınca ölçek dörtte birine iner.

# --tests--

`DEPTH` should give a 100 degree field of view.
tr: `DEPTH` 100 derecelik bir görüş açısı vermeli.

```js
assert.strictEqual(ROAD, 1000)
assert.strictEqual(CAMERA_HEIGHT, 1000)
assert.closeTo(DEPTH, 0.8391, 1e-4)
```

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

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
