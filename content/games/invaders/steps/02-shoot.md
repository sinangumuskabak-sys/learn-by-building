---
title: Firing, with a cooldown
title_tr: Bekleme süreli ateş
skills: [game.input, prog.arrays]
---

# --explanation--

Space fires a bullet straight up. Bullets are the classic **list of short-lived objects**: push a new one when firing,
move all of them every frame, and drop the ones that have left the screen with `filter`.

Without a limit, holding Space (which repeats `keydown` many times a second) or mashing it would fill the screen with
bullets and remove all challenge. So the cannon needs a **cooldown**: a minimum time between shots. Remember **when**
the last shot happened and refuse to fire again too soon:

```js
if (now - lastShot < COOLDOWN) return   // still reloading
lastShot = now
```

`now` is the current time, which the loop receives from `requestAnimationFrame`. Starting `lastShot` at `-COOLDOWN`
means the very first shot is allowed immediately.

Cooldowns are everywhere in games: weapons, abilities, dashes, even how often a menu button can be pressed.

# --explanation-tr--

Boşluk dümdüz yukarı bir mermi atar. Mermiler klasik bir **kısa ömürlü nesne listesidir**: ateş edince yenisini ekle,
her karede hepsini taşı ve ekrandan çıkanları `filter` ile at.

Bir sınır olmazsa Boşluk'u basılı tutmak (saniyede birçok kez `keydown` tekrarlar) ya da art arda basmak ekranı
mermiyle doldurur ve bütün zorluğu yok eder. Bu yüzden topun bir **bekleme süresi** (cooldown) olmalı: iki atış arasında
en kısa süre. Son atışın **ne zaman** olduğunu hatırla ve çok erken yeniden ateş etmeyi reddet:

```js
if (now - lastShot < COOLDOWN) return   // hâlâ dolduruluyor
lastShot = now
```

`now`, döngünün `requestAnimationFrame`'den aldığı o anki zamandır. `lastShot`'u `-COOLDOWN`'dan başlatmak ilk atışa
hemen izin verir.

Bekleme süreleri oyunların her yerindedir: silahlar, yetenekler, atılmalar, hatta bir menü düğmesine ne sıklıkla
basılabileceği.

# --task--

1. Add `BULLET_SPEED = 8`, `COOLDOWN = 350`, `let bullets = []`, `let lastShot = -COOLDOWN` and `let now = 0`, and set
   `now = time` at the start of `loop(time)`.
2. Write `shoot()`: if less than `COOLDOWN` ms have passed since `lastShot`, do nothing; otherwise set `lastShot = now`
   and push a 4×12 bullet at `x = ship.x + SHIP_W / 2 - 2`, `y = ship.y - 12`. Call it when Space is pressed.
3. In `update()`, move bullets up by `BULLET_SPEED` and keep only those still on screen (`y + h > 0`). Draw them in
   `'#f8fafc'`.

# --task-tr--

1. `BULLET_SPEED = 8`, `COOLDOWN = 350`, `let bullets = []`, `let lastShot = -COOLDOWN` ve `let now = 0` ekle;
   `loop(time)`'ın başında `now = time` yap.
2. `shoot()` yaz: `lastShot`'tan beri `COOLDOWN` ms'den az geçtiyse hiçbir şey yapma; değilse `lastShot = now` yap ve
   `x = ship.x + SHIP_W / 2 - 2`, `y = ship.y - 12` noktasına 4×12 bir mermi ekle. Boşluk'a basılınca çağır.
3. `update()` içinde mermileri `BULLET_SPEED` kadar yukarı taşı ve yalnızca ekranda kalanları (`y + h > 0`) tut. Onları
   `'#f8fafc'` ile çiz.

# --tests--

Space should fire a bullet from the barrel.
tr: Boşluk namludan bir mermi atmalı.

```js
$.tick()
$.tap(' ')
assert.deepEqual(bullets, [{ x: 238, y: 468, w: 4, h: 12 }])
$.tick()
assert.strictEqual(bullets[0].y, 460)
assert.lengthOf($.rects('#f8fafc'), 1)
```

The cooldown should limit how fast the cannon fires.
tr: Bekleme süresi topun ne kadar hızlı ateş ettiğini sınırlamalı.

```js
$.tick()
$.tap(' ')
$.tap(' ')
$.tap(' ')
assert.lengthOf(bullets, 1, 'mashing Space fires once')
$.run(0.3)
$.tap(' ')
assert.lengthOf(bullets, 1, 'still reloading after 300 ms')
$.run(0.1)
$.tap(' ')
assert.lengthOf(bullets, 2, 'ready again after 350 ms')
```

Bullets should disappear once they leave the screen.
tr: Mermiler ekrandan çıkınca kaybolmalı.

```js
$.tick()
$.tap(' ')
$.run(1.2)
assert.lengthOf(bullets, 0)
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

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let now = 0
const keys = {}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
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
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
