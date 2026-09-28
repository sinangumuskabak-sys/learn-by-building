---
title: Painting cells
title_tr: Hücre boyamak
skills: [game.input, game.state]
---

# --explanation--

Random soup is fun, but the real game is drawing your own patterns and watching what they do. A click should flip a cell,
and **dragging** should paint a line of cells.

Dragging needs to remember something between events: is the pointer down, and what are we painting? One variable does both.
`painting` is `null` while the pointer is up. On `pointerdown` it becomes the **opposite** of the pressed cell: pressing on a
dead cell paints live ones, pressing on a live cell erases. Every `pointermove` then writes `painting` into the cell under
the pointer, and `pointerup` sets it back to `null`.

```js
painting = grid[cell.r][cell.c] ? 0 : 1
```

Why decide once, at the start, instead of flipping each cell the pointer crosses? Because a slow drag fires several moves
over the same cell, and flipping would turn it on, off, on... Painting one value is stable.

Listen for `pointerup` on the **document**, not the canvas: if the player lets go outside the canvas, the canvas never hears
about it and the game would keep painting.

Two more keys: C clears the world (and stops it), R throws in a new random soup.

# --explanation-tr--

**Bu adımda:** kendi desenlerini çizebileceksin. Bir hücreye tıklamak onu canlandıracak (ya da silecek), basılı tutup
sürüklemek bir çizgi boyayacak. **C** dünyayı temizleyecek, **R** yeniden rastgele dolduracak.

**Fare ve parmak olayları.** Tarayıcı, fare ya da dokunmatik için üç olay (event) yayar: `pointerdown` (bastın),
`pointermove` (hareket ettirdin), `pointerup` (bıraktın). 2. adımda `keydown` için yaptığımız gibi
`addEventListener` ile dinleriz.

**Tıklanan yer canvas'ın neresi?** Olay bize yeri **sayfaya göre** verir: `event.clientX`, `event.clientY`. Canvas
sayfada başka bir yerde durur ve ekrana sığsın diye büyütülmüş ya da küçültülmüş olabilir. `toCanvas(event)` bunu
düzeltir:

- `canvas.getBoundingClientRect()` canvas'ın sayfadaki kutusunu verir: `left` (sol kenarı), `top` (üst kenarı), `width`,
  `height` (ekrandaki boyu).
- `event.clientX - rect.left` → canvas'ın sol kenarından kaç piksel içeride.
- `* canvas.width / rect.width` → ekrandaki pikseli canvas'ın kendi pikseline çevirir (canvas iki kat büyük gösteriliyorsa
  yarıya indirir).
- Sonuç `{ x: ..., y: ... }` biçiminde bir nesnedir (4. adımdaki gibi anahtar–değer).

**Hangi hücre?** `cellAt(point)` noktayı hücreye çevirir. `Math.floor` sayıyı aşağı yuvarlar: `Math.floor(3.9)` = 3.
`x = 85` ise `85 / 8` = 10.6, aşağı yuvarlayınca sütun 10. Satır için önce üstteki `TOP` boşluğunu çıkarırız.

- Parantezdeki `{ x, y }` → "gelen nesnenin `x`'ini ve `y`'sini al, bu adlarla kullan".
- `{ r, c }` kısa yazımdır, `{ r: r, c: c }` demektir.
- Nokta ızgaranın dışındaysa `null` döneriz. `null` "hiçbir şey" demektir.

**Sürüklerken ne boyuyoruz?** `painting` değişkeni iki işi birden yapar:

- `null` ise parmak kalkık, hiçbir şey boyanmıyor.
- Basınca, basılan hücrenin **tersi** olur: ölü hücreye bastıysan `1` (canlı boya), canlıya bastıysan `0` (silgi).

```js
painting = grid[cell.r][cell.c] ? 0 : 1
```

Sonra her `pointermove`'da parmağın altındaki hücreye bu değer yazılır; bırakınca yine `null` olur. Neden her hücreyi
çevirmiyoruz? Yavaş sürüklerken aynı hücrede birkaç hareket olayı gelir; çevirseydik aç–kapa–aç yapardı.

`pointerup`'ı canvas'ta değil **document**'te (bütün sayfada) dinleriz: oyuncu parmağını canvas'ın dışında kaldırırsa
canvas bunu duymaz ve boyamaya devam ederdi.

`painting === null` → "`painting` hiçbir şey mi?". `!==` ise "eşit değil mi?" diye sorar.

# --task--

1. Write `toCanvas(event)` (the pointer in canvas pixels) and `cellAt(point)` (the `{ r, c }` under it, or `null` off the
   grid).
2. Add `painting = null`. On `pointerdown` over a cell, set `painting` to the opposite of that cell and write it into the
   cell. On `pointermove`, while `painting` is not `null`, write it into the cell under the pointer. On the document's
   `pointerup`, set `painting = null`.
3. Write `clear()`: an empty grid, `generation = 0`, `playing = false`.
4. `press('Random')` calls `randomize()` and `press('Clear')` calls `clear()`; the R and C keys press them.

# --task-tr--

1. `let frames` satırının altına ekle:

   ```js
   let painting = null // while the pointer is down: the value being painted, 1 or 0
   ```

2. `randomize()` fonksiyonunun kapanış `}`'sinin altına temizleyen fonksiyonu ekle:

   ```js
   function clear() {
     grid = emptyGrid()
     generation = 0
     playing = false
   }
   ```

3. `press()` fonksiyonuna iki düğme daha ekle. Fonksiyon şöyle olmalı:

   ```js
   function press(button) {
     if (button === 'Play') playing = !playing
     else if (button === 'Step') {
       playing = false
       step()
     } else if (button === 'Random') randomize() // ← yeni
     else if (button === 'Clear') clear()        // ← yeni
   }
   ```

4. `keydown` dinleyicisindeki tabloya R ve C'yi ekle:

   ```js
     const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' } // ← değişti
   ```

5. `keydown` dinleyicisinin kapanışı olan `})` satırının altına şunları yaz:

   ```js
   function toCanvas(event) {
     const rect = canvas.getBoundingClientRect()
     return {
       x: ((event.clientX - rect.left) * canvas.width) / rect.width,
       y: ((event.clientY - rect.top) * canvas.height) / rect.height,
     }
   }

   function cellAt({ x, y }) {
     const r = Math.floor((y - TOP) / CELL)
     const c = Math.floor(x / CELL)
     return r >= 0 && r < ROWS && c >= 0 && c < COLS ? { r, c } : null
   }

   // Pressing on a dead cell paints live cells as you drag; pressing on a live one erases.
   canvas.addEventListener('pointerdown', (event) => {
     const cell = cellAt(toCanvas(event))
     if (!cell) return
     painting = grid[cell.r][cell.c] ? 0 : 1
     grid[cell.r][cell.c] = painting
   })

   canvas.addEventListener('pointermove', (event) => {
     if (painting === null) return
     const cell = cellAt(toCanvas(event))
     if (cell) grid[cell.r][cell.c] = painting
   })

   document.addEventListener('pointerup', () => {
     painting = null
   })
   ```

6. **Çalıştır**'a bas. Önce oyuna tıkla ve **C**'ye bas: ızgara boşalmalı. Sonra basılı tutup sürükleyerek bir şekil çiz,
   **Boşluk** ile çalıştır. **R** yeniden rastgele doldurmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A click should bring a cell to life, and a second click should erase it.
tr: Bir tıklama bir hücreyi canlandırmalı, ikinci bir tıklama onu silmeli.

```js
grid = emptyGrid()
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 1)
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 0, 'a second click erases')
$.click(200, 10)
assert.strictEqual(population(), 0, 'nothing happens above the grid')
```

Dragging should paint a line of live cells, and dragging from a live cell should erase.
tr: Sürüklemek bir canlı hücre çizgisi boyamalı, canlı bir hücreden sürüklemek silmeli.

```js
grid = emptyGrid()
$.pointerDown(4, 36 + 20 * 8 + 4)
for (let c = 1; c < 10; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(9 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 11), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], 'dragging paints live cells')
$.move(11 * 8 + 4, 36 + 20 * 8 + 4)
assert.strictEqual(grid[20][11], 0, 'moving without pressing does nothing')
$.pointerDown(3 * 8 + 4, 36 + 20 * 8 + 4)
for (let c = 4; c < 7; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(6 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 10), [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], 'dragging from a live cell erases')
```

C should clear and stop the world, and R should fill it again.
tr: C dünyayı temizleyip durdurmalı, R onu yeniden doldurmalı.

```js
$.press(' ')
$.tick(SPEED * 3)
$.press('c')
assert.strictEqual(population(), 0)
assert.strictEqual(generation, 0)
assert.isFalse(playing, 'clearing stops the game')
$.press('r')
assert.isAbove(population(), 300)
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let playing
let frames
let painting = null // while the pointer is down: the value being painted, 1 or 0

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
}

function reset() {
  grid = emptyGrid()
  randomize()
  playing = false
  frames = 0
}

// Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
    }
  }
  return count
}

// Every cell changes at the same moment, so the next generation is built in a new grid.
function step() {
  const next = emptyGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
    }
  }
  grid = next
  generation += 1
}

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  } else if (button === 'Random') randomize()
  else if (button === 'Clear') clear()
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

function cellAt({ x, y }) {
  const r = Math.floor((y - TOP) / CELL)
  const c = Math.floor(x / CELL)
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? { r, c } : null
}

// Pressing on a dead cell paints live cells as you drag; pressing on a live one erases.
canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(toCanvas(event))
  if (!cell) return
  painting = grid[cell.r][cell.c] ? 0 : 1
  grid[cell.r][cell.c] = painting
})

canvas.addEventListener('pointermove', (event) => {
  if (painting === null) return
  const cell = cellAt(toCanvas(event))
  if (cell) grid[cell.r][cell.c] = painting
})

document.addEventListener('pointerup', () => {
  painting = null
})

function update() {
  frames += 1
  if (playing && frames % SPEED === 0) step()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
