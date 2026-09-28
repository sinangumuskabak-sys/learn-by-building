---
title: Mines and neighbour counts
title_tr: Mayınlar ve komşu sayıları
skills: [prog.loops, prog.arrays]
---

# --explanation--

Almost every question in Minesweeper is about a cell's **neighbours**: the up to eight cells around it. Get them with
two small loops over the offsets `-1, 0, 1`, skipping `(0, 0)` (the cell itself) and anything off the board:

```js
for (let dr = -1; dr <= 1; dr++) {
  for (let dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue
    const row = cell.row + dr
    const col = cell.col + dc
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
  }
}
```

The bounds check is what makes corner cells have 3 neighbours and edge cells 5. Forgetting it is the classic grid bug:
reading `grid[-1]` gives `undefined`, and the next line crashes.

Now the mines. A player hates losing on the very first click, so the real game places mines **after** it, and never on
the clicked cell or next to it. That way the first click always opens an area. `placeMines(safe)` does exactly that:
take every cell except the safe ones, shuffle them (Fisher–Yates), and put mines on the first ten. Then each cell counts
its mine neighbours once, up front, so the numbers never have to be recomputed.

# --explanation-tr--

**Bu adımda:** tahtaya 10 mayın gizleyeceğiz ve her hücrenin çevresinde kaç mayın olduğunu sayacağız. Ekranda henüz
bir şey değişmeyecek (mayınlar gizli); işin doğru yapıldığını alttaki kontroller söyleyecek.

**Hücreye yeni bilgiler.** Her hücre nesnesine üç alan ekliyoruz: `mine: false` (altında mayın yok),
`count: 0` (çevresinde 0 mayın), `revealed: false` (henüz açılmadı). `true` "evet", `false` "hayır" demektir; bu
iki değere **mantıksal değer** (boolean) denir.

**Komşular.** Mayın Tarlası'ndaki hemen her soru bir hücrenin **komşularıyla** ilgilidir: çevresindeki en fazla 8
hücre. Bir hücrenin satırına ve sütununa -1, 0 veya +1 ekleyerek onları buluruz:

```js
for (let dr = -1; dr <= 1; dr++) {
  ...
}
```

Bu, sayarak dönen bir **`for` döngüsüdür**. Üç parçası noktalı virgülle ayrılır:

- `let dr = -1` → sayaç -1'den başlar (`dr` "satır farkı" demek).
- `dr <= 1` → sayaç 1'den küçük ya da eşit olduğu sürece devam et.
- `dr++` → her turun sonunda sayacı 1 artır.

Yani süslü parantezin içi `dr` = -1, 0, 1 için üç kez çalışır. İçine aynısını sütun farkı `dc` için koyunca
3 × 3 = 9 kombinasyon elde ederiz. Bunlardan biri `(0, 0)`, yani hücrenin kendisi; onu atlarız:

```js
if (dr === 0 && dc === 0) continue
```

- `if (...)` → "parantezin içi doğruysa şunu yap".
- `===` → "eşit mi?" sorusu. (Tek `=` "koy" demektir, üç `===` "karşılaştır".)
- `&&` → "ve": iki koşul da doğru olmalı.
- `continue` → "bu turu burada bırak, döngünün sonraki turuna geç".

Sonra komşunun satırını ve sütununu hesaplarız ve **tahtanın içindeyse** listeye ekleriz:

```js
if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
```

`>=` "büyük ya da eşit", `<` "küçük". `list.push(...)` diziye sona bir eleman ekler. Bu sınır kontrolü sayesinde
köşedeki hücrenin 3, kenardakinin 5 komşusu olur. Unutulursa `grid[-1]` gibi var olmayan bir satır okunur,
sonuç `undefined` (tanımsız) olur ve program çöker. Fonksiyonun sonundaki `return list` bulduğu listeyi
**geri verir**: `neighbors(hucre)` yazan yere bu liste gelir.

**Mayınları ne zaman koyarız?** Kimse ilk tıklamada patlamayı sevmez. Gerçek oyun mayınları ilk tıklamadan **sonra**
koyar, tıklanan hücreye ve komşularına asla koymaz. `placeMines(safe)` tam bunu yapar (`safe` = güvenli hücre):

- `new Set([safe, ...neighbors(safe)])` → yasak hücrelerin kümesi. **Set** (küme) "içinde var mı?" sorusuna hızlı
  cevap veren bir koleksiyondur: `forbidden.has(cell)`. `...` (yayma) bir listenin elemanlarını tek tek buraya dök
  demektir; yani küme = güvenli hücre + komşuları.
- `grid.flat().filter((cell) => !forbidden.has(cell))` → **`filter`** listeden yalnız koşulu sağlayanları tutar.
  `!` "değil" demektir: yasak **olmayan** hücreler aday olur.
- Sonraki döngü adayları **karıştırır** (Fisher–Yates yöntemi): sondan başa gelir, her hücreyi rastgele seçilen bir
  hücreyle yer değiştirir. `Math.random()` 0 ile 1 arasında rastgele bir ondalık sayı verir; `(i + 1)` ile çarpıp
  `Math.floor` ile aşağı yuvarlayınca 0 ile `i` arasında rastgele bir tam sayı olur. `[a, b] = [b, a]` iki elemanın
  yerini değiştirir. Satırın başındaki `;` bir önceki satırla karışmasın diye oradadır.
- `candidates.slice(0, MINES)` → karışık listenin ilk 10 elemanı. Onlara `cell.mine = true` deriz.
- Son satır her hücrenin komşularından mayınlı olanları süzer ve **sayısını** (`.length`, dizinin uzunluğu)
  `count`'a yazar. Sayılar böylece bir kez hesaplanır, oyun boyunca hazır durur.

# --task--

1. Add `MINES = 10`, and give every cell `mine: false, count: 0, revealed: false`.
2. Write `function neighbors(cell)` returning the up to 8 cells around `cell`.
3. Write `function placeMines(safe)`: leave out `safe` and its neighbours, shuffle the other cells, set `mine = true`
   on the first `MINES` of them, then set every cell's `count` to the number of its neighbours that are mines.

# --task-tr--

1. `const TOP = 40` satırının altına mayın sayısını ekle:

   ```js
   const MINES = 10
   ```

2. `newGame()` fonksiyonunun içinde hücreyi üreten satıra üç yeni alan ekle. Fonksiyon şöyle olmalı:

   ```js
   function newGame() {
     grid = Array.from({ length: SIZE }, (_, row) =>
       Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })), // ← değişti
     )
   }
   ```

3. `newGame()` fonksiyonunun kapanış `}`'sinin altına, bir satır boşlukla komşuları bulan fonksiyonu yaz:

   ```js
   // The up to 8 cells around a cell, skipping the ones that would be off the board.
   function neighbors(cell) {
     const list = []
     for (let dr = -1; dr <= 1; dr++) {
       for (let dc = -1; dc <= 1; dc++) {
         if (dr === 0 && dc === 0) continue
         const row = cell.row + dr
         const col = cell.col + dc
         if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
       }
     }
     return list
   }
   ```

   `const list = []` boş bir dizi açar; komşular içine eklenir.

4. Onun altına, `function draw()` satırından önce, mayınları yerleştiren fonksiyonu yaz:

   ```js
   // Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
   function placeMines(safe) {
     const forbidden = new Set([safe, ...neighbors(safe)])
     const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
     for (let i = candidates.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1))
       ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
     }
     for (const cell of candidates.slice(0, MINES)) cell.mine = true
     for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
   }
   ```

   `i--` sayacı her turda 1 azaltır. Bu fonksiyonu henüz kimse çağırmıyor; ilk tıklamayı sonraki adımda ekleyeceğiz.

5. **Çalıştır**'a bas. Tahta aynı görünecek (mayınlar gizli), ama alttaki kontrollerin hepsi yeşil olmalı. Komşu
   kontrolü kırmızıysa sınır satırındaki `<` ve `>=` işaretlerine bak.

# --tests--

Corner, edge and middle cells should have 3, 5 and 8 neighbours.
tr: Köşe, kenar ve ortadaki hücrelerin 3, 5 ve 8 komşusu olmalı.

```js
assert.lengthOf(neighbors(grid[0][0]), 3)
assert.lengthOf(neighbors(grid[0][4]), 5)
assert.lengthOf(neighbors(grid[4][4]), 8)
assert.sameMembers(neighbors(grid[0][0]), [grid[0][1], grid[1][0], grid[1][1]])
assert.notInclude(neighbors(grid[4][4]), grid[4][4])
```

There should be exactly 10 mines, never on or next to the safe cell.
tr: Tam 10 mayın olmalı; asla güvenli hücrenin üstünde ya da yanında değil.

```js
for (let i = 0; i < 50; i++) {
  newGame()
  const safe = grid[i % 9][(i * 4) % 9]
  placeMines(safe)
  assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
  assert.isFalse(safe.mine)
  assert.isTrue(neighbors(safe).every((c) => !c.mine))
}
```

Every cell should count the mines around it.
tr: Her hücre çevresindeki mayınları saymalı.

```js
placeMines(grid[8][8])
for (const cell of grid.flat()) {
  assert.strictEqual(cell.count, neighbors(cell).filter((n) => n.mine).length)
}
assert.strictEqual(grid[8][8].count, 0)
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer
const MINES = 10

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
  )
}

// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}

// Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
function placeMines(safe) {
  const forbidden = new Set([safe, ...neighbors(safe)])
  const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
  for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
}

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#94a3b8'
  for (const cell of grid.flat()) {
    ctx.fillRect(cell.col * CELL + 1, TOP + cell.row * CELL + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
