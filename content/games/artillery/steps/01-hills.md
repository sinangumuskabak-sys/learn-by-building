---
title: Hills from sine waves
title_tr: Sinüs dalgalarından tepeler
skills: [prog.arrays, game.canvas]
---

# --explanation--

In an artillery game two tanks stand on hills and take turns lobbing shells at each other. First, the hills.

The ground is a **height map**: one number per column of pixels, `ground[x]`, the y of the surface there. Drawing it is one thin
rectangle per column, from the surface down to the bottom.

Where do natural-looking hills come from? One sine wave gives regular bumps, like a corrugated roof. But **adding** a few sine waves
of different sizes and lengths, each shifted by a random amount, gives hills that look irregular and are still smooth:

```js
let y = 220
for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
```

The big slow wave makes the valleys, the small quick ones the bumps on top. Every game gets new random waves and a new landscape.
The result is clamped so hills are never too tall or too low.

The tanks stand on the surface: a tank's `y` is just `ground` at its `x`. `groundAt(x)` rounds `x` and keeps it on the canvas,
since shells will ask about any position at all.

# --explanation-tr--

Bir topçu oyununda iki tank tepelerin üstünde durur ve sırayla birbirlerine mermi atar. Önce tepeler.

Zemin bir **yükseklik haritasıdır**: piksel sütunu başına bir sayı, `ground[x]`, oradaki yüzeyin y'si. Onu çizmek, yüzeyden en alta
kadar sütun başına ince bir dikdörtgendir.

Doğal görünen tepeler nereden gelir? Tek bir sinüs dalgası oluklu bir çatı gibi düzenli tümsekler verir. Ama her biri rastgele
kaydırılmış, farklı boyut ve uzunlukta birkaç sinüs dalgasını **toplamak**, düzensiz görünen ama yine de yumuşak tepeler verir:

```js
let y = 220
for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
```

Büyük yavaş dalga vadileri, küçük hızlılar üstteki tümsekleri yapar. Her oyun yeni rastgele dalgalar ve yeni bir manzara alır.
Sonuç, tepeler asla çok yüksek ya da çok alçak olmasın diye sınırlanır.

Tanklar yüzeyde durur: bir tankın `y`'si yalnızca `x`'indeki `ground`'dur. Mermiler her konumu soracağı için `groundAt(x)`, `x`'i
yuvarlar ve canvas üstünde tutar.

# --task--

1. Add `W = canvas.width` and `H = canvas.height`. Write `makeGround()`: three waves `n = 1, 2, 3` with
   `size = (30 / n) * (0.5 + Math.random())`, `length = W / (n + Math.random())` and `shift = Math.random() * W`; for each `x` add
   them to 220 as above and clamp between 120 and `H - 20`.
2. Write `groundAt(x)`: `ground` at `Math.round(x)`, with `x` kept between 0 and `W - 1`.
3. In `reset()`, make the ground and two tanks, `{ x: 70, color: '#2563eb' }` and `{ x: W - 70, color: '#dc2626' }`, each with `y` on
   the ground.
4. Draw the sky `'#7dd3fc'`, a `'#65a30d'` column 1 wide from `ground[x]` to the bottom for every `x`, and each tank as a 20 by 8
   rectangle standing on its point (`t.x - 10`, `t.y - 8`).

# --task-tr--

1. `W = canvas.width` ve `H = canvas.height` ekle. `makeGround()` yaz: `n = 1, 2, 3` için `size = (30 / n) * (0.5 + Math.random())`,
   `length = W / (n + Math.random())` ve `shift = Math.random() * W` olan üç dalga; her `x` için onları yukarıdaki gibi 220'ye ekle
   ve 120 ile `H - 20` arasında sınırla.
2. `groundAt(x)` yaz: `x` 0 ile `W - 1` arasında tutularak `Math.round(x)`'teki `ground`.
3. `reset()`'te zemini ve her birinin `y`'si zeminde olan iki tankı yap: `{ x: 70, color: '#2563eb' }` ve
   `{ x: W - 70, color: '#dc2626' }`.
4. Gökyüzünü `'#7dd3fc'`, her `x` için `ground[x]`'ten en alta 1 genişliğinde `'#65a30d'` bir sütunu ve her tankı noktasının üstünde
   duran (`t.x - 10`, `t.y - 8`) 20'ye 8 bir dikdörtgen olarak çiz.

# --tests--

The ground should be smooth hills within limits, new every time.
tr: Zemin sınırlar içinde yumuşak tepeler olmalı ve her seferinde yeni olmalı.

```js
assert.lengthOf(ground, W)
for (const y of ground) {
  assert.isAtLeast(y, 120)
  assert.isAtMost(y, H - 20)
}
for (let x = 1; x < W; x++) assert.isBelow(Math.abs(ground[x] - ground[x - 1]), 3, 'smooth hills, no cliffs')
const first = ground.join()
makeGround()
assert.notStrictEqual(ground.join(), first, 'new hills every time')
```

The tanks should sit on the ground, and `groundAt` should stay on the canvas.
tr: Tanklar zeminde durmalı ve `groundAt` canvas üstünde kalmalı.

```js
for (const t of tanks) assert.strictEqual(t.y, groundAt(t.x), 'the tanks sit on the ground')
assert.strictEqual(tanks[0].x, 70)
assert.strictEqual(tanks[1].x, W - 70)
assert.strictEqual(groundAt(-5), ground[0], 'off the left edge: the first column')
assert.strictEqual(groundAt(9999), ground[W - 1])
assert.strictEqual(groundAt(10.4), ground[10])
```

The ground should be drawn one column per x, and the tanks on it.
tr: Zemin x başına bir sütun olarak, tanklar da üstünde çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#65a30d'), { x: 0, y: ground[0], w: 1, h: H - ground[0], color: '#65a30d' })
assert.lengthOf($.rects('#65a30d'), W, 'one column per x')
assert.deepInclude($.rects('#2563eb'), { x: 60, y: tanks[0].y - 8, w: 20, h: 8, color: '#2563eb' })
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
let tanks // [blue, red]: { x, y, color }

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, color: '#2563eb' },
    { x: W - 70, y: 0, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
