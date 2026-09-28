---
title: The launcher and three balls
title_tr: Fırlatıcı ve üç top
skills: [game.input, game.state]
---

# --explanation--

A real launcher is a spring: the longer you pull it back, the harder the ball flies. So Space now works in two halves:

- **holding** it pulls the spring: `charge` grows from 0 to 1 over about a second;
- **letting go** launches with a speed between 13 and 19, depending on the charge.

The spring and the ball in the lane are drawn lower as the charge grows, so you can see how far you have pulled.

That is also why the key handler now listens to `keyup` as well as `keydown`: the launch happens on the *release*, and only if
the key was held (`pressed.launch`).

A game gets **three balls**. A drained ball costs one; after the last one the game is over, the best score is saved, and Space
starts again.

# --explanation-tr--

**Bu adımda:** fırlatıcıyı gerçek bir **yay** gibi yapacağız ve oyuna **üç top** hakkı ekleyeceğiz. Boşluk'u ne kadar
uzun basılı tutarsan yay o kadar gerilecek (gri yay ve top aşağı inecek), bırakınca top o kadar hızlı fırlayacak.
Üç top düşünce `Game over` yazısı çıkacak.

**Yay iki yarıda çalışır:**

- **basılı tutmak** yayı çeker: `charge` (gerginlik) yaklaşık bir saniyede 0'dan 1'e çıkar (her karede `0.02`);
- **bırakmak** topu 13 ile 19 arasında bir hızla fırlatır: `-(13 + 6 * charge)`. `charge` 0 ise 13, 1 ise 19.

Yay ve kanaldaki top, gerginlik arttıkça biraz aşağıda çizilir (`charge * 12` piksel); böylece ne kadar çektiğini
görürsün.

**Neden `keyup`?** Fırlatma tuşu **bırakınca** olur, ve sadece tuş gerçekten basılı tutulduysa
(`pressed.launch`). Önceki adımda yazdığın `key(event, down)` fonksiyonu zaten hem basmayı (`down = true`) hem
bırakmayı (`down = false`) duyuyor.

**Üç top ve oyun sonu.** Düşen top bir hak yer (`balls -= 1`, yani 1 azalt). Hak kalmayınca `state` `'over'` olur;
Boşluk'a basmak oyunu baştan başlatır.

**En iyi skoru saklamak: `localStorage`.** Tarayıcının küçük bir defteridir; sayfa kapansa da içindekiler kalır.

```js
localStorage.setItem('pinball-best', 1234) // deftere yaz
localStorage.getItem('pinball-best')       // oku: '1234' (yazı olarak döner)
```

Okunan değer yazı olduğu için `Number(...)` ile sayıya çeviririz. Defterde hiç kayıt yoksa sonuç sayı olmaz; o
zaman `|| 0` "değilse 0 kullan" der.

**Yeni çizim parçaları:** `textAlign = 'right'` yazıyı verilen noktada biten, `'center'` ortalanan şekilde yazar.
`'rgba(12, 10, 9, 0.85)'` kırmızı, yeşil, mavi ve **saydamlık** (0.85 = biraz saydam) ile verilen bir renktir.
`Math.min(1, ...)` iki sayıdan küçüğünü seçer; `charge` 1'i geçmez.

# --task--

1. Add `charge` (`0` in `newBall()`) and `pressed.launch`. While ready and `pressed.launch`, `charge` grows by `0.02` a frame, up
   to 1. `launch()` sets `vy = -(13 + 6 * charge)`.
2. Space and Down: pressing sets `pressed.launch` (or restarts when the game is over); letting go launches if it was held.
3. Add `balls` (`3` in `reset()`) and `best` in `localStorage` under `'pinball-best'`. A drained ball takes one; at 0 the state is
   `'over'` and a better score is saved.
4. Draw the spring (`'#78716c'`, 16 by 20 at `(LANE_X - 8, 580 + charge * 12)`) and the ready ball `charge * 12` lower; `Balls 3`
   right-aligned at `(330, 50)`, `Best 0` centered at `(200, 50)` (`'13px sans-serif'`), `Hold Space, let go to launch` at
   `(200, 580)` while ready, and a `Game over` panel with `Space to play again` at the end.

# --task-tr--

1. Dosyanın başındaki `let` satırlarını (`let ball`'dan `let flash`'a kadar) şöyle değiştir; yeni ve değişen
   satırlar işaretli:

   ```js
   let ball // { x, y, vx, vy }
   let flippers // { ...FLIPPERS[i], angle, speed }
   let pressed // { left, right, launch }               ← değişti (sadece yorum)
   let charge // 0 to 1 while the launcher is held      ← yeni
   let state // 'ready' (in the lane), 'playing' or 'over'
   let score
   let balls                                            // ← yeni
   let flash // frames each bumper stays lit
   let best = Number(localStorage.getItem('pinball-best')) || 0 // ← yeni
   ```

   `← yeni` gibi işaretler yorumun içinde; onları yazman gerekmez.

2. `newBall()` ve `reset()` fonksiyonlarını şöyle değiştir:

   ```js
   function newBall() {
     ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
     charge = 0 // ← yeni
     state = 'ready'
   }

   function reset() {
     score = 0
     flash = BUMPERS.map(() => 0)
     flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
     pressed = { left: false, right: false, launch: false } // ← değişti
     balls = 3 // ← yeni
     newBall()
   }
   ```

3. `update()` fonksiyonunda `if (state === 'ready') { ... }` bloğunu şöyle değiştir ve hemen altına bir satır ekle:

   ```js
     if (state === 'ready') {
       for (const f of flippers) f.angle += f.speed
       if (pressed.launch) charge = Math.min(1, charge + 0.02) // ← yeni
       return
     }
     if (state !== 'playing') return // ← yeni
   ```

4. `update()`'in son satırını (`if (ball.y > canvas.height + R) newBall() // drained: the next ball`) sil ve yerine
   şunu yaz:

   ```js
     if (ball.y > canvas.height + R) {
       balls -= 1
       if (balls > 0) newBall()
       else {
         state = 'over'
         if (score > best) {
           best = score
           localStorage.setItem('pinball-best', best)
         }
       }
     }
   ```

5. `launch()` fonksiyonunu şöyle değiştir:

   ```js
   function launch() {
     if (state !== 'ready') return
     ball.vy = -(13 + 6 * charge) // ← değişti
     charge = 0                   // ← yeni
     state = 'playing'
   }
   ```

6. `key()` fonksiyonunda Boşluk/Aşağı kısmındaki `if (down) launch()` satırını üç satırla değiştir:

   ```js
     else if (k === ' ' || k === 'ArrowDown') {
       if (down && state === 'over') reset()          // ← değişti
       else if (!down && pressed.launch) launch()      // ← yeni
       pressed.launch = down                           // ← yeni
     } else return
   ```

   `!down` "`down` değilse", yani tuş bırakıldıysa demektir (`!` "değil").

7. `draw()`'da paletleri çizen `for` döngüsünün kapanış `}`'inin altına yayı çiz, ve hemen altındaki topu çizen
   `ctx.arc(...)` satırını değiştir:

   ```js
     // The launcher's spring shortens as it is pulled back.
     ctx.fillStyle = '#78716c'
     ctx.fillRect(LANE_X - 8, 580 + charge * 12, 16, 20)
     ctx.fillStyle = '#e7e5e4'
     ctx.beginPath()
     ctx.arc(ball.x, ball.y + (state === 'ready' ? charge * 12 : 0), R, 0, Math.PI * 2) // ← değişti
     ctx.fill()
   ```

8. `draw()`'un sonunda `ctx.fillText('Score ' + score, 30, 50)` satırının altına (kapanış `}`'inden önce) şunları
   ekle:

   ```js
     ctx.textAlign = 'right'
     ctx.fillText('Balls ' + balls, 330, 50)
     ctx.textAlign = 'center'
     ctx.font = '13px sans-serif'
     ctx.fillText('Best ' + best, 200, 50)
     if (state === 'ready') ctx.fillText('Hold Space, let go to launch', 200, 580)
     if (state === 'over') {
       ctx.fillStyle = 'rgba(12, 10, 9, 0.85)'
       ctx.fillRect(60, 330, 280, 80)
       ctx.fillStyle = 'white'
       ctx.font = 'bold 22px sans-serif'
       ctx.fillText('Game over', 200, 364)
       ctx.font = '15px sans-serif'
       ctx.fillText('Space to play again', 200, 392)
     }
   ```

9. **Çalıştır**'a bas. Üstte `Balls 3` ve `Best 0`, altta `Hold Space, let go to launch` görünmeli. Oynamak için önce
   oyuna tıkla; Boşluk'u basılı tutunca yay inmeli, bırakınca top fırlamalı. Alttaki kontrollerin hepsi yeşil
   olmalı. Top hiç fırlamıyorsa 6. maddedeki üç satırın sırasını kontrol et: `pressed.launch = down` en sonda olmalı.

# --tests--

Holding Space should pull the spring, and letting go should launch harder the longer it was held.
tr: Boşluk'u tutmak yayı çekmeli ve bırakmak ne kadar uzun tutulduysa o kadar sert fırlatmalı.

```js
assert.strictEqual(balls, 3)
$.tick(1)
assert.include($.texts(), 'Balls 3')
assert.include($.texts(), 'Hold Space, let go to launch')
$.press(' ')
$.tick(25)
assert.closeTo(charge, 0.5, 1e-9, 'holding pulls the spring')
$.tick(50)
assert.strictEqual(charge, 1)
$.release(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(ball.vy, -19, 'a full pull launches hardest')
```

Losing three balls should end the game, and Space should restart it.
tr: Üç top kaybetmek oyunu bitirmeli ve Boşluk yeniden başlatmalı.

```js
for (let n = 3; n > 0; n--) {
  launch()
  ball = { x: 200, y: 590, vx: 0, vy: 3 }
  $.tick(10)
}
assert.strictEqual(state, 'over')
assert.strictEqual(balls, 0)
$.tick(1)
assert.include($.texts(), 'Game over')
$.press(' ')
assert.strictEqual(state, 'ready')
assert.strictEqual(balls, 3)
```

The best score should be saved when the game ends.
tr: Oyun bitince en iyi puan kaydedilmeli.

```js
score = 1234
for (let n = 3; n > 0; n--) {
  launch()
  ball = { x: 200, y: 590, vx: 0, vy: 3 }
  $.tick(10)
}
assert.strictEqual(best, 1234)
assert.strictEqual(localStorage.getItem('pinball-best'), '1234')
$.tick(1)
assert.include($.texts(), 'Best 1234')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]
const FLIPPER_LENGTH = 62
const FLIP_SPEED = 0.25 // radians per frame
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let pressed // { left, right, launch }
let charge // 0 to 1 while the launcher is held
let state // 'ready' (in the lane), 'playing' or 'over'
let score
let balls
let flash // frames each bumper stays lit
let best = Number(localStorage.getItem('pinball-best')) || 0

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  charge = 0
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false, launch: false }
  score = 0
  balls = 3
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

// Push the ball out of a segment and bounce it. `surface` is how fast the segment itself moves at that point:
// the bounce works on the speed of the ball relative to the surface, which is how a flipper throws the ball.
function hitSegment(x1, y1, x2, y2, bounce, surface) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  const sx = surface ? surface(px, py).x : 0
  const sy = surface ? surface(px, py).y : 0
  const vn = (ball.vx - sx) * nx + (ball.vy - sy) * ny
  if (vn < 0) {
    ball.vx -= (1 + bounce) * vn * nx
    ball.vy -= (1 + bounce) * vn * ny
  }
  return true
}

function hitBumper(b, i) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
  // A bumper kicks the ball away, faster than it came.
  const vn = ball.vx * nx + ball.vy * ny
  ball.vx += (-vn + 6) * nx
  ball.vy += (-vn + 6) * ny
  if (flash[i] === 0) score += 100
  flash[i] = 10
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
  for (const f of flippers) {
    f.angle += f.speed / SUB
    const t = tip(f)
    // A point on a turning flipper moves at speed × distance from the pivot, at right angles to it.
    hitSegment(f.x, f.y, t.x, t.y, 0.3, (px, py) => ({ x: -f.speed * (py - f.y), y: f.speed * (px - f.x) }))
  }
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  for (const f of flippers) {
    // Up while the key is held, back down when it is let go, and stop at either end.
    const target = pressed[f.key] ? f.up : f.rest
    const dir = Math.sign(target - f.angle)
    f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
  }
  if (state === 'ready') {
    for (const f of flippers) f.angle += f.speed
    if (pressed.launch) charge = Math.min(1, charge + 0.02)
    return
  }
  if (state !== 'playing') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) {
    balls -= 1
    if (balls > 0) newBall()
    else {
      state = 'over'
      if (score > best) {
        best = score
        localStorage.setItem('pinball-best', best)
      }
    }
  }
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -(13 + 6 * charge)
  charge = 0
  state = 'playing'
}

function key(event, down) {
  const k = event.key
  if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
  else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
  else if (k === ' ' || k === 'ArrowDown') {
    if (down && state === 'over') reset()
    else if (!down && pressed.launch) launch()
    pressed.launch = down
  } else return
  event.preventDefault()
}

document.addEventListener('keydown', (event) => key(event, true))
document.addEventListener('keyup', (event) => key(event, false))

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  BUMPERS.forEach((b, i) => {
    ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
  // The launcher's spring shortens as it is pulled back.
  ctx.fillStyle = '#78716c'
  ctx.fillRect(LANE_X - 8, 580 + charge * 12, 16, 20)
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y + (state === 'ready' ? charge * 12 : 0), R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
  ctx.textAlign = 'right'
  ctx.fillText('Balls ' + balls, 330, 50)
  ctx.textAlign = 'center'
  ctx.font = '13px sans-serif'
  ctx.fillText('Best ' + best, 200, 50)
  if (state === 'ready') ctx.fillText('Hold Space, let go to launch', 200, 580)
  if (state === 'over') {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.85)'
    ctx.fillRect(60, 330, 280, 80)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Game over', 200, 364)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space to play again', 200, 392)
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
