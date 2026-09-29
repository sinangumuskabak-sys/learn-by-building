---
title: Discs in their colors
title_tr: Renkli diskler
skills: [prog.arrays, game.canvas]
---

# --goal--

Now the drawing reads the board: an empty cell is a dark hole, a cell with 1 or 2 a disc in that player's color. The
colors are kept in an object, `COLORS`.

# --goal-tr--

Şimdi çizim **tahtaya bakacak**: boş hücre koyu bir delik, içinde 1 ya da 2 olan hücre o oyuncunun renginde bir disk.
Renkleri bir **nesnede** (object) tutuyoruz: `COLORS[1]` kırmızı, `COLORS[2]` sarı.

Tahta şimdilik boş olduğu için ekran değişmez; denemek için aşağıdaki **Dene** kısmına bak.

# --code--

```js
const COLORS = { 1: '#ef4444', 2: '#facc15' }

      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
```

# --meaning--

- `COLORS` is an object: `{ key: value, ... }`. `COLORS[1]` reads the value under 1: red.
- `a ? b : c` picks `b` when `a` is truthy, otherwise `c`. 0 counts as false, 1 and 2 as true.

# --meaning-tr--

- `const COLORS = { 1: '#ef4444', 2: '#facc15' }` → **nesne**: süslü parantez içinde `ad: değer` çiftleri. `COLORS[1]`
  köşeli parantezle `1` adlı değeri okur: kırmızı.
- `board[row][col]` → o hücrede ne var: 0, 1 ya da 2.
- `koşul ? A : B` → kısa bir seçim: koşul doğruysa A, değilse B. `0` "yok" (yanlış) sayılır, `1` ve `2` "var" (doğru).
- Yani: "hücrede disk var mı? Varsa oyuncunun rengi (`COLORS[board[row][col]]`), yoksa koyu delik".

# --task--

1. Under `TOP` write `COLORS`.
2. In the inner loop of `draw`, replace `'#0f172a'` in the `disc` call with the choice.

# --task-tr--

1. `const TOP = ...` satırının altına `COLORS` satırını yaz.
2. `draw` içindeki iç döngüde `disc(x, y, '#0f172a')` satırındaki `'#0f172a'` yerine
   `board[row][col] ? COLORS[board[row][col]] : '#0f172a'` yaz.
3. **Çalıştır**: tahta şimdilik boş görünür.

# --try--

In `reset`, under the `board =` line, add `board[5][3] = 1` and run: a red disc at the bottom. Remove it again.

# --try-tr--

`reset` içinde `board =` satırının altına `board[5][3] = 1` ekle ve çalıştır: altta kırmızı bir disk. Sonra sil.

# --tests--

Discs should be drawn in their player's color.
tr: Diskler oyuncularının renginde çizilmeli.

```js
board[5][3] = 1
board[5][4] = 2
draw()
assert.deepEqual($.arcs().filter((a) => a.color === '#ef4444').map((a) => [a.x, a.y]), [[224, 448]])
assert.deepEqual($.arcs().filter((a) => a.color === '#facc15').map((a) => [a.x, a.y]), [[288, 448]])
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
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

reset()
draw()
```
