---
title: Smaller steps and a ghost ball
title_tr: Daha küçük adımlar ve bir hayalet top
skills: [game.physics, game.collision]
---

# --explanation--

Hit a ball hard and at an angle, and it can go off in the **wrong direction**. Why? At power 16 a ball moves 16 pixels per
frame. By the time we notice the two balls touch, they may overlap by many pixels, and the line between their centres,
which decides everything in `collide`, is no longer the line at the moment they first touched.

The fix is to move in **smaller steps**: split each frame into `SUB` steps, each moving `velocity / SUB` and checking for
collisions. Here is how far off the direction of a hit ball is, for a fast glancing shot:

| steps per frame | direction | error |
|---|---|---|
| 1 | 1.35 rad | 0.62 |
| 4 | 0.85 rad | 0.12 |
| 8 | 0.77 rad | 0.04 |
| exact | 0.73 rad | 0 |

Eight steps are close enough to the truth, and still cheap. Friction stays once per frame, so the balls roll just as far.

With the physics this precise, we can **predict** the shot. The **ghost ball** is where the cue ball will be when it first
touches another ball. For each ball, measure how far along the aim line it is (`t`, a dot product) and how far to the side
(`side`). If the side distance is less than `2R`, the cue ball will hit it, `sqrt(4R² − side²)` before reaching `t`. The
nearest such hit wins. Since the hit ball leaves along the line from the ghost's centre through its own, we can draw that
too. Real players imagine exactly this.

Finally, the fewest shots you ever needed to clear the table is your best.

# --explanation-tr--

**Bu adımda:** fiziği daha hassas yapacağız ve vuruşu önceden göstereceğiz. Nişan alırken beyaz topun ilk değeceği yerde
içi boş bir "hayalet top" ve vurulan topun gideceği yönü gösteren bir çizgi göreceksin. Sağ üstte en iyi skorun
(`Best`) yazacak.

**Neden bazen yanlış yöne gidiyor?** Bir topa sert ve açılı vurursan, vurulan top bazen **yanlış yöne** gider. 16
güçte top her karede 16 piksel ilerler. İki topun değdiğini fark ettiğimizde birçok piksel iç içe geçmiş olabilirler;
`collide`'da her şeye karar veren "merkezden merkeze çizgi" artık ilk değdikleri andaki çizgi değildir.

**Çözüm: daha küçük adımlar.** Her kareyi `SUB` (8) küçük adıma böleriz; her adımda top hızının sadece 8'de biri kadar
ilerler ve çarpışma kontrol edilir. Hızlı, sıyırarak bir vuruşta vurulan topun yönündeki hata:

| karede adım | yön | hata |
|---|---|---|
| 1 | 1.35 rad | 0.62 |
| 4 | 0.85 rad | 0.12 |
| 8 | 0.77 rad | 0.04 |
| kesin | 0.73 rad | 0 |

8 adım gerçeğe yeterince yakın ve hâlâ ucuz. Sürtünme karede bir kez uygulanmaya devam eder, böylece toplar yine aynı
mesafeye kadar yuvarlanır.

**Hayalet top (ghost ball).** Fizik bu kadar kesinleşince vuruşu **önceden** hesaplayabiliriz. Hayalet top, beyaz
topun başka bir topa **ilk değdiği** anda duracağı yerdir. Her top için:

- `t` → o top nişan çizgisi boyunca ne kadar ileride (`dx * ux + dy * uy`; `ux`, `uy` nişan yönü).
- `side` → çizginin **yanına** ne kadar uzak (uzaklığın karesi olarak: toplam uzaklığın karesi eksi `t`'nin karesi).
- `t <= 0` ise top arkada kalıyor; `side >= 4R²` ise çizgiden çok uzak, beyaz top ona hiç değmez. Bunları `continue`
  ile atlarız.
- Değecekse, beyaz top `t`'ye varmadan `√(4R² − side)` önce değer: `hit = t - Math.sqrt(R * R * 4 - side)`.
  `Math.sqrt` karekök alır.

En yakın `hit` kazanır. `first` başta `null`'dır ("henüz hiçbir şey yok"). `if (!first || hit < first.hit)` →
"henüz bulunmadıysa **ya da** bu daha yakınsa, bunu sakla". Hiçbir topa değmiyorsa sonuç `null` olur.

Vurulan top, hayaletin merkezinden kendi merkezine giden çizgi boyunca gider; bunu da çizeriz. Gerçek oyuncular kafalarında
tam olarak bunu hayal eder.

**En iyi skor.** Bu oyunda **en az** vuruş en iyisidir. `localStorage` tarayıcının küçük defteridir; sayfa kapansa da
unutmaz. `localStorage.getItem('pool-best')` okur, `setItem` yazar, `Number(...) || 0` okunanı sayıya çevirir (yoksa 0).
Kaydetme koşulu: `best === 0 || shots < best` → "daha önce rekor yoksa **ya da** bu sefer daha az vuruş". Yazarken
`best || '-'` → rekor 0 ise (yoksa) `-` göster.

# --task--

1. Add `SUB = 8`. `step()` moves each ball by `vx / SUB` and `vy / SUB`, and `update()` calls it `SUB` times per frame.
2. Write `ghost()`: for every ball except the cue ball, `t` = the dot product of `(ball − cue)` with the aim direction and
   `side` = `|ball − cue|² − t²`; skip it if `t <= 0` or `side >= 4R²`. Return the nearest `{ hit, ball, x, y }`, where
   `hit = t - sqrt(4R² - side)` and `(x, y)` is the cue ball moved `hit` along the aim, or `null`.
3. While aiming, end the aim line at the ghost ball if there is one, stroke a circle of radius `R` there, and a line from the
   hit ball's centre going 3 times `(ball − ghost)` further.
4. Keep `best` (fewest shots) in `localStorage` under `'pool-best'` when the table is cleared, and draw `Best 12` (or
   `Best -`) right-aligned at `(RIGHT, 22)`.

# --task-tr--

1. `const MAX_POWER = 16` satırının hemen altına adım sayısını ekle:

   ```js
   const SUB = 8 // physics steps per frame, so fast balls cannot jump through each other
   ```

2. `let state` satırının hemen altına en iyi skoru okuyan satırı ekle:

   ```js
   let best = Number(localStorage.getItem('pool-best')) || 0
   ```

3. `step()`'in başındaki iki hareket satırını hızın 8'de biriyle ilerleyecek şekilde değiştir:

   ```js
   function step() {
     for (const b of balls) {
       b.x += b.vx / SUB // ← değişti
       b.y += b.vy / SUB // ← değişti
   ```

4. `update()` içinde tek başına duran `step()` satırını 8 kez çağıran döngüyle değiştir:

   ```js
     if (state !== 'rolling') return
     for (let i = 0; i < SUB; i++) step() // ← değişti
   ```

5. `update()`'in son satırını (`state = balls.length === 1 ? 'won' : 'aiming'`) rekoru da kaydeden hâliyle değiştir:

   ```js
     if (moving) return
     if (!balls.includes(cue)) respot()
     if (balls.length === 1) {               // ← değişti
       state = 'won'
       if (best === 0 || shots < best) {
         best = shots
         localStorage.setItem('pool-best', best)
       }
     } else state = 'aiming'
   }
   ```

6. `pointerup` dinleyicisinin kapanış `})`'inden sonra, `function draw()`'dan önce hayalet topu bulan fonksiyonu yaz:

   ```js
   // Where the cue ball will first touch another ball along the aim: the "ghost ball".
   function ghost() {
     const ux = Math.cos(aim)
     const uy = Math.sin(aim)
     let first = null
     for (const b of balls) {
       if (b === cue) continue
       const dx = b.x - cue.x
       const dy = b.y - cue.y
       const t = dx * ux + dy * uy // how far along the aim line the ball is
       const side = dx * dx + dy * dy - t * t // squared distance from the line
       if (t <= 0 || side >= R * R * 4) continue
       const hit = t - Math.sqrt(R * R * 4 - side)
       if (!first || hit < first.hit) first = { hit, ball: b, x: cue.x + ux * hit, y: cue.y + uy * hit }
     }
     return first
   }
   ```

7. `draw()` içindeki `if (state === 'aiming') { ... }` bloğunu şu hâle getir:

   ```js
     if (state === 'aiming') {
       const g = ghost()                                                          // ← yeni
       const length = g ? g.hit : 400                                             // ← yeni
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
       ctx.lineWidth = 1
       ctx.beginPath()
       ctx.moveTo(cue.x, cue.y)
       ctx.lineTo(cue.x + Math.cos(aim) * length, cue.y + Math.sin(aim) * length) // ← değişti (400 yerine length)
       ctx.stroke()
       if (g) {                                                                   // ← yeni
         ctx.beginPath()
         ctx.arc(g.x, g.y, R, 0, Math.PI * 2)
         ctx.stroke()
         // The ball that is hit goes off along the line from the ghost ball through its centre.
         const dx = g.ball.x - g.x
         const dy = g.ball.y - g.y
         ctx.beginPath()
         ctx.moveTo(g.ball.x, g.ball.y)
         ctx.lineTo(g.ball.x + dx * 3, g.ball.y + dy * 3)
         ctx.stroke()
       }
     }
   ```

   `g ? g.hit : 400` → hayalet top varsa çizgi ona kadar, yoksa eskisi gibi 400 piksel.

8. `draw()`'un sonunda, `ctx.fillText('Shots ' + ...)` satırından sonra, `if (state === 'won')`'dan önce en iyi skoru
   sağa yaslı yaz:

   ```js
     ctx.textAlign = 'right'                        // ← yeni
     ctx.fillText('Best ' + (best || '-'), RIGHT, 22) // ← yeni
   ```

9. **Çalıştır**'a bas. Nişan çizgisi 1 numaralı topun önünde bitmeli; orada içi boş beyaz bir daire ve 1 numaradan
   çıkan kısa bir yön çizgisi görmelisin. Sağ üstte `Best -` yazmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa `ghost` içindeki `t <= 0 || side >= R * R * 4` satırına ve `SUB` ile bölme satırlarına bak.

# --tests--

A fast glancing hit should send the other ball in the right direction.
tr: Hızlı, sıyırarak bir vuruş diğer topu doğru yöne göndermeli.

```js
// A fast, glancing hit: the other ball must leave along the line between the centres at the moment they touch.
balls = [cue, ball(200, 172, '#fff', 1)]
cue.x = 150
cue.y = 160
cue.vx = 16
cue.vy = 0
state = 'rolling'
$.tick(3)
const expected = Math.atan2(12, Math.sqrt(18 * 18 - 12 * 12))
assert.closeTo(Math.atan2(balls[1].vy, balls[1].vx), expected, 0.05)
```

`ghost` should find where the cue ball first touches a ball, and it should be drawn.
tr: `ghost` isteka topunun bir topa ilk değdiği yeri bulmalı ve çizilmeli.

```js
const g = ghost()
assert.strictEqual(g.ball.number, 1)
assert.closeTo(g.x, 312, 1e-9)
assert.closeTo(g.hit, 182, 1e-9)
aim = -Math.PI / 2
assert.isNull(ghost(), 'nothing in the way')
aim = 0
$.tick(1)
assert.deepInclude($.arcs().map(({ x, y, r }) => ({ x: Math.round(x), y, r })), { x: 312, y: 160, r: 9 }, 'the ghost ball is drawn')
```

Clearing the table should save the fewest shots as the best.
tr: Masayı temizlemek en az vuruşu en iyi olarak kaydetmeli.

```js
assert.strictEqual(best, 0)
balls = [cue, ball(60, 80, '#fff', 5)]
balls[1].vx = -3
balls[1].vy = -3
shots = 7
state = 'rolling'
for (let i = 0; i < 200 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(best, 7)
assert.strictEqual(localStorage.getItem('pool-best'), '7')
$.tick(1)
assert.include($.texts(), 'Best 7')
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
const SUB = 8 // physics steps per frame, so fast balls cannot jump through each other
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let dragging
let shots
let state // 'aiming', 'rolling' or 'won'
let best = Number(localStorage.getItem('pool-best')) || 0

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
    b.x += b.vx / SUB
    b.y += b.vy / SUB
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
  for (let i = 0; i < SUB; i++) step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  if (!balls.includes(cue)) respot()
  if (balls.length === 1) {
    state = 'won'
    if (best === 0 || shots < best) {
      best = shots
      localStorage.setItem('pool-best', best)
    }
  } else state = 'aiming'
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

// Where the cue ball will first touch another ball along the aim: the "ghost ball".
function ghost() {
  const ux = Math.cos(aim)
  const uy = Math.sin(aim)
  let first = null
  for (const b of balls) {
    if (b === cue) continue
    const dx = b.x - cue.x
    const dy = b.y - cue.y
    const t = dx * ux + dy * uy // how far along the aim line the ball is
    const side = dx * dx + dy * dy - t * t // squared distance from the line
    if (t <= 0 || side >= R * R * 4) continue
    const hit = t - Math.sqrt(R * R * 4 - side)
    if (!first || hit < first.hit) first = { hit, ball: b, x: cue.x + ux * hit, y: cue.y + uy * hit }
  }
  return first
}

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
    const g = ghost()
    const length = g ? g.hit : 400
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * length, cue.y + Math.sin(aim) * length)
    ctx.stroke()
    if (g) {
      ctx.beginPath()
      ctx.arc(g.x, g.y, R, 0, Math.PI * 2)
      ctx.stroke()
      // The ball that is hit goes off along the line from the ghost ball through its centre.
      const dx = g.ball.x - g.x
      const dy = g.ball.y - g.y
      ctx.beginPath()
      ctx.moveTo(g.ball.x, g.ball.y)
      ctx.lineTo(g.ball.x + dx * 3, g.ball.y + dy * 3)
      ctx.stroke()
    }
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
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best || '-'), RIGHT, 22)
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
