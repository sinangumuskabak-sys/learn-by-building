---
title: Cutting the rope
title_tr: İpi kesmek
skills: [prog.arrays, game.state]
---

# --explanation--

The best moves in a bubble shooter pop a small group that **holds up** a big one. Everything hanging from the popped bubbles
drops, and a single shot clears half the board.

How do we know what still hangs? A bubble is held if it connects, through other bubbles, to the **ceiling**. So we flood fill
again, this time starting from every bubble in row 0 and going through any color. Every bubble reached is held; every bubble
**not** reached is floating and falls. Dropped bubbles are worth double.

The same `connected` function does both jobs; only the starting cells and the test change:

```js
connected([[r, c]], (nr, nc) => grid[nr][nc] === color) // the group of one color
connected(topRow, (nr, nc) => grid[nr][nc] >= 0)        // everything held by the ceiling
```

Removed bubbles no longer just vanish. They become **falling** bubbles with a little upward pop and gravity, and are forgotten
once they leave the screen. The grid is already updated, so the game plays on while they fall.

# --explanation-tr--

**Bu adımda:** ipi keseceğiz. Bir grup patlayınca, artık tavana bağlı olmayan bütün balonlar da düşecek. Patlayan ve düşen
balonların birden kaybolmak yerine hafifçe zıplayıp ekranın altından **düşerek** çıktığını göreceksin.

**En iyi hamle.** Balon oyunlarında en güzel atış, **büyük bir grubu taşıyan** küçük bir grubu patlatmaktır. Patlayanlara
asılı olan her şey düşer ve tek atış tahtanın yarısını temizler. Düşen balonlar **iki kat** değerlidir (20 puan).

**Hangi balon hâlâ asılı?** Bir balon, başka balonlar üzerinden **tavana** bağlıysa asılıdır. Bunu 4. adımdaki taşma
doldurmayla (flood fill) buluruz, ama bu sefer:

- başlangıç: tavandaki (satır 0) **bütün** balonlar;
- test: **renk fark etmez**, dolu olan her hücre (`grid[nr][nc] >= 0`).

Ulaşılan her balon asılıdır; ulaşılamayan her balon boşta kalmıştır ve düşer. Aynı `connected` fonksiyonu iki işi de
yapar, yalnızca başlangıç ve test değişir:

```js
connected([[r, c]], (nr, nc) => grid[nr][nc] === color) // tek renkli grup
connected(top, (nr, nc) => grid[nr][nc] >= 0)           // tavana asılı her şey
```

Kodda sırayla:

1. `top` listesine satır 0'daki dolu hücreler eklenir.
2. `held` (tutulanlar): taşma doldurmanın bulduğu hücreler, 4. adımdaki gibi `r * COLS + c` sayısına çevrilip bir `Set`'e
   konur; böylece "bu hücre tutuluyor mu?" sorusu tek bir `has` olur.
3. `loose` (boşta olanlar): bütün hücreleri gezip dolu **ve** tutulmayan (`!held.has(...)`) hücreleri toplarız.
4. `remove(loose, 20)`.

Döngü değişkenlerine `r2`, `c2`, `hr`, `hc` adlarını veriyoruz, çünkü `r` ve `c` adları zaten `attach(r, c, color)`'ın
kendi değerleri; aynı adı kullanırsak onları gölgelerdik.

**Düşen balonlar ve yerçekimi.** `remove` artık balonu sadece silmiyor; önce `falling` listesine bir kart ekliyor:
`{ x, y, vy: -2, r: R, color }`. `vy: -2` küçük bir yukarı zıplamadır (`y` aşağı büyüdüğü için eksi = yukarı). Sonra her
karede:

```js
f.vy += 0.4   // yerçekimi: aşağı doğru hız her karede biraz artar
f.y += f.vy   // hızı kadar hareket et
```

Önce yavaşça yükselir, durur, sonra gittikçe hızlanarak düşer; gerçek bir top gibi. Üst kenarı canvas'ın altını geçince
(`f.y - f.r < canvas.height` artık doğru değilse) `filter` onu listeden çıkarır. Izgara zaten güncellendiği için oyun,
balonlar düşerken devam eder. Bu hareket `update()`'in **başında** yapılır, `if (!shot) return` satırından önce; yoksa uçan
balon yokken düşenler havada donardı.

# --task--

1. After a group pops in `attach`, flood fill from all bubbles in row 0 through any bubble, and remove every bubble that was not
   reached, for 20 points each.
2. Add `falling` (`[]` in `reset()`). `remove` now also adds `{ x, y, vy: -2, r: R, color }` for each removed bubble, at its cell's
   position.
3. In `update()`, every falling bubble gets `0.4` added to `vy` and moves by it; remove it once its top is below the canvas.
4. Draw the falling bubbles.

# --task-tr--

1. `let shot ...` satırının altına ekle:

   ```js
   let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
   ```

2. `reset()`'te `shot = null` satırının altına ekle:

   ```js
     falling = []
   ```

3. `remove()` şöyle olmalı:

   ```js
   function remove(cells, points) {
     for (const [r, c] of cells) {
       const p = cellPos(r, c)                                             // ← yeni
       falling.push({ x: p.x, y: p.y, vy: -2, r: R, color: grid[r][c] }) // ← yeni
       grid[r][c] = -1
       score += points
     }
   }
   ```

4. `attach()`'te `remove(group, 10)` satırının altına (aynı `if`'in içine) boşta kalanları düşüren kodu ekle:

   ```js
     if (group.length >= 3) {
       remove(group, 10)
       // Whatever no longer hangs from the ceiling drops, worth double.
       const top = []
       for (let c2 = 0; c2 < cols(0); c2++) if (grid[0][c2] >= 0) top.push([0, c2])
       const held = new Set(connected(top, (nr, nc) => grid[nr][nc] >= 0).map(([hr, hc]) => hr * COLS + hc))
       const loose = []
       for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < cols(r2); c2++) {
         if (grid[r2][c2] >= 0 && !held.has(r2 * COLS + c2)) loose.push([r2, c2])
       }
       remove(loose, 20)
     }
   ```

5. `update()`'in **en başına**, `if (!shot) return` satırının üstüne ekle:

   ```js
   function update() {
     for (const f of falling) {                                  // ← yeni
       f.vy += 0.4                                               // ← yeni
       f.y += f.vy                                               // ← yeni
     }                                                           // ← yeni
     falling = falling.filter((f) => f.y - f.r < canvas.height) // ← yeni
     if (!shot) return
   ```

6. `draw()`'da ızgarayı çizen iki döngünün kapanışından hemen sonra, `// The aim: ...` yorumundan önce ekle:

   ```js
     for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Başka balonları taşıyan bir grubu patlat: altındakiler de düşmeli,
   balonlar ekranın altından çıkmalı. Alttaki kontrollerin hepsi yeşil olmalı. "Düşen balonlar" kontrolü kırmızıysa yerçekimi
   kodunu `if (!shot) return`'ün **üstüne** koyduğundan emin ol.

# --tests--

Bubbles no longer held by the ceiling should drop, worth double; the others stay.
tr: Artık tavana tutunmayan balonlar düşmeli ve iki kat değerli olmalı; diğerleri kalır.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][0] = grid[0][1] = 0
grid[1][0] = 3
grid[2][0] = 4
grid[0][5] = 2
attach(0, 2, 0)
assert.strictEqual(grid[1][0], -1, 'nothing holds it up any more')
assert.strictEqual(grid[2][0], -1)
assert.strictEqual(grid[0][5], 2, 'still hanging from the ceiling')
assert.strictEqual(score, 3 * 10 + 2 * 20, 'dropped bubbles are worth double')
assert.lengthOf(falling, 5)
```

Removed bubbles should fall and leave the screen.
tr: Kaldırılan balonlar düşmeli ve ekrandan çıkmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][0] = grid[0][1] = 0
attach(0, 2, 0)
const y = falling[0].y
$.tick(5)
assert.isAbove(falling[0].y, y - 20, 'it falls')
$.tick(120)
assert.lengthOf(falling, 0, 'and leaves the screen')
```

Falling bubbles should be drawn.
tr: Düşen balonlar çizilmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
falling = [{ x: 100, y: 200, vy: 0, r: R, color: 2 }]
$.tick(1)
assert.isAbove(falling[0].vy, 0)
assert.deepInclude($.arcs(), { x: 100, y: falling[0].y, r: 19, color: COLORS[2] })
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
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
let score

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

// The six cells around (r, c). Odd rows are shifted right, so their neighbours above and below are at c and c + 1;
// even rows' are at c - 1 and c.
function neighbors(r, c) {
  const shift = r % 2 === 0 ? -1 : 0
  return [
    [r, c - 1], [r, c + 1],
    [r - 1, c + shift], [r - 1, c + shift + 1],
    [r + 1, c + shift], [r + 1, c + shift + 1],
  ].filter(([nr, nc]) => inGrid(nr, nc))
}

const pickColor = () => Math.floor(Math.random() * COLORS.length)

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  falling = []
  score = 0
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

// Flood fill: every cell connected to (r, c) through neighbours that pass the test.
function connected(starts, test) {
  const seen = new Set(starts.map(([r, c]) => r * COLS + c))
  const queue = [...starts]
  while (queue.length) {
    const [r, c] = queue.shift()
    for (const [nr, nc] of neighbors(r, c)) {
      if (seen.has(nr * COLS + nc) || !test(nr, nc)) continue
      seen.add(nr * COLS + nc)
      queue.push([nr, nc])
    }
  }
  return [...seen].map((k) => [Math.floor(k / COLS), k % COLS])
}

function remove(cells, points) {
  for (const [r, c] of cells) {
    const p = cellPos(r, c)
    falling.push({ x: p.x, y: p.y, vy: -2, r: R, color: grid[r][c] })
    grid[r][c] = -1
    score += points
  }
}

function attach(r, c, color) {
  grid[r][c] = color
  // Three or more of one color, touching: they pop.
  const group = connected([[r, c]], (nr, nc) => grid[nr][nc] === color)
  if (group.length >= 3) {
    remove(group, 10)
    // Whatever no longer hangs from the ceiling drops, worth double.
    const top = []
    for (let c2 = 0; c2 < cols(0); c2++) if (grid[0][c2] >= 0) top.push([0, c2])
    const held = new Set(connected(top, (nr, nc) => grid[nr][nc] >= 0).map(([hr, hc]) => hr * COLS + hc))
    const loose = []
    for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < cols(r2); c2++) {
      if (grid[r2][c2] >= 0 && !held.has(r2 * COLS + c2)) loose.push([r2, c2])
    }
    remove(loose, 20)
  }
}

function update() {
  for (const f of falling) {
    f.vy += 0.4
    f.y += f.vy
  }
  falling = falling.filter((f) => f.y - f.r < canvas.height)
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
  for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 21)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
