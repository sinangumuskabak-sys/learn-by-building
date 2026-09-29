---
title: The world in memory
title_tr: Hafızadaki dünya
skills: [prog.arrays]
---

# --goal--

The picture is not the world; the world is data. Each cell is a number, `1` alive and `0` dead, and the grid is a list
of rows, each row a list of cells: `grid[row][col]`. We make an all-dead grid.

# --goal-tr--

Ekrandaki resim dünyanın kendisi değil, sadece **görüntüsü**. Dünyanın kendisi bilgisayarın hafızasında duran
**sayılar**: her hücre ya `1` (canlı) ya `0` (ölü).

Birden çok şeyi sırayla tutmak için **dizi** (array) kullanırız: bir alışveriş listesi gibi. Izgaramız
**satırlardan oluşan bir liste**; her satır da 60 hücreden oluşan bir liste. Bu yüzden bir hücreye iki numarayla
ulaşırız: `grid[satır][sütun]`. Bu adımda bütün hücreleri ölü olan bir ızgara kuruyoruz. Ekran değişmeyecek.

# --code--

```js
let grid // grid[row][col]: 1 alive, 0 dead

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function reset() {
  grid = emptyGrid()
}

reset()
draw()
```

# --meaning--

- `let grid` makes a variable whose value can change later (`const` cannot). It is empty until `reset` fills it.
- `emptyGrid` is a short arrow function: it returns whatever is right of `=>`.
- `Array(COLS).fill(0)` is one row of 60 zeros. `Array.from({ length: ROWS }, () => ...)` calls the little function
  48 times and makes a list of the 48 results: a **new** row each time.
- `reset()` puts a fresh empty grid in `grid`; it runs once, before the first `draw()`.

# --meaning-tr--

- `let grid` → bir **değişken** açar: adı `grid` olan bir kutu. `const`'tan farkı: `let` ile açılan kutunun içi
  **sonradan değiştirilebilir** (`grid = ...`). Şimdilik boş; içini `reset` dolduracak.
- `// grid[row][col]: ...` → satırın sonundaki **yorum**: kendimize not.
- `const emptyGrid = () => ...` → fonksiyonun kısa yazılışı: "`emptyGrid` adında, `=>` işaretinin sağındakini
  hesaplayıp **geri veren** bir fonksiyon".
- `Array(COLS).fill(0)` → 60 kutuluk bir liste yapar ve hepsini `0` ile doldurur: **tek bir satır**.
- `Array.from({ length: ROWS }, () => ...)` → 48 elemanlı bir liste yapar; her eleman için sağdaki küçük fonksiyonu
  çağırır. Yani **48 ayrı satır**.
- `function reset() { grid = emptyGrid() }` → dünyayı baştan kuran fonksiyon: `grid` kutusuna yepyeni, bomboş bir
  ızgara koyar.
- En altta `reset()` → çizmeden önce dünyayı kur.

Liste numaraları **0'dan başlar**: `grid[0]` ilk satır, `grid[47]` son satır, `grid[2][3]` 2. satırın 3. hücresi.

# --task--

1. Under `const TOP = 36`, after an empty line, write `let grid`, `emptyGrid` and `reset` as shown.
2. At the bottom, write `reset()` above `draw()`. Press **Run**.

# --task-tr--

1. `const TOP = 36` satırının altında bir boş satır bırak; `let grid` satırını, `emptyGrid`'i ve `reset`
   fonksiyonunu kodda görüldüğü gibi, aralarında birer boş satırla yaz.
2. En alttaki `draw()` satırının hemen **üstüne** `reset()` yaz.
3. **Çalıştır**: ekran aynı kalmalı, kontroller yeşil olmalı.

# --predict--

Will the green square disappear now that every cell is `0`?
- [ ] Yes, all cells are dead
- [x] No, `draw` still paints it at a fixed place
  `draw` does not look at `grid` yet. We connect them in the next step.

# --predict-tr--

Bütün hücreler `0` olduğuna göre yeşil kare kaybolur mu?
- [ ] Evet, bütün hücreler ölü
- [x] Hayır, `draw` onu hâlâ sabit bir yere çiziyor
  `draw` henüz `grid`'e bakmıyor. İkisini bir sonraki adımda bağlayacağız.

# --try--

Replace `emptyGrid`'s right side with `Array(ROWS).fill(Array(COLS).fill(0))` and run: the second check fails,
because `fill` puts the **same** row in all 48 places. Put it back.

# --try-tr--

`emptyGrid`'in sağ tarafını `Array(ROWS).fill(Array(COLS).fill(0))` yap ve çalıştır: ikinci kontrol kırmızı olur,
çünkü `fill` 48 yere de **aynı satırı** koyar; birini değiştirmek hepsini değiştirir. Sonra geri al.

# --tests--

`grid` should be 48 rows of 60 cells, all `0`.
tr: `grid` her biri 60 hücreli 48 satır olmalı, hepsi `0`.

```js
assert.lengthOf(grid, 48)
for (const row of grid) assert.lengthOf(row, 60)
assert.isTrue(grid.flat().every((cell) => cell === 0))
```

Every row should be its own list: changing one cell must not change the others.
tr: Her satır ayrı bir liste olmalı: bir hücreyi değiştirmek diğerlerini değiştirmemeli.

```js
grid[0][5] = 1
assert.strictEqual(grid[1][5], 0, 'grid[1][5] changed together with grid[0][5]')
assert.strictEqual(grid.flat().filter((cell) => cell === 1).length, 1)
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

function reset() {
  grid = emptyGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  ctx.fillRect(3 * CELL, TOP + 2 * CELL, CELL - 1, CELL - 1)
}

reset()
draw()
```
