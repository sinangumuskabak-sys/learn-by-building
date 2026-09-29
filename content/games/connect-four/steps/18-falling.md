---
title: A disc on its way
title_tr: Yoldaki disk
skills: [game.state]
---

# --goal--

Discs will fall instead of appearing. So `play` no longer changes the board: it creates `falling`, a disc on its way down
that knows its target row. `land()` finishes the move: the board changes and the turn passes.

# --goal-tr--

Diskler deliğe birden belirmesin, yukarıdan **düşsün**. Bunun için hamleyi ikiye ayırıyoruz:

- `play` artık tahtayı değiştirmiyor. Onun yerine `falling` (düşen) adında, **yolda olan** bir disk yaratıyor. Disk hedef
  satırını baştan biliyor.
- `land()` (in) hamleyi bitiriyor: disk tahtaya yazılıyor ve sıra geçiyor.

"Hamleye karar verildi" ile "hamle tamamlandı"yı ayırmak her animasyonlu oyunda işe yarar. Düşme hareketini bir sonraki
adımda ekleyeceğiz.

# --code--

```js
let falling // the disc on its way down, or null

  falling = null

function play(col) {
  if (falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
  turn = 3 - turn
}
```

# --meaning--

- `falling` is `null` ("nothing") when no disc is falling; `if (falling || ...)` refuses a move while one is.
- `{ col, row }` is short for `{ col: col, row: row }`. The disc starts half a cell above the canvas with speed 0.
- `const { col, row, who } = falling` takes those three fields out into names. `land` puts the disc on the board.

# --meaning-tr--

- `let falling` → düşen disk. Düşen disk yokken değeri `null`: "hiçbir şey".
- `if (falling || dropRow(col) === -1) return` → `||` "veya": disk zaten düşüyorsa **veya** sütun doluysa çık. Böylece
  hızlı tıklamalar aynı anda iki disk bırakamaz. `null` yanlış, bir nesne doğru sayılır.
- `falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }` → `{ col, row }` kısa yazım: `{ col: col, row: row }`.
  `who` diski atan oyuncu, `y: -CELL / 2` disk tuvalin biraz üstünden başlar, `vy: 0` hızı sıfırdan.
- `const { col, row, who } = falling` → tersi: nesnenin üç alanını aynı adlı üç sabite çıkarır. `falling.col` yerine
  kısaca `col`.
- `land` eski `play`'in yaptığını yapıyor: diski tahtaya yaz, sırayı değiştir. Bir de `falling = null`: yolda disk kalmadı.

# --task--

1. Under `let turn` write `let falling`; in `reset`, under `turn = 1`, write `falling = null`.
2. Change `play` as shown and write `land` under it.

# --task-tr--

1. `let turn` satırının altına `let falling ...` satırını yaz.
2. `reset` içinde `turn = 1` satırının altına `falling = null` yaz.
3. `play` içinde: ilk satıra `falling || ` ekle; `board[row][col] = turn` ve `turn = 3 - turn` satırlarını sil, yerine
   `falling = { ... }` satırını yaz.
4. `play`'in altına bir boş satır bırakıp `land` fonksiyonunu yaz.
5. **Çalıştır** ve tıkla.

# --predict--

You click a column now. What happens?
- [ ] A disc appears in the hole, like before
- [x] Nothing, and later clicks do nothing either
  `play` creates a falling disc, but nothing moves it or calls `land()` yet, and `play` refuses while one is falling.
- [ ] The game stops with an error

# --predict-tr--

Şimdi bir sütuna tıklıyorsun. Ne olur?
- [ ] Eskisi gibi deliğe bir disk çıkar
- [x] Hiçbir şey; sonraki tıklamalar da bir şey yapmaz
  `play` düşen bir disk yaratıyor ama onu hareket ettiren ya da `land()`'i çağıran henüz yok; `play` de bir disk
  düşerken hamle kabul etmiyor.
- [ ] Oyun hata verip durur

# --tests--

`play` should start a falling disc without changing the board yet.
tr: `play` tahtayı değiştirmeden düşen bir disk başlatmalı.

```js
assert.isNull(falling)
play(3)
assert.deepEqual(falling, { col: 3, row: 5, who: 1, y: -32, vy: 0 })
assert.strictEqual(board[5][3], 0, 'not on the board until it lands')
play(4)
assert.strictEqual(falling.col, 3, 'no second disc while one is falling')
```

`land` should put the disc on the board and pass the turn.
tr: `land` diski tahtaya koymalı ve sırayı geçirmeli.

```js
play(3)
land()
assert.strictEqual(board[5][3], 1)
assert.isNull(falling)
assert.strictEqual(turn, 2)
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
let turn
let falling // the disc on its way down, or null
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  falling = null
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  if (falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
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
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
