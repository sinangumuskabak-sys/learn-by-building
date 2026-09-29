---
title: Four rules
title_tr: Dört kural
skills: [game.state, prog.loops]
---

# --goal--

One generation: every cell counts its neighbours and follows the rules. The new values go into a new grid, `next`,
because all cells must change at the same moment.

# --goal-tr--

Şimdi kurallar. Her **nesilde** (generation) her hücre komşularını sayar ve:

- canlı hücrenin **2'den az** canlı komşusu varsa **yalnızlıktan** ölür;
- **2 ya da 3** komşusu varsa **yaşamaya** devam eder;
- **3'ten fazla** komşusu varsa **kalabalıktan** ölür;
- ölü hücrenin **tam 3** komşusu varsa **doğar**.

Önemli bir ayrıntı: bütün hücreler **aynı anda** değişmeli. Yeni değerleri hemen `grid`'e yazsaydık, sonra bakılan
hücreler zaten değişmiş komşuları sayardı. Bu yüzden eski `grid`'den okuyup yeni bir ızgaraya (`next`) yazıyoruz,
en sonda da ikisini değiştiriyoruz. Buna **çift tamponlama** (double buffering) denir: sınıfta herkesin notunu önce
kâğıda yazıp sonra tahtaya birden asmak gibi.

# --code--

```js
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
```

# --meaning--

- `next` starts empty; the loops fill it cell by cell, reading only from `grid`.
- The four rules fit in one line: alive next time with 3 neighbours, or with 2 if alive now.
- `||` means "or", `&&` "and". At the end `grid = next` makes the new generation the world.

# --meaning-tr--

- `const next = emptyGrid()` → bir sonraki nesil için **boş bir ızgara**.
- İki döngü yine her hücreyi gezer; `const n = countNeighbors(r, c)` → o hücrenin canlı komşu sayısı.
- `next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0` → dört kural tek satırda:
  - `n === 3` → 3 komşu varsa, hücre ölü de olsa canlı da olsa, gelecek nesilde **canlı**.
  - `||` "**ya da**" demektir.
  - `(n === 2 && grid[r][c] === 1)` → 2 komşusu var **ve** şu an canlıysa **yaşamaya devam** eder.
  - Başka her durumda `0`: ölür ya da ölü kalır.
- Dikkat: okumayı hep `grid`'den, yazmayı hep `next`'e yapıyoruz.
- `grid = next` → döngüler bitince yeni nesil dünyanın kendisi olur.

# --task--

Write `step` under `countNeighbors`, after an empty line.

# --task-tr--

`countNeighbors` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve iki yorum satırıyla birlikte `step`
fonksiyonunu yaz. **Çalıştır**.

# --predict--

Will the cells on screen change after Run?
- [ ] Yes, the soup starts to live
- [x] No, nothing calls `step()` yet
  Writing a recipe is not cooking it. We call `step` soon.

# --predict-tr--

Çalıştır'a basınca ekrandaki hücreler değişecek mi?
- [ ] Evet, çorba canlanmaya başlar
- [x] Hayır, `step()`'i henüz kimse çağırmıyor
  Tarifi yazmak yemeği pişirmek değil. `step`'i birazdan çağıracağız.

# --hint--

If the glider check fails but the others pass, you are writing into `grid` instead of `next` somewhere.

# --hint-tr--

Planör kontrolü kırmızı ama diğerleri yeşilse, bir yerde `next` yerine `grid`'e yazıyorsun.

# --try--

Change `next[r][c] =` to `grid[r][c] =` and run: the glider check turns red, because cells now see neighbours that
already changed. Put `next` back.

# --try-tr--

`next[r][c] =` yerine `grid[r][c] =` yaz ve çalıştır: planör kontrolü kırmızıya döner, çünkü hücreler artık zaten
değişmiş komşuları görüyor. Sonra `next`'e geri al.

# --tests--

A blinker should turn upright, a block should stay, and a lonely cell should die.
tr: Bir yanıp sönen dikleşmeli, bir blok yerinde kalmalı ve yalnız bir hücre ölmeli.

```js
grid = emptyGrid()
grid[5][4] = grid[5][5] = grid[5][6] = 1 // a blinker
grid[20][20] = grid[20][21] = grid[21][20] = grid[21][21] = 1 // a block
grid[30][30] = 1 // alone
step()
assert.deepEqual([grid[4][5], grid[5][5], grid[6][5], grid[5][4], grid[5][6]], [1, 1, 1, 0, 0], 'the blinker turns upright')
assert.deepEqual([grid[20][20], grid[20][21], grid[21][20], grid[21][21]], [1, 1, 1, 1], 'the block stays')
assert.strictEqual(grid[30][30], 0, 'a lonely cell dies')
step()
assert.deepEqual([grid[5][4], grid[5][5], grid[5][6], grid[4][5]], [1, 1, 1, 0], 'and back')
```

A glider should move one cell diagonally every four generations, which only works if all cells change together.
tr: Bir planör her dört nesilde bir hücre çapraz ilerlemeli; bu yalnızca bütün hücreler birlikte değişirse işler.

```js
grid = emptyGrid()
for (const [r, c] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) grid[r][c] = 1 // a glider
for (let i = 0; i < 4; i++) step()
const cells = []
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) cells.push(r + ',' + c)
assert.sameMembers(cells, ['2,3', '3,4', '4,2', '4,3', '4,4'], 'every cell must change at the same time')
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

reset()
draw()
```
