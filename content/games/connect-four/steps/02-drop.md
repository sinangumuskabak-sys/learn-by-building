---
title: Dropping discs
title_tr: Disk bırakmak
skills: [game.input, prog.arrays]
---

# --explanation--

You never choose a cell in this game, only a **column**: the disc falls to the lowest empty hole. Finding it is a loop
from the bottom row upwards that stops at the first empty cell:

```js
for (let row = ROWS - 1; row >= 0; row--) {
  if (board[row][col] === 0) return row
}
return -1   // the column is full
```

Returning `-1` for "no such row" is a common convention (`indexOf` does the same), and it lets `play` refuse a full
column with one check.

The two players take turns, and `turn = 3 - turn` switches between 1 and 2 without an `if`: 3 − 1 is 2 and 3 − 2 is 1.

The column under the mouse comes from the click position. Like in other games, convert screen pixels to canvas pixels
first, because the page scales the canvas. A disc floating above that column shows where the next one will go; the
keyboard can move it with the arrows and drop it with Enter or Space, or drop straight into a column with 1 to 7.

# --explanation-tr--

**Bu adımda:** diskleri bırakacağız. Tahtanın üstünde, farenin olduğu sütunun üzerinde bir disk bekleyecek; bir
sütuna tıklayınca disk o sütunun en alttaki boş deliğine yerleşecek. Sıra kırmızı ile sarı arasında değişecek ve
en üstte `Red's turn` (sıra kırmızıda) ya da `Yellow's turn` (sıra sarıda) yazacak.

**Hücre değil, sütun seçersin.** Bu oyunda hücre seçilmez, sadece **sütun**: disk en alttaki boş deliğe düşer. O
deliği bulmak için en alt satırdan **yukarı doğru** bakarız ve ilk boş hücrede dururuz:

```js
for (let row = ROWS - 1; row >= 0; row--) {
  if (board[row][col] === 0) return row
}
return -1   // sütun dolu
```

Bunu parça parça okuyalım:

- `let row = ROWS - 1` → en alt satırdan (5) başla.
- `row >= 0` → `>=` "büyük ya da eşit": 0. satıra kadar devam et.
- `row--` → her turdan sonra 1 **azalt** (yukarı çık).
- `if (board[row][col] === 0) return row` → `===` "eşit mi?" diye sorar. Boşsa bu satırı **geri ver** ve
  fonksiyondan çık (`return`).
- Döngü hiç boş bulamadan biterse `return -1`: "böyle bir satır yok". `-1` ile "yok" demek yaygın bir alışkanlıktır
  ve `play`'in dolu sütunu tek bir kontrolle reddetmesini sağlar.

**Sırayı değiştirmek.** `turn` 1 (kırmızı) ya da 2 (sarı). `turn = 3 - turn` bir `if` olmadan ikisi arasında gidip
gelir: 3 − 1 = 2, 3 − 2 = 1.

**Olaylar (events).** Tarayıcı, sayfada bir şey olunca bunu duyurur; sen de "şu olunca şunu yap" diye kayıt olursun
(kapı zili gibi):

- `'pointermove'` → fare canvas üstünde hareket etti: bekleyen diski o sütuna taşırız.
- `'pointerdown'` → tıklandı (ya da parmakla dokunuldu): o sütuna oynarız.
- `'keydown'` → klavyede bir tuşa basıldı. `event.key` tuşun adıdır: `'ArrowLeft'`, `'Enter'`, `' '` (Boşluk),
  `'1'`...

**Fare hangi sütunda?** `event.clientX` farenin sayfadaki yeridir. Sayfa canvas'ı büyütüp küçültebildiği için önce
canvas piksellerine çeviririz: `canvas.getBoundingClientRect()` canvas'ın ekrandaki yerini (`left`) ve gösterilen
enini (`width`) verir. Sonra `Math.floor(x / CELL)` sütunu verir (aşağı yuvarlama).

```js
Math.min(COLS - 1, Math.max(0, sütun))
```

`Math.max(0, a)` "a'yı al ama 0'ın altına inme", `Math.min(6, a)` "6'nın üstüne çıkma". Birlikte sonucu 0 ile 6
arasında **sıkıştırırlar**.

**Klavye.** Sol/sağ ok bekleyen diski kaydırır; `1`–`7` doğrudan o sütunu seçip bırakır; Boşluk ve Enter bırakır.

- `event.key >= '1' && event.key <= '7'` → "tuş 1 ile 7 arasında mı?" (`&&` "ve", `<=` "küçük ya da eşit").
- `Number(event.key) - 1` → `'3'` yazısını `3` sayısına çevirir, 1 çıkarır: 2. sütun (sütunlar 0'dan sayılır).
- `||` "veya" demektir.
- `event.preventDefault()` → tuşun olağan işini (Boşluk'un sayfayı kaydırması gibi) engeller.

**Yazı.** `ctx.font` yazı tipi, `ctx.textAlign = 'center'` verilen `x`'in yazının ortası olması,
`ctx.fillText(yazı, x, y)` yazıyı boyamak. `"Red's turn"` çift tırnakla yazılır, çünkü içinde tek tırnak var.

# --task--

1. Add `turn` (`1` in `reset()`) and `hoverCol = 3`.
2. Write `dropRow(col)` as above, and `play(col)`: if the column is not full, put `turn` in its lowest empty cell and
   switch `turn`.
3. Write `colAt(event)`: the column under a pointer event, converting screen pixels to canvas pixels and keeping the result
   between `0` and `COLS - 1`. `pointermove` sets `hoverCol`; `pointerdown` sets it and plays there.
4. Keys: the left and right arrows move `hoverCol`, `1` to `7` set it; `1` to `7`, Space and Enter play `hoverCol`
   (`preventDefault()` them).
5. Draw a disc of the current player's color above `hoverCol` (centered at `TOP - CELL / 2`), and `Red's turn` or
   `Yellow's turn` centered at the top (`y = 26`, white, `'bold 18px sans-serif'`).

# --task-tr--

1. `let board ...` satırının altına sıra ve bekleyen disk değişkenlerini ekle:

   ```js
   let turn
   let hoverCol = 3
   ```

2. `reset()` fonksiyonuna sırayı başlatan satırı ekle:

   ```js
   function reset() {
     board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
     turn = 1 // ← yeni
   }
   ```

3. `reset()`'in altına bir boş satır bırak ve şu fonksiyonları ve olay dinleyicilerini yaz (`function disc`'ten
   önce):

   ```js
   // The lowest empty row in a column, or -1 when the column is full.
   function dropRow(col) {
     for (let row = ROWS - 1; row >= 0; row--) {
       if (board[row][col] === 0) return row
     }
     return -1
   }

   function play(col) {
     const row = dropRow(col)
     if (row === -1) return
     board[row][col] = turn
     turn = 3 - turn
   }

   function colAt(event) {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width
     return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
   }

   canvas.addEventListener('pointermove', (event) => {
     hoverCol = colAt(event)
   })
   canvas.addEventListener('pointerdown', (event) => {
     hoverCol = colAt(event)
     play(hoverCol)
   })
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
     if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
     if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
     if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
       event.preventDefault()
       play(hoverCol)
     }
   })
   ```

4. `draw()` fonksiyonunda, arka planı boyayan iki satırın hemen altına bekleyen diski ekle:

   ```js
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     // The next disc waits above the column it would drop into. // ← yeni
     disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn]) // ← yeni
   ```

5. `draw()` fonksiyonunun sonunda, iç içe `for` döngülerinin kapanışından sonra, fonksiyonun son `}` işaretinden
   **önce** sıra yazısını ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'center'
     ctx.fillText(turn === 1 ? "Red's turn" : "Yellow's turn", canvas.width / 2, 26)
   ```

6. İstersen `const TOP = 96` satırının yorumunu `// room above the board for the messages and the next disc` yap;
   yorum olduğu için kontrolleri etkilemez.

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Fareyi gezdirince üstteki disk sütun sütun izlemeli; tıklayınca
   disk o sütunun en altına yerleşmeli ve renk değişmeli. `1`–`7` tuşları ve oklar da çalışmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. Diskler en üste yerleşiyorsa `dropRow` döngüsünün `ROWS - 1`'den başlayıp
   `row--` ile azaldığını kontrol et.

# --tests--

A disc should fall to the lowest empty hole, and the players should take turns.
tr: Disk en alttaki boş deliğe düşmeli ve oyuncular sırayla oynamalı.

```js
assert.strictEqual(dropRow(3), 5)
$.click(224, 300) // column 3
assert.strictEqual(board[5][3], 1)
assert.strictEqual(turn, 2)
$.click(224, 300)
assert.strictEqual(board[4][3], 2)
assert.strictEqual(dropRow(3), 3)
```

A full column should refuse more discs.
tr: Dolu bir sütun daha fazla disk kabul etmemeli.

```js
for (let i = 0; i < 6; i++) play(0)
assert.strictEqual(dropRow(0), -1)
const before = turn
play(0)
assert.strictEqual(turn, before, 'the turn does not change')
assert.deepEqual(board.map((row) => row[0]), [2, 1, 2, 1, 2, 1])
```

Keys should choose and drop, and clicks should work on a scaled canvas.
tr: Tuşlar seçip bırakmalı ve tıklamalar ölçeklenmiş bir canvas'ta çalışmalı.

```js
$.press('7')
assert.strictEqual(board[5][6], 1)
$.press('ArrowLeft')
$.press('Enter')
assert.strictEqual(hoverCol, 5)
assert.strictEqual(board[5][5], 2)
canvas.getBoundingClientRect = () => ({ left: 100, top: 0, width: 224, height: 260 }) // drawn at half size
$.click(100 + 40, 100)
assert.strictEqual(board[5][1], 1)
```

The next disc should hover over the chosen column.
tr: Sıradaki disk seçilen sütunun üstünde durmalı.

```js
$.move(100, 300) // column 1
$.tick(1)
const above = $.arcs().filter((a) => a.y === 64)
assert.deepEqual(above.map((a) => [a.x, a.color]), [[96, '#ef4444']])
assert.include($.texts(), "Red's turn")
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow

let board // board[row][col]: 0 empty, 1 or 2
let turn
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  const row = dropRow(col)
  if (row === -1) return
  board[row][col] = turn
  turn = 3 - turn
}

function colAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
}

canvas.addEventListener('pointermove', (event) => {
  hoverCol = colAt(event)
})
canvas.addEventListener('pointerdown', (event) => {
  hoverCol = colAt(event)
  play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    play(hoverCol)
  }
})

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The next disc waits above the column it would drop into.
  disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(turn === 1 ? "Red's turn" : "Yellow's turn", canvas.width / 2, 26)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
