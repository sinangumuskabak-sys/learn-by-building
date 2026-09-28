---
title: Birds, and ducking under them
title_tr: Kuşlar ve altlarından eğilmek
skills: [game.input, game.collision, prog.arrays]
---

# --explanation--

Cacti only ever ask one question ("jump now?"). A second kind of obstacle, a bird flying at head height, asks a
different one: **duck**. Two answers to two threats, and the player has to read which is coming.

Obstacles are plain data, so a new kind is just a new shape of object:

```js
{ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true }   // head height
```

The drawing code picks a color from `o.bird`, and the collision code does not change at all: a box is a box. Designing
around data instead of special cases is what makes adding content cheap.

Ducking makes the runner **shorter** while the down arrow is held on the ground: 26 px instead of 44. When the height
changes, move `y` by the difference so the feet stay on the ground, since `y` is the top of the box:

```js
const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
runner.y += runner.h - h   // keep the feet where they are
runner.h = h
```

Birds only start appearing after a while (`distance > 1500`), so the player learns one skill at a time. Introducing
mechanics gradually is a core idea of game design, and of teaching.

# --explanation-tr--

**Bu adımda:** kafa hizasında uçan turuncu kuşlar eklenecek. Aşağı ok tuşunu basılı tutunca koşucu eğilip
kısalacak ve kuşun altından geçecek. Kuşlar bir süre koştuktan sonra (mesafe 1500'ü geçince) çıkmaya başlayacak.

**İki tehlike, iki cevap.** Kaktüs "şimdi zıpla" der, kuş "şimdi eğil". Oyuncu hangisinin geldiğini okumak zorunda.

**Yeni engel türü = yeni bir nesne şekli.** Engeller sadece veridir. Kuş da bir nesne, yalnızca başka yerde ve bir
etiketle:

```js
{ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true }    // kafa hizası
```

`true`/`false` değerlerine **mantıksal değer** (boolean) denir. Kaktüslere de `bird: false` veririz. Çarpışma kodu
hiç değişmez: kutu kutudur. Çizim kodu da sadece rengi `bird`'e göre seçer.

**Kısa `if`: `? :`.** Bir değeri koşula göre seçmek için:

```js
ctx.fillStyle = o.bird ? '#b45309' : '#15803d'
```

"`o.bird` doğru mu? Öyleyse turuncu, **değilse** yeşil." `koşul ? evetse : hayırsa` diye okunur.

**`if` / `else`.** Bir koşul doğruysa bir şeyi, değilse başka şeyi yapmak için:

```js
if (distance > 1500 && Math.random() < 0.3) {
  // kuş ekle
} else {
  // kaktüs ekle
}
```

`Math.random() < 0.3` her denemede yaklaşık %30 ihtimalle doğrudur (0 ile 1 arası sayının 0,3'ten küçük olma şansı).
Kuşlar ancak oyuncu zıplamaya alıştıktan sonra gelir: her seferinde tek beceri öğretmek hem oyun tasarımının hem
öğretmenin temel fikridir.

**Basılı tuşları hatırlamak.** Eğilmek için "aşağı ok **şu an** basılı mı?" diye sormamız lazım. Boş bir nesne
açarız, tuşa basılınca o tuşun adıyla `true`, bırakılınca `false` yazarız:

```js
const keys = {}
keys[event.key] = true    // ör. keys['ArrowDown'] = true
```

Köşeli parantez `keys[...]`, alanın adı bir değişkenin içindeyken kullanılır. Sonra `keys.ArrowDown` ile sorarız.
(`const` olsa da nesnenin **içi** değişebilir; sadece `keys` etiketi başka bir nesneye yapıştırılamaz.)

**Eğilmek: boyu değiştir, ayakları yerinde tut.** Eğilince boy 44 yerine 26 olur. Ama `y` kutunun **tepesi**; boyu
kısaltıp `y`'yi bırakırsak koşucu havada asılı kalır. Tepeyi aradaki fark kadar aşağı indiririz:

```js
const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
runner.y += runner.h - h   // 44 - 26 = 18 piksel aşağı
runner.h = h
```

Kalkarken fark eksi çıkar (`26 - 44 = -18`) ve tepe yeniden yukarı çıkar. Eğilmiş koşucu zıplayamaz: `jump()`
yalnızca `runner.h === STAND_H` iken zıplatır.

# --task--

1. Add `const STAND_H = 44`, `const DUCK_H = 26` and `const keys = {}`; record held keys on `keydown`/`keyup`. Use
   `STAND_H` for the runner's starting height.
2. In `update()`, after landing, apply the ducking code above. Only allow a jump when the runner is standing
   (`runner.h === STAND_H`).
3. Give cacti `bird: false`. In `spawn()`, once `distance > 1500`, make the new obstacle a bird with a 30% chance
   (`Math.random() < 0.3`): `{ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true }`.
4. Draw birds in `'#b45309'` and cacti in `'#15803d'`.

# --task-tr--

1. `const MARGIN = 6 ...` satırının hemen **altına** iki sabit ekle:

   ```js
   const STAND_H = 44
   const DUCK_H = 26
   ```

2. `let best = ...` satırının hemen **altına** basılı tuşlar nesnesini ekle:

   ```js
   const keys = {}
   ```

3. `reset()` içindeki `runner = ...` satırında `44` yerine `STAND_H` kullan:

   ```js
     runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
   ```

4. `jump()` fonksiyonunun son satırına "ayaktaysa" koşulunu ekle:

   ```js
     if (onGround() && runner.h === STAND_H) runner.vy = JUMP // ← değişti
   ```

5. İki klavye dinleyicisinin **ilk satırına** tuşu kaydeden satırı ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true // ← yeni
     if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false // ← yeni
     if (event.key === ' ' || event.key === 'ArrowUp') endJump()
   })
   ```

6. `spawn()` fonksiyonunu kuş ya da kaktüs seçecek şekilde değiştir:

   ```js
   function spawn() {
     // Birds only show up once the player has got used to jumping.
     if (distance > 1500 && Math.random() < 0.3) {
       obstacles.push({ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true })
     } else {
       obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40, bird: false })
     }
     // At least 50 frames apart, so there is always room to land and jump again.
     nextIn = 50 + Math.floor(Math.random() * 70)
   }
   ```

7. `update()` fonksiyonunda, yere inme `if`'inin kapanan `}`'sinin hemen altına (`distance += speed`'den önce)
   eğilme kodunu ekle:

   ```js
     // Duck only on the ground; keep the feet in place when the height changes.
     const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
     runner.y += runner.h - h
     runner.h = h
   ```

8. `draw()` fonksiyonunda kaktüsleri çizen iki satırı (`ctx.fillStyle = '#15803d'` ve altındaki `for`) sil, yerine
   her engelin rengini kendisi seçen döngüyü yaz:

   ```js
     for (const o of obstacles) {
       ctx.fillStyle = o.bird ? '#b45309' : '#15803d'
       ctx.fillRect(o.x, o.y, o.w, o.h)
     }
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Aşağı oku basılı tutunca koşucu kısalmalı, ayakları zeminde
   kalmalı; bırakınca eski boyuna dönmeli. Bir süre koşunca turuncu kuşlar gelmeli. Alttaki kontrollerin hepsi
   yeşil olmalı. Eğilince koşucu havada kalıyorsa `runner.y += runner.h - h` satırının `runner.h = h`'den **önce**
   olduğunu kontrol et.

# --tests--

Holding the down arrow on the ground should make the runner duck, feet on the ground.
tr: Zeminde aşağı oku basılı tutmak koşucuyu eğdirmeli; ayaklar zeminde kalmalı.

```js
assert.deepEqual([STAND_H, DUCK_H], [44, 26])
$.press(' ')
$.release(' ')
$.tick(30)
$.press('ArrowDown')
$.tick()
assert.strictEqual(runner.h, 26)
assert.strictEqual(runner.y + runner.h, GROUND)
$.release('ArrowDown')
$.tick()
assert.strictEqual(runner.h, 44)
assert.strictEqual(runner.y, 136)
```

Ducking should get under a bird, standing should not.
tr: Eğilmek kuşun altından geçirmeli, ayakta durmak geçirmemeli.

```js
const bird = { x: 60, y: 130, w: 34, h: 20, bird: true }
assert.isTrue(hits(bird), 'standing runner hits a bird at head height')
runner.h = 26
runner.y = GROUND - 26
assert.isFalse(hits(bird), 'ducking runner passes under it')
```

A ducking runner should not be able to jump.
tr: Eğilmiş bir koşucu zıplayamamalı.

```js
$.press(' ')
$.release(' ')
$.tick(40)
$.press('ArrowDown')
$.tick()
$.press(' ')
assert.strictEqual(runner.vy, 0)
```

Birds should start appearing only after 1500 distance, about 30% of the time.
tr: Kuşlar ancak 1500 mesafeden sonra, yaklaşık %30 oranında çıkmaya başlamalı.

```js
distance = 100
for (let i = 0; i < 100; i++) spawn()
assert.isTrue(obstacles.every((o) => o.bird === false), 'no birds early on')
obstacles = []
distance = 2000
for (let i = 0; i < 400; i++) spawn()
const birds = obstacles.filter((o) => o.bird)
assert.isAbove(birds.length, 80)
assert.isBelow(birds.length, 160)
assert.deepInclude(birds[0], { x: 600, y: 130, w: 34, h: 20, bird: true })
```

Birds and cacti should be drawn in their own colors.
tr: Kuşlar ve kaktüsler kendi renklerinde çizilmeli.

```js
obstacles = [{ x: 300, y: 130, w: 34, h: 20, bird: true }, { x: 400, y: 140, w: 20, h: 40, bird: false }]
draw()
assert.lengthOf($.rects('#b45309'), 1)
assert.lengthOf($.rects('#15803d'), 1)
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const JUMP = -11 // speed at the start of a jump (negative = up)
const CUT = -4 // letting go early caps the upward speed at this
const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much
const STAND_H = 44
const DUCK_H = 26

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let distance
let nextIn // frames until the next obstacle
let best = Number(localStorage.getItem('runner-best')) || 0
const keys = {}

function reset() {
  runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  distance = 0
  nextIn = 60
}

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'running'
  if (onGround() && runner.h === STAND_H) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function spawn() {
  // Birds only show up once the player has got used to jumping.
  if (distance > 1500 && Math.random() < 0.3) {
    obstacles.push({ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true })
  } else {
    obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40, bird: false })
  }
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}

function update() {
  if (state !== 'running') return

  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
  // Duck only on the ground; keep the feet in place when the height changes.
  const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
  runner.y += runner.h - h
  runner.h = h

  distance += speed
  speed = Math.min(12, speed + 0.003)

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) {
    state = 'over'
    const score = Math.floor(distance / 10)
    if (score > best) {
      best = score
      localStorage.setItem('runner-best', best)
    }
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  for (const o of obstacles) {
    ctx.fillStyle = o.bird ? '#b45309' : '#15803d'
    ctx.fillRect(o.x, o.y, o.w, o.h)
  }

  const score = Math.floor(distance / 10)
  ctx.fillStyle = '#334155'
  ctx.font = '16px monospace'
  ctx.textAlign = 'right'
  ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24)

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28)
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
