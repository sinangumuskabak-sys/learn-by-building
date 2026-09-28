---
title: A camera and endless platforms
title_tr: Bir kamera ve sonsuz platformlar
skills: [game.loop, game.state]
---

# --explanation--

To climb forever, the game needs two ideas.

**A camera.** The player and the platforms now live in a tall **world**, and `cameraY` is the world y shown at the top of
the screen. Everything is drawn at `y - cameraY`. Whenever the player rises above 200 pixels from the top of the screen, the
camera follows: `cameraY = player.y - 200`. It never moves down, so falling is dangerous: once the player drops below the
bottom of the screen, the game is over.

**Endless platforms.** Instead of a fixed list, `fillPlatforms()` keeps adding platforms above the highest one until the
area just above the screen is filled, and platforms far below the screen are thrown away. Only about fifteen exist at a
time, however high you climb.

Random is only fun when it is **fair**. A bounce rises about 167 pixels, so the gap to the next platform is never more
than `MAX_GAP = 110`: every generated level can be climbed. The gap is random but its range grows with a
`difficulty()` between 0 and 1: at the start the gaps are between 45 and 71 pixels, 10000 pixels up they can reach 110.
That is **procedural generation**: rules that guarantee the result is possible, and randomness inside those rules.

The faint lines in the background are fixed to the world, so you can see the climb even when no platform is near.

# --explanation-tr--

**Bu adımda:** zemini kaldırıp sonsuz bir tırmanış yapacağız. Oyuncu yükseldikçe ekran (kamera) onu yukarı izleyecek,
yukarıda hep yeni platformlar belirecek. Aşağı düşersen "Game Over" yazısı çıkacak; Boşluk tuşu (ya da dokunmak) yeniden
başlatacak.

**Dünya ve kamera.** Artık oyuncu ve platformlar, ekrandan çok daha uzun bir **dünyada** yaşıyor. Ekran bu dünyaya
bakan bir pencere gibi. `cameraY`, ekranın en üstünde görünen dünya yüksekliğidir. Her şeyi `y - cameraY` konumunda
çizeriz. Örnek: kamera `-300`'deyse, dünyada `-100`'deki platform ekranda `-100 - (-300) = 200`'de görünür. Yukarı
çıktıkça `y` eksiye doğru küçülür (hatırla: `y` aşağı doğru büyür).

Oyuncu ekranın tepesinden 200 pikselden daha yukarı çıkınca kamera onu izler: `cameraY = player.y - 200`. Kamera
**hiç aşağı inmez**; bu yüzden düşmek tehlikelidir. Oyuncu ekranın altından çıkarsa oyun biter.

**Durum (state).** Oyun ya `'playing'` (oynanıyor) ya da `'over'` (bitti) durumunda. Bunu `state` adlı bir yazıda
tutarız. `!==` "eşit değil mi?" demektir. `update()`'in ilk satırı `if (state !== 'playing') return` olur:
**`return`** fonksiyonu o anda bitirir, altındaki satırlar çalışmaz. Yani oyun bitince hiçbir şey hareket etmez.

**Başa dönmek: `reset()`.** Oyunu hem başlangıçta hem "yeniden oyna"da aynı hâle getirmek için bütün başlangıç
değerlerini tek bir fonksiyona koyarız. Bu yüzden en üstte `let player` gibi satırları **değersiz** yazarız (sadece adı
ayırırız); değerleri `reset()` verir. `reset()`'i döngüden önce bir kez çağırmayı unutma.

**Sonsuz platformlar.** Sabit liste yerine `fillPlatforms()`, en yüksek platformun (`highest`) üstüne yenilerini
ekler, ta ki ekranın biraz yukarısı dolana kadar. Bunun için **`while` döngüsü** kullanırız: "koşul doğru olduğu sürece
tekrar et". Yeni platformu listenin sonuna `platforms.push(...)` ekler. Ekranın çok altında kalan platformları da
`filter` ile atarız:

```js
platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)
```

`filter`, listedeki her öğeye bu soruyu sorar ve yalnızca "evet" diyenlerle yeni bir liste yapar. Böylece ne kadar
yükselirsen yüksel, aynı anda yaklaşık 15 platform olur.

**Adil rastgelelik.** `Math.random()` her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı verir.
`Math.min(a, b)` ikisinden küçüğünü verir. Bir sekiş yaklaşık 167 piksel yükseldiği için iki platform arası hiçbir
zaman `MAX_GAP = 110`'u geçmez: her seviye tırmanılabilir. Boşluk rastgeledir ama üst sınırı `difficulty()` ile büyür.
`difficulty` başta 0'dır, 10000 piksel tırmanınca 1 olur. Başta boşluklar 45 ile 71 arası, yukarıda 110'a kadar. Buna
**prosedürel üretim** denir: sonucun mümkün olmasını garanti eden kurallar ve o kuralların içinde rastgelelik.
`difficulty(y)` bir sonuç **döndürür** (`return`): `const d = difficulty(highest)` yazınca o sonuç `d`'ye konur.

**Arka plan çizgileri.** Dünyaya sabitlenmiş soluk çizgiler, platform yokken bile tırmandığını görmeni sağlar. Bunu
sayan bir **`for` döngüsü** çizer: `for (başlangıç; koşul; her turdan sonra)`. `y += 40` "40 ekle" demektir. `%` bölmeden
**kalanı** verir (`45 % 40` = `5`); ilk çizginin yeri `((-cameraY % 40) + 40) % 40` ile bulunur, böylece çizgiler kamera
kaydıkça dünya ile birlikte kayar.

**Yazı yazmak.** `ctx.font = 'bold 32px sans-serif'` yazı tipini, `ctx.textAlign = 'center'` hizalamayı seçer,
`ctx.fillText('Game Over', x, y)` yazıyı o noktaya boyar. `'rgba(248, 250, 252, 0.85)'` yarı saydam bir renktir (son
sayı saydamlık: 0 görünmez, 1 tam kapalı).

# --task--

1. Remove `FLOOR` and the fixed platforms. Add `START_Y = 500`, `MAX_GAP = 110`, and `let player`, `platforms`, `cameraY`,
   `highest` and `state`.
2. Write `reset()`: the player at `{ x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }`, one platform
   `{ x: 170, y: START_Y, w: 60, h: 12 }`, `cameraY = 0`, `highest = START_Y`, state `'playing'`, then `fillPlatforms()`.
   Call it before the loop, and on Space (or a tap) when the game is over.
3. Write `difficulty(y)`: `Math.min(1, (START_Y - y) / 10000)`. Write `fillPlatforms()`: while `highest > cameraY - 100`,
   pick `gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)` with `d = difficulty(highest)`, move `highest` up
   by it and add a 60 by 12 platform there at a random `x` from `0` to `canvas.width - 60`.
4. At the end of `update()` (which does nothing unless playing): move the camera up when `player.y < cameraY + 200`, call
   `fillPlatforms()`, keep only platforms with `p.y < cameraY + canvas.height + 20`, and end the game when
   `player.y > cameraY + canvas.height`.
5. Draw everything at `y - cameraY`, the `'#e2e8f0'` lines 1 pixel high every 40 world pixels (the first one at
   `((-cameraY % 40) + 40) % 40`), and the Game Over screen as before.

# --task-tr--

Bu adımda birçok yer değişiyor; sırayla git.

1. Sabitlerde `const FLOOR = 600 ...` satırını **sil** ve yerine şu satırları yaz:

   ```js
   const START_Y = 500 // ilk platformun dünya y'si
   // Bir sekiş yaklaşık JUMP * JUMP / (2 * GRAVITY) = 172 piksel yükselir; boşluk bunun epey altında kalmalı.
   const MAX_GAP = 110
   ```

2. `let player = { ... }` satırını ve altındaki `const platforms = [ ... ]` listesinin **tamamını** (kapanış `]` dahil)
   sil. Yerlerine şunu yaz (`const keys = {}` satırı altta kalsın):

   ```js
   let player
   let platforms
   let cameraY // ekranın tepesinde görünen dünya y'si: kamera
   let highest // şimdiye kadarki en yüksek platformun dünya y'si
   let state // 'playing' ya da 'over'
   ```

3. `const keys = {}` satırının hemen altına üç fonksiyonu ekle:

   ```js
   function reset() {
     player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
     platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
     cameraY = 0
     highest = START_Y
     state = 'playing'
     fillPlatforms()
   }

   // Başta 0, 10000 piksel tırmanınca 1.
   function difficulty(y) {
     return Math.min(1, (START_Y - y) / 10000)
   }

   // Ekran (ve biraz fazlası) dolana kadar en yüksek platformun üstüne platform ekle.
   function fillPlatforms() {
     while (highest > cameraY - 100) {
       const d = difficulty(highest)
       const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)
       highest -= gap
       platforms.push({ x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12 })
     }
   }
   ```

4. `keydown` dinleyicisinde `preventDefault()` satırının altına, oyun bitmişken Boşluk ile yeniden başlatan satırı ekle
   (Boşluk tuşunun adı tırnak içinde tek bir boşluktur: `' '`):

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
     if (event.key === ' ' && state === 'over') reset() // ← yeni
   })
   ```

5. `pointerdown` dinleyicisinin **en başına** oyun bitmişse dokunuşla yeniden başlatan kısmı ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (state === 'over') { // ← yeni
       reset() // ← yeni
       return // ← yeni
     } // ← yeni
     const rect = canvas.getBoundingClientRect()
     const left = event.clientX - rect.left < rect.width / 2
     keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
   })
   ```

6. `update()` fonksiyonunun **ilk satırı** olarak şunu ekle, sonra bir boş satır bırak:

   ```js
   function update() {
     if (state !== 'playing') return // ← yeni

     const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
   ```

7. Yine `update()`'te, en sondaki zemin bloğunu, yani `if (player.y + player.h >= FLOOR) {` ile başlayan bloğu (içindeki iki
   satır ve kapanış `}` dahil) ve üstündeki yorum satırını **sil**. Yerine, fonksiyonun kapanış `}`'inden önce şunları yaz:

   ```js
     // Kamera yalnızca yukarı gider ve oyuncuyu ekranın üst kısmında tutar.
     if (player.y < cameraY + 200) cameraY = player.y - 200
     fillPlatforms()
     platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

     if (player.y > cameraY + canvas.height) {
       state = 'over'
     }
   }
   ```

8. `draw()` fonksiyonunun tamamını şununla değiştir. Değişenler: çizgiler, her `y`'den `cameraY` çıkarılması ve sondaki
   Game Over ekranı:

   ```js
   function draw() {
     ctx.fillStyle = '#f8fafc'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     // Dünyaya sabit soluk çizgiler: platform yokken de tırmandığını görürsün.
     ctx.fillStyle = '#e2e8f0'
     for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

     ctx.fillStyle = '#16a34a'
     for (const p of platforms) {
       ctx.fillRect(p.x, p.y - cameraY, p.w, p.h) // ← değişti
     }

     ctx.fillStyle = '#f59e0b'
     ctx.fillRect(player.x, player.y - cameraY, player.w, player.h) // ← değişti
     if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h) // ← değişti
     if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h) // ← değişti

     if (state === 'over') { // ← yeni: bu bloğun tamamı
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
   ```

9. En alttaki `requestAnimationFrame(loop)` satırının **hemen üstüne** oyunu hazırlayan çağrıyı ekle:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

10. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Yükseldikçe platformlar aşağı kaymalı ve yukarıda yenileri
    çıkmalı; düşersen "Game Over" görünmeli, Boşluk yeniden başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı.
    Kırmızı kalırsa en sık hata `reset()` çağrısını unutmak ya da bir `y - cameraY`'yi atlamaktır.

# --tests--

The camera should follow the player up.
tr: Kamera oyuncuyu yukarı izlemeli.

```js
player = { x: 180, y: 150, w: 40, h: 40, vy: -5 }
$.tick(1)
assert.closeTo(cameraY, -54.65, 1e-9)
assert.isAtMost(highest, cameraY - 100, 'new platforms fill the space above the screen')
assert.isTrue(platforms.every((p) => p.y < cameraY + 620), 'platforms far below are removed')
$.tick(1)
const [p] = $.rects('#f59e0b')
assert.closeTo(p.y, player.y - cameraY, 1e-9)
assert.closeTo(p.y, 200, 1e-9)
```

The camera should never move down.
tr: Kamera asla aşağı inmemeli.

```js
cameraY = -300
player = { x: 0, y: -100, w: 40, h: 40, vy: 8 }
$.tick(5)
assert.strictEqual(cameraY, -300)
```

Gaps should be random, but never too big to climb, and grow as you climb.
tr: Boşluklar rastgele olmalı ama tırmanılamayacak kadar büyük olmamalı ve tırmandıkça büyümeli.

```js
assert.strictEqual(difficulty(500), 0)
assert.strictEqual(difficulty(-4500), 0.5)
assert.strictEqual(difficulty(-50000), 1)
cameraY = -20000
fillPlatforms()
const ys = platforms.map((p) => p.y).sort((a, b) => b - a)
const gaps = ys.slice(1).map((y, i) => ys[i] - y)
assert.isAbove(gaps.length, 200)
for (const g of gaps) assert.isTrue(g >= 45 && g <= 110, 'gap of ' + g)
const low = gaps.slice(0, 20)
const high = gaps.slice(-60)
assert.isTrue(low.every((g) => g <= 45 + 65 * 0.52), 'easy gaps at the start')
assert.isTrue(high.some((g) => g > 100), 'big gaps high up')
assert.isAbove(new Set(platforms.map((p) => p.x)).size, 100, 'platforms should be at random x positions')
```

Falling below the screen should end the game, and Space should start again.
tr: Ekranın altına düşmek oyunu bitirmeli, Boşluk yeniden başlatmalı.

```js
player.y = 610
$.tick(1)
assert.strictEqual(state, 'over')
assert.include($.texts(), 'Game Over')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(cameraY, 0)
assert.deepEqual(player, { x: 180, y: 460, w: 40, h: 40, vy: 0 })
```

The background lines should move with the world.
tr: Arka plan çizgileri dünyayla birlikte hareket etmeli.

```js
cameraY = -10
draw()
const lines = $.rects('#e2e8f0')
assert.lengthOf(lines, 15)
assert.strictEqual(lines[0].y, 10)
cameraY = -1000
draw()
assert.strictEqual($.rects('#e2e8f0')[0].y, 0)
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

let player
let platforms
let cameraY // the world y shown at the top of the screen: the camera
let highest // world y of the highest platform so far
let state // 'playing' or 'over'
const keys = {}

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
  cameraY = 0
  highest = START_Y
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
    platforms.push({ x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12 })
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
  fillPlatforms()
  platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

  if (player.y > cameraY + canvas.height) {
    state = 'over'
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint lines fixed to the world, so you can see the climb even between platforms.
  ctx.fillStyle = '#e2e8f0'
  for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)

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
