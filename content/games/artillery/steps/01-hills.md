---
title: The ground
title_tr: Zemin
skills: [game.canvas, prog.arrays]
---

# --goal--

We are building an artillery game like Scorched Earth: two tanks on hills lob shells at each other. First the ground.
It is a height map: a list with one number for every column of pixels, the y of the surface there. For now it is flat.

# --goal-tr--

**Scorched Earth** tarzı bir topçu oyunu yapıyoruz: tepelerdeki iki tank birbirine mermi atıyor. Sonunda nasıl
olacağını **Bitmiş hâlini gör** ile görebilirsin.

Önce zemin. Zemin bir **yükseklik haritası**: her piksel sütunu için bir sayı tutan bir liste; o sütunda yüzeyin y'si.
Şimdilik dümdüz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x

function makeGround() {
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    ground.push(y)
  }
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])
}

makeGround()
draw()
```

# --meaning--

- `W` and `H` are short names for the canvas size, used everywhere.
- `ground[x]` is where the grass starts in column `x`; everything below it is ground.
- The ground is drawn as 560 one-pixel-wide columns, from the surface down to the bottom.

# --meaning-tr--

- `W`, `H` → tuvalin genişliği ve yüksekliği için kısa adlar; her yerde kullanacağız.
- `ground[x]` → `x` sütununda çimenin başladığı y; altı hep toprak. 560 sütun, 560 sayı.
- `let y = 220` → şimdilik her sütunda aynı yükseklik. Bir sonraki adımda buraya tepeler eklenecek; o yüzden ayrı bir
  `y` değişkeni.
- `ctx.fillRect(x, ground[x], 1, H - ground[x])` → her sütunu **1 piksel genişliğinde** bir şerit olarak yüzeyden
  alta kadar boya. Sonra zemin her yerde farklı yükseklikte olacak; böyle çizmek her şekli çizer.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: mavi gökyüzü ve düz yeşil bir zemin görmelisin.

# --tests--

The ground should be a flat list of 560 heights, drawn column by column.
tr: Zemin 560 yükseklikten oluşan düz bir liste olmalı ve sütun sütun çizilmeli.

```js
assert.lengthOf(ground, W)
assert.isTrue(ground.every((y) => y === 220))
assert.lengthOf($.rects('#65a30d'), W)
assert.deepEqual($.rects('#65a30d')[0], { x: 0, y: 220, w: 1, h: 100, color: '#65a30d' })
```

# --seed--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x

function makeGround() {
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    ground.push(y)
  }
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])
}

makeGround()
draw()
```
