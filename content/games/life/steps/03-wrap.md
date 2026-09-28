---
title: A world without edges
title_tr: Kenarsız bir dünya
skills: [prog.arrays]
---

# --explanation--

With walls at the edges, a glider that reaches the border crashes into it and turns into a block. Many Life programs avoid
this by making the world **wrap around**: the column after the last one is the first one, and the row above the top is the
bottom. The grid becomes a *torus*, the shape of a doughnut.

The `%` (remainder) operator does the wrapping. `(c + dc) % COLS` turns `60` into `0`. It does not help with `-1`, though:
in JavaScript `-1 % 60` is `-1`. Adding `COLS` first keeps the number positive, and the `%` then removes it again when it was
not needed:

```js
grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
```

A good test for a torus: a glider keeps moving forever. It travels one cell diagonally every 4 generations, and on a
48 by 60 world it comes back to exactly where it started after 4 × 240 = 960 generations (240 is the smallest number both
48 and 60 divide).

We also count the living. `reduce` adds up a row, and a second `reduce` adds up the rows.

# --explanation-tr--

**Bu adımda:** dünyanın kenarlarını kaldıracağız: sağ kenardan çıkan desen soldan, alttan çıkan üstten geri gelecek.
Ayrıca sağ üstte kaç canlı hücre olduğunu gösteren `Alive 123` gibi bir yazı göreceksin.

**Neden?** Şu an kenarlar duvar gibi. Kayarak ilerleyen bir planör (glider) kenara çarpınca bozulup kareye döner.
Birçok Hayat Oyunu programı dünyayı **başa saran** (wrap around) yapar: son sütunun sağı ilk sütundur, en üst satırın
üstü en alt satırdır. Eski video oyunlarında ekranın sağından çıkıp solundan giren karakter gibi. Böyle bir dünyanın
şekli simittir (torus).

**Kalan işareti `%`.** `a % b`, `a`'yı `b`'ye böldüğünde **kalanı** verir: `7 % 3` = 1, `60 % 60` = 0, `5 % 60` = 5.
Bu tam istediğimiz şey: sütun 60 olursa (tahtanın dışı) `60 % 60` ile 0'a, yani en sola döner.

Bir sorun var: sola taşınca sütun `-1` olur ve JavaScript'te `-1 % 60` yine `-1`'dir. Çözüm, önce `COLS` eklemek:
`(-1 + 60) % 60` = 59, yani en sağ sütun. Gerek yoksa da zarar vermez: `(5 + 60) % 60` = 5.

```js
grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
```

Artık komşunun tahtanın içinde olup olmadığını sormamıza gerek yok; her komşu bir yere denk gelir.

Güzel bir deneme: 48 × 60'lık bu dünyada bir planör her 4 nesilde bir kare çapraz kayar ve 960 nesil sonra tam başladığı
yere döner.

**Canlıları saymak (`reduce`).** `reduce` bir listeyi tek bir değere indirir; burada hepsini toplar:

```js
[1, 0, 1].reduce((a, b) => a + b, 0) // 2
```

"`0`'dan başla; her elemanı (`b`) o ana kadarki toplama (`a`) ekle." Izgarada iki kat yaparız: içteki `reduce` bir
satırı toplar, dıştaki `reduce` satırların toplamlarını toplar. Sonuç canlı hücre sayısıdır.

**Sağa hizalı yazı.** `ctx.textAlign = 'right'` yazının **sağ ucunu** verdiğin `x`'e koyar. `canvas.width - 8` sağ
kenardan 8 piksel içeri demektir, böylece yazı ne kadar uzarsa uzasın kenardan taşmaz.

# --task--

1. Make `countNeighbors` wrap around the edges instead of skipping cells off the board.
2. Write `population()`: the number of live cells.
3. Draw `Alive 123` right-aligned at `(canvas.width - 8, 24)`.

# --task-tr--

1. `countNeighbors` fonksiyonunda komşuyu tahtada mı diye soran üç satırı (`const nr = ...`, `const nc = ...` ve
   `if (nr >= 0 ...`) sil, yerine başa saran tek satırı yaz. Üstündeki yorumu da güncelle. Fonksiyon şöyle olmalı:

   ```js
   // Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
   function countNeighbors(r, c) {
     let count = 0
     for (let dr = -1; dr <= 1; dr++) {
       for (let dc = -1; dc <= 1; dc++) {
         if (dr === 0 && dc === 0) continue
         count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS] // ← değişti
       }
     }
     return count
   }
   ```

2. `step()` fonksiyonunun kapanış `}`'sinin altına canlı hücreleri sayan fonksiyonu ekle:

   ```js
   const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)
   ```

3. `draw()`'un en sonunda, `ctx.fillText('Generation ' + generation, 8, 24)` satırının altına (fonksiyonun son `}`'sinden
   önce) iki satır ekle:

   ```js
     ctx.fillText('Generation ' + generation, 8, 24)
     ctx.textAlign = 'right'                                   // ← yeni
     ctx.fillText('Alive ' + population(), canvas.width - 8, 24) // ← yeni
   }
   ```

4. **Çalıştır**'a bas. Sağ üstte `Alive` ve bir sayı görmelisin; oyuna tıklayıp **N**'ye bastıkça kenara gelen desenler
   karşı taraftan devam etmeli. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Cells on opposite edges should be neighbours.
tr: Karşı kenarlardaki hücreler komşu olmalı.

```js
grid = emptyGrid()
grid[47][59] = grid[0][59] = grid[47][0] = 1
assert.strictEqual(countNeighbors(0, 0), 3, 'the corners touch across the edges')
grid = emptyGrid()
grid[20][59] = 1
assert.strictEqual(countNeighbors(20, 0), 1)
assert.strictEqual(countNeighbors(20, 58), 1)
```

A glider should travel around the world and come back to where it started after 960 generations.
tr: Bir planör dünyanın çevresini dolaşmalı ve 960 nesil sonra başladığı yere dönmeli.

```js
grid = emptyGrid()
for (const [r, c] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) grid[r][c] = 1
const start = grid.flat().join('')
for (let i = 0; i < 960; i++) {
  step()
  if (i % 97 === 0) assert.strictEqual(population(), 5)
}
assert.strictEqual(grid.flat().join(''), start, 'after 960 generations the glider has gone around the world and is back')
```

The number of live cells should be drawn.
tr: Canlı hücre sayısı çizilmeli.

```js
grid = emptyGrid()
grid[0][0] = grid[1][1] = 1
$.tick(1)
assert.include($.texts(), 'Alive 2')
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
