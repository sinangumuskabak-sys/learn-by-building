---
title: A generation every few frames
title_tr: Birkaç karede bir nesil
skills: [game.loop]
---

# --goal--

Pressing N for every generation gets tiring. The loop runs 60 times a second, which is too fast to follow, so we
count frames and step only on every 6th one: 10 generations a second.

# --goal-tr--

Her nesil için N'ye basmak yorucu; dünya kendi kendine yaşasın. Ama döngü saniyede 60 kez dönüyor; her turda bir
nesil ilerlesek gözle izlenemez.

Çözüm: döngünün turlarını (**kare**, frame) sayarız ve yalnız **her 6. karede** bir nesil ilerleriz. Saniyede 60 ÷ 6 =
**10 nesil**. Bu adımda sayacı ve kararı veren `update` fonksiyonunu yazıyoruz.

# --code--

```js
const SPEED = 6 // frames per generation while playing

let frames

function reset() {
  grid = emptyGrid()
  randomize()
  frames = 0
}

function update() {
  frames += 1
  if (frames % SPEED === 0) step()
}
```

# --meaning--

- `SPEED` is how many frames one generation lasts. `frames` counts frames; `reset` sets it to 0.
- `update` adds one frame and steps when `frames % SPEED === 0`: on frames 6, 12, 18 ...

# --meaning-tr--

- `const SPEED = 6` → bir nesil kaç kare sürsün. **Büyüdükçe dünya yavaşlar.**
- `let frames` → kaç kare geçtiğini sayan kutu. `reset` içindeki `frames = 0` → yeni dünyada sayaç sıfırdan başlar.
- `function update() {` → her karede dünyayı **güncelleyecek** fonksiyon.
- `frames += 1` → bir kare daha geçti.
- `if (frames % SPEED === 0) step()` → kalan işaretini hatırla: `frames % 6`, `frames` 6'ya tam bölündüğünde `0`
  olur. Yani 6, 12, 18... karelerde bir nesil ilerle.

# --task--

1. Under `const TOP = 36` write the `SPEED` line.
2. Under `let generation` write `let frames`.
3. At the end of `reset`, write `frames = 0`.
4. Above `function draw() {` write `update`, with an empty line between them.

# --task-tr--

1. `const TOP = 36` satırının altına `SPEED` satırını yaz.
2. `let generation` satırının altına `let frames` yaz.
3. `reset` içinde, `randomize()` satırının altına `frames = 0` yaz.
4. `function draw() {` satırının **üstüne** `update` fonksiyonunu yaz; aralarında bir boş satır kalsın.
5. **Çalıştır**.

# --predict--

Will the world start moving by itself after Run?
- [ ] Yes, 10 generations a second
- [x] No, nothing calls `update()` yet
  Just like `step` before: a function does nothing until it is called.

# --predict-tr--

Çalıştır'a basınca dünya kendi kendine hareket etmeye başlayacak mı?
- [ ] Evet, saniyede 10 nesil
- [x] Hayır, `update()`'i henüz kimse çağırmıyor
  Daha önceki `step` gibi: fonksiyon çağrılana kadar hiçbir şey yapmaz.

# --tests--

`SPEED` should be 6 and `frames` should start at 0.
tr: `SPEED` 6 olmalı, `frames` 0'dan başlamalı.

```js
assert.strictEqual(SPEED, 6)
assert.strictEqual(frames, 0)
```

Calling `update()` `SPEED` times should advance exactly one generation.
tr: `update()`'i `SPEED` kez çağırmak tam bir nesil ilerletmeli.

```js
for (let i = 0; i < SPEED - 1; i++) update()
assert.strictEqual(generation, 0, 'not yet')
update()
assert.strictEqual(generation, 1)
for (let i = 0; i < SPEED * 3; i++) update()
assert.strictEqual(generation, 4)
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
let frames

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function reset() {
  grid = emptyGrid()
  randomize()
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

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
})

function update() {
  frames += 1
  if (frames % SPEED === 0) step()
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
