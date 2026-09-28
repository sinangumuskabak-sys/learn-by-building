---
title: Light and shade
title_tr: Işık ve gölge
skills: [game.canvas]
---

# --explanation--

With one flat color per wall, corners disappear: two walls meeting at a corner are the same color, so you cannot tell
where one ends. Two cheap tricks give the picture depth:

- **Side shading.** Walls facing north or south (`side === 'y'`) are drawn at 70% brightness. Corners become visible at
  once, as if light came from one direction.
- **Distance fog.** Everything gets darker with distance, down to a minimum of 25%: `1 - dist / 12`. Far corridors fade
  into the dark, which makes distances easy to judge and hides how small the map really is.

Both are just a multiplier on the red, green and blue values. Multiply, round, and build the `'rgb(...)'` string:

```js
const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
```

Tricks like these are how early 3D games looked good on very slow computers: no real lighting, just a number per column.

# --explanation-tr--

**Bu adımda:** duvarlara ışık ve gölge vereceğiz. Köşeler belirginleşecek (bazı yüzler daha koyu olacak) ve uzaktaki
koridorlar karanlığa karışacak; görüntü çok daha derin görünecek.

**Sorun:** her duvarın tek düz rengi olunca köşeler kaybolur. Köşede buluşan iki duvar aynı renkte olduğu için
birinin nerede bitip ötekinin nerede başladığını göremezsin. İki ucuz hile görüntüye derinlik verir:

- **Yüz gölgesi.** Kuzeye ya da güneye bakan duvarlar (`side === 'y'`, yani ışının yatay çizgiye çarptığı yüzler)
  %70 parlaklıkla çizilir. Işık tek bir yönden geliyormuş gibi köşeler hemen görünür olur.
- **Uzaklık sisi.** Her şey uzaklaştıkça kararır, en az %25'e kadar: `1 - dist / 12`. Uzaklık 0 iken 1 (tam
  parlak), 6 iken 0.5, 9'dan sonra 0.25'te kalır. Uzak koridorlar karanlıkta kaybolur; bu hem uzaklığı tahmin
  etmeyi kolaylaştırır hem de haritanın aslında ne kadar küçük olduğunu gizler.

İkisi de kırmızı, yeşil ve mavi değerlerini çarptığımız tek bir sayıdır (`light`, ışık):

```js
const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
```

`Math.max(0.25, ...)` iki sayıdan büyüğünü seçer; böylece ışık 0.25'in altına inmez. Rengin her parçasını `light`
ile çarparız, `Math.round` ile en yakın tam sayıya yuvarlarız (`Math.round(104.6)` → `105`; renk değerleri tam sayı
olmalı) ve `'rgb(...)'` yazısını kurarız.

**`return` ile değer döndüren fonksiyon.** `shade(hit, dist)` bir renk yazısı hesaplar ve `return` ile geri verir.
Çağıran yer bu cevabı doğrudan kullanır: `ctx.fillStyle = shade(hit, dist)`.

Eski 3D oyunlar çok yavaş bilgisayarlarda böyle hilelerle güzel görünürdü: gerçek bir ışıklandırma yok, sütun başına
tek bir sayı.

# --task--

1. Write `shade(hit, dist)` returning `'rgb(r, g, b)'`: the wall's color times `light` as above, each part rounded with
   `Math.round`.
2. Draw each column with `shade(hit, dist)`, using the corrected distance.

# --task-tr--

1. `draw()` fonksiyonunun **hemen üstüne** (`function draw() {` satırından önce) gölge fonksiyonunu yaz:

   ```js
   function shade(hit, dist) {
     // Walls facing north or south are a little darker, and everything fades with distance.
     const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
     const [r, g, b] = COLORS[hit.tile]
     return 'rgb(' + Math.round(r * light) + ', ' + Math.round(g * light) + ', ' + Math.round(b * light) + ')'
   }

   ```

2. `draw()`'daki sütun döngüsünde şu iki satırı sil:

   ```js
       const [r, g, b] = COLORS[hit.tile]
       ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')'
   ```

   ve yerine tek satır yaz. Döngü şöyle olmalı:

   ```js
     for (let i = 0; i < RAYS; i++) {
       const angle = player.angle - FOV / 2 + (FOV * (i + 0.5)) / RAYS
       const hit = castRay(angle)
       // The distance straight ahead, not along the ray: otherwise flat walls bulge (the fish-eye effect).
       const dist = hit.dist * Math.cos(angle - player.angle)
       const h = Math.min(H * 3, PROJECTION / dist)
       ctx.fillStyle = shade(hit, dist) // ← değişti
       ctx.fillRect(i * COLUMN, (H - h) / 2, COLUMN, h)
     }
   ```

   `shade`'e düzeltilmiş uzaklık `dist`'i veriyoruz, `hit.dist`'i değil.

3. **Çalıştır**'a bas. Duvarlar uzaklaştıkça kararmalı ve köşelerde bir yüz ötekinden koyu görünmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Renk kontrolü kırmızıysa `'rgb('` ve `', '` içindeki boşlukları karşılaştır.

# --tests--

Walls should get darker with distance, down to a quarter.
tr: Duvarlar mesafeyle bir çeyreğe kadar koyulaşmalı.

```js
assert.strictEqual(shade({ side: 'x', tile: '#' }, 0), 'rgb(148, 163, 184)')
assert.strictEqual(shade({ side: 'x', tile: '#' }, 3.5), 'rgb(105, 115, 130)')
assert.strictEqual(shade({ side: 'x', tile: '#' }, 20), 'rgb(37, 41, 46)')
```

North and south faces should be darker than east and west ones.
tr: Kuzey ve güney yüzler doğu ve batı yüzlerden koyu olmalı.

```js
assert.strictEqual(shade({ side: 'y', tile: '#' }, 1), 'rgb(95, 105, 118)')
assert.strictEqual(shade({ side: 'x', tile: '2' }, 3), 'rgb(139, 68, 45)')
```

The view should use the shading.
tr: Görünüm gölgelendirmeyi kullanmalı.

```js
$.tick(1)
const columns = $.rects().filter((r) => r.w === 2)
assert.strictEqual(columns[120].color, 'rgb(105, 115, 130)')
assert.isTrue(columns.some((c) => c.color !== columns[120].color), 'not all columns alike')
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const COLORS = { '#': [148, 163, 184], 2: [185, 90, 60], E: [34, 197, 94] }
const FOV = Math.PI / 3 // 60 degrees
const RAYS = 240 // one ray for every 2 pixels across
const COLUMN = canvas.width / RAYS
// How far the screen is from the eye, in pixels, so that the view is exactly FOV wide.
const PROJECTION = canvas.width / 2 / Math.tan(FOV / 2)
const MOVE = 0.05 // tiles per frame
const TURN = 0.04 // radians per frame
const RADIUS = 0.2 // how close the player can get to a wall
const MINI = 8 // minimap pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function tileAt(x, y) {
  return MAP[Math.floor(y)][Math.floor(x)]
}

// Is any corner of the player's little square inside a wall?
function blocked(x, y) {
  for (const [cx, cy] of [[-RADIUS, -RADIUS], [RADIUS, -RADIUS], [-RADIUS, RADIUS], [RADIUS, RADIUS]]) {
    if (tileAt(x + cx, y + cy) !== '.') return true
  }
  return false
}

// Moving each axis on its own lets the player slide along a wall instead of sticking to it.
function move(dx, dy) {
  if (!blocked(player.x + dx, player.y)) player.x += dx
  if (!blocked(player.x, player.y + dy)) player.y += dy
}

// Walk the grid line by line (DDA) until the ray enters a wall tile.
function castRay(angle) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  let col = Math.floor(player.x)
  let row = Math.floor(player.y)
  const stepX = dx > 0 ? 1 : -1
  const stepY = dy > 0 ? 1 : -1
  // How far along the ray one whole tile across (or down) is.
  const deltaX = Math.abs(1 / dx)
  const deltaY = Math.abs(1 / dy)
  // How far along the ray the next vertical (or horizontal) grid line is.
  let nextX = (dx > 0 ? col + 1 - player.x : player.x - col) * deltaX
  let nextY = (dy > 0 ? row + 1 - player.y : player.y - row) * deltaY
  while (true) {
    let dist
    let side
    if (nextX < nextY) {
      dist = nextX
      nextX += deltaX
      col += stepX
      side = 'x'
    } else {
      dist = nextY
      nextY += deltaY
      row += stepY
      side = 'y'
    }
    const tile = MAP[row][col]
    if (tile !== '.') return { dist, side, tile, x: player.x + dx * dist, y: player.y + dy * dist }
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle to walk.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

function shade(hit, dist) {
  // Walls facing north or south are a little darker, and everything fades with distance.
  const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
  const [r, g, b] = COLORS[hit.tile]
  return 'rgb(' + Math.round(r * light) + ', ' + Math.round(g * light) + ', ' + Math.round(b * light) + ')'
}

function draw() {
  const H = canvas.height
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, H / 2)
  ctx.fillStyle = '#475569'
  ctx.fillRect(0, H / 2, canvas.width, H / 2)

  for (let i = 0; i < RAYS; i++) {
    const angle = player.angle - FOV / 2 + (FOV * (i + 0.5)) / RAYS
    const hit = castRay(angle)
    // The distance straight ahead, not along the ray: otherwise flat walls bulge (the fish-eye effect).
    const dist = hit.dist * Math.cos(angle - player.angle)
    const h = Math.min(H * 3, PROJECTION / dist)
    ctx.fillStyle = shade(hit, dist)
    ctx.fillRect(i * COLUMN, (H - h) / 2, COLUMN, h)
  }

  // The minimap, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
