---
title: Height is the score
title_tr: Yükseklik skordur
skills: [game.state]
---

# --explanation--

The score is simply **how high you have been**: the distance between the start platform and the highest point the
player's feet reached, in tens of pixels. "Highest so far" is a running maximum:

```js
score = Math.max(score, Math.floor((START_Y - player.y - player.h) / 10))
```

`Math.max` makes the score only go up: falling back down to a lower platform does not take points away. And because
world y grows downwards, "higher" means a **smaller** y, which is why the feet are subtracted from `START_Y` and not the other
way round.

The best score is kept in `localStorage`, so the browser keeps it after the page is closed, and saved at the moment the game ends.

# --explanation-tr--

**Bu adımda:** skor ekleyeceğiz. Sol üstte `Score: ...`, sağ üstte `Best: ...` yazacak. En iyi skor, sayfayı kapatıp
açsan bile hatırlanacak.

**Skor = ne kadar yükseğe çıktın.** Başlangıç platformu ile oyuncunun ayaklarının ulaştığı en yüksek nokta arasındaki
mesafe, 10'a bölünmüş hâliyle. Dünyada `y` aşağı doğru büyüdüğü için "daha yüksek" **daha küçük** `y` demektir. Bu
yüzden ayakların yerini (`player.y + player.h`) `START_Y`'den çıkarırız, tersini değil:

```js
score = Math.max(score, Math.floor((START_Y - player.y - player.h) / 10))
```

Parça parça:

- `START_Y - player.y - player.h` → ayakların başlangıçtan kaç piksel yukarıda olduğu.
- `/ 10` → onda birini alır; 300 piksel 30 puan olur.
- `Math.floor(...)` → sayıyı **aşağı yuvarlar**, virgülden sonrasını atar (`30.7` → `30`).
- `Math.max(a, b)` → ikisinden **büyüğünü** verir. Yani yeni değer eskisinden büyükse skor yükselir, değilse aynı
  kalır. Aşağıdaki bir platforma geri düşmek puan götürmez.

**Yazı ile sayıyı birleştirmek.** `'Score: ' + score` bir yazının sonuna sayıyı ekler: skor 30 ise sonuç
`'Score: 30'` olur. `+` sayılarda toplar, yazılarda yan yana ekler.

**Hafıza: `localStorage`.** Tarayıcının küçük bir defteri vardır; sayfa kapansa bile içindekiler kalır.
`localStorage.setItem('doodle-best', best)` "bu ada bu değeri yaz" demektir; `localStorage.getItem('doodle-best')`
okur. Defter her şeyi **yazı** olarak saklar, bu yüzden okurken `Number(...)` ile sayıya çeviririz. Hiç kayıt yoksa
sonuç sayı olmaz; `|| 0` "o zaman 0 kullan" demektir:

```js
let best = Number(localStorage.getItem('doodle-best')) || 0
```

En iyi skoru oyun bittiği anda, yalnızca yeni skor daha büyükse (`score > best`) kaydederiz.

**Yazının hizası.** `textAlign = 'left'` ile yazı verdiğin noktadan sağa doğru, `'right'` ile o noktada **biten**
şekilde yazılır. Bu yüzden `Best` yazısını `canvas.width - 10` noktasına sağa hizalı yazarız; sağ kenara yapışık durur.

# --task--

1. Add `let score` (reset to `0`) and `let best = Number(localStorage.getItem('doodle-best')) || 0`.
2. In `update()`, after moving the camera, raise `score` to `Math.floor((START_Y - player.y - player.h) / 10)` when that is bigger.
3. When the game ends with a new best score, save it under `'doodle-best'`.
4. Draw `Score: 30` at the top left and `Best: 120` at the top right (`'#0f172a'`, `'bold 18px sans-serif'`).

# --task-tr--

1. En üstteki değişkenlerde `let highest ...` satırının altına `let score` ekle; `let state ...` satırının altına en
   iyi skoru hafızadan okuyan satırı ekle:

   ```js
   let highest // ...
   let score // ← yeni
   let state // ...
   let best = Number(localStorage.getItem('doodle-best')) || 0 // ← yeni
   const keys = {}
   ```

2. `reset()` fonksiyonunda `highest = START_Y` satırının altına skoru sıfırlayan satırı ekle:

   ```js
     highest = START_Y
     score = 0 // ← yeni
     state = 'playing'
   ```

3. `update()` fonksiyonunda kamerayı hareket ettiren `if (player.y < cameraY + 200) ...` satırının hemen altına skoru
   güncelleyen satırı ekle:

   ```js
     if (player.y < cameraY + 200) cameraY = player.y - 200
     score = Math.max(score, Math.floor((START_Y - player.y - player.h) / 10)) // ← yeni
     fillPlatforms()
   ```

4. Yine `update()`'in sonunda, `state = 'over'` satırının altına rekoru kaydeden kısmı ekle:

   ```js
     if (player.y > cameraY + canvas.height) {
       state = 'over'
       if (score > best) { // ← yeni
         best = score // ← yeni
         localStorage.setItem('doodle-best', best) // ← yeni
       } // ← yeni
     }
   }
   ```

5. `draw()` fonksiyonunda oyuncuyu çizen satırların altına, `if (state === 'over') {` satırından **önce** skorları
   yazan satırları ekle:

   ```js
     ctx.fillStyle = '#0f172a'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Score: ' + score, 10, 26)
     ctx.textAlign = 'right'
     ctx.fillText('Best: ' + best, canvas.width - 10, 26)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Tırmandıkça sol üstteki skor artmalı; düşünce sağ üstteki `Best`
   güncellenmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `'doodle-best'` adının iki yerde de aynı
   yazıldığına ve `'Score: '` içindeki iki nokta ile boşluğa bak.

# --tests--

The score should be the highest point reached, in tens of pixels.
tr: Skor, ulaşılan en yüksek nokta olmalı, onlarca piksel olarak.

```js
$.tick(1)
assert.strictEqual(score, 0)
player = { x: 180, y: 150, w: 40, h: 40, vy: 0 }
$.tick(1)
assert.strictEqual(score, 30)
assert.include($.texts(), 'Score: 30')
```

Falling back down should not lower the score.
tr: Geri düşmek skoru düşürmemeli.

```js
player = { x: 180, y: 150, w: 40, h: 40, vy: 0 }
$.tick(1)
player.y = 300
player.vy = 3
$.tick(1)
assert.strictEqual(score, 30)
```

The best score should be saved when the game ends.
tr: En iyi skor oyun bitince kaydedilmeli.

```js
player = { x: 180, y: 150, w: 40, h: 40, vy: 0 }
$.tick(1)
player.y = cameraY + 610
$.tick(1)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 30)
assert.strictEqual(localStorage.getItem('doodle-best'), '30')
$.press(' ')
$.tick(1)
assert.strictEqual(score, 0)
assert.include($.texts(), 'Best: 30')
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
let score
let state // 'playing' or 'over'
let best = Number(localStorage.getItem('doodle-best')) || 0
const keys = {}

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
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

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
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
