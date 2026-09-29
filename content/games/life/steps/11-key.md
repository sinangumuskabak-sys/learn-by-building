---
title: Next generation with N
title_tr: N ile sonraki nesil
skills: [game.input]
---

# --goal--

Now we see the rules at work: each press of the N key calls `step()` once, and the loop shows the new generation.

# --goal-tr--

Kuralları iş başında görme zamanı! **N** tuşuna her basışta `step()` bir kez çalışacak ve döngü yeni nesli ekrana
çizecek.

Tarayıcıya "bir tuşa basılınca bana haber ver" deriz. Buna **olay dinlemek** (event listener) denir: kapı zili gibi,
çalınca ne yapılacağını önceden söylersin.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the arrow function every time a key goes down.
- `event.key` is the key, like `'n'` or `'N'`; `.toLowerCase()` makes it small, so both work.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** (keydown) süslü
  parantez içini çalıştır". `(event) => { }` adı olmayan kısa bir fonksiyon; `event` basılan tuşun bilgilerini taşır.
- `event.key` → basılan tuş: `'n'`, ya da Caps Lock açıksa `'N'`.
- `.toLowerCase()` → yazıyı küçük harfe çevirir. Böylece `n` de `N` de aynı işi yapar.
- `if (... === 'n') step()` → **eğer** basılan N ise bir nesil ilerle.

# --task--

Write the listener above `function draw() {`, with an empty line after it. Run, click the game, press N a few times.

# --task-tr--

1. `function draw() {` satırının **üstüne** dinleyiciyi yaz; altında bir boş satır kalsın.
2. **Çalıştır**, sonra oyuna bir kez tıkla (klavye oyuna gitsin) ve **N**'ye birkaç kez bas.

# --predict--

What happens to the random soup at the first N?
- [x] Many cells die at once, and small groups remain
  In a random soup most cells have too few or too many neighbours.
- [ ] Almost nothing changes
- [ ] The whole grid fills up

# --predict-tr--

İlk N'de rastgele çorbaya ne olur?
- [x] Birçok hücre birden ölür, küçük gruplar kalır
  Rastgele çorbada çoğu hücrenin komşusu ya çok az ya çok fazladır.
- [ ] Neredeyse hiçbir şey değişmez
- [ ] Bütün ızgara dolar

# --hint--

If nothing happens, click on the game first so it receives the keys, and check that `'keydown'` is all lowercase.

# --hint-tr--

Bir şey olmuyorsa önce oyuna tıkla ki tuşlar oyuna gitsin; `'keydown'` tamamen küçük harfle yazılır.

# --tests--

Each N (small or capital) should advance one generation.
tr: Her N (küçük ya da büyük) bir nesil ilerletmeli.

```js
grid = emptyGrid()
grid[5][4] = grid[5][5] = grid[5][6] = 1 // a blinker
$.press('n')
assert.deepEqual([grid[4][5], grid[5][5], grid[6][5], grid[5][4]], [1, 1, 1, 0])
$.press('N')
assert.deepEqual([grid[5][4], grid[5][5], grid[5][6], grid[4][5]], [1, 1, 1, 0])
```

Other keys should not change the world.
tr: Başka tuşlar dünyayı değiştirmemeli.

```js
const before = grid.flat().join('')
$.press('m')
$.press(' ')
assert.strictEqual(grid.flat().join(''), before)
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

let grid // grid[row][col]: 1 alive, 0 dead

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
}

function reset() {
  grid = emptyGrid()
  randomize()
}

// Live neighbours among the 8 around (r, c), skipping those off the board.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) count += grid[nr][nc]
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
}

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
})

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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
