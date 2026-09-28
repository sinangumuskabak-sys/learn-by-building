---
title: Seeing the path, dragging the band
title_tr: Yolu görmek, lastiği çekmek
skills: [game.physics, game.input]
---

# --explanation--

Aiming blind is frustrating. Since we know the physics, we can **draw the path before the shot**.

Without air, the position after `t` frames has a formula. Sideways, the speed never changes, so `x` just grows by `vx` every
frame. Downwards, the speed grows by `GRAVITY` every frame, and the distance fallen grows with the **square** of time:

```js
x = SLING.x + vx * t
y = SLING.y + vy * t + (GRAVITY * t * t) / 2
```

A dot every 4 frames, until the path reaches the ground, gives the dotted line. The real bird ends up a hair lower than the
dots, because the game adds gravity in whole-frame steps rather than smoothly. The formula is the smooth version, and at a
few pixels the difference does not matter for aiming.

Then the pointer: press **on the sling** (within 60 pixels), pull away, and let go. As in the pool game, the vector from the
pointer back to the sling gives both the angle (`Math.atan2`) and the pull (`Math.hypot`, capped at `MAX_PULL`). A tiny pull
does not launch, so a stray tap does not waste a bird.

# --explanation-tr--

**Bu adımda:** nişan alırken kuşun gideceği yol beyaz noktalarla önceden görünecek. Ayrıca fareyle (ya da parmakla)
sapanı tutup geri çekerek, gerçek bir sapan gibi nişan alıp bırakabileceksin.

**Körlemesine nişan almak sinir bozucu.** Fiziği bildiğimize göre yolu **atıştan önce çizebiliriz**. Hava direnci
olmadığında, `t` kare sonraki konum için bir formül var:

- **Yana doğru** hız hiç değişmez; `x` her karede `vx` kadar büyür: `x = SLING.x + vx * t`.
- **Aşağı doğru** hız her karede `GRAVITY` kadar artar; düşülen yol zamanın **karesiyle** büyür:

```js
x = SLING.x + vx * t
y = SLING.y + vy * t + (GRAVITY * t * t) / 2
```

Her 4 karede bir nokta koyarız (`t = 4, 8, 12, ... 60`), yol zemine ulaşana kadar. Bu, noktalı çizgiyi verir. Gerçek
kuş noktalardan bir tık aşağıda kalır, çünkü oyun yerçekimini kare kare, basamak basamak ekler; formül ise pürüzsüz
hâlidir. Birkaç piksellik fark nişan için önemli değil.

**Döngüde yeni iki şey:**

- `for (let t = 4; t <= 60; t += 4)` → `t` 4'ten başlar, her turda 4 artar, 60'ı geçince durur.
- `break` → "döngüyü hemen bitir". Nokta zeminin altına düşünce (`y > GROUND`) sonrakileri çizmeyiz.

Noktalar 4×4 küçük karelerdir; `x - 2`, `y - 2` onları noktanın tam ortasına oturtur. `'rgba(255, 255, 255, 0.8)'`
biraz saydam beyazdır (son sayı saydamlık).

**Fareyle nişan: sapanı tut ve çek.** Sapana 60 pikselden yakın bir yere basarsın, uzaklaşarak çekersin, bırakırsın.
Göstericiden sapana doğru olan ok, hem açıyı hem çekişi verir:

- `Math.atan2(dy, dx)` bir farkın **yönünü** radyan olarak verir → açı.
- `Math.hypot(dx, dy)` iki nokta arasındaki düz **uzaklıktır** → çekiş (en fazla `MAX_PULL`).

Fark `SLING - point` alındığı için sapanın sol altına çekersen kuş sağ üste nişan alır. Küçücük bir çekiş (15'ten az)
fırlatmaz; yanlışlıkla dokunmak bir kuşu harcamasın.

**Fare olayları:** `pointerdown` (basıldı), `pointermove` (hareket etti), `pointerup` (bırakıldı). Basılı olup olmadığını
`dragging` (`true`/`false`) değişkeninde tutarız. `pointerup`'ı `canvas`'a değil `document`'e (bütün sayfaya) bağlarız;
böylece fare canvas'ın dışında bırakılsa bile yakalanır.

**Ekran noktasını canvas noktasına çevirmek.** Canvas ekranda büyütülmüş ya da küçültülmüş olabilir. `toCanvas(event)`
bunu düzeltir: `getBoundingClientRect()` canvas'ın sayfadaki yerini ve boyunu verir; `event.clientX - rect.left`
göstericinin canvas'ın solundan uzaklığıdır; `canvas.width / rect.width` oranıyla çarpınca canvas pikseline çevrilir.

# --task--

1. While aiming, draw a `'rgba(255, 255, 255, 0.8)'` dot (a 4 by 4 square centered on the point) for `t = 4, 8, ..., 60`
   using the formula above, stopping at the first one below the ground.
2. Add `dragging` (`false` in `reset()`) and write `toCanvas(event)` and `pull(point)`, which sets the angle and the pull from
   the vector `SLING - point`.
3. `pointerdown` while aiming within 60 pixels of the sling starts dragging and pulls; `pointermove` pulls while dragging; on
   the document's `pointerup`, stop dragging and launch if the pull is at least 15.

# --task-tr--

1. `let aim ...` satırının altına ekle:

   ```js
   let dragging
   ```

2. `reset()` içinde `aim = ...` satırının altına ekle:

   ```js
     dragging = false
   ```

3. `keydown` olayının kapanış `})`'sinden sonra, `function draw()`'un **üstüne** fare kodunu yaz:

   ```js
   function toCanvas(event) {
     const rect = canvas.getBoundingClientRect()
     return {
       x: ((event.clientX - rect.left) * canvas.width) / rect.width,
       y: ((event.clientY - rect.top) * canvas.height) / rect.height,
     }
   }

   // Drag back from the sling like a real one: the bird flies the other way, harder the further you pull.
   function pull(point) {
     const dx = SLING.x - point.x
     const dy = SLING.y - point.y
     aim.angle = Math.atan2(dy, dx)
     aim.pull = Math.min(MAX_PULL, Math.hypot(dx, dy))
   }

   canvas.addEventListener('pointerdown', (event) => {
     if (state !== 'aiming') return
     const point = toCanvas(event)
     if (Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60) return
     dragging = true
     pull(point)
   })

   canvas.addEventListener('pointermove', (event) => {
     if (dragging) pull(toCanvas(event))
   })

   document.addEventListener('pointerup', () => {
     if (!dragging) return
     dragging = false
     if (aim.pull >= 15) launch()
   })
   ```

   `pointerdown`: nişan alınmıyorsa ya da sapandan 60 pikselden uzağa basıldıysa hiçbir şey yapmaz; değilse çekmeye başlar.

4. `draw()` içinde yorumu değiştir; `if (state === 'aiming') {` satırının hemen altına hızı hesaplayan satırı, lastiği
   çizen `ctx.stroke()`'un altına da noktaları ekle:

   ```js
     // The sling and, while aiming, the pulled-back bird and the path it will take. // ← değişti
     ctx.fillStyle = '#78350f'
     ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
     if (state === 'aiming') {
       const { vx, vy } = launchVelocity() // ← yeni
       const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
       const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
       ctx.strokeStyle = '#451a03'
       ctx.lineWidth = 3
       ctx.beginPath()
       ctx.moveTo(SLING.x, SLING.y)
       ctx.lineTo(bx, by)
       ctx.stroke()
       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)' // ← yeni (buradan)
       for (let t = 4; t <= 60; t += 4) {
         // Where the bird will be after t frames: x grows steadily, y follows a parabola.
         const x = SLING.x + vx * t
         const y = SLING.y + vy * t + (GRAVITY * t * t) / 2
         if (y > GROUND) break
         ctx.fillRect(x - 2, y - 2, 4, 4)
       } // ← (buraya kadar)
       ctx.fillStyle = MATERIALS.bird.color
   ```

   Altındaki kuş çizimi aynen kalır.

5. **Çalıştır**'a bas. Sapandan sağa doğru beyaz noktalı bir yay görmelisin; oklarla nişanı değiştirince yay da
   değişmeli. Fareyle kuşun yanına basıp sol aşağı çek ve bırak: kuş noktaların gösterdiği yoldan uçmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. "Parabol" kontrolü kırmızıysa `y` formülündeki `(GRAVITY * t * t) / 2` parantezlerini kontrol et.

# --tests--

The dots should follow the parabola, and the bird should fly along them.
tr: Noktalar parabolü izlemeli ve kuş onlar boyunca uçmalı.

```js
aim = { angle: -0.5, pull: 40 }
$.tick(1)
const { vx, vy } = launchVelocity()
const dots = $.rects('rgba(255, 255, 255, 0.8)')
assert.isAbove(dots.length, 5)
assert.closeTo(dots[0].x + 2, SLING.x + vx * 4, 1e-9)
assert.closeTo(dots[0].y + 2, SLING.y + vy * 4 + (GRAVITY * 16) / 2, 1e-9, 'y follows a parabola')
launch()
$.tick(20)
assert.closeTo(bird.x + BIRD, SLING.x + vx * 20, 1e-6, 'the bird flies along the dots')
assert.closeTo(bird.y + BIRD, SLING.y + vy * 20 + (GRAVITY * 400) / 2, 3)
```

Dragging back from the sling should aim the other way, up to the maximum pull, and letting go should launch.
tr: Sapandan geri çekmek ters yöne nişan almalı, en fazla çekişe kadar; bırakmak fırlatmalı.

```js
$.pointerDown(60, 240)
assert.isTrue(dragging)
assert.closeTo(aim.angle, Math.atan2(-20, 30), 1e-9, 'pulling down and left aims up and right')
assert.closeTo(aim.pull, Math.hypot(30, 20), 1e-9)
$.move(0, 220)
assert.strictEqual(aim.pull, MAX_PULL, 'the pull is limited')
assert.closeTo(aim.angle, 0, 1e-9)
$.pointerUp(0, 220)
assert.strictEqual(state, 'flying')
assert.closeTo(bird.vx, MAX_PULL * LAUNCH, 1e-9)
```

Only a press on the sling should start aiming, and a tiny pull should not launch.
tr: Nişanı yalnızca sapana basmak başlatmalı ve küçücük bir çekiş fırlatmamalı.

```js
$.pointerDown(400, 100)
assert.isFalse(dragging, 'you have to grab the sling')
$.pointerUp(400, 100)
assert.strictEqual(state, 'aiming')
$.pointerDown(85, 225)
$.pointerUp(85, 225)
assert.strictEqual(state, 'aiming', 'a tiny pull does not launch')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const GRAVITY = 0.25
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const LAUNCH = 0.2 // speed per pixel of pull
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null
let aim // { angle, pull }
let dragging
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  calm = 0
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming') return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
  state = 'flying'
  calm = 0
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
    b.y += b.vy
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    return false
  })
}

function update() {
  step()
  if (state !== 'flying') return
  // Wait until everything has stopped for a second before the next bird.
  const moving = bodies.some((b) => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.3)
  calm = moving ? 0 : calm + 1
  if (calm < 60 && !(bird && bird.x > canvas.width)) return
  if (bird) {
    bodies = bodies.filter((b) => b !== bird)
    bird = null
  }
  state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') launch()
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

// Drag back from the sling like a real one: the bird flies the other way, harder the further you pull.
function pull(point) {
  const dx = SLING.x - point.x
  const dy = SLING.y - point.y
  aim.angle = Math.atan2(dy, dx)
  aim.pull = Math.min(MAX_PULL, Math.hypot(dx, dy))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'aiming') return
  const point = toCanvas(event)
  if (Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60) return
  dragging = true
  pull(point)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (aim.pull >= 15) launch()
})

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  if (state === 'aiming') {
    const { vx, vy } = launchVelocity()
    const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
    const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SLING.x, SLING.y)
    ctx.lineTo(bx, by)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let t = 4; t <= 60; t += 4) {
      // Where the bird will be after t frames: x grows steadily, y follows a parabola.
      const x = SLING.x + vx * t
      const y = SLING.y + vy * t + (GRAVITY * t * t) / 2
      if (y > GROUND) break
      ctx.fillRect(x - 2, y - 2, 4, 4)
    }
    ctx.fillStyle = MATERIALS.bird.color
    ctx.beginPath()
    ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
    ctx.fill()
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
