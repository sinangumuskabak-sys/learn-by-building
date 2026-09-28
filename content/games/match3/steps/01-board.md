---
title: A board with no matches
title_tr: Eşleşmesiz bir tahta
skills: [prog.arrays, game.canvas]
---

# --explanation--

A match three game is an 8 by 8 grid of gems in six colors. Swap two neighbouring gems to line up three or more of the same
color and they disappear. The whole game lives in one **2D array**: `board[row][col]` holds a color index from `0` to `5`.

The first surprise: a board filled with plain random colors almost always **already contains** three in a row, and the game
would start by clearing gems the player never touched. So each gem is chosen with a rule. We fill the board row by row, left
to right, so when we place a gem only the cells to its **left** and **above** exist yet. If the two on the left are the same
color as the new gem, or the two above are, we would make a run, so we roll again:

```js
let gem
do gem = randomGem()
while (makesRun(r, c, gem))   // try again until it doesn't make three
```

`do ... while` runs its body at least once and repeats while the condition holds. It always ends: at most two colors are
forbidden, and there are six.

Every cell is `SIZE` pixels; the board starts at `LEFT` and `TOP`, so cell `(r, c)` is at `x = LEFT + c * SIZE`,
`y = TOP + r * SIZE`. A gem is a circle in the middle of its cell.

# --explanation-tr--

**Bu adımda:** 8×8'lik bir mücevher tahtası çizeceğiz. Sağda damalı mor karelerin üstünde altı farklı renkte
yuvarlak mücevherler göreceksin. Tahtada hiçbir yerde aynı renkten üç mücevher yan yana ya da alt alta olmayacak.

**Oyun nedir?** Altı renkli mücevherlerden oluşan 8×8 bir ızgara. Yan yana iki mücevherin yerini değiştirip aynı
renkten üç ya da daha fazlasını sıraya dizersin, onlar yok olur.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur ve yapar. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 400×480 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Her şeyi onun
üstüne boyarız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı (çizim bağlamı, context) al
```

`const ad = değer` bir şeye değişmeyen bir ad (**sabit**) verir; `let ad` içi sonradan değişebilen bir
**değişken** açar. Nokta (`.`) "bunun içindeki" demek; tırnak içindekiler **yazıdır**. Canvas'ta `(0, 0)` sol üst
köşedir; `x` sağa, `y` **aşağı** doğru büyür. `ctx.fillStyle = renk` fırçaya renk sürer, `ctx.fillRect(x, y, en,
boy)` dikdörtgen boyar. `'#ef4444'` gibi yazılar renk kodudur.

**Dizi (array) ve iki boyutlu tahta.** Dizi köşeli parantez içinde bir listedir: `['#ef4444', '#f59e0b']`.
Elemanlar **0'dan** numaralanır: `COLORS[0]` ilk renk. `.length` eleman sayısıdır. Tahta, satırlardan oluşan bir
listedir: `board[r][c]` → `r`. satırın `c`. hücresi. Hücrede rengin kendisini değil **sıra numarasını** (0–5)
tutarız; rengi çizerken `COLORS[gem]` ile buluruz.

**Fonksiyon.** Bir işi bir ad altında toplar. `function ad(parametreler) { ... }` ile tanımlanır, `ad(...)` ile
çağrılır. Parametreler çağırırken verdiğin değerlerin içerideki adlarıdır. `return` cevabı geri verir. Kısa yazımı
da var: `const randomGem = () => ...` "hiçbir şey almayan, `=>`'nun sağındakini veren fonksiyon".

**Rastgele renk.** `Math.random()` 0 ile 1 arası rastgele bir sayı verir; `* COLORS.length` (× 6) onu 0 ile 5,99…
arasına genişletir; `Math.floor` aşağı yuvarlar: 0–5 arası tam sayı.

**İlk sürpriz.** Tamamen rastgele renklerle doldurulmuş bir tahtada neredeyse **her zaman** zaten üçlü sıralar olur;
oyun, oyuncunun dokunmadığı mücevherleri silerek başlardı. Bu yüzden her mücevheri bir kuralla seçeriz. Tahtayı
satır satır, soldan sağa doldururuz; bir mücevheri koyarken yalnızca **solundaki** ve **üstündeki** hücreler var.
Soldaki iki hücre ya da üstteki iki hücre yeni mücevherle aynı renkse üçlü olur; o zaman yeniden zar atarız:

```js
let gem
do gem = randomGem()
while (makesRun(r, c, gem))   // üçlü yapmayana kadar yeniden dene
```

`do ... while` içini **en az bir kez** yapar, koşul doğru olduğu sürece tekrarlar. Hep biter: en fazla iki renk
yasaktır, altı renk var.

`makesRun` içinde: `c >= 2` "solda iki hücre var mı?" (`>=` büyük ya da eşit), `===` "eşit mi?", `&&` "ve", `||`
"veya". `board[r][c - 1]` bir soldaki hücredir.

**Döngüler.** `for (let r = 0; r < N; r++) { ... }` sayan bir döngüdür: `r = 0`'dan başla, `r < 8` olduğu sürece
dön, her turdan sonra `r`'yi bir artır (`r++`). İç içe iki döngü 64 hücrenin hepsini gezer. `board.push(x)`
listenin sonuna ekler.

**Konum.** Her hücre `SIZE` (48) piksel. Tahta `LEFT` ve `TOP`'tan başlar; `(r, c)` hücresi `x = LEFT + c * SIZE`,
`y = TOP + r * SIZE`'dadır. Dama deseni: `(r + c) % 2 === 0` → "satır + sütun çift mi?" (`%` bölümden kalan).

**Daire çizmek.** `ctx.beginPath()` yeni bir şekle başlar, `ctx.arc(x, y, yarıçap, 0, Math.PI * 2)` merkezi
`(x, y)` olan tam bir çember tarif eder (`Math.PI * 2` tam tur), `ctx.fill()` içini boyar.

# --task--

1. Add `N = 8`, `SIZE = 48`, `LEFT = (canvas.width - N * SIZE) / 2`, `TOP = 72` and the six `COLORS`
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'`).
2. Write `randomGem()` (a random index into `COLORS`) and `makesRun(r, c, gem)`: true if the two cells to the left, or the
   two cells above, both hold `gem`.
3. Write `newBoard()`, which builds `board` row by row with the `do ... while` above, and `reset()`, which calls it.
4. Each frame, fill the canvas with `'#1e1b4b'`, then draw every cell as a square (`'#312e81'` when `(r + c)` is even,
   otherwise `'#3730a3'`) and its gem as a circle of radius `SIZE / 2 - 6` in its color.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunları yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const N = 8 // 8 by 8 gems
   const SIZE = 48
   const LEFT = (canvas.width - N * SIZE) / 2
   const TOP = 72 // room for the score and the moves left
   const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

   let board // board[row][col]: a color index
   ```

   `LEFT` tahtayı yatayda ortalar: (400 − 8 × 48) / 2 = 8. `TOP` üstte skor için yer bırakır.

2. Bir satır boşluk bırakıp rastgele renk ve üçlü kontrolünü yaz:

   ```js
   const randomGem = () => Math.floor(Math.random() * COLORS.length)

   // Would this gem make three in a row with the two to its left, or the two above it?
   function makesRun(r, c, gem) {
     const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
     const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
     return left || up
   }
   ```

3. Altına tahtayı kuran fonksiyonu ve `reset()`'i yaz:

   ```js
   // A new board with no three in a row: each gem avoids the colors that would make one.
   function newBoard() {
     board = []
     for (let r = 0; r < N; r++) {
       board.push([])
       for (let c = 0; c < N; c++) {
         let gem
         do gem = randomGem()
         while (makesRun(r, c, gem))
         board[r].push(gem)
       }
     }
   }

   function reset() {
     newBoard()
   }
   ```

   Her satırın başında boş bir liste (`[]`) eklenir, sonra o satıra 8 mücevher itilir.

4. Altına çizim fonksiyonunu, oyun döngüsünü ve başlatan satırları yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#1e1b4b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let r = 0; r < N; r++) {
       for (let c = 0; c < N; c++) {
         const x = LEFT + c * SIZE
         const y = TOP + r * SIZE
         ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
         ctx.fillRect(x, y, SIZE, SIZE)
         const gem = board[r][c]
         ctx.fillStyle = COLORS[gem]
         ctx.beginPath()
         ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
         ctx.fill()
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

   `koşul ? a : b` "koşul doğruysa `a`, değilse `b`" demektir. Mücevher hücrenin ortasında, yarıçapı
   `48 / 2 - 6 = 18`. `requestAnimationFrame(loop)` tarayıcıdan "bir sonraki karede `loop`'u çalıştır" ister;
   `loop` her seferinde çizip kendini yeniden ister, ekran saniyede ~60 kez güncellenir.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda damalı bir tahta ve üzerinde 64 renkli yuvarlak görmelisin;
   her çalıştırmada renkler değişir, ama hiçbir yerde üç aynı renk sıralanmaz. Alttaki kontrollerin hepsi yeşil
   olmalı. Üçlü testi kırmızıysa `makesRun`'daki `c - 1`, `c - 2`, `r - 1`, `r - 2` yazımını kontrol et.

# --tests--

The board should be 8 rows of 8 gems, each a color index from 0 to 5.
tr: Tahta 8 mücevherden 8 satır olmalı; her biri 0'dan 5'e bir renk sırası.

```js
assert.lengthOf(board, 8)
for (const row of board) assert.lengthOf(row, 8)
for (const row of board) for (const gem of row) assert.include([0, 1, 2, 3, 4, 5], gem)
```

A new board should never contain three of a color in a row or a column.
tr: Yeni bir tahta asla bir satırda ya da sütunda aynı renkten üç içermemeli.

```js
for (let i = 0; i < 200; i++) {
  newBoard()
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (c >= 2) assert.isFalse(board[r][c] === board[r][c - 1] && board[r][c] === board[r][c - 2], 'three in a row at row ' + r)
    if (r >= 2) assert.isFalse(board[r][c] === board[r - 1][c] && board[r][c] === board[r - 2][c], 'three in a column at column ' + c)
  }
}
```

Each gem should be drawn as a circle in the middle of its cell, in its color.
tr: Her mücevher kendi hücresinin ortasında, kendi renginde bir daire olarak çizilmeli.

```js
$.tick(1)
const gems = $.arcs().filter((a) => a.r === 18)
assert.lengthOf(gems, 64)
assert.deepInclude(gems, { x: 32, y: 96, r: 18, color: COLORS[board[0][0]] })
assert.deepInclude(gems, { x: 368, y: 432, r: 18, color: COLORS[board[7][7]] })
```

# --seed--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

let board // board[row][col]: a color index

const randomGem = () => Math.floor(Math.random() * COLORS.length)

// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.
function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
    }
  }
}

function reset() {
  newBoard()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      ctx.fillStyle = COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
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
