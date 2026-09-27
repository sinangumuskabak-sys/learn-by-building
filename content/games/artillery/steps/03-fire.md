---
title: Fire
title_tr: Ateş
skills: [game.physics, game.state]
---

# --explanation--

Space fires. The shell starts at the **end of the barrel** (not inside the tank, where it would hit its own ground) with a velocity
along the angle, as big as the power.

Its flight is the physics of every thrown thing: each frame gravity adds a little to `vy`, then the shell moves by its velocity.
We put one frame of flight in its own function, `fly(s)`, which moves a shell and says what it hit: `'ground'`, `'away'` (it left
the screen at the side) or nothing. Keeping it separate pays off later, when the computer uses the very same function to
**imagine** shots.

The shell hits the ground when its `y` goes below the surface at its `x`, which the height map answers in one step:
`s.y >= groundAt(s.x)`.

The game now has **states**: `'aiming'`, then `'flying'`, then `'boom'` while the explosion shows for 20 frames, then back to
aiming. Keys and fire only work while aiming.

# --explanation-tr--

Boşluk ateş eder. Mermi **namlunun ucundan** başlar (tankın içinden değil; orada kendi zeminine çarpardı) ve açı boyunca, güç kadar
büyük bir hıza sahiptir.

Uçuşu atılan her şeyin fiziğidir: her karede yerçekimi `vy`'ye biraz ekler, sonra mermi hızı kadar hareket eder. Uçuşun bir karesini
kendi fonksiyonuna, `fly(s)`'e koyarız; bir mermiyi hareket ettirir ve neye çarptığını söyler: `'ground'`, `'away'` (ekranı yandan
terk etti) ya da hiçbir şey. Ayrı tutmanın karşılığı sonra gelir: bilgisayar atışları **hayal etmek** için tam olarak aynı fonksiyonu
kullanır.

Mermi, `y`'si `x`'indeki yüzeyin altına geçtiğinde zemine çarpar; yükseklik haritası bunu tek adımda cevaplar:
`s.y >= groundAt(s.x)`.

Oyunun artık **durumları** var: `'aiming'`, sonra `'flying'`, sonra patlama 20 kare görünürken `'boom'`, sonra yeniden nişan. Tuşlar
ve ateş yalnızca nişan alırken çalışır.

# --task--

1. Add `GRAVITY = 0.15`, `BLAST = 30`, and `shell`, `blast`, `timer` and `state` (`null`, `null`, and `'aiming'` in `reset()`).
2. Write `fire()`: while aiming, a shell at the end of the blue barrel (`t.x + cos × 14`, `t.y - 8 + sin × 14`) with velocity
   `cos × power`, `sin × power`, and `state = 'flying'`. Space fires, and so does letting go of the pointer.
3. Write `fly(s)`: add `GRAVITY` to `vy`, move, and return `'away'` off the sides, `'ground'` at or below the surface, else `null`.
4. Write `explode(x, y)`, which for now only sets `blast = { x, y }`. In `update()`: while flying, `fly` the shell; when it hits
   something, `explode` (unless it went away), clear `shell`, set `'boom'` and `timer = 20`. In `'boom'`, count the timer down and
   at `0` clear `blast` and go back to `'aiming'`.
5. Aiming only works while aiming. Draw the shell (a `'#0f172a'` circle of radius 3) and the blast, an orange
   (`'rgba(249, 115, 22, 0.8)'`) circle of radius `BLAST * (1 - timer / 40)`.

# --task-tr--

1. `GRAVITY = 0.15`, `BLAST = 30` ve `shell`, `blast`, `timer` ve `state` ekle (`reset()`'te `null`, `null` ve `'aiming'`).
2. `fire()` yaz: nişan alırken, mavi namlunun ucunda (`t.x + cos × 14`, `t.y - 8 + sin × 14`) `cos × power`, `sin × power` hızlı bir
   mermi ve `state = 'flying'`. Boşluk ateş eder, işaretçiyi bırakmak da.
3. `fly(s)` yaz: `vy`'ye `GRAVITY` ekle, hareket ettir ve kenarların dışında `'away'`, yüzeyde ya da altında `'ground'`, değilse `null`
   döndür.
4. Şimdilik yalnızca `blast = { x, y }` yapan `explode(x, y)`'yi yaz. `update()`'te: uçarken mermiyi `fly` et; bir şeye çarpınca
   (gitmediyse) `explode` et, `shell`'i temizle, `'boom'` ve `timer = 20` yap. `'boom'`'da sayacı azalt ve `0`'da `blast`'ı temizle ve
   `'aiming'`'e dön.
5. Nişan yalnızca nişan alırken çalışır. Mermiyi (3 yarıçaplı `'#0f172a'` bir daire) ve patlamayı, `BLAST * (1 - timer / 40)`
   yarıçaplı turuncu (`'rgba(249, 115, 22, 0.8)'`) bir daireyi çiz.

# --tests--

Space should fire from the end of the barrel, and gravity should pull the shell down.
tr: Boşluk namlunun ucundan ateş etmeli ve yerçekimi mermiyi aşağı çekmeli.

```js
const t = tanks[0]
$.press(' ')
assert.strictEqual(state, 'flying')
assert.closeTo(shell.x, t.x + Math.cos(t.angle) * 14, 1e-9, 'from the end of the barrel')
assert.closeTo(shell.vx, Math.cos(t.angle) * t.power, 1e-9)
const vy = shell.vy
$.tick(1)
assert.closeTo(shell.vy, vy + GRAVITY, 1e-9, 'gravity pulls it down')
$.press('ArrowLeft')
$.press(' ')
assert.strictEqual(state, 'flying')
```

The shell should explode where it meets the ground, and after the blast the next shot can be aimed.
tr: Mermi zemine değdiği yerde patlamalı ve patlamadan sonra sonraki atışa nişan alınabilmeli.

```js
const before = ground.join()
fire()
let landed = null
for (let i = 0; i < 400 && state === 'flying'; i++) {
  $.tick(1)
  if (state === 'boom') landed = { ...blast }
}
assert.strictEqual(state, 'boom')
assert.isAtLeast(landed.y, groundAt(landed.x) - 12, 'it explodes where it meets the ground')
$.tick(20)
assert.strictEqual(state, 'aiming')
assert.isNull(blast)
assert.strictEqual(ground.join(), before, 'no craters yet')
```

A shell leaving the screen should end the shot with no explosion.
tr: Ekrandan çıkan bir mermi atışı patlama olmadan bitirmeli.

```js
tanks[0].angle = -Math.PI / 2 - 0.3
tanks[0].power = 12
fire()
for (let i = 0; i < 400 && state === 'flying'; i++) $.tick(1)
assert.strictEqual(state, 'boom', 'a shell leaving the screen ends the shot too')
assert.isNull(blast, 'with no explosion')
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
const GRAVITY = 0.15
const BLAST = 30 // explosion radius
const MAX_POWER = 12

let ground // ground[x]: the y of the surface in column x
let tanks // [blue, red]: { x, y, angle, power, color }
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying' or 'boom'
let dragging

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
    { x: 70, y: 0, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  shell = null
  blast = null
  state = 'aiming'
  dragging = false
}

function fire() {
  if (state !== 'aiming') return
  const t = tanks[0]
  // The shell leaves from the end of the barrel.
  shell = {
    x: t.x + Math.cos(t.angle) * 14,
    y: t.y - 8 + Math.sin(t.angle) * 14,
    vx: Math.cos(t.angle) * t.power,
    vy: Math.sin(t.angle) * t.power,
  }
  state = 'flying'
}

// One frame of flight: gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  return null
}

function explode(x, y) {
  blast = { x, y }
}

function update() {
  if (state === 'boom' && --timer === 0) {
    blast = null
    state = 'aiming'
  }
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20
}

function aimBy(dAngle, dPower) {
  if (state !== 'aiming') return
  const t = tanks[0]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else if (event.key === ' ') fire()
  else return
  event.preventDefault()
})

// Point from the tank: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[0]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'aiming') return
  dragging = true
  pointAt(event)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pointAt(event)
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  fire()
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
  }

  if (shell) {
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(shell.x, shell.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  if (blast) {
    // The fireball grows as the timer runs down.
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
    ctx.beginPath()
    ctx.arc(blast.x, blast.y, BLAST * (1 - timer / 40), 0, Math.PI * 2)
    ctx.fill()
  }

  const now = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
