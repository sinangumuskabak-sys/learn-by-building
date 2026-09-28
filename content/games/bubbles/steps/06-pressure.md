---
title: The ceiling comes down
title_tr: Tavan iniyor
skills: [game.state]
---

# --explanation--

Without pressure you could shoot forever. So every `DROP_EVERY` shots the **ceiling comes down** one row, pushing all the bubbles
towards you. If any bubble ends up below the **danger line**, the game is lost. Clear every bubble first and you win, with a
bonus.

The clever part is how little code the ceiling needs. The grid does not change at all; only `cellPos` adds `drop * ROW_H` to every
`y`. Because every other function (`touches`, `snap`, drawing) goes through `cellPos`, the whole board moves together. The
ceiling itself is drawn as a solid block that grows downwards, so you can see it coming.

When the game ends, shooting stops, and Space or a tap starts again.

# --explanation-tr--

**Bu adımda:** oyuna baskı ekleyeceğiz. Her 8 atışta bir **tavan bir satır aşağı inecek** ve bütün balonları sana doğru
itecek. Altta kırmızımsı bir **tehlike çizgisi** göreceksin: bir balon onun altına inerse kaybedersin
(`The bubbles reached you`). Bütün balonları temizlersen kazanırsın (`Board cleared!`) ve 1000 puan ödül alırsın.

**Tavanı indirmenin akıllı yolu.** `drop`, tavanın kaç satır indiğini sayar. Izgaranın kendisi hiç değişmez; yalnızca
`cellPos` her `y`'ye `drop * ROW_H` ekler. `touches`, `snap` ve çizim, hücrenin yerini hep `cellPos`'tan sorduğu için bütün
tahta birlikte aşağı kayar. Tek bir satırı değiştirip her şeyi hareket ettirmek: işleri tek bir yere toplamanın ödülü.
Tavanın kendisi aşağı doğru uzayan dolu bir blok olarak çizilir (`TOP + drop * ROW_H` yüksekliğinde), böylece geldiğini
görürsün. `touches`'taki tavan kontrolü de aynı miktarı ekler.

**Oyunun durumu (`state`).** `state` bir yazıyla oyunun hâlini tutar: `'playing'` (oynanıyor), `'won'` (kazandın),
`'lost'` (kaybettin). `!==` "eşit değil mi?" diye sorar.

**Her atıştan sonra (`attach`):**

- `shots += 1`; `shots % DROP_EVERY === 0` (8'e bölümünden kalan 0, yani 8., 16., 24. atış) ise `drop += 1`.
- Kazandın mı, kaybettin mi? Önce ızgarayı düz bir listeye çeviririz:

  ```js
  const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
  ```

  `map` her hücreyi `{ r, c, color }` kartına çevirir; `flatMap` satır satır çıkan listeleri tek bir uzun listede birleştirir.
- `cells.every((cell) => cell.color < 0)` → "**her** hücre boş mu?" Evetse kazandın, `score += 1000`.
- `else if (cells.some(...))` → değilse, "**en az bir** dolu balonun alt kenarı (`y + R`) tehlike çizgisinin altında mı?"
  `some` biri bile uyarsa `true` verir. Evetse kaybettin.

**Oyun bitince.** `shoot` yalnızca oynarken çalışır: `if (state !== 'playing' || shot) return`. Boşluk tuşu oynarken ateş
eder, oyun bitmişse yeniden başlatır:

```js
state === 'playing' ? shoot() : reset()
```

`a ? b : c` burada bir değer seçmek için değil, iki işten birini yapmak için kullanılıyor: "oynuyorsa `shoot()`, değilse
`reset()`". Ekrana dokunmak da aynı kuralı izler: parmağı kaldırınca (`pointerup`) oynuyorsan atış yapılır, oyun
bitmişse `reset()`; parmak ekrandayken (`pointerdown`) yalnızca nişan alınır. Nişan çizgisi
yalnızca oynarken çizilir, bitince ortada yarı saydam bir panelde sonuç yazar.

# --task--

1. Add `DANGER = 440`, `DROP_EVERY = 8`, and `shots`, `drop` and `state` (`0`, `0` and `'playing'` in `reset()`). `cellPos` and
   the ceiling in `touches` add `drop * ROW_H`.
2. `attach` counts `shots`; every `DROP_EVERY` shots, `drop` grows by 1. Then: an empty board is `'won'` (+1000); a bubble whose
   bottom is below `DANGER` is `'lost'`.
3. `shoot` only works while playing. When the game is over, Space and a tap restart it: `pointerdown` only aims while
   playing, and `pointerup` does `state === 'playing' ? shoot() : reset()`.
4. Draw the ceiling block `TOP + drop * ROW_H` high, the danger line (`'rgba(239, 68, 68, 0.5)'`, 2 high at `DANGER`), and the aim
   line only while playing. At the end: a `'rgba(15, 23, 42, 0.85)'` panel at `(40, 200)`, `canvas.width - 80` by 90, with
   `Board cleared!` or `The bubbles reached you` (`'bold 24px sans-serif'`, `y = 238`) and `Space or tap to play again`
   (`'16px sans-serif'`, `y = 268`).

# --task-tr--

1. `const SPEED = 12` satırının altına iki sabit ekle:

   ```js
   const DANGER = 440 // a bubble below this line ends the game
   const DROP_EVERY = 8 // shots between the ceiling coming down
   ```

2. `let score` satırının altına üç değişken ekle:

   ```js
   let shots
   let drop // how many rows the ceiling has come down
   let state // 'playing', 'won' or 'lost'
   ```

3. `cellPos` satırını şöyle değiştir (`y` kısmına `drop * ROW_H +` eklendi):

   ```js
   const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + drop * ROW_H + R + r * ROW_H })
   ```

4. `reset()`'te `score = 0` satırının altına ekle:

   ```js
     shots = 0
     drop = 0
     state = 'playing'
   ```

5. `shoot()`'un ilk satırını değiştir:

   ```js
     if (state !== 'playing' || shot) return // ← değişti
   ```

6. `touches()`'un ilk satırını değiştir:

   ```js
     if (y - R <= TOP + drop * ROW_H) return true // ← değişti
   ```

7. `attach()`'te `grid[r][c] = color` satırının altına `shots += 1` ekle ve fonksiyonun sonuna (büyük `if`'in kapanışından
   sonra, son `}`'den önce) şunları yaz:

   ```js
   function attach(r, c, color) {
     grid[r][c] = color
     shots += 1 // ← yeni
     ...
       remove(loose, 20)
     }
     if (shots % DROP_EVERY === 0) drop += 1                                                  // ← yeni
     const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
     if (cells.every((cell) => cell.color < 0)) {                                             // ← yeni
       state = 'won'
       score += 1000
     } else if (cells.some((cell) => cell.color >= 0 && cellPos(cell.r, cell.c).y + R > DANGER)) state = 'lost'
   }
   ```

   (`...` yazma; arada kalan kod aynen kalır. `const cells` ve `} else if` satırları da yeni.)

8. `keydown` dinleyicisinde Boşluk satırını değiştir:

   ```js
     else if (event.key === ' ') state === 'playing' ? shoot() : reset() // ← değişti
   ```

9. `canvas.addEventListener('pointerdown', pointAt)` ve `canvas.addEventListener('pointerup', () => shoot())`
   satırlarını sil, yerlerine şunu yaz:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (state === 'playing') pointAt(event)
   })
   canvas.addEventListener('pointerup', () => (state === 'playing' ? shoot() : reset()))
   ```

   Parmağı ekrana koyunca yalnızca nişan alınır; kaldırınca oynuyorsan atış yapılır, oyun bittiyse yeniden başlar.
   Böylece yeniden başlatan dokunuş aynı anda bir de atış yapmaz.

10. `draw()`'un başında tavan ve tehlike çizgisi:

    ```js
      ctx.fillStyle = '#1e1b4b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // The ceiling comes down as a solid block.
      ctx.fillStyle = '#312e81'
      ctx.fillRect(0, 0, canvas.width, TOP + drop * ROW_H) // ← değişti
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'             // ← yeni
      ctx.fillRect(0, DANGER, canvas.width, 2)             // ← yeni
    ```

11. `draw()`'da nişan çizgisini çizen altı satırı bir `if`'in içine al:

    ```js
      if (state === 'playing') {
        // The aim: a short line from the shooter.
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(SHOOTER.x, SHOOTER.y)
        ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
        ctx.stroke()
      }
    ```

12. `draw()`'un en sonuna, `ctx.fillText('Score ' + score, 10, 21)` satırının altına sonuç panelini ekle:

    ```js
      if (state !== 'playing') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.fillRect(40, 200, canvas.width - 80, 90)
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(state === 'won' ? 'Board cleared!' : 'The bubbles reached you', canvas.width / 2, 238)
        ctx.font = '16px sans-serif'
        ctx.fillText('Space or tap to play again', canvas.width / 2, 268)
      }
    ```

13. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Altta kırmızı ince bir çizgi görmelisin; 8 atış yap: tavan ve
    balonlar bir satır inmeli. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Every eighth shot should bring the ceiling and the bubbles down a row.
tr: Her sekizinci atış tavanı ve balonları bir satır indirmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][0] = 3
const y = cellPos(0, 0).y
shots = DROP_EVERY - 1
attach(0, 5, 1)
assert.strictEqual(drop, 1, 'the ceiling comes down')
assert.closeTo(cellPos(0, 0).y, y + ROW_H, 1e-9)
assert.strictEqual(state, 'playing')
```

A bubble below the danger line should lose the game, and Space should restart it.
tr: Tehlike çizgisinin altındaki bir balon oyunu kaybettirmeli ve Boşluk yeniden başlatmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][0] = 3
attach(11, 0, 1)
assert.strictEqual(state, 'lost', 'a bubble below the danger line')
$.tick(1)
assert.include($.texts(), 'The bubbles reached you')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(drop, 0)
```

Clearing the board should win with a bonus, and a tap should play again.
tr: Tahtayı temizlemek bir ödülle kazandırmalı ve bir dokunuş yeniden oynatmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][3] = grid[0][4] = 2
attach(0, 5, 2)
assert.strictEqual(state, 'won')
assert.strictEqual(score, 1030)
shoot()
assert.isNull(shot, 'no shooting after the end')
$.click(200, 300)
assert.strictEqual(state, 'playing', 'a tap plays again')
assert.isNull(shot, 'the tap that plays again does not also shoot')
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
const DANGER = 440 // a bubble below this line ends the game
const DROP_EVERY = 8 // shots between the ceiling coming down

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
let score
let shots
let drop // how many rows the ceiling has come down
let state // 'playing', 'won' or 'lost'

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + drop * ROW_H + R + r * ROW_H })

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
  shots = 0
  drop = 0
  state = 'playing'
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (state !== 'playing' || shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP + drop * ROW_H) return true
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
  shots += 1
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
  if (shots % DROP_EVERY === 0) drop += 1
  const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
  if (cells.every((cell) => cell.color < 0)) {
    state = 'won'
    score += 1000
  } else if (cells.some((cell) => cell.color >= 0 && cellPos(cell.r, cell.c).y + R > DANGER)) state = 'lost'
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
  else if (event.key === ' ') state === 'playing' ? shoot() : reset()
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
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'playing') pointAt(event)
})
// Lifting the finger shoots, or plays again after the end (so the tap that restarts does not also shoot).
canvas.addEventListener('pointerup', () => (state === 'playing' ? shoot() : reset()))

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // The ceiling comes down as a solid block.
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP + drop * ROW_H)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
  ctx.fillRect(0, DANGER, canvas.width, 2)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }
  for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)

  if (state === 'playing') {
    // The aim: a short line from the shooter.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(SHOOTER.x, SHOOTER.y)
    ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
    ctx.stroke()
  }
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 21)
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(40, 200, canvas.width - 80, 90)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(state === 'won' ? 'Board cleared!' : 'The bubbles reached you', canvas.width / 2, 238)
    ctx.font = '16px sans-serif'
    ctx.fillText('Space or tap to play again', canvas.width / 2, 268)
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
