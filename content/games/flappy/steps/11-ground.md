---
title: The ground and the sky
title_tr: Yer ve gök
skills: [game.collision, game.state]
---

# --goal--

When the bird's bottom edge reaches the ground, or its top edge the top of the screen, the game is over: the state
becomes `'over'`, everything freezes, and flapping does nothing.

# --goal-tr--

Kuş yere çakılınca oyun bitmeli; ekranın tepesinden çıkmak da yasak. İkisinde de durum `'over'` (bitti) olur ve her şey
donar.

`bird.y` dairenin **merkezi**. Kuşun alt kenarı merkezden bir yarıçap aşağıda: `bird.y + bird.r`. Üst kenarı bir
yarıçap yukarıda: `bird.y - bird.r`. Zemin canvas'ın en alt çizgisi: `canvas.height` (600).

# --code--

```js
function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

  bird.y += bird.vy

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
```

# --meaning--

- `>=` means "greater than or equal", `<=` "less than or equal". Each comparison is `true` or `false`, and we give
  the answers names.
- `hitGround || hitSky`: either one ends the game.
- Once the state is `'over'`, `update` returns at once (frozen), and `flap` returns too.

# --meaning-tr--

- `const hitGround = bird.y + bird.r >= canvas.height` → `>=` "büyük veya eşit mi?". Alt kenar zemine değdi mi? Böyle
  bir sorunun cevabı sayı değil, **doğru** (`true`) ya da **yanlış** (`false`). Cevaba bir ad veriyoruz: `hitGround`
  (yere çarptı). Kod böyle daha kolay okunur.
- `const hitSky = bird.y - bird.r <= 0` → `<=` "küçük veya eşit mi?". Üst kenar tavana değdi mi?
- `if (hitGround || hitSky) state = 'over'` → `||` "veya": biri doğruysa oyun biter.
- Durum `'over'` olunca `update`'in ilk satırı hemen çıkar: kuş **donar**.
- `flap` içinde `if (state === 'over') return` → oyun bittiyse çırpış hiçbir şey yapmaz. (Yeniden başlatmayı ileride
  ekleyeceğiz.)

# --task--

1. In `flap`, add `if (state === 'over') return` as the first line.
2. In `update`, under `bird.y += bird.vy`, leave an empty line and write the three new lines.

# --task-tr--

1. `flap` içinde en üste `if (state === 'over') return` satırını yaz.
2. `update` içinde `bird.y += bird.vy` satırının altına bir boş satır bırak ve üç yeni satırı yaz.
3. **Çalıştır**, oyuna tıkla ve kuşu düşür: yere değince donmalı.

# --hint--

The bottom edge is `bird.y + bird.r` (y grows downwards), the top edge is `bird.y - bird.r`.

# --hint-tr--

Alt kenar `bird.y + bird.r` (y aşağı doğru büyür), üst kenar `bird.y - bird.r`.

# --tests--

Hitting the ground should end the game and freeze the bird.
tr: Yere çarpmak oyunu bitirmeli ve kuşu dondurmalı.

```js
flap()
$.run(3)
assert.strictEqual(state, 'over')
assert.isAtLeast(bird.y + bird.r, 600)
const frozen = bird.y
$.tick(30)
assert.strictEqual(bird.y, frozen)
```

Flying into the top should end the game too.
tr: Tepeye uçmak da oyunu bitirmeli.

```js
state = 'playing'
bird.y = 20
bird.vy = -8
update()
assert.strictEqual(state, 'over')
```

Flapping after game over should do nothing (for now).
tr: Oyun bittikten sonra kanat çırpmak (şimdilik) hiçbir şey yapmamalı.

```js
state = 'over'
bird.vy = 3
flap()
assert.strictEqual(state, 'over')
assert.strictEqual(bird.vy, 3)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)

let bird = { x: 100, y: 300, vy: 0, r: 14 }
let state = 'ready' // 'ready', 'playing' or 'over'

function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
