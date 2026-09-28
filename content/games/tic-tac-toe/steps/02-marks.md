---
title: The board as an array
title_tr: Dizi olarak tahta
skills: [prog.arrays, game.state]
---

# --explanation--

The 3×3 board is state: which cells hold an X, an O, or nothing. You could use a grid of rows, but a **flat array of
9 cells** is simpler, and a quick formula converts between an index and a position:

```
index:        0 1 2        row    = Math.floor(index / 3)
              3 4 5        column = index % 3
              6 7 8        index  = row * 3 + column
```

`%` is the remainder: `7 % 3` is `1`, so cell 7 is in column 1. `Math.floor(7 / 3)` is `2`, so it is in row 2. You
will use this "flat array + row/column formula" trick for every grid game: 2048, Minesweeper, Tetris...

An empty cell is the empty string `''`. To draw a mark, use big text centered in its cell. With
`textAlign = 'center'` and `textBaseline = 'middle'`, the point you give to `fillText` is the **middle** of the text,
so the cell center is all you need:

```js
const x = (index % 3) * CELL + CELL / 2
const y = Math.floor(index / 3) * CELL + CELL / 2
```

# --explanation-tr--

**Bu adımda:** tahtanın içeriğini (hangi kutuda X, hangisinde O var) bir listede tutacağız ve bu listeden
çizeceğiz. Liste şimdilik boş olduğu için ekran aynı görünecek; ama kontroller, içine X ve O koyup doğru çizip
çizmediğine bakacak.

**Dizi (array).** 9 kutunun her birinin içeriğini sırayla tutan bir listeye **dizi** denir:

```js
let board = ['', '', '', '', '', '', '', '', '']
```

- Köşeli parantez `[ ]` diziyi açar ve kapatır; elemanlar virgülle ayrılır.
- `''` iki tırnak arasında hiçbir şey olmayan **boş yazıdır**. Boş kutu demek. Dolu bir kutuda `'X'` ya da
  `'O'` olacak.
- `let` kullanıyoruz, çünkü tahta oyun boyunca değişecek (1. adımda gördüğün değişken).
- Elemanlara **sıra numarasıyla (index)** ulaşılır ve sayma **0'dan başlar**: `board[0]` sol üst kutu,
  `board[8]` sağ alt kutu.

**Sıra numarası ↔ satır ve sütun.** Kutular soldan sağa, yukarıdan aşağı numaralanır:

```
sıra:   0 1 2        satır  = Math.floor(sıra / 3)
        3 4 5        sütun  = sıra % 3
        6 7 8        sıra   = satır * 3 + sütun
```

- `/` bölme demektir. `Math.floor(...)` sonucu **aşağı yuvarlar** (küsuratı atar): `7 / 3 = 2.33...` →
  `2`. Yani 7 numaralı kutu 2. satırda (satırlar da 0'dan sayılır).
- `%` **bölümden kalan** demektir: `7 % 3` → 7'nin içinde iki tane 3 var, 1 artar → `1`. Yani 7 numaralı kutu
  1. sütunda.

Bu "düz dizi + satır/sütun formülü" numarasını her ızgara oyununda kullanacaksın.

**Fonksiyon (function).** Birlikte çalışan satırlara bir ad verip onları tek komutla çalıştırmanın yolu. Yemek
tarifi gibi: bir kez yazarsın, istediğin zaman uygularsın.

```js
function draw() {
  // tarif buraya
}
draw()
```

`function draw() { ... }` tarifi **tanımlar**, tek başına hiçbir şey çizmez. `draw()` ise tarifi **çağırır**:
şimdi uygula. Tahta değiştikçe `draw()`'u yeniden çağırıp her şeyi baştan çizeceğiz.

**Yazı çizmek.** X ve O'yu büyük harfler olarak çizeriz:

```js
ctx.font = 'bold 64px sans-serif'   // kalın, 64 piksel, sade yazı tipi
ctx.textAlign = 'center'            // verilen x, yazının yatay ortası olsun
ctx.textBaseline = 'middle'         // verilen y, yazının dikey ortası olsun
ctx.fillText('X', 50, 50)           // 'X'i (50, 50) noktasına ortalayarak yaz
```

Kutunun ortası: sütun × 100 + 50 ve satır × 100 + 50 (`CELL / 2` = 50).

**Her kutu için bir şey yapmak.**

```js
board.forEach((mark, index) => {
  // her kutu için bir kez çalışır
})
```

- `forEach` → "dizinin her elemanı için şunu yap".
- `(mark, index) => { ... }` → her elemanda çalışacak küçük bir fonksiyon. `=>` (ok), fonksiyon yazmanın kısa
  yoludur. Parantezdeki adlara **parametre** denir: `mark` kutunun içeriği (`'X'`, `'O'` ya da `''`), `index`
  kutunun sıra numarası.
- `if (mark === '') return` → `===` "eşit mi?" diye sorar. "Kutu boşsa, bu kutu için dur, sıradakine geç."
  `return` fonksiyondan hemen çıkar.

**Kısa seçim: `? :`.**

```js
ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
```

"`mark` X mi? Evetse pembe (`'#f38ba8'`), değilse mavi (`'#89b4fa'`)." Soru işaretinden önce soru, iki noktanın
iki yanında iki cevap.

# --task--

1. Add `let board = ['', '', '', '', '', '', '', '', '']`.
2. Move the drawing into `function draw()`. After the grid, for every cell that is not empty, draw its mark with
   `fillText` at the cell's center, in `'bold 64px sans-serif'`, centered horizontally and vertically. Use
   `'#f38ba8'` for X and `'#89b4fa'` for O.
3. Call `draw()` once.

# --task-tr--

1. `const CELL = 100` satırının altına bir satır boşluk bırak ve tahtayı ekle (tırnak çiftlerini say: 9 tane):

   ```js
   let board = ['', '', '', '', '', '', '', '', '']
   ```

2. Şimdi çizim kodunu bir fonksiyona alacağız. Arka planı boyayan `ctx.fillStyle = '#1e1e2e'` satırından
   döngünün kapanan `}` işaretine kadar olan her şeyi sil ve yerine şunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#1e1e2e'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#585b70'
     for (let i = 1; i < 3; i++) {
       ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
       ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
     }

     ctx.font = 'bold 64px sans-serif' // ← yeni
     ctx.textAlign = 'center' // ← yeni
     ctx.textBaseline = 'middle' // ← yeni
     board.forEach((mark, index) => { // ← yeni
       if (mark === '') return // ← yeni
       ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa' // ← yeni
       const x = (index % 3) * CELL + CELL / 2 // ← yeni
       const y = Math.floor(index / 3) * CELL + CELL / 2 // ← yeni
       ctx.fillText(mark, x, y) // ← yeni
     }) // ← yeni
   }
   ```

   Üstteki kısım 1. adımdaki kodun aynısı, sadece iki boşluk içeri kaydı. `})` kapanışına dikkat: `}` küçük
   fonksiyonu, `)` ise `forEach(` parantezini kapatır.

3. Fonksiyonun son `}` işaretinin altına bir satır boşluk bırak ve onu çağır:

   ```js
   draw()
   ```

4. **Çalıştır**'a bas. Tahta bir öncekiyle aynı görünmeli (tahta henüz boş). Alttaki kontrollerin hepsi yeşil
   olmalı. Merak edersen `board` dizisindeki ilk `''`'yi geçici olarak `'X'` yapıp çalıştır: sol üst kutuda
   pembe bir X görürsün. Sonra geri `''` yap, yoksa ilk kontrol kırmızı kalır.

# --tests--

The board should start with 9 empty cells.
tr: Tahta 9 boş hücreyle başlamalı.

```js
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
```

`draw()` should draw each mark in the middle of its cell, and nothing for empty cells.
tr: `draw()` her işareti hücresinin ortasına çizmeli, boş hücreler için hiçbir şey çizmemeli.

```js
board = ['X', '', '', '', 'O', '', '', '', 'X']
draw()
const marks = $.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.args[1], c.args[2]])
assert.sameDeepMembers(marks.map((m) => [m[0], m[1]]), [['X', 50], ['O', 150], ['X', 250]])
const byMark = Object.fromEntries(marks.map((m) => [m[0] + m[1], m[2]]))
assert.closeTo(byMark.X50, 50, 6)
assert.closeTo(byMark.O150, 150, 6)
assert.closeTo(byMark.X250, 250, 6)
```

X and O should have their own colors.
tr: X ve O'nun kendi renkleri olmalı.

```js
board = ['X', 'O', '', '', '', '', '', '', '']
draw()
const colors = Object.fromEntries($.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.fill]))
assert.deepEqual(colors, { X: '#f38ba8', O: '#89b4fa' })
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```
