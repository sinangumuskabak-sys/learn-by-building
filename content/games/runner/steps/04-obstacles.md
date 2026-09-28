---
title: Cacti on the way
title_tr: Yoldaki kaktüsler
skills: [prog.arrays, game.state]
---

# --explanation--

As in the flappy game, the runner never moves forward: obstacles slide toward it. What is new is **when** they appear.
A fixed rhythm (one every 90 frames) is predictable and boring; random gaps keep the player reacting.

Use a **countdown**: `nextIn` is the number of frames until the next obstacle. Every frame, subtract one; when it
reaches zero, spawn an obstacle and pick a new random countdown:

```js
nextIn = 50 + Math.floor(Math.random() * 70)   // somewhere from 50 to 119 frames
```

The minimum (`50`) is not arbitrary. At 6 px per frame the gap is at least 300 px, and a full jump covers about
220 px, so there is always room to land and jump again. Random, but never unfair: design the range, don't just
randomize.

The game also needs a `'ready'` state, so obstacles do not start rushing in before the player has pressed anything.
The first jump starts the run.

# --explanation-tr--

**Bu adımda:** yola yeşil kaktüsler çıkacak. Oyun önce ortada "Press Space to start" yazısıyla bekleyecek; ilk
zıplamada koşu başlayacak ve kaktüsler sağdan sola doğru kayarak gelecek. (Henüz çarpma yok, içlerinden geçersin.)

**Koşucu aslında koşmuyor.** Koşucu hep aynı `x`'te durur; kaktüsler ona doğru kayar. Ekranda bu, koşucu ileri
gidiyormuş gibi görünür. Trenden dışarı bakınca ağaçların geriye kaçması gibi.

**Oyunun durumu (state).** Oyun iki hâlden birinde: `'ready'` (hazır, bekliyor) ya da `'running'` (koşuyor). Bunu
bir yazı olarak `state` adlı değişkende tutarız. `update()` en başta sorar: koşmuyorsak hiçbir şey yapma.

```js
if (state !== 'running') return
```

`!==` "eşit değil mi?" demek (`===`'in tersi). `return` burada bir cevap vermeden **fonksiyondan hemen çıkar**;
altındaki satırlar o kare için çalışmaz.

**Dizi (array): bir liste.** Ekranda aynı anda birkaç kaktüs olabilir. Hepsini köşeli parantez `[ ]` içinde bir
listede tutarız. `let obstacles = []` boş bir listedir.

- `obstacles.push(bir şey)` listenin sonuna ekler.
- `for (const o of obstacles) { ... }` listedeki **her** eleman için bir kez döner; o sırada elemanın adı `o` olur.
  Tek komut varsa süslü parantezsiz yazılabilir: `for (const o of obstacles) o.x -= speed` → her kaktüsü `speed`
  kadar sola kaydır. (`-=` "şu kadar çıkar", `+=`'in tersi.)
- `obstacles.filter((o) => o.x + o.w > 0)` listeden **yalnızca koşulu doğru olanları** içeren yeni bir liste
  yapar. Burada: sağ kenarı hâlâ ekranın içinde olanlar. Ekrandan tamamen çıkanlar böylece silinir.

**Ne zaman yeni kaktüs?** Hep aynı aralıkla gelseler sıkıcı olurdu. Bir **geri sayım** kullanırız: `nextIn`, bir
sonraki kaktüse kaç kare kaldığını tutar. Her kare bir azalır (`nextIn -= 1`), sıfıra inince yeni kaktüs çıkar ve
yeni bir rastgele sayı seçilir:

```js
nextIn = 50 + Math.floor(Math.random() * 70)
```

- `Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir ondalıklı sayı verir, ör. `0.37`.
- `* 70` onu 0 ile 69,99… arasına genişletir. `Math.floor(...)` küsuratı atıp aşağı yuvarlar: 0 ile 69 arası
  tam sayı.
- `50 +` ekleyince sonuç **50 ile 119** arası olur.

En az 50 olması bilinçli: saniyede 6 pikselden 50 kare en az 300 piksel boşluk demek, tam bir zıplama yaklaşık 220
piksel tutar. Yani hep yere inip yeniden zıplayacak yer kalır. Rastgele ama asla haksız değil.

**Yazı yazmak.** `ctx.fillText('yazı', x, y)` canvas'a yazı yazar. `ctx.font` yazı tipini ve boyunu,
`ctx.textAlign = 'center'` de verdiğin `x`'in yazının **ortası** olmasını ayarlar. `canvas.width / 2` (`/` bölme)
alanın ortasıdır.

# --task--

1. Add `let state = 'ready'`, `let obstacles = []`, `let speed = 6` and `let nextIn = 60`.
2. In `jump()`, set `state = 'running'` before jumping.
3. Write `function spawn()` that pushes a cactus `{ x: canvas.width, y: GROUND - 40, w: 20, h: 40 }` and sets
   `nextIn = 50 + Math.floor(Math.random() * 70)`.
4. In `update()`: do nothing unless `'running'`. After the runner's physics, count `nextIn` down and `spawn()` when it
   reaches 0; move every obstacle left by `speed`; keep only obstacles still on screen (`o.x + o.w > 0`).
5. Draw obstacles as `'#15803d'` rectangles, and while `'ready'` show `Press Space to start` centered on the canvas
   (`'#334155'`, `'16px sans-serif'`).

# --task-tr--

1. `let runner = ...` satırının hemen **altına** dört değişken ekle:

   ```js
   let state = 'ready' // 'ready' or 'running'
   let obstacles = []
   let speed = 6
   let nextIn = 60 // frames until the next obstacle
   ```

2. `jump()` fonksiyonunda, `if`'ten önce oyunu başlatan satırı ekle:

   ```js
   function jump() {
     state = 'running' // ← yeni
     if (onGround()) runner.vy = JUMP
   }
   ```

3. `canvas.addEventListener('pointerup', endJump)` satırının altına bir satır boşluk bırakıp kaktüs üreten
   fonksiyonu yaz:

   ```js
   function spawn() {
     obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
     // At least 50 frames apart, so there is always room to land and jump again.
     nextIn = 50 + Math.floor(Math.random() * 70)
   }
   ```

   Yeni kaktüs sağ kenarda (`x: canvas.width`) ve zeminin üstünde (`GROUND - 40`) doğar.

4. `update()` fonksiyonunu şöyle değiştir: en başa durum kontrolü, en sona geri sayım ve kaktüs hareketi:

   ```js
   function update() {
     if (state !== 'running') return // ← yeni

     runner.vy += GRAVITY
     runner.y += runner.vy
     if (onGround()) {
       runner.y = GROUND - runner.h
       runner.vy = 0
     }

     nextIn -= 1                                       // ← yeni
     if (nextIn <= 0) spawn()                          // ← yeni
     for (const o of obstacles) o.x -= speed           // ← yeni
     obstacles = obstacles.filter((o) => o.x + o.w > 0) // ← yeni
   }
   ```

5. `draw()` fonksiyonunda, koşucuyu çizen `ctx.fillRect(runner.x, ...)` satırının altına, kapanan `}`'den önce
   şunları ekle:

   ```js
     ctx.fillStyle = '#15803d'
     for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)

     ctx.fillStyle = '#334155'
     ctx.font = '16px sans-serif'
     ctx.textAlign = 'center'
     if (state === 'ready') ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
   ```

   Önce bütün kaktüsler yeşil boyanır; sonra oyun beklerken ortaya başlama yazısı yazılır.

6. **Çalıştır**'a bas. Ortada "Press Space to start" görmelisin. Oynamak için önce oyuna tıkla ve Boşluk'a bas:
   kaktüsler sağdan gelmeye başlamalı. Alttaki kontrollerin hepsi yeşil olmalı. Yazı testi kırmızıysa yazıyı
   büyük/küçük harfiyle aynen yazdığından emin ol.

# --tests--

Nothing should move until the first jump.
tr: İlk zıplamaya kadar hiçbir şey hareket etmemeli.

```js
assert.strictEqual(state, 'ready')
$.tick(120)
assert.deepEqual(obstacles, [])
assert.include($.texts(), 'Press Space to start')
$.press(' ')
assert.strictEqual(state, 'running')
```

The first cactus should appear after 60 frames, at the right edge, standing on the ground.
tr: İlk kaktüs 60 kare sonra sağ kenarda, zemin üstünde çıkmalı.

```js
$.press(' ')
$.tick(59)
assert.lengthOf(obstacles, 0)
$.tick()
assert.lengthOf(obstacles, 1)
assert.include(obstacles[0], { y: 140, w: 20, h: 40 })
assert.isAtLeast(obstacles[0].x, 590)
```

`spawn()` should pick a random gap of 50 to 119 frames.
tr: `spawn()` 50 ile 119 kare arası rastgele bir aralık seçmeli.

```js
const gaps = new Set()
for (let i = 0; i < 200; i++) {
  spawn()
  assert.isAtLeast(nextIn, 50)
  assert.isAtMost(nextIn, 119)
  assert.isTrue(Number.isInteger(nextIn))
  gaps.add(nextIn)
}
assert.isAbove(gaps.size, 30)
```

Obstacles should move left at `speed` and be removed off screen.
tr: Engeller `speed` hızında sola kaymalı ve ekran dışında silinmeli.

```js
state = 'running'
obstacles = [{ x: 300, y: 140, w: 20, h: 40 }, { x: -15, y: 140, w: 20, h: 40 }]
update()
assert.lengthOf(obstacles, 1)
assert.strictEqual(obstacles[0].x, 294)
draw()
assert.deepEqual($.rects('#15803d'), [{ x: 294, y: 140, w: 20, h: 40, color: '#15803d' }])
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

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
let state = 'ready' // 'ready' or 'running'
let obstacles = []
let speed = 6
let nextIn = 60 // frames until the next obstacle

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  state = 'running'
  if (onGround()) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function spawn() {
  obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

function update() {
  if (state !== 'running') return

  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  ctx.fillStyle = '#15803d'
  for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)

  ctx.fillStyle = '#334155'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  if (state === 'ready') ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
