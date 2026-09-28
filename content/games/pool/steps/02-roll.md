---
title: Rolling and cushions
title_tr: Yuvarlanma ve bantlar
skills: [game.physics, game.loop]
---

# --explanation--

A shot gives the cue ball a **velocity**: a speed (`power`) in a direction (`aim`, an angle). Trigonometry turns the angle
into the two parts that the position needs:

```js
cue.vx = Math.cos(aim) * power
cue.vy = Math.sin(aim) * power
```

Angle `0` points right, `Math.PI / 2` points **down** (the canvas y axis grows downwards), and the arrow keys turn the aim a
little each press.

Every frame each ball moves by its velocity, then **friction** keeps only 98.5% of the speed. Multiplying by the same number
every frame makes the ball slow down smoothly, fast at first and gently at the end. Below a tiny speed we set it to exactly
zero; otherwise it would creep forever, never quite stopping.

A **cushion** reflects the ball: past the left edge, put it back on the edge and flip `vx`. Real cushions absorb some energy,
so the bounce keeps only 80% (`BOUNCE`).

While anything moves, the game is `'rolling'` and waits; when all balls are still, it is `'aiming'` again. A thin line from the
cue ball shows the aim.

# --explanation-tr--

**Bu adımda:** isteka topuna vuracağız. Sol/sağ oklarla nişanı döndürecek, boşlukla vuracaksın. Top ince bir nişan
çizgisi boyunca gidecek, bantlardan sekecek, yavaşlayıp duracak. Sol üstte kaç vuruş yaptığın yazacak.

**Açıdan yön.** Vuruş isteka topuna bir **hız** verir: bir büyüklük (`power`) ve bir yön (`aim`, bir açı).
JavaScript açıyı derece değil **radyan** ile ölçer: `Math.PI` (π, yaklaşık 3,14) yarım tur, `Math.PI * 2` tam tur.
Açı `0` sağa, `Math.PI / 2` **aşağı** bakar (çünkü canvas'ta `y` aşağı doğru büyür).

Bir açının sağa ne kadar gittiğini `Math.cos(açı)`, aşağı ne kadar gittiğini `Math.sin(açı)` verir (her biri -1 ile
1 arasında). Bunları güçle çarparak iki hız parçasını buluruz:

```js
cue.vx = Math.cos(aim) * power
cue.vy = Math.sin(aim) * power
```

`aim = 0`, `power = 8` ise `vx = 8`, `vy = 0`: top her karede 8 piksel sağa gider.

**Sürtünme.** Her karede her top hızı kadar yer değiştirir (`b.x += b.vx`, `+=` "üstüne ekle"), sonra hızının sadece
%98.5'i kalır (`b.vx *= FRICTION`, `*=` "şununla çarp"). Hep aynı sayıyla çarpmak topu yumuşakça yavaşlatır: başta
hızlı, sonda nazik. Hız çok küçülünce (`< 0.05`) tam **sıfır** yaparız; yoksa top sonsuza kadar sürünürdü.
`Math.hypot(vx, vy)` iki hız parçasından toplam hızı (Pisagor ile) hesaplar. `b.vx = b.vy = 0` ikisine birden 0 koyar.

**Bant (cushion).** Top sol kenarı geçerse onu kenara geri koyar ve `vx`'in işaretini çeviririz (`-` ile): sağa değil
sola gidiyorsa artık sağa gider. Gerçek bantlar biraz enerji yutar; bu yüzden hızın %80'i kalır (`BOUNCE`).

```js
if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
```

Köşeli parantezli bu yazım iki değeri bir arada koyar: `b.x`'e `LEFT + R`, `b.vx`'e `-b.vx * BOUNCE`. Kenar
`LEFT + R`'dir, çünkü topun **merkezi** kenardan bir yarıçap içeride durmalı.

**Durum (state).** Bir şey hareket ederken oyun `'rolling'` (yuvarlanıyor) durumundadır ve bekler; hepsi durunca
tekrar `'aiming'` (nişan alma) olur. `if (state !== 'aiming') return` → "nişan almıyorsak fonksiyondan hemen çık".
`!==` "eşit değil", `return` "burada bitir" demektir. `if (!moving)` → `!` "değil": "hareket eden yoksa".

**Tuşlar.** `document.addEventListener('keydown', (event) => { ... })` → "bir tuşa basıldığında şu işi yap".
`(event) => { ... }` kısa yazılmış bir fonksiyondur; `event.key` basılan tuşun adıdır (`'ArrowLeft'`, `' '` boşluk).
`else if` "değilse, şu mu?" diye zincirler. Bu üç tuştan biri değilse `else return` ile çıkarız; biriyse
`event.preventDefault()` tarayıcının o tuşla kendi işini yapmasını (sayfayı kaydırmak gibi) engeller.

**Nişan çizgisi.** `moveTo` kalemi topa götürür, `lineTo` 400 piksel ötedeki noktaya çizgi çeker, `stroke()` çizer.
`'rgba(255, 255, 255, 0.6)'` %60 opak beyazdır (son sayı saydamlık). `'Shots ' + shots` → `+` yazıları yan yana ekler:
`'Shots 0'`.

# --task--

1. Add `FRICTION = 0.985`, `BOUNCE = 0.8`, and `aim`, `power`, `shots` and `state` (`0`, `8`, `0` and `'aiming'` in
   `reset()`).
2. Write `shoot()`: only while `'aiming'`, set the cue ball's velocity from `aim` and `power`, add 1 to `shots` and set
   `'rolling'`.
3. Write `step()`: move every ball by its velocity, and at each cushion put it back on the edge (`LEFT + R` and so on) and
   reverse that part of the velocity, times `BOUNCE`.
4. Write `update()`, called before `draw()`: while `'rolling'`, `step()`, multiply every velocity by `FRICTION`, set a ball
   slower than `0.05` to exactly zero, and go back to `'aiming'` when nothing moves.
5. Left and Right change `aim` by `0.035`; Space shoots (`preventDefault()` for these keys).
6. While aiming, stroke a line (`'rgba(255, 255, 255, 0.6)'`, width 1) from the cue ball 400 pixels along the aim. Draw
   `Shots 0` at `(LEFT, 22)` in white, `'bold 16px sans-serif'`.

# --task-tr--

1. `const COLORS = ...` satırının hemen altına iki ayar ekle:

   ```js
   const FRICTION = 0.985 // speed kept each frame
   const BOUNCE = 0.8 // speed kept when hitting a cushion
   ```

2. `let cue` satırının hemen altına dört ad ekle:

   ```js
   let aim // angle of the shot, in radians
   let power
   let shots
   let state // 'aiming' or 'rolling'
   ```

3. `reset` fonksiyonunu şöyle genişlet:

   ```js
   function reset() {
     rack()
     aim = 0          // ← yeni
     power = 8        // ← yeni
     shots = 0        // ← yeni
     state = 'aiming' // ← yeni
   }
   ```

4. `reset`'in kapanış `}`'inden sonra, `function draw()`'dan önce üç fonksiyon yaz: vuruş, bir adım hareket ve her
   karedeki güncelleme.

   ```js
   function shoot() {
     if (state !== 'aiming') return
     cue.vx = Math.cos(aim) * power
     cue.vy = Math.sin(aim) * power
     shots += 1
     state = 'rolling'
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
     if (!moving) state = 'aiming'
   }
   ```

5. Altına tuşları dinleyen satırları yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowLeft') aim -= 0.035
     else if (event.key === 'ArrowRight') aim += 0.035
     else if (event.key === ' ') shoot()
     else return
     event.preventDefault()
   })
   ```

6. `draw()` içinde yeşil çuhayı boyayan `ctx.fillRect(LEFT, TOP, ...)` satırından sonra, `for (const b of balls)`
   döngüsünden önce nişan çizgisini ekle:

   ```js
     if (state === 'aiming') {                                              // ← yeni
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
       ctx.lineWidth = 1
       ctx.beginPath()
       ctx.moveTo(cue.x, cue.y)
       ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
       ctx.stroke()
     }
   ```

7. `draw()`'un en sonunda, topları çizen döngünün kapanış `}`'inden sonra ve fonksiyonun kapanış `}`'inden önce
   vuruş sayısını yaz:

   ```js
     ctx.fillStyle = 'white'                 // ← yeni
     ctx.font = 'bold 16px sans-serif'       // ← yeni
     ctx.textAlign = 'left'                  // ← yeni
     ctx.fillText('Shots ' + shots, LEFT, 22) // ← yeni
   }
   ```

8. `loop` fonksiyonunda `draw()`'dan önce `update()` çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Oklarla çizgiyi döndür, boşlukla vur: beyaz top çizgi boyunca
   gitmeli, bantlardan sekip durmalı ve sol üstte `Shots 1` yazmalı (diğer toplarla henüz çarpışmaz, içlerinden geçer).
   Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `step` içindeki dört satırda `+ R` / `- R` ve eksi
   işaretlerine bak.

# --tests--

Space should shoot along the aim, and friction should slow the ball every frame.
tr: Boşluk nişan boyunca vurmalı ve sürtünme topu her karede yavaşlatmalı.

```js
assert.strictEqual(state, 'aiming')
$.press('ArrowRight')
$.press('ArrowRight')
assert.closeTo(aim, 0.07, 1e-9)
$.press('ArrowLeft')
aim = 0
$.press(' ')
assert.strictEqual(state, 'rolling')
assert.strictEqual(shots, 1)
assert.deepEqual([cue.vx, cue.vy], [8, 0])
$.press(' ')
assert.strictEqual(shots, 1, 'no second shot while rolling')
$.tick(1)
assert.strictEqual(cue.x, 138)
assert.closeTo(cue.vx, 8 * FRICTION, 1e-9, 'friction slows the ball every frame')
```

A ball should bounce off a cushion and finally stop.
tr: Bir top banttan sekmeli ve sonunda durmalı.

```js
aim = Math.PI / 2
power = 8
shoot()
let bounced = false
for (let i = 0; i < 600 && state === 'rolling'; i++) {
  $.tick(1)
  assert.isAtMost(cue.y, BOTTOM - R, 'the cushion stops the ball')
  if (cue.vy < 0) bounced = true
}
assert.isTrue(bounced, 'it bounces back off the cushion')
assert.strictEqual(state, 'aiming', 'and stops in the end')
assert.strictEqual(cue.vx, 0)
assert.strictEqual(cue.vy, 0)
```

The aim line should point where the shot will go.
tr: Nişan çizgisi vuruşun gideceği yeri göstermeli.

```js
aim = Math.PI / 2
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '130,560', 'the aim line points the way the shot will go')
$.tick(1)
assert.include($.texts(), 'Shots 0')
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
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let shots
let state // 'aiming' or 'rolling'

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
  if (!moving) state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === ' ') shoot()
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
  ctx.fillText('Shots ' + shots, LEFT, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
