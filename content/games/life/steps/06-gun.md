---
title: Buttons and a glider gun
title_tr: Düğmeler ve bir planör topu
skills: [game.input, prog.arrays]
---

# --explanation--

Famous patterns are shared as **text**: one line per row, `O` for a live cell, `.` for a dead one. Our `stamp(pattern, row,
col)` copies such a picture onto the grid, wrapping at the edges like everything else in this world.

The most famous of them all is the **Gosper glider gun**, found by Bill Gosper in 1970. Conway had offered a prize for a
pattern that grows forever, and this was the answer: 36 cells that bounce back and forth and fire a new glider every
30 generations. Its population never stops growing, at least until the gliders wrap around and crash into the gun.

On a phone there are no keys, so the game gets a row of buttons: Play, Step, Random, Clear and Gun. They call the same
`press` as the keyboard, so there is still only one place that decides what "Play" does. While the world runs, the Play
button reads **Pause**.

# --explanation-tr--

**Bu adımda:** ünlü **planör topunu** (glider gun) ekleyeceğiz ve ekranın altına beş düğme koyacağız: Play, Step, Random,
Clear, Gun. **Gun**'a basınca sağda sürekli yeni planörler fırlatan bir makine göreceksin.

**Desenler yazı olarak paylaşılır.** Her satır bir yazıdır: `O` canlı hücre, `.` ölü hücre. Bir desen de bu yazılardan
oluşan bir listedir:

```js
['.O.',
 '..O',
 'OOO']   // bir planör
```

**Yazının harflerine bakmak.** Bir yazı da bir liste gibi davranır: `'.O.'[1]` → `'O'` (sayma 0'dan başlar),
`'.O.'.length` → 3 (kaç harf olduğu).

**`stamp(pattern, row, col)`** deseni ızgaraya "damga gibi basar"; desenin sol üst köşesi `(row, col)`'a gelir.

```js
pattern.forEach((line, r) => { ... })
```

`forEach` listenin **her elemanı için** `{ }` içini çalıştırır. `line` o anki satır yazısı, `r` onun sırası (0, 1, 2...).
İçerideki `for` döngüsü satırın her harfine bakar; harf `'O'` ise `(row + r, col + c)` hücresini `1` yapar. Dünya başa
sardığı için (3. adım) burada da `% ROWS` ve `% COLS` kullanırız.

**Gosper'ın planör topu.** Conway, sonsuza kadar büyüyen bir desen bulana ödül vermişti. Bill Gosper 1970'te buldu:
36 hücre, ileri geri gidip her 30 nesilde bir yeni planör fırlatır.

**Ekran düğmeleri.** Telefonda klavye yok, bu yüzden düğmeler gerekiyor. Beş düğmenin adı bir listede durur:
`BUTTONS`. Canvas 480 piksel geniş, 5 düğme var: her birine `BUTTON_W = 480 / 5` = 96 piksel düşer.
`BUTTONS.length` listenin eleman sayısıdır (5).

- Çizerken `BUTTONS.forEach((label, i) => ...)` her düğme için `i * BUTTON_W` konumundan başlayan bir kutu çizer. Her
  yandan 4 piksel içeri çekeriz (`+ 4`, `- 8`) ki düğmeler arasında boşluk kalsın.
- `ctx.textAlign = 'center'` yazıyı verdiğin `x`'e **ortalar**; `x` de kutunun ortasıdır: `i * BUTTON_W + BUTTON_W / 2`.
- `label === 'Play' && playing ? 'Pause' : label` → "bu Play düğmesiyse ve dünya çalışıyorsa `Pause` yaz, değilse
  kendi adını".
- Tıklanan nokta `BAR_Y`'nin altındaysa (`point.y >= BAR_Y`) hangi düğme olduğunu `Math.floor(point.x / BUTTON_W)` bulur:
  `x = 150` → `150 / 96` = 1.56 → 1 → `BUTTONS[1]` = `'Step'`. Sonra klavyeyle aynı `press` çağrılır. Böylece "Play ne
  yapar?" sorusunun cevabı hâlâ tek bir yerde durur.

# --task--

1. Add the `GUN` pattern (below the constants) and write `stamp(pattern, row, col)`: every `'O'` at line `r`, character `c`
   sets the cell `(row + r, col + c)`, wrapped with `%`.
2. `press('Gun')` clears the world and stamps `GUN` at `(4, 4)`; the G key presses it.
3. Add `BAR_Y = TOP + ROWS * CELL + 12`, `BUTTONS = ['Play', 'Step', 'Random', 'Clear', 'Gun']` and
   `BUTTON_W = canvas.width / BUTTONS.length`. Draw each button as a `'#334155'` rectangle 4 pixels in from its sides,
   36 high, with its label in white (`'Pause'` instead of `'Play'` while playing).
4. A `pointerdown` at or below `BAR_Y` presses the button under it.

```js
const GUN = [
  '........................O...........',
  '......................O.O...........',
  '............OO......OO............OO',
  '...........O...O....OO............OO',
  'OO........O.....O...OO..............',
  'OO........O...O.OO....O.O...........',
  '..........O.....O.......O...........',
  '...........O...O....................',
  '............OO......................',
]
```

# --task-tr--

1. `const TOP = 36` satırının altına düğme sabitlerini ekle:

   ```js
   const BAR_Y = TOP + ROWS * CELL + 12 // the row of buttons
   const BUTTONS = ['Play', 'Step', 'Random', 'Clear', 'Gun']
   const BUTTON_W = canvas.width / BUTTONS.length
   ```

2. `const SPEED = 6 ...` satırının altına bir satır boşluk bırakıp deseni ekle (harfleri tek tek yazmak yerine buradan
   kopyalayabilirsin):

   ```js
   // Patterns drawn as text: O is a live cell.
   const GUN = [
     '........................O...........',
     '......................O.O...........',
     '............OO......OO............OO',
     '...........O...O....OO............OO',
     'OO........O.....O...OO..............',
     'OO........O...O.OO....O.O...........',
     '..........O.....O.......O...........',
     '...........O...O....................',
     '............OO......................',
   ]
   ```

3. `clear()` fonksiyonunun kapanış `}`'sinin altına `stamp`'i yaz:

   ```js
   // Copy a text pattern onto the grid with its top left corner at (row, col).
   function stamp(pattern, row, col) {
     pattern.forEach((line, r) => {
       for (let c = 0; c < line.length; c++) if (line[c] === 'O') grid[(row + r) % ROWS][(col + c) % COLS] = 1
     })
   }
   ```

4. `press()` fonksiyonunun sonuna Gun düğmesini ekle:

   ```js
     } else if (button === 'Random') randomize()
     else if (button === 'Clear') clear()
     else if (button === 'Gun') { // ← yeni
       clear()                    // ← yeni
       stamp(GUN, 4, 4)           // ← yeni
     }                            // ← yeni
   }
   ```

5. `keydown` tablosuna G'yi ekle:

   ```js
     const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear', g: 'Gun' } // ← değişti
   ```

6. `pointerdown` dinleyicisinin başını değiştir: önce nokta düğme sırasında mı diye bak. Dinleyici şöyle olmalı:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     const point = toCanvas(event)                      // ← yeni
     if (point.y >= BAR_Y) {                            // ← yeni
       press(BUTTONS[Math.floor(point.x / BUTTON_W)])   // ← yeni
       return                                           // ← yeni
     }                                                  // ← yeni
     const cell = cellAt(point)                         // ← değişti
     if (!cell) return
     painting = grid[cell.r][cell.c] ? 0 : 1
     grid[cell.r][cell.c] = painting
   })
   ```

7. `draw()` içinde, hücreleri çizen iki döngünün kapanışından sonra ve `ctx.fillStyle = 'white'` satırından önce düğmeleri
   çiz:

   ```js
     BUTTONS.forEach((label, i) => {
       ctx.fillStyle = '#334155'
       ctx.fillRect(i * BUTTON_W + 4, BAR_Y, BUTTON_W - 8, 36)
       ctx.fillStyle = 'white'
       ctx.font = 'bold 16px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText(label === 'Play' && playing ? 'Pause' : label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 24)
     })
   ```

8. **Çalıştır**'a bas. Altta beş düğme görmelisin. **Gun**'a, sonra **Play**'e bas: topun sağ alta doğru planörler
   fırlattığını görmelisin ve Play düğmesi **Pause** yazmalı. Alttaki kontrollerin hepsi yeşil olmalı. Gun kontrolü
   kırmızıysa desen satırlarını buradan yeniden kopyala: tek bir nokta eksiği deseni bozar.

# --tests--

`stamp` should copy a text pattern onto the grid, wrapping at the edges.
tr: `stamp` bir metin desenini ızgaraya kopyalamalı ve kenarlarda başa sarmalı.

```js
grid = emptyGrid()
stamp(['.O.', '..O', 'OOO'], 10, 20)
assert.deepEqual([grid[10][21], grid[11][22], grid[12][20], grid[12][21], grid[12][22]], [1, 1, 1, 1, 1])
assert.strictEqual(population(), 5)
stamp(['OO'], 47, 59)
assert.strictEqual(grid[47][59] + grid[47][0], 2, 'patterns wrap around too')
```

The glider gun should fire its first glider within 30 generations and keep growing.
tr: Planör topu ilk planörünü 30 nesil içinde fırlatmalı ve büyümeye devam etmeli.

```js
$.press('g')
assert.strictEqual(population(), 36)
assert.strictEqual(generation, 0)
for (let i = 0; i < 30; i++) step()
assert.strictEqual(population(), 41, 'the gun has fired its first glider')
for (let i = 0; i < 90; i++) step()
assert.isAbove(population(), 50, 'and keeps firing')
```

The five buttons should be drawn and do the same as the keys.
tr: Beş düğme çizilmeli ve tuşlarla aynı işi yapmalı.

```js
$.tick(1)
const labels = $.texts()
for (const label of ['Play', 'Step', 'Random', 'Clear', 'Gun']) assert.include(labels, label)
$.click(48, 450)
assert.isTrue(playing)
$.tick(1)
assert.include($.texts(), 'Pause')
$.click(96 + 48, 450)
assert.isFalse(playing)
assert.strictEqual(generation, 1)
$.click(96 * 3 + 48, 450)
assert.strictEqual(population(), 0)
$.click(96 * 4 + 48, 450)
assert.strictEqual(population(), 36)
$.click(96 * 2 + 48, 450)
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
const BAR_Y = TOP + ROWS * CELL + 12 // the row of buttons
const BUTTONS = ['Play', 'Step', 'Random', 'Clear', 'Gun']
const BUTTON_W = canvas.width / BUTTONS.length
const SPEED = 6 // frames per generation while playing

// Patterns drawn as text: O is a live cell.
const GUN = [
  '........................O...........',
  '......................O.O...........',
  '............OO......OO............OO',
  '...........O...O....OO............OO',
  'OO........O.....O...OO..............',
  'OO........O...O.OO....O.O...........',
  '..........O.....O.......O...........',
  '...........O...O....................',
  '............OO......................',
]

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

// Copy a text pattern onto the grid with its top left corner at (row, col).
function stamp(pattern, row, col) {
  pattern.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) if (line[c] === 'O') grid[(row + r) % ROWS][(col + c) % COLS] = 1
  })
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
  else if (button === 'Gun') {
    clear()
    stamp(GUN, 4, 4)
  }
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear', g: 'Gun' }
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
  const point = toCanvas(event)
  if (point.y >= BAR_Y) {
    press(BUTTONS[Math.floor(point.x / BUTTON_W)])
    return
  }
  const cell = cellAt(point)
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

  BUTTONS.forEach((label, i) => {
    ctx.fillStyle = '#334155'
    ctx.fillRect(i * BUTTON_W + 4, BAR_Y, BUTTON_W - 8, 36)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label === 'Play' && playing ? 'Pause' : label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 24)
  })

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
