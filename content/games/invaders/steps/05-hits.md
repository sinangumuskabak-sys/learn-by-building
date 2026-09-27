---
title: Hits and points
title_tr: İsabetler ve puanlar
skills: [game.collision, prog.arrays]
---

# --explanation--

A bullet that overlaps a living invader destroys it. That is a box test between every bullet and every invader:
**nested loops over two lists**. For each bullet, `find` the first living invader it overlaps.

When a bullet hits, **both** are used up: the invader is marked dead, and the bullet must not go on to hit the invader
behind it. The simplest trick is to move the used bullet off the top of the screen; the `filter` that already removes
off-screen bullets then throws it away. Reusing an existing cleanup instead of writing a second removal path keeps the
code short and hard to get wrong.

Top rows are harder to reach, so they are worth more: `ROW_POINTS[invader.row]`, the same lookup-by-row idea as the
colors.

With 45 invaders and a few bullets, checking every pair is only a hundred or so tests per frame, nothing for a
computer. With thousands of objects, games switch to smarter spatial structures, but the idea of the test stays the
same.

# --explanation-tr--

Canlı bir istilacıyla kesişen bir mermi onu yok eder. Bu, her mermiyle her istilacı arasında bir kutu testidir: **iki
liste üzerinde iç içe döngüler**. Her mermi için kesiştiği ilk canlı istilacıyı `find` ile bul.

Bir mermi isabet ettiğinde **ikisi de** harcanır: istilacı ölü olarak işaretlenir ve mermi arkasındaki istilacıya
çarpmaya devam etmemeli. En basit hile, kullanılmış mermiyi ekranın tepesinin dışına taşımaktır; ekran dışı mermileri
zaten kaldıran `filter` onu atar. İkinci bir silme yolu yazmak yerine var olan bir temizliği yeniden kullanmak kodu kısa
ve hataya kapalı tutar.

Üst sıralara ulaşmak daha zordur, bu yüzden daha değerlidirler: `ROW_POINTS[invader.row]`, renklerdeki satıra göre
arama fikrinin aynısı.

45 istilacı ve birkaç mermiyle her çifti kontrol etmek karede yalnızca yüz kadar test eder; bir bilgisayar için hiçbir
şey. Binlerce nesnede oyunlar daha akıllı uzamsal yapılara geçer, ama testin fikri aynı kalır.

# --task--

1. Add `ROW_POINTS = [30, 20, 20, 10, 10]`, `let score = 0` and an `overlaps(a, b)` box test.
2. In `update()`, after moving the bullets: for each bullet, find the first living invader it overlaps; if there is
   one, mark it dead, move the bullet to `y = -100`, and add `ROW_POINTS[invader.row]` to the score. (Do this before the
   off-screen `filter`.)
3. Draw `SCORE 120` (the real number) in white `'bold 16px monospace'`, left-aligned at `(10, 24)`.

# --task-tr--

1. `ROW_POINTS = [30, 20, 20, 10, 10]`, `let score = 0` ve bir `overlaps(a, b)` kutu testi ekle.
2. `update()` içinde mermileri taşıdıktan sonra: her mermi için kesiştiği ilk canlı istilacıyı bul; varsa onu ölü yap,
   mermiyi `y = -100`'e taşı ve skora `ROW_POINTS[invader.row]` ekle. (Bunu ekran dışı `filter`'ından önce yap.)
3. `(10, 24)` noktasına sola hizalı, beyaz `'bold 16px monospace'` ile `SCORE 120` (gerçek sayı) yaz.

# --tests--

A bullet should destroy the invader it hits and score its row's points.
tr: Bir mermi çarptığı istilacıyı yok etmeli ve satırının puanını kazandırmalı.

```js
const target = invaders[40] // bottom row
bullets = [{ x: target.x + 10, y: target.y + 25, w: 4, h: 12 }]
update()
assert.isFalse(target.alive)
assert.strictEqual(score, 10)
assert.lengthOf(bullets, 0, 'the bullet is used up')
```

A bullet should only destroy one invader.
tr: Bir mermi yalnızca bir istilacıyı yok etmeli.

```js
const front = invaders[40]
const behind = invaders[31]
bullets = [{ x: front.x + 10, y: front.y + 25, w: 4, h: 12 }]
update()
update()
update()
update()
update()
update()
assert.isFalse(front.alive)
assert.isTrue(behind.alive)
```

Top rows should be worth more, and the score should be shown.
tr: Üst sıralar daha değerli olmalı ve skor gösterilmeli.

```js
const top = invaders[4]
bullets = [{ x: top.x + 10, y: top.y + 25, w: 4, h: 12 }]
update()
assert.strictEqual(score, 30)
draw()
assert.include($.texts(), 'SCORE 30')
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8
const COOLDOWN = 350 // milliseconds between shots
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_POINTS = [30, 20, 20, 10, 10]
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let invaders = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
  }
}
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0
let score = 0
let now = 0
const keys = {}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

function stepInterval() {
  return 500
}

function march() {
  const living = alive()
  const left = Math.min(...living.map((invader) => invader.x))
  const right = Math.max(...living.map((invader) => invader.x + invader.w))
  if ((dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)) {
    for (const invader of living) invader.y += 16
    dir = -dir
  } else {
    for (const invader of living) invader.x += 10 * dir
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
      score += ROW_POINTS[hit.row]
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
  }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
