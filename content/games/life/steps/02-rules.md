---
title: Four rules
title_tr: Dört kural
skills: [prog.loops, game.state]
---

# --explanation--

Each generation, every cell looks at its **8 neighbours** (sides and corners) and counts how many are alive. Then:

- a live cell with **fewer than 2** live neighbours dies, of loneliness;
- a live cell with **2 or 3** survives;
- a live cell with **more than 3** dies, of overcrowding;
- a dead cell with **exactly 3** comes alive.

That fits in one line: the cell is alive next time if it has 3 neighbours, or if it has 2 and is alive now.

```js
next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
```

The important detail is `next`. All cells change **at the same moment**. If we wrote the new values straight into `grid`,
the cells we visit later would count neighbours that have *already* changed, and the patterns would fall apart. So we read
only from `grid`, write only into a new grid, and swap them at the end. This is called **double buffering**, and games use
it for the screen too.

To count the neighbours, two small loops run `dr` and `dc` from `-1` to `1`, skipping `(0, 0)` (the cell itself) and any
neighbour off the board.

# --explanation-tr--

**Bu adımda:** dünyaya kuralları vereceğiz. Oyuna tıklayıp **N** tuşuna her bastığında bir sonraki nesil (generation)
hesaplanacak; desenin değiştiğini ve sol üstte `Generation 1`, `Generation 2`... yazısının arttığını göreceksin.

**Dört kural.** Her hücre çevresindeki **8 komşusuna** (sağ, sol, üst, alt ve dört çapraz) bakar ve kaçının canlı
olduğunu sayar. Sonra:

- canlı hücrenin **2'den az** canlı komşusu varsa yalnızlıktan ölür;
- **2 ya da 3** komşusu varsa yaşamaya devam eder;
- **3'ten fazla** komşusu varsa kalabalıktan ölür;
- ölü hücrenin **tam 3** komşusu varsa canlanır.

Hepsi tek satıra sığar: "3 komşun varsa, ya da 2 komşun var ve şu an canlıysan, bir sonraki nesilde canlısın."

```js
next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
```

Parça parça:

- `===` "eşit mi?" diye **sorar** (tek `=` ise değer koyar, soru sormaz). Cevap doğru (`true`) ya da yanlıştır (`false`).
- `||` "**ya da**", `&&` "**ve**" demektir. Parantez içi önce hesaplanır.
- `? 1 : 0` ilk adımdaki gibi: doğruysa `1`, değilse `0`.

**Neden yeni bir ızgara (`next`)?** Bütün hücreler **aynı anda** değişmeli. Yeni değerleri doğrudan `grid`'e yazsaydık,
sonra bakılan hücreler zaten değişmiş komşuları sayar, desenler bozulurdu. Bu yüzden hep eski `grid`'den okur, yeni
`next`'e yazar, en sonda `grid = next` ile değiştiririz. Buna **çift tamponlama** (double buffering) denir. Sınıfta
herkesin notunu önce kâğıda yazıp sonra tahtaya birden asmak gibi.

**Komşuları saymak.** `countNeighbors(r, c)` fonksiyonu iki **parametre** alır: parantez içindeki `r` ve `c`, fonksiyonu
çağırırken verdiğin satır ve sütun numaralarıdır (`countNeighbors(10, 10)` gibi). İçinde:

- `let count = 0` bir sayaç açar. `count += 1` "sayaca 1 ekle" demektir.
- İki döngü `dr` ve `dc`'yi `-1`'den `1`'e götürür (`<=` "küçük ya da eşit"). Böylece bir üst, aynı ve bir alt satırla bir
  sol, aynı ve bir sağ sütuna bakarız: 3 × 3 = 9 yer.
- `if (dr === 0 && dc === 0) continue` → ortadaki hücre kendisidir; `continue` "bu turu atla, sıradakine geç" demektir.
- `nr >= 0 && nr < ROWS && ...` komşu tahtanın içindeyse sayarız. Hücre `1` ya da `0` olduğu için doğrudan ekleriz.
- `return count` → fonksiyon işi bitince bu sayıyı **geri verir**. `const n = countNeighbors(r, c)` o sayıyı `n`'ye koyar.

**Tuşu dinlemek (olay, event).** Tarayıcı, bir tuşa basıldığında `keydown` adında bir **olay** yayar.
`document.addEventListener('keydown', (event) => { ... })` "tuşa her basıldığında `{ }` içini çalıştır" demektir.
`event.key` basılan tuştur (`'n'` ya da `'N'`); `.toLowerCase()` onu küçük harfe çevirir, böylece ikisini birden yakalarız.

**Yazı çizmek.** `ctx.font` yazı tipini, `ctx.textAlign = 'left'` hizayı seçer; `ctx.fillText(yazı, x, y)` yazıyı boyar.
`'Generation ' + generation` bir yazıyla bir sayıyı yan yana ekler: `'Generation 4'`.

# --task--

1. Write `countNeighbors(r, c)`: the number of live cells among the 8 around `(r, c)`, skipping those off the board.
2. Add `generation` (`0` in `randomize()`). Write `step()`: build `next` with the rule above from an `emptyGrid()`, then set
   `grid = next` and add 1 to `generation`.
3. The N key calls `step()` (either case).
4. Draw `Generation 4` at `(8, 24)`: white, `'bold 16px sans-serif'`, left-aligned.

# --task-tr--

1. `let grid // grid[row][col]: 1 alive, 0 dead` satırının hemen altına nesil sayacını ekle:

   ```js
   let generation
   ```

2. `randomize()` fonksiyonunda sayacı sıfırla. Fonksiyon şöyle olmalı:

   ```js
   function randomize() {
     grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
     generation = 0 // ← yeni
   }
   ```

3. `reset()` fonksiyonunun kapanış `}`'sinin altına bir satır boşluk bırakıp komşu sayan fonksiyonu yaz:

   ```js
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
   ```

4. Hemen altına bir nesil ilerleten `step()` fonksiyonunu yaz:

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
     generation += 1
   }
   ```

5. Altına N tuşunu dinleyen kodu ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key.toLowerCase() === 'n') step()
   })
   ```

6. `draw()` fonksiyonunun en sonuna, iki döngünün kapanışından sonra ve fonksiyonun son `}`'sinden önce nesil yazısını
   ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Generation ' + generation, 8, 24)
   }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra **N**'ye birkaç kez bas: desen değişmeli, `Generation`
   sayısı artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Planör (glider) kontrolü kırmızıysa, yeni değerleri
   `grid`'e değil `next`'e yazdığından emin ol.

# --tests--

`countNeighbors` should count the live cells around a cell, but not the cell itself.
tr: `countNeighbors` bir hücrenin çevresindeki canlı hücreleri saymalı, ama hücrenin kendisini değil.

```js
grid = emptyGrid()
grid[10][10] = grid[10][11] = grid[11][10] = 1
assert.strictEqual(countNeighbors(10, 10), 2, 'a cell does not count itself')
assert.strictEqual(countNeighbors(11, 11), 3)
assert.strictEqual(countNeighbors(12, 12), 0)
assert.strictEqual(countNeighbors(9, 9), 1)
```

A blinker should flip back and forth, a block should stay, and a lonely cell should die.
tr: Bir yanıp sönen ileri geri dönmeli, bir blok kalmalı ve yalnız bir hücre ölmeli.

```js
grid = emptyGrid()
grid[5][4] = grid[5][5] = grid[5][6] = 1 // a blinker
grid[20][20] = grid[20][21] = grid[21][20] = grid[21][21] = 1 // a block
grid[30][30] = 1 // alone
$.press('n')
assert.strictEqual(generation, 1)
assert.deepEqual([grid[4][5], grid[5][5], grid[6][5], grid[5][4], grid[5][6]], [1, 1, 1, 0, 0], 'the blinker turns upright')
assert.deepEqual([grid[20][20], grid[20][21], grid[21][20], grid[21][21]], [1, 1, 1, 1], 'the block stays')
assert.strictEqual(grid[30][30], 0, 'a lonely cell dies')
$.press('N')
assert.deepEqual([grid[5][4], grid[5][5], grid[5][6], grid[4][5]], [1, 1, 1, 0], 'and back')
assert.strictEqual(grid.flat().filter((cell) => cell).length, 7)
```

A glider should move one cell diagonally every four generations, which only works if all cells change together.
tr: Bir planör her dört nesilde bir hücre çapraz ilerlemeli; bu yalnızca bütün hücreler birlikte değişirse işler.

```js
grid = emptyGrid()
for (const [r, c] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) grid[r][c] = 1 // a glider
for (let i = 0; i < 4; i++) step()
const cells = []
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) cells.push(r + ',' + c)
assert.sameMembers(cells, ['2,3', '3,4', '4,2', '4,3', '4,4'], 'the glider moved one cell down and right: every cell must change at the same time')
$.tick(1)
assert.include($.texts(), 'Generation 4')
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
let generation

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
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
  generation += 1
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
