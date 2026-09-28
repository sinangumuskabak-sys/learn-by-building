---
title: Pull back to shoot
title_tr: Geri çek ve vur
skills: [game.input, game.physics]
---

# --explanation--

Arrow keys are precise but slow. Most pool games use the pointer like a **slingshot**: press, pull back **away** from where
you want to shoot, and let go. The further you pull, the harder the shot.

Both the aim and the power come from one vector, from the pointer to the cue ball:

```js
aim = Math.atan2(cue.y - point.y, cue.x - point.x)          // pointing from the pointer through the ball
power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
```

`Math.atan2(dy, dx)` gives the angle of a vector, in every direction, which is exactly what `aim` means. Pull 60 pixels to
the left and you shoot right at power 10.

The shot fires on `pointerup`, which we listen for on the **document**: if you let go outside the canvas, it still shoots.
A power bar under the table shows how hard you are about to hit; Up and Down change it from the keyboard.

# --explanation-tr--

**Bu adımda:** fareyle (ya da parmakla) sapan gibi nişan alacağız. Masaya bas, vurmak istediğin yönün **tersine** geri
çek ve bırak. Ne kadar çok çekersen vuruş o kadar sert olur. Masanın altında turuncu bir güç çubuğu görünecek.

Ok tuşları hassas ama yavaş. Çoğu bilardo oyunu fareyi **sapan** gibi kullanır: lastiği geriye çekersin, taş öbür
yöne fırlar.

**Tek oktan hem yön hem güç.** Fareden beyaz topa doğru bir ok düşün:

```js
aim = Math.atan2(cue.y - point.y, cue.x - point.x)
power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
```

- `Math.atan2(dy, dx)` → bir okun **açısını** verir, her yön için doğru çalışır. `cos`/`sin`'in tersi gibi: onlar
  açıdan yön buluyordu, bu yönden açı bulur. Ok fareden topa doğru olduğu için vuruş çektiğin yönün tersine gider.
- `Math.hypot(...)` fare ile top arasındaki uzaklıktır; 6'ya böleriz ki güç makul bir sayı olsun.
- `Math.min(a, b)` iki sayıdan küçüğünü verir: güç hiçbir zaman `MAX_POWER`'ı (16) geçmez. `Math.max(a, b)` de
  büyüğünü verir.

Örnek: topun 60 piksel soluna çekersen açı 0 (sağa), güç 60 / 6 = 10 olur.

**Fare olayları.** Fare ve dokunmatik ekran için aynı olaylar kullanılır:

- `pointerdown` → bastın. `pointermove` → basılıyken ya da değilken hareket ettirdin. `pointerup` → bıraktın.
- `dragging` (sürüklüyor mu) `true`/`false` bilgisini tutar; hareket sadece basılıyken nişanı değiştirsin.
- `pointerup`'ı canvas'ta değil **document**'ta (bütün sayfada) dinleriz: fareyi masanın dışında bırakırsan da vuruş
  olur.
- `if (state === 'won') return reset()` → kazandıysan tıklama yeni oyun başlatır ve fonksiyon orada biter.

**Sayfadaki konumdan canvas'taki konuma.** Olay, farenin **sayfadaki** konumunu verir (`event.clientX`,
`event.clientY`). Canvas sayfanın bir yerinde durur ve ekranda büyütülüp küçültülmüş olabilir.
`canvas.getBoundingClientRect()` canvas'ın sayfadaki yerini ve ekrandaki boyunu verir (`left`, `top`, `width`,
`height`). Farkı alıp oranla çarparak canvas içindeki koordinatı buluruz; `toCanvas` bunu yapar.

**Güç çubuğu.** Önce gri tam boy bir çubuk, üstüne gücün oranı kadar (`power / MAX_POWER`) turuncu bir çubuk.
Yukarı/Aşağı ok gücü 1 artırıp azaltır; `Math.min`/`Math.max` onu 2 ile 16 arasında tutar.

# --task--

1. Add `MAX_POWER = 16` and `dragging` (`false` in `reset()`).
2. Write `toCanvas(event)` and `pull(point)`, which sets `aim` and `power` as above.
3. `pointerdown` while aiming starts dragging and pulls (in `'won'`, it starts again); `pointermove` pulls while dragging; on
   the document's `pointerup`, stop dragging and shoot if `power >= 1`.
4. Up and Down change `power` by 1, between `2` and `MAX_POWER`.
5. Draw the power bar: a `'#334155'` bar at `(LEFT, 304)`, `RIGHT - LEFT` wide and 14 high, and over it a `'#f59e0b'` bar as
   wide as `power / MAX_POWER` of it.

# --task-tr--

1. `const BOUNCE = 0.8 ...` satırının hemen altına en büyük gücü ekle:

   ```js
   const MAX_POWER = 16
   ```

2. `let power` satırının hemen altına sürükleme bilgisini ekle:

   ```js
   let dragging
   ```

3. `reset()` içinde `power = 8` satırının altına şunu ekle:

   ```js
     dragging = false
   ```

4. `keydown` dinleyicisinde `ArrowRight` satırının altına, boşluk satırının üstüne iki satır ekle:

   ```js
     else if (event.key === 'ArrowRight') aim += 0.035
     else if (event.key === 'ArrowUp') power = Math.min(MAX_POWER, power + 1) // ← yeni
     else if (event.key === 'ArrowDown') power = Math.max(2, power - 1)       // ← yeni
     else if (event.key === ' ') state === 'won' ? reset() : shoot()
   ```

5. `keydown` dinleyicisinin kapanış `})`'inden sonra, `function draw()`'dan önce fare kodunu yaz:

   ```js
   function toCanvas(event) {
     const rect = canvas.getBoundingClientRect()
     return {
       x: ((event.clientX - rect.left) * canvas.width) / rect.width,
       y: ((event.clientY - rect.top) * canvas.height) / rect.height,
     }
   }

   // Pull back from the cue ball like a slingshot: the shot goes the other way, harder the further you pull.
   function pull(point) {
     aim = Math.atan2(cue.y - point.y, cue.x - point.x)
     power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
   }

   canvas.addEventListener('pointerdown', (event) => {
     if (state === 'won') return reset()
     if (state !== 'aiming') return
     dragging = true
     pull(toCanvas(event))
   })

   canvas.addEventListener('pointermove', (event) => {
     if (dragging) pull(toCanvas(event))
   })

   document.addEventListener('pointerup', () => {
     if (!dragging) return
     dragging = false
     if (power >= 1) shoot()
   })
   ```

   Son dinleyicide olay bilgisine ihtiyacımız olmadığı için parantez boş: `() =>`.

6. `draw()` içinde topları çizen döngünün kapanış `}`'inden sonra, `ctx.fillStyle = 'white'` satırından önce güç
   çubuğunu çiz:

   ```js
     // Power bar
     ctx.fillStyle = '#334155'
     ctx.fillRect(LEFT, 304, RIGHT - LEFT, 14)
     ctx.fillStyle = '#f59e0b'
     ctx.fillRect(LEFT, 304, ((RIGHT - LEFT) * power) / MAX_POWER, 14)
   ```

7. **Çalıştır**'a bas. Masanın altında gri bir çubuk ve yarısına kadar turuncu dolu kısım görmelisin. Oyunda beyaz
   topun soluna bas, sola doğru çek: nişan çizgisi sağı göstermeli, turuncu çubuk uzamalı; bırakınca top sağa gitmeli.
   Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `atan2` içindeki sıraya bak: önce `y` farkı, sonra `x`
   farkı, ikisinde de `cue` önce.

# --tests--

Pulling back should aim the opposite way, with more power the further you pull, and letting go should shoot.
tr: Geri çekmek ters yöne nişan almalı, ne kadar çekersen o kadar güçlü; bırakmak vurmalı.

```js
$.pointerDown(70, 160)
assert.closeTo(aim, 0, 1e-9, 'pulling back to the left aims right')
assert.closeTo(power, 10, 1e-9)
$.move(130, 130)
assert.closeTo(aim, Math.PI / 2, 1e-9)
assert.closeTo(power, 5, 1e-9)
assert.strictEqual(state, 'aiming')
$.pointerUp(130, 130)
assert.strictEqual(state, 'rolling')
assert.closeTo(cue.vy, 5, 1e-9)
```

Power should be capped, and Up and Down should change it.
tr: Güç sınırlanmalı ve Yukarı ile Aşağı onu değiştirmeli.

```js
$.pointerDown(0, 160)
$.pointerUp(0, 160)
assert.closeTo(cue.vx, MAX_POWER, 1e-9, 'power is capped')
state = 'aiming'
power = 8
$.press('ArrowUp')
assert.strictEqual(power, 9)
for (let i = 0; i < 20; i++) $.press('ArrowUp')
assert.strictEqual(power, MAX_POWER)
for (let i = 0; i < 20; i++) $.press('ArrowDown')
assert.strictEqual(power, 2)
```

The power bar should show the power.
tr: Güç çubuğu gücü göstermeli.

```js
power = 12
$.tick(1)
assert.deepInclude($.rects('#f59e0b'), { x: 20, y: 304, w: 330, h: 14, color: '#f59e0b' })
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const POCKETS = [
  [LEFT, TOP], [240, TOP], [RIGHT, TOP],
  [LEFT, BOTTOM], [240, BOTTOM], [RIGHT, BOTTOM],
]
const POCKET_R = 15
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const MAX_POWER = 16
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let dragging
let shots
let state // 'aiming', 'rolling' or 'won'

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
  aim = 0
  power = 8
  dragging = false
  shots = 0
  state = 'aiming'
}

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  shots += 1
  state = 'rolling'
}

// Two balls of the same mass that touch swap the parts of their velocities that point along the line between them.
function collide(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  if (dist >= R * 2 || dist === 0) return
  const nx = dx / dist
  const ny = dy / dist
  // Push them apart so they only just touch.
  const overlap = (R * 2 - dist) / 2
  a.x -= nx * overlap
  a.y -= ny * overlap
  b.x += nx * overlap
  b.y += ny * overlap
  const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (along <= 0) return // already moving apart
  a.vx -= along * nx
  a.vy -= along * ny
  b.vx += along * nx
  b.vy += along * ny
}

function pocketed(b) {
  return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
}

function step() {
  for (const b of balls) {
    b.x += b.vx
    b.y += b.vy
    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
  balls = balls.filter((b) => {
    if (!pocketed(b)) return true
    if (b.cue) shots += 1 // a scratch costs a shot
    return false
  })
}

// The cue ball comes back on its spot, or as close to it as there is room.
function respot() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  while (balls.some((b) => Math.hypot(b.x - cue.x, b.y - cue.y) < R * 2)) cue.x -= R
  balls.unshift(cue)
}

function update() {
  if (state !== 'rolling') return
  step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  if (!balls.includes(cue)) respot()
  state = balls.length === 1 ? 'won' : 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === 'ArrowUp') power = Math.min(MAX_POWER, power + 1)
  else if (event.key === 'ArrowDown') power = Math.max(2, power - 1)
  else if (event.key === ' ') state === 'won' ? reset() : shoot()
  else return
  event.preventDefault()
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

// Pull back from the cue ball like a slingshot: the shot goes the other way, harder the further you pull.
function pull(point) {
  aim = Math.atan2(cue.y - point.y, cue.x - point.x)
  power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won') return reset()
  if (state !== 'aiming') return
  dragging = true
  pull(toCanvas(event))
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (power >= 1) shoot()
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
  for (const [px, py] of POCKETS) {
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
    ctx.fill()
  }

  if (state === 'aiming') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
    ctx.stroke()
  }

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
  }

  // Power bar
  ctx.fillStyle = '#334155'
  ctx.fillRect(LEFT, 304, RIGHT - LEFT, 14)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(LEFT, 304, ((RIGHT - LEFT) * power) / MAX_POWER, 14)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots + '  Left ' + (balls.filter((b) => !b.cue).length), LEFT, 22)
  if (state === 'won') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Table cleared in ' + shots + ' shots!', canvas.width / 2, 170)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
