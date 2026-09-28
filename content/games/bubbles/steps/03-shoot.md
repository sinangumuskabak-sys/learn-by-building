---
title: Shoot, bounce and stick
title_tr: At, sek ve yapış
skills: [game.physics, game.collision]
---

# --explanation--

A shot flies in a straight line at `SPEED` pixels per frame, bouncing off the side walls: past the left edge, flip `vx` and put
the bubble back inside. It stops as soon as it **touches** something:

- the ceiling, or
- a bubble in the grid, when the centres are less than `2R` apart (we use `2R - 4`, a little forgiving, so a shot can slip
  through a gap that looks just wide enough).

Where it stopped is almost never exactly a cell, so it **snaps** to the nearest empty cell. That one step turns free movement back
into the grid, and everything after (matching, falling) only has to think about cells.

A fast bubble could jump over a gap or into another bubble in a single frame, so each frame is split into three smaller steps
that each check for a touch.

Space shoots, and so does letting go of the pointer: on a phone you tap where you want to aim and the bubble flies there.

# --explanation-tr--

**Bu adımda:** balonu ateşleyeceğiz. **Boşluk**'a basınca (ya da fareyi/parmağı bırakınca) yüklü balon nişan yönünde uçacak,
yan duvarlardan sekecek, tavana ya da bir balona değince durup ızgaraya oturacak.

**Uçan balon (`shot`).** Uçan balonu bir **nesnede** tutarız: `{ x, y, vx, vy, color }`. `x`, `y` yeri; `vx`, `vy` her
karede ne kadar yana ve yukarı/aşağı gideceği (**hız**, velocity); `color` rengi. Uçan balon yoksa `shot` `null`'dır
("hiçbir şey").

**Ateş etmek.** Hız, nişan açısından gelir: 2. adımdaki çizginin ucu gibi, ama 80 yerine `SPEED` = 12 piksel:
`vx = Math.cos(aim) * SPEED`, `vy = Math.sin(aim) * SPEED`. Atıştan sonra sıradaki balon atıcıya geçer (`loaded = next`)
ve yeni bir sıradaki seçilir. `if (shot) return` → zaten uçan bir balon varsa ikinciyi atma.

**Uçuş ve sekme (`update`).** Her karede balonun yerine hızını ekleriz (`shot.x += shot.vx`). Sol ya da sağ kenarı geçerse
(`shot.x < R || shot.x > canvas.width - R`; `||` "ya da") yatay hızı ters çeviririz: `shot.vx = -shot.vx`. Balonu da
duvarın içine geri koyarız ki duvarın içinde takılmasın: `Math.max(R, Math.min(canvas.width - R, shot.x))` sayıyı iki sınır
arasında tutar (2. adımdaki `clampAim` gibi).

**Küçük adımlar.** Hızlı bir balon tek karede bir boşluğun üstünden atlayabilir ya da başka bir balonun içine girebilir.
Bu yüzden her kareyi **üç küçük adıma** böleriz; her adımda hızın üçte birini (`shot.vx / 3`) ekleyip "değdi mi?" diye
sorarız. `for (let i = 0; i < 3 && shot; i++)` → "en fazla 3 kez, balon hâlâ uçtuğu sürece".

**Değdi mi? (`touches`)** Balon şu durumlarda durur:

- tavana değdiyse: `y - R <= TOP` (balonun üst kenarı, üst şeridin altına ulaştı);
- ızgaradaki bir balona değdiyse: iki merkez arası `2R`'den (iki yarıçap) azsa. `Math.hypot(dx, dy)` iki nokta arasındaki
  uzaklığı verir (Pisagor). `2 * R - 4` kullanırız: biraz hoşgörülü, böylece tam sığacak kadar görünen bir aralıktan balon
  geçebilir.

Bir şey bulunca `return true` (doğru) ile hemen cevap verir; hiçbir şey yoksa en sonda `return false` (yanlış).

**Izgaraya oturtmak (`snap`).** Balonun durduğu yer neredeyse hiç tam bir hücre olmaz, bu yüzden **en yakın boş hücreye**
yerleşir. Bütün boş hücreleri gezer ve en yakınını `nearest`'ta tutarız: `!nearest || d < nearest.d` → "henüz aday yoksa ya
da bu daha yakınsa, yeni aday bu". `{ r, c, d }`, `{ r: r, c: c, d: d }`'nin kısa yazımıdır. Bu tek adım serbest hareketi
yeniden ızgaraya çevirir; bundan sonraki her şey (eşleşme, düşme) yalnızca hücrelerle uğraşır.

`attach(r, c, color)` rengi o hücreye koyar. Şimdilik tek satır; sonraki adımlarda büyüyecek.

**Nasıl ateş edilir?** `keydown`'a Boşluk (`' '`) eklenir. Telefonda ise nişan için ekrana dokunup **bıraktığında** balon
gider: `pointerup` olayı. `() => shoot()` "olay gelince `shoot()`'u çağır" diyen kısa bir fonksiyondur.

# --task--

1. Add `SPEED = 12` and `shot` (`null` in `reset()`). Write `shoot()`: if nothing is flying, launch the loaded bubble from the
   shooter along the aim, then `loaded = next` and pick a new `next`.
2. Write `touches(x, y)`: true at the ceiling (`y - R <= TOP`) or within `2R - 4` of a bubble in the grid.
3. Write `snap(x, y)`: the empty cell `{ r, c }` whose centre is nearest, and `attach(r, c, color)`, which puts the color there.
4. Write `update()`, before `draw()`: in three steps per frame, move the shot by a third of its velocity, bounce it off the side
   walls, and when it touches, attach it at `snap` and set `shot = null`.
5. Space shoots (`preventDefault()`), `pointerup` shoots, and the flying bubble is drawn.

# --task-tr--

1. `const SHOOTER = ...` satırının altına ekle:

   ```js
   const SPEED = 12
   ```

2. `let next ...` satırının altına ekle:

   ```js
   let shot // the bubble in flight: { x, y, vx, vy, color }, or null
   ```

3. `reset()`'te `aim = -Math.PI / 2` satırının hemen altına ekle:

   ```js
     shot = null
   ```

4. `reset()`'in kapanış `}`'sinin altına, `const clampAim = ...` satırından önce, şu fonksiyonları yaz:

   ```js
   function shoot() {
     if (shot) return
     shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
     loaded = next
     next = pickColor()
   }

   // Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
   function touches(x, y) {
     if (y - R <= TOP) return true
     for (let r = 0; r < ROWS; r++) {
       for (let c = 0; c < cols(r); c++) {
         if (grid[r][c] < 0) continue
         const p = cellPos(r, c)
         if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
       }
     }
     return false
   }

   // The empty cell closest to where the bubble stopped.
   function snap(x, y) {
     let nearest = null
     for (let r = 0; r < ROWS; r++) {
       for (let c = 0; c < cols(r); c++) {
         if (grid[r][c] >= 0) continue
         const p = cellPos(r, c)
         const d = Math.hypot(p.x - x, p.y - y)
         if (!nearest || d < nearest.d) nearest = { r, c, d }
       }
     }
     return nearest
   }

   function attach(r, c, color) {
     grid[r][c] = color
   }

   function update() {
     if (!shot) return
     // A few small steps per frame, so the bubble cannot jump past a gap.
     for (let i = 0; i < 3 && shot; i++) {
       shot.x += shot.vx / 3
       shot.y += shot.vy / 3
       if (shot.x < R || shot.x > canvas.width - R) {
         shot.vx = -shot.vx // bounce off the side walls
         shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
       }
       if (touches(shot.x, shot.y)) {
         const cell = snap(shot.x, shot.y)
         attach(cell.r, cell.c, shot.color)
         shot = null
       }
     }
   }
   ```

5. `keydown` dinleyicisine Boşluk'u ekle; dinleyici şöyle olmalı:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
     else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
     else if (event.key === ' ') shoot() // ← yeni
     else return
     event.preventDefault()
   })
   ```

6. `canvas.addEventListener('pointerdown', pointAt)` satırının altına ekle:

   ```js
   canvas.addEventListener('pointerup', () => shoot())
   ```

7. `draw()`'un sonuna, `drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)` satırının altına uçan balonu çizen satırı ekle:

   ```js
     if (shot) drawBubble(shot.x, shot.y, shot.color)
   ```

8. En alttaki `loop()`'ta `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. **Boşluk**'a bas ya da ekrana tıklayıp bırak: balon uçmalı,
   duvarlardan sekmeli ve bir balona değince yanına oturmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A shot straight up on an empty board should stick to the ceiling above the shooter.
tr: Boş tahtada dümdüz yukarı bir atış atıcının üstünde tavana yapışmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
const color = loaded
const second = next
$.press(' ')
assert.isNotNull(shot)
assert.strictEqual(loaded, second, 'the next bubble moves up')
$.press(' ')
for (let i = 0; i < 100 && shot; i++) $.tick(1)
assert.isNull(shot)
assert.isTrue(grid[0][4] === color || grid[0][5] === color, 'it sticks to the ceiling above the shooter')
```

A shot should bounce off the side walls.
tr: Bir atış yan duvarlardan sekmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
aim = -Math.PI + 0.3
shoot()
let bounced = false
for (let i = 0; i < 100 && shot; i++) {
  $.tick(1)
  if (shot && shot.vx > 0) bounced = true
  if (shot) assert.isAtLeast(shot.x, R, 'never through the wall')
}
assert.isTrue(bounced, 'it bounces off the left wall')
```

A shot should stop against a bubble and snap into the row below it.
tr: Bir atış bir balona çarpıp durmalı ve altındaki satıra oturmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[5][4] = 2
const color = loaded
$.move(200 + 10, 300)
$.pointerDown(210, 300)
$.pointerUp(210, 300)
assert.isNotNull(shot, 'letting go shoots')
for (let i = 0; i < 100 && shot; i++) $.tick(1)
const placed = []
for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols(r); c++) if (grid[r][c] >= 0 && !(r === 5 && c === 4)) placed.push([r, c])
assert.lengthOf(placed, 1)
assert.strictEqual(placed[0][0], 6, 'it stops against the bubble, in the row below it')
assert.strictEqual(grid[placed[0][0]][placed[0][1]], color)
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }
const SPEED = 12

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

const pickColor = () => Math.floor(Math.random() * COLORS.length)

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP) return true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
    }
  }
  return false
}

// The empty cell closest to where the bubble stopped.
function snap(x, y) {
  let nearest = null
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] >= 0) continue
      const p = cellPos(r, c)
      const d = Math.hypot(p.x - x, p.y - y)
      if (!nearest || d < nearest.d) nearest = { r, c, d }
    }
  }
  return nearest
}

function attach(r, c, color) {
  grid[r][c] = color
}

function update() {
  if (!shot) return
  // A few small steps per frame, so the bubble cannot jump past a gap.
  for (let i = 0; i < 3 && shot; i++) {
    shot.x += shot.vx / 3
    shot.y += shot.vy / 3
    if (shot.x < R || shot.x > canvas.width - R) {
      shot.vx = -shot.vx // bounce off the side walls
      shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
    }
    if (touches(shot.x, shot.y)) {
      const cell = snap(shot.x, shot.y)
      attach(cell.r, cell.c, shot.color)
      shot = null
    }
  }
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)
canvas.addEventListener('pointerup', () => shoot())

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  // The aim: a short line from the shooter.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
