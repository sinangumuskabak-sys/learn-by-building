---
title: A board of random gems
title_tr: Rastgele mücevherli tahta
skills: [prog.arrays]
---

# --goal--

There are six gem colors. The board is a list of 8 rows, each a list of 8 numbers from 0 to 5: not the color itself
but its index in `COLORS`. `newBoard()` fills it with random gems.

# --goal-tr--

Altı renk mücevher var: `COLORS`. Tahtayı bir tabloda tutacağız: 8 satır, her satır 8 sayı. Hücrede rengin kendisini
değil, `COLORS` listesindeki **sıra numarasını** (0–5) tutuyoruz: 0 kırmızı, 3 mavi... Sayıları karşılaştırmak
kolay; rengi yalnız çizerken arayacağız.

`newBoard()` (yeni tahta) tabloyu rastgele mücevherlerle dolduracak. Bu adımda ekranda bir şey değişmeyecek; tahta
şimdilik yalnız bilgi.

# --code--

```js
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

let board // board[row][col]: a color index

const randomGem = () => Math.floor(Math.random() * COLORS.length)

function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      board[r].push(randomGem())
    }
  }
}

newBoard()
requestAnimationFrame(loop)
```

# --meaning--

- `randomGem` is a short arrow function: `Math.random()` is a number from 0 up to 1, times 6 and rounded down it is a
  whole number 0 to 5.
- `newBoard` starts with an empty list, adds an empty row for each `r`, and pushes 8 random gems into it.
- `board[r][c]` is the gem in row `r`, column `c`. `newBoard()` at the bottom makes the first board.

# --meaning-tr--

- `const COLORS = [...]` → altı renk; sıra numaraları 0'dan 5'e.
- `let board` → tahta. Yanındaki yorum içinde ne olduğunu söylüyor: `board[satır][sütun]` bir renk sırası.
- `const randomGem = () => ...` → kısa yazılmış bir fonksiyon (**ok fonksiyonu**): hiçbir şey almaz, `=>`'nin sağını
  verir. `randomGem()` diye çağrılır.
  - `Math.random()` → 0 ile 1 arası (1 hariç) rastgele bir sayı. `* COLORS.length` (× 6) → 0 ile 5,99 arası.
  - `Math.floor(...)` → aşağı yuvarla: 0, 1, 2, 3, 4 ya da 5.
- `function newBoard() {` →
  - `board = []` → boş bir listeyle başla.
  - `board.push([])` → `push` listenin **sonuna** ekler: her satır için boş bir satır listesi.
  - `board[r].push(randomGem())` → o satıra rastgele bir mücevher ekle. İç döngü 8 kez: satırda 8 mücevher.
- En alttaki `newBoard()` → döngü başlamadan ilk tahtayı kurar.

# --task--

1. Under `TOP` write `COLORS`.
2. Above `function draw() {` write `let board`, `randomGem` and `newBoard`.
3. At the bottom, write `newBoard()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `const TOP = 72 ...` satırının altına `COLORS` satırını yaz.
2. `function draw() {` satırının **üstüne** `let board`, `randomGem` ve `newBoard`'u yaz; aralarında birer boş satır
   bırak.
3. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `newBoard()` yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

What do you see after Run?
- [ ] 64 colored gems
- [x] The same empty grid
  The board exists only as data; `draw` does not look at it yet.
- [ ] An error

# --predict-tr--

Çalıştır'a basınca ne görürsün?
- [ ] 64 renkli mücevher
- [x] Aynı boş ızgara
  Tahta şimdilik yalnız bilgi; `draw` ona henüz bakmıyor.
- [ ] Bir hata

# --tests--

`randomGem()` should give a whole number from 0 to 5.
tr: `randomGem()` 0'dan 5'e bir tam sayı vermeli.

```js
const seen = new Set()
for (let i = 0; i < 200; i++) seen.add(randomGem())
assert.sameMembers([...seen], [0, 1, 2, 3, 4, 5])
```

The board should be 8 rows of 8 gems, each a color index from 0 to 5.
tr: Tahta 8 mücevherden 8 satır olmalı; her biri 0'dan 5'e bir renk sırası.

```js
assert.lengthOf(board, 8)
for (const row of board) assert.lengthOf(row, 8)
for (const row of board) for (const gem of row) assert.include([0, 1, 2, 3, 4, 5], gem)
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

function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      board[r].push(randomGem())
    }
  }
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
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newBoard()
requestAnimationFrame(loop)
```
