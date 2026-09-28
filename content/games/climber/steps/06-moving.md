---
title: Moving platforms
title_tr: Hareketli platformlar
skills: [game.state, game.collision]
---

# --explanation--

Higher up, some platforms slide from side to side. Each platform now has a `kind` and a sideways speed `vx`, and every
frame all platforms move by their `vx`. Normal platforms simply have `vx: 0`, so one loop moves them all, without an `if`
for each kind. Hitting a wall **reverses** the speed: `p.vx = -p.vx`, the same bounce as the ball in Pong.

The chance of a moving platform is `difficulty * 0.5`: none at the start, half of them 10000 pixels up. Because the
player can cross the whole screen in 80 frames and wraps around the edges, a moving platform is always still reachable;
it is harder, not impossible.

Different kinds get different colors from a small lookup table:

```js
const COLORS = { normal: '#16a34a', moving: '#2563eb' }
ctx.fillStyle = COLORS[p.kind]
```

A table like this is easy to extend: a new kind of platform is one more line, not one more `if`.

# --explanation-tr--

**Bu adımda:** yukarılarda bazı platformlar sağa sola kaymaya başlayacak. Kayan platformlar mavi, normal olanlar yeşil
görünecek.

**Her platforma tür ve hız.** Her platform nesnesine iki yeni alan ekliyoruz:

- `kind` → türü: `'normal'` ya da `'moving'` (hareketli).
- `vx` → yatay hızı: her karede kaç piksel yana kayacağı.

Normal platformların hızı `vx: 0`'dır. Böylece **tek bir döngü** hepsini hareket ettirir; her tür için ayrı `if`
yazmaya gerek kalmaz (sıfır eklemek hiçbir şeyi değiştirmez).

**Duvardan dönmek.** Platformun sol kenarı `0`'ın altına inerse ya da sağ kenarı (`p.x + p.w`) canvas'ı geçerse hızın
**işaretini çeviririz**: `p.vx = -p.vx`. `1.5` ise `-1.5` olur, `-1.5` ise `1.5`. Eksi hız sola, artı hız sağa demek.
Duvara çarpan top gibi.

**Olasılıkla karar vermek.** `Math.random()` 0 ile 1 arasında rastgele bir sayı verdiği için
`Math.random() < 0.3` yaklaşık her 10 denemenin 3'ünde doğru olur. Burada sınır `d * 0.5`: başta `d` 0 olduğu için
hiç hareketli platform çıkmaz, 10000 piksel yukarıda platformların yarısı hareketlidir. Oyuncu bütün ekranı 80 karede
geçebildiği ve kenarlardan dolandığı için hareketli bir platforma her zaman ulaşılabilir; oyun zorlaşır ama imkânsız
olmaz.

Yeni platformu önce `platform` adlı bir sabite koyarız, gerekirse alanlarını değiştiririz (`platform.kind = 'moving'`),
en son listeye ekleriz. `const` ile ad verilen bir nesnenin **içindeki** alanlar yine değişebilir; değişmeyen, etiketin
hangi nesneye yapıştığıdır.

**Renk tablosu.** Her türün rengini küçük bir nesnede tutarız:

```js
const COLORS = { normal: '#16a34a', moving: '#2563eb' }
ctx.fillStyle = COLORS[p.kind]
```

`COLORS[p.kind]` → platformun türü `'moving'` ise `COLORS.moving`, yani mavi. Köşeli parantez, 2. adımdaki
`keys[event.key]` gibi, alanın adını bir değişkenden alır. Yeni bir platform türü eklemek artık tabloya bir satır
eklemekten ibaret; yeni bir `if` gerekmez.

# --task--

1. Give every platform `kind: 'normal'` and `vx: 0` (the start platform too). In `fillPlatforms()`, with a chance of
   `d * 0.5`, make the new platform `kind: 'moving'` with `vx: 1.5`.
2. In `update()`, before the player's physics, move every platform by its `vx`, and reverse `vx` when the platform's left
   edge is below `0` or its right edge is past `canvas.width`.
3. Add `COLORS = { normal: '#16a34a', moving: '#2563eb' }` and draw each platform in its kind's color.

# --task-tr--

1. `const MAX_GAP = 110` satırının hemen altına renk tablosunu ekle:

   ```js
   const COLORS = { normal: '#16a34a', moving: '#2563eb' }
   ```

2. `reset()` fonksiyonunda ilk platformu tanımlayan satıra iki alan ekle:

   ```js
     platforms = [{ x: 170, y: START_Y, w: 60, h: 12, kind: 'normal', vx: 0 }] // ← değişti
   ```

3. `fillPlatforms()` fonksiyonunda `platforms.push({ ... })` satırını sil ve yerine şunları yaz. Fonksiyon şöyle olmalı:

   ```js
   function fillPlatforms() {
     while (highest > cameraY - 100) {
       const d = difficulty(highest)
       const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)
       highest -= gap
       const platform = { x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12, kind: 'normal', vx: 0 } // ← yeni
       if (Math.random() < d * 0.5) { // ← yeni
         platform.kind = 'moving' // ← yeni
         platform.vx = 1.5 // ← yeni
       } // ← yeni
       platforms.push(platform) // ← değişti
     }
   }
   ```

4. `update()` fonksiyonunda kenardan dolanma satırlarının (`player.x -= canvas.width` ile biten satır) altına, `const
   oldBottom = ...` satırından **önce** platformları kaydıran döngüyü ekle:

   ```js
     for (const p of platforms) {
       p.x += p.vx
       if (p.x < 0 || p.x + p.w > canvas.width) p.vx = -p.vx
     }
   ```

5. `draw()` fonksiyonunda platformları çizen kısmı şöyle değiştir: döngüden önceki `ctx.fillStyle = '#16a34a'` satırını
   **sil**, döngünün içine her platformun kendi rengini seçen satırı ekle:

   ```js
     for (const p of platforms) {
       ctx.fillStyle = COLORS[p.kind] // ← yeni
       ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
     }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Başta hepsi yeşildir; yükseldikçe mavi, kayan platformlar çıkmaya
   başlar. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa ilk platforma `kind: 'normal', vx: 0` eklemeyi
   unutmuş olabilirsin.

# --tests--

A moving platform should slide and turn around at the walls.
tr: Hareketli bir platform kaymalı ve duvarlarda geri dönmeli.

```js
const p = { x: 338, y: 300, w: 60, h: 12, kind: 'moving', vx: 1.5 }
const q = { x: 1, y: 250, w: 60, h: 12, kind: 'moving', vx: -1.5 }
platforms.push(p, q)
$.tick(2)
assert.strictEqual(p.x, 341)
assert.strictEqual(p.vx, -1.5)
assert.strictEqual(q.vx, 1.5)
$.tick(1)
assert.strictEqual(p.x, 339.5)
assert.strictEqual(q.x, 2.5)
```

Normal platforms should stay where they are.
tr: Normal platformlar yerinde kalmalı.

```js
assert.deepEqual(platforms[0], { x: 170, y: 500, w: 60, h: 12, kind: 'normal', vx: 0 })
const before = platforms.filter((p) => p.kind === 'normal').map((p) => p.x)
$.tick(30)
assert.deepEqual(platforms.filter((p) => p.kind === 'normal').map((p) => p.x), before)
```

Moving platforms should appear only higher up, and more often the higher you go.
tr: Hareketli platformlar yalnızca yukarılarda ve yükseldikçe daha sık çıkmalı.

```js
cameraY = -20000
fillPlatforms()
const share = (list) => list.filter((p) => p.kind === 'moving').length / list.length
const low = platforms.filter((p) => p.y > -1500)
const high = platforms.filter((p) => p.y < -12000)
assert.isBelow(share(low), 0.15)
assert.isAbove(share(high), 0.3)
assert.isBelow(share(high), 0.7)
assert.isTrue(platforms.filter((p) => p.kind === 'moving').every((p) => p.vx === 1.5))
```

Each kind of platform should have its own color.
tr: Her platform türünün kendi rengi olmalı.

```js
platforms.push({ x: 100, y: 300, w: 60, h: 12, kind: 'moving', vx: 1.5 })
$.tick(1)
assert.isAtLeast($.rects('#2563eb').length, 1)
assert.isAtLeast($.rects('#16a34a').length, 1)
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const JUMP = -11 // every bounce starts with this speed (negative = up)
const SPEED = 5 // sideways pixels per frame
const START_Y = 500 // world y of the first platform
// A bounce rises about JUMP * JUMP / (2 * GRAVITY) = 172 pixels, so a gap must stay well below that.
const MAX_GAP = 110
const COLORS = { normal: '#16a34a', moving: '#2563eb' }

let player
let platforms
let cameraY // the world y shown at the top of the screen: the camera
let highest // world y of the highest platform so far
let score
let state // 'playing' or 'over'
let best = Number(localStorage.getItem('doodle-best')) || 0
const keys = {}

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12, kind: 'normal', vx: 0 }]
  cameraY = 0
  highest = START_Y
  score = 0
  state = 'playing'
  fillPlatforms()
}

// 0 at the start, growing to 1 after climbing 10000 pixels.
function difficulty(y) {
  return Math.min(1, (START_Y - y) / 10000)
}

// Add platforms above the highest one until the screen (and a little more) is full.
function fillPlatforms() {
  while (highest > cameraY - 100) {
    const d = difficulty(highest)
    const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)
    highest -= gap
    const platform = { x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12, kind: 'normal', vx: 0 }
    if (Math.random() < d * 0.5) {
      platform.kind = 'moving'
      platform.vx = 1.5
    }
    platforms.push(platform)
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
  if (event.key === ' ' && state === 'over') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left or right half of the game to steer.
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  const left = event.clientX - rect.left < rect.width / 2
  keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
})
function stopSteering() {
  keys.ArrowLeft = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopSteering)
canvas.addEventListener('pointercancel', stopSteering)

function update() {
  if (state !== 'playing') return

  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
  // Walking off one side brings you back on the other.
  if (player.x + player.w / 2 < 0) player.x += canvas.width
  if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width

  for (const p of platforms) {
    p.x += p.vx
    if (p.x < 0 || p.x + p.w > canvas.width) p.vx = -p.vx
  }

  const oldBottom = player.y + player.h
  player.vy += GRAVITY
  player.y += player.vy
  const bottom = player.y + player.h

  // Platforms only catch you on the way down, when your feet cross their top in this frame.
  if (player.vy > 0) {
    for (const p of platforms) {
      const over = player.x + player.w - 8 > p.x && player.x + 8 < p.x + p.w
      if (over && oldBottom <= p.y && bottom >= p.y) {
        player.y = p.y - player.h
        player.vy = JUMP
        break
      }
    }
  }

  // The camera only ever moves up, keeping the player in the upper part of the screen.
  if (player.y < cameraY + 200) cameraY = player.y - 200
  score = Math.max(score, Math.floor((START_Y - player.y - player.h) / 10))
  fillPlatforms()
  platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

  if (player.y > cameraY + canvas.height) {
    state = 'over'
    if (score > best) {
      best = score
      localStorage.setItem('doodle-best', best)
    }
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint lines fixed to the world, so you can see the climb even between platforms.
  ctx.fillStyle = '#e2e8f0'
  for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

  for (const p of platforms) {
    ctx.fillStyle = COLORS[p.kind]
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Best: ' + best, canvas.width - 10, 26)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.85)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0f172a'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
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
