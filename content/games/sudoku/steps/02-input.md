---
title: Selecting and typing
title_tr: Seçmek ve yazmak
skills: [game.input, game.state]
---

# --explanation--

The player needs a **selected cell**: the arrow keys move it, a click puts it anywhere, and the digit keys write into it.

Moving off the edge should wrap around, so that Up on the top row goes to the bottom. The `%` operator does that, as long as
the number is not negative. Adding 9 first keeps it positive:

```js
selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
```

Typing is one small function, `enter(d)`, used by every key: a digit writes `d`, and `0`, Backspace and Delete write `0`,
which empties the cell. It refuses to touch a **given** cell; that single check is what protects the puzzle.

Good Sudoku apps help your eyes. When you select a cell they shade its **row, column and box**, the three places where its
digit may not appear again, and highlight every cell holding the **same digit**. It is only a few `if`s choosing the fill
color, but it makes the game much easier to read.

# --explanation-tr--

**Bu adımda:** bir hücre seçip içine rakam yazabileceksin. Seçili hücre mavi olacak; onun satırı, sütunu ve kutusu
açık griyle gölgelenecek. Ok tuşları seçimi taşır, tıklamak bir hücreyi seçer, rakam tuşları yazar, Backspace siler.
Senin yazdığın rakamlar mavi ve ince görünecek.

**Seçili hücre.** Hangi hücrede olduğumuzu bir **nesnede** tutarız: `{ r: 4, c: 4 }` (satır 4, sütun 4: tam orta).
Nesne süslü parantez içinde `ad: değer` alanlarıdır; `selected.r` ile okunur.

**Kenardan başa sarmak.** En üst satırda yukarı basınca en alta gitmek isteriz. 1. adımda gördüğün `%` (bölümden
kalan) bunu yapar: `9 % 9` → `0` (en alttan aşağı basınca başa döner). Ama `(0 - 1) % 9` → `-1` olur, böyle bir satır yok. Önce 9 ekleyip artı tutarız:

```js
selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
```

`dr` ve `dc` satırın ve sütunun ne kadar değişeceği (−1, 0 ya da 1). Örnek: `r = 0`, yukarı (`dr = -1`):
`(0 - 1 + 9) % 9` = `8 % 9` = `8`, en alt satır.

**Tuşları yöne çevirmek.** Bir nesne her ok tuşunu bir `[satır farkı, sütun farkı]` çiftine bağlar:

```js
const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const [dr, dc] = moves[event.key]   // listenin ilk elemanı dr'ye, ikincisi dc'ye
```

`moves[event.key]` basılan tuşun adıyla nesneye bakar; ok tuşu değilse boş (`undefined`) döner, `if` bunu yanlış
sayar. `event.preventDefault()` ok tuşlarının sayfayı kaydırmasını engeller.

**Yazmak: tek bir fonksiyon.** `enter(d)` seçili hücreye `d` yazar; `0` yazmak hücreyi boşaltır. İlk satırı
bulmacayı korur: hücre **verilmişse** hiçbir şey yapmadan çıkar (`return`).

Rakam tuşu kontrolü: `event.key >= '1' && event.key <= '9'` yazılar arasında karşılaştırma yapar; tek karakterlik
rakamlar için "1 ile 9 arasında mı?" demektir (`&&` "ve"). `Number(event.key)` `'4'`'ü `4` yapar. `||` "veya"
demek. `if ... else if ... else if` zinciri: ilk doğru olan kısım çalışır.

**Tıklanan hücreyi bulmak.** Tarayıcı tıklamanın yerini sayfaya göre verir (`event.clientX`, `clientY`).
`canvas.getBoundingClientRect()` canvas'ın sayfadaki yerini ve ekrandaki boyunu verir; bununla canvas'ın kendi
piksellerine çeviririz. Sonra ızgaranın başlangıcını çıkarıp hücre boyuna böler, `Math.floor` ile aşağı
yuvarlarız: `x = 110` → `110 / 48 = 2,29` → sütun `2`. Izgaranın dışına tıklanırsa (0'dan küçük ya da 9 ve üstü)
seçim değişmez. `{ r, c }` kısaltması `{ r: r, c: c }` demektir.

**Göze yardım.** Hücreyi seçince onun **satırını, sütununu ve kutusunu** (rakamının bir daha olamayacağı üç yer)
gölgeleriz; **aynı rakamı** taşıyan hücreleri de vurgularız. Aynı kutuda mı? `Math.floor(r / 3)` hücrenin hangi kutu
satırında olduğunu verir (0, 1, 2); iki hücrenin hem kutu satırı hem kutu sütunu aynıysa aynı kutudadırlar. Renk
birkaç `if` ile seçilir; **sonraki kural kazanır**, çünkü her `if` `fill`'in üstüne yazar.

# --task--

1. Add `selected`, `{ r: 4, c: 4 }` in `reset()`.
2. Write `enter(d)`: if the selected cell is not given, set it to `d`.
3. On `keydown`: the arrow keys move `selected` with wrap-around (and `preventDefault()`), `'1'` to `'9'` call `enter` with
   that digit, and `'0'`, `'Backspace'` and `'Delete'` call `enter(0)`.
4. On `pointerdown`, convert to canvas pixels and select the cell under the pointer, if any.
5. Choose each cell's fill: `'#e2e8f0'` in the selected cell's row, column or box, `'#bfdbfe'` if it holds the selected cell's
   digit (when that is not `0`), `'#93c5fd'` for the selected cell itself, otherwise white. Later rules win.

# --task-tr--

1. `let given ...` satırının hemen **altına** ekle:

   ```js
   let selected
   ```

2. `reset()` fonksiyonunun son satırı olarak başlangıç seçimini ekle:

   ```js
   function reset() {
     grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
     given = grid.map((row) => row.map((d) => d !== 0))
     selected = { r: 4, c: 4 } // ← yeni
   }
   ```

3. `reset()` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp yazma fonksiyonunu, klavye ve tıklama
   dinleyicilerini yaz:

   ```js
   function enter(d) {
     if (given[selected.r][selected.c]) return
     grid[selected.r][selected.c] = d
   }

   document.addEventListener('keydown', (event) => {
     const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
     if (moves[event.key]) {
       event.preventDefault()
       const [dr, dc] = moves[event.key]
       selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
     } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
     else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
   })

   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height
     const r = Math.floor((y - TOP) / SIZE)
     const c = Math.floor(x / SIZE)
     if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
   })
   ```

   `addEventListener('keydown', ...)` "tuşa basılınca şunu çalıştır", `'pointerdown'` "fareyle tıklanınca ya da
   parmakla dokununca şunu çalıştır" der. Tarayıcı olayın bilgisini `event` içinde verir.

4. `draw()` fonksiyonunun başını değiştir. Arka planı boyayan iki satırdan sonra `d` satırını ekle; döngünün içinde
   de beyaz boyamayı renk seçimiyle değiştir:

   ```js
     const d = selected && grid[selected.r][selected.c]      // ← yeni
     for (let r = 0; r < 9; r++) {
       for (let c = 0; c < 9; c++) {
         const x = LEFT + c * SIZE
         const y = TOP + r * SIZE
         // Light up the selected cell's row, column and box, and every cell with the same digit.
         const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
         let fill = '#ffffff'                                  // ← yeni
         if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
         if (d && grid[r][c] === d) fill = '#bfdbfe'
         if (r === selected.r && c === selected.c) fill = '#93c5fd'
         ctx.fillStyle = fill                                  // ← değişti
         ctx.fillRect(x, y, SIZE, SIZE)
         if (grid[r][c] === 0) continue
   ```

   `d` seçili hücredeki rakam. `if (d && ...)` rakam 0 ise (boş hücre) atlanır, çünkü 0 yanlış sayılır. Döngünün
   geri kalanı (rakamı yazan satırlar ve çizgiler) aynı kalır.

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Ortadaki hücre mavi, satırı, sütunu ve kutusu gri olmalı. Ok
   tuşlarıyla gez, boş bir hücreye rakam yaz, Backspace ile sil; verilen koyu rakamlar değişmemeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Tıklama yanlış hücreyi seçiyorsa `x` satırının sonundaki `- LEFT`'i kontrol et.

# --tests--

The arrow keys should move the selection and wrap around the edges, and a click should select a cell.
tr: Ok tuşları seçimi hareket ettirmeli ve kenarlardan başa sarmalı; bir tıklama bir hücre seçmeli.

```js
assert.deepEqual(selected, { r: 4, c: 4 })
$.press('ArrowUp')
$.press('ArrowLeft')
assert.deepEqual(selected, { r: 3, c: 3 })
for (let i = 0; i < 4; i++) $.press('ArrowUp')
assert.deepEqual(selected, { r: 8, c: 3 }, 'going off the top wraps to the bottom')
$.press('ArrowRight')
$.click(38 + 48 * 2, 80)
assert.deepEqual(selected, { r: 0, c: 2 }, 'clicking a cell selects it')
```

Digits should be typed into empty cells and erased with Backspace, but given digits should not change.
tr: Rakamlar boş hücrelere yazılmalı ve Backspace ile silinmeli, ama verilen rakamlar değişmemeli.

```js
$.click(38 + 48 * 2, 80)
$.press('4')
assert.strictEqual(grid[0][2], 4)
$.press('9')
assert.strictEqual(grid[0][2], 9, 'a new digit replaces the old one')
$.press('Backspace')
assert.strictEqual(grid[0][2], 0)
$.click(38, 80)
$.press('1')
assert.strictEqual(grid[0][0], 5, 'the puzzle\'s own digits cannot change')
```

The selected cell, its row, column and box should be shaded.
tr: Seçili hücre, satırı, sütunu ve kutusu gölgelendirilmeli.

```js
$.click(38 + 48 * 2, 80)
$.press('4')
$.tick(1)
assert.deepInclude($.rects('#93c5fd'), { x: 14 + 48 * 2, y: 56, w: 48, h: 48, color: '#93c5fd' })
assert.deepInclude($.rects('#e2e8f0'), { x: 14 + 48 * 8, y: 56, w: 48, h: 48, color: '#e2e8f0' }, 'same row')
assert.deepInclude($.rects('#e2e8f0'), { x: 14 + 48 * 2, y: 56 + 48 * 8, w: 48, h: 48, color: '#e2e8f0' }, 'same column')
assert.deepInclude($.rects('#e2e8f0'), { x: 14, y: 56 + 48 * 2, w: 48, h: 48, color: '#e2e8f0' }, 'same box')
assert.deepInclude($.rects('#ffffff'), { x: 14 + 48 * 4, y: 56 + 48 * 4, w: 48, h: 48, color: '#ffffff' })
assert.include($.texts(), '4')
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

// The puzzle, row by row; 0 is an empty cell.
const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
let selected

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
}

function enter(d) {
  if (given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
}

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
})

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
})

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const d = selected && grid[selected.r][selected.c]
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      // Light up the selected cell's row, column and box, and every cell with the same digit.
      const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
      let fill = '#ffffff'
      if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
      if (d && grid[r][c] === d) fill = '#bfdbfe'
      if (r === selected.r && c === selected.c) fill = '#93c5fd'
      ctx.fillStyle = fill
      ctx.fillRect(x, y, SIZE, SIZE)
      if (grid[r][c] === 0) continue
      ctx.fillStyle = given[r][c] ? '#0f172a' : '#2563eb'
      ctx.font = (given[r][c] ? 'bold ' : '') + '26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
    }
  }
  // Thin lines between cells, thick ones around each box.
  for (let i = 0; i <= 9; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
    const w = i % 3 === 0 ? 3 : 1
    ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
    ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
