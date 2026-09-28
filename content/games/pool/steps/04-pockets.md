---
title: Pockets
title_tr: Cepler
skills: [game.collision, game.state]
---

# --explanation--

Six pockets: four corners and two in the middle of the long sides. A ball drops when its centre comes within `POCKET_R` of a
pocket's centre.

Notice how this plays with the cushions. A ball in a corner is pushed back by two cushions to `(LEFT + R, TOP + R)`, which is
about 13 pixels from the corner, less than `POCKET_R`, so it drops. In the middle pockets only one cushion stops it, at `R`
from the pocket, so the ball must arrive within about 12 pixels sideways. Middle pockets are **narrower**, just like on a real
table, and we never had to write a special rule for it.

Removing balls **while looping** over the same array is a classic bug: the loop skips the item after each removed one. So
we build a new array instead with `filter`, keeping the balls that are not pocketed.

Pocketing the cue ball is a **scratch**: it costs an extra shot, and when everything has stopped the cue ball comes back on
its spot. If another ball sits there, it moves left until it has room. When only the cue ball is left, the table is cleared.

# --explanation-tr--

**Bu adımda:** masaya altı cep ekleyeceğiz. Cebe giren top masadan kaybolacak; üstte kaç top kaldığı yazacak. Beyaz top
cebe girerse bir vuruş cezası alacaksın ve beyaz top yerine dönecek. Hepsini sokunca `Table cleared in ... shots!`
yazacak.

**Cepler.** Dört köşe ve uzun kenarların ortasında iki cep. Her cebi `[x, y]` şeklinde iki sayılık küçük bir diziyle
tutarız; hepsi `POCKETS` listesinde. Bir topun merkezi bir cebin merkezine `POCKET_R` (15) pikselden yakınsa top düşer.

**Bantlarla güzel bir uyum.** Köşedeki bir top iki bant tarafından `(LEFT + R, TOP + R)` noktasına itilir; bu köşeye
yaklaşık 13 piksel, yani 15'ten az: top düşer. Orta ceplerde ise topu tek bir bant durdurur, cepten `R` uzakta; bu
yüzden top yan yana en çok 12 piksel kadar kaymışken gelmeli. Yani orta cepler gerçek masadaki gibi **daha dar** olur
ve bunun için ayrı bir kural yazmamız gerekmedi.

**Yeni araçlar:**

- `POCKETS.some(([px, py]) => ...)` → `some` listede koşulu tutan **en az bir** öğe varsa `true` verir. `[px, py]`
  yazımı her cebin iki sayısını ayrı adlara açar: `px` birinci, `py` ikinci sayı. `for (const [px, py] of POCKETS)`
  da aynı şekilde çalışır.
- `balls.filter((b) => { ... })` → yalnız `true` döndüren topları tutan **yeni** bir liste yapar. Aynı listenin
  üzerinde dönerken ondan öğe silmek, silinenden sonraki öğenin atlanmasına yol açan klasik bir hatadır; `filter`
  eski listeye dokunmaz.
- `balls.includes(cue)` → "listede beyaz top var mı?".
- `while (koşul) iş` → koşul doğru olduğu **sürece** işi tekrar tekrar yap. Beyaz topun yerinde başka top varsa, yer
  bulana kadar `R` piksel sola kaydırırız.
- `balls.unshift(cue)` → listenin **başına** ekler (`push` sonuna ekliyordu). Beyaz top hep ilk sırada dursun.
- `koşul ? A : B` → kısa "eğer": koşul doğruysa A, değilse B. `balls.length === 1 ? 'won' : 'aiming'` → sadece bir
  top (beyaz) kaldıysa kazandın.

**Faul (scratch).** Beyaz top cebe girerse bir vuruş cezası eklenir (`shots += 1`). Her şey durunca beyaz top yerine
geri konur (`respot`).

**Yazı.** `'Shots ' + shots + '  Left ' + (...)` → `+` yazıları yan yana ekler. `Left`'ten önce **iki** boşluk
var: sonuç `Shots 3  Left 7` gibi. Kalan topları `balls.filter((b) => !b.cue).length` sayar: beyaz olmayanların sayısı.

# --task--

1. Add `POCKETS` (the four corners and `(240, TOP)`, `(240, BOTTOM)`) and `POCKET_R = 15`. Draw each pocket as a `'#020617'`
   circle.
2. Write `pocketed(b)`: true if the ball's centre is within `POCKET_R` of any pocket. At the end of `step()`, keep only the
   balls that are not pocketed; a pocketed cue ball adds 1 to `shots`.
3. Write `respot()`: a new cue ball at `CUE_START`, moved left by `R` while it overlaps a ball, put first in `balls`.
4. When everything stops: `respot()` if the cue ball is gone; `'won'` if only the cue ball is left, otherwise `'aiming'`.
   Space in `'won'` starts again.
5. Draw `Shots 3  Left 7`, and when `'won'` the message `Table cleared in 12 shots!` centered at `y = 170`,
   `'bold 22px sans-serif'`.

# --task-tr--

1. `const COLORS = ...` satırının hemen altına cepleri ekle:

   ```js
   const POCKETS = [
     [LEFT, TOP], [240, TOP], [RIGHT, TOP],
     [LEFT, BOTTOM], [240, BOTTOM], [RIGHT, BOTTOM],
   ]
   const POCKET_R = 15
   ```

2. `let state` satırının yorumunu yeni durumu da anlatacak şekilde güncelle (isteğe bağlı):

   ```js
   let state // 'aiming', 'rolling' or 'won'
   ```

3. `collide` fonksiyonunun kapanış `}`'inden sonra, `function step()`'ten önce cep sorusunu yaz:

   ```js
   function pocketed(b) {
     return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
   }
   ```

4. `step()`'in sonunda, çarpışma satırından sonra ve kapanış `}`'inden önce cebe girenleri çıkaran satırları ekle;
   `step`'in kapanışından sonra da `respot` fonksiyonunu yaz:

   ```js
     for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
     balls = balls.filter((b) => {                // ← yeni
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
   ```

5. `update()`'in son satırını (`if (!moving) state = 'aiming'`) şu üç satırla değiştir:

   ```js
     if (moving) return                           // ← değişti
     if (!balls.includes(cue)) respot()           // ← yeni
     state = balls.length === 1 ? 'won' : 'aiming' // ← yeni
   }
   ```

6. Tuş dinleyicisindeki boşluk satırını değiştir: kazandıysan boşluk yeni oyun başlatsın:

   ```js
     else if (event.key === ' ') state === 'won' ? reset() : shoot() // ← değişti
   ```

7. `draw()` içinde yeşil çuhayı boyayan satırdan hemen sonra cepleri çiz:

   ```js
     ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
     for (const [px, py] of POCKETS) { // ← yeni
       ctx.fillStyle = '#020617'
       ctx.beginPath()
       ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
       ctx.fill()
     }
   ```

8. `draw()`'un sonundaki `ctx.fillText('Shots ' + shots, LEFT, 22)` satırını değiştir ve altına kazanma yazısını ekle:

   ```js
     ctx.fillText('Shots ' + shots + '  Left ' + (balls.filter((b) => !b.cue).length), LEFT, 22) // ← değişti
     if (state === 'won') {                                                                      // ← yeni
       ctx.textAlign = 'center'
       ctx.font = 'bold 22px sans-serif'
       ctx.fillText('Table cleared in ' + shots + ' shots!', canvas.width / 2, 170)
     }
   }
   ```

9. **Çalıştır**'a bas. Masada altı siyah cep görmelisin, üstte `Shots 0  Left 10` yazmalı. Oynamak için önce oyuna
   tıkla ve vur: cebe giren toplar kaybolmalı. Alttaki kontrollerin hepsi yeşil olmalı. Yazı kontrolü kırmızıysa
   `'  Left '` içindeki iki boşluğa bak.

# --tests--

Corner pockets and the narrower middle pockets should catch a ball.
tr: Köşe cepleri ve daha dar orta cepler bir topu yakalamalı.

```js
assert.isTrue(pocketed({ x: 29, y: 49 }), 'a corner pocket')
assert.isTrue(pocketed({ x: 240, y: 49 }), 'a middle pocket')
assert.isFalse(pocketed({ x: 255, y: 49 }), 'the middle pockets are narrower')
assert.isFalse(pocketed({ x: 240, y: 160 }))
```

A pocketed ball should leave the table; a scratch should cost a shot and bring the cue ball back.
tr: Cebe giren bir top masadan çıkmalı; faul bir vuruşa mal olmalı ve isteka topunu geri getirmeli.

```js
const one = balls[1]
one.x = 60
one.y = 80
one.vx = -3
one.vy = -3
state = 'rolling'
for (let i = 0; i < 200 && state === 'rolling'; i++) $.tick(1)
assert.notInclude(balls, one, 'the ball dropped into the pocket')
assert.lengthOf(balls, 10)
$.tick(1)
assert.include($.texts(), 'Shots 0  Left 9')
cue.x = 440
cue.y = 60
cue.vx = 3
cue.vy = -3
state = 'rolling'
for (let i = 0; i < 200 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(shots, 1, 'a scratch costs a shot')
assert.include(balls, cue, 'the cue ball comes back')
assert.deepEqual([cue.x, cue.y, cue.vx, cue.vy], [130, 160, 0, 0])
```

Pocketing the last ball should clear the table, and the cue ball should find room when its spot is taken.
tr: Son topu cebe sokmak masayı temizlemeli ve noktası doluysa isteka topu yer bulmalı.

```js
balls = [cue, ball(60, 80, '#fff', 5)]
balls[1].vx = -3
balls[1].vy = -3
state = 'rolling'
for (let i = 0; i < 200 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(state, 'won')
$.tick(1)
assert.include($.texts(), 'Table cleared in 0 shots!')
$.press(' ')
assert.strictEqual(state, 'aiming')
assert.lengthOf(balls, 11)
balls.push(ball(131, 161, '#fff', 11))
balls = balls.filter((b) => b !== cue)
respot()
assert.isBelow(cue.x, 130 - R, 'the spot is taken, so it moves left')
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
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
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
  else if (event.key === ' ') state === 'won' ? reset() : shoot()
  else return
  event.preventDefault()
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
