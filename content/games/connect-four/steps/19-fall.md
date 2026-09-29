---
title: Gravity
title_tr: Yer çekimi
skills: [game.physics, game.loop]
---

# --goal--

Gravity is two lines: every frame the speed grows a little, then the position changes by the speed. When the disc
reaches the middle of its hole, it lands. `update` does this, and the loop calls it every frame.

# --goal-tr--

Yer çekimi iki satırdır. Düşen bir şeyin iki bilgisi var: yeri (`y`) ve hızı (`vy`, dikey hız). Her karede:

1. hız biraz artar (yer çekimi çeker),
2. yer, hız kadar aşağı iner.

Böylece disk önce yavaş, sonra giderek hızlı düşer; bir topu bıraktığında olduğu gibi. Deliğinin ortasına varınca
**iner**. Bu işi `update` (güncelle) fonksiyonu yapacak; döngü de onu her karede çağıracak. Disk henüz çizilmiyor, ama
yerine vardığında tahtada belirecek.

# --code--

```js
const GRAVITY = 1.2

function update() {
  if (falling) {
    falling.vy += GRAVITY
    falling.y += falling.vy
    const bottom = TOP + falling.row * CELL + CELL / 2
    if (falling.y >= bottom) {
      falling.y = bottom
      land()
    }
  }
}

  update()
```

# --meaning--

- `+=` adds: the speed grows by 1.2 each frame, and the position by the speed.
- `bottom` is the middle of the target hole. Once `y` reaches it, the disc is snapped there and lands.
- `loop` calls `update()` before `draw()`.

# --meaning-tr--

- `if (falling)` → "düşen bir disk varsa".
- `falling.vy += GRAVITY` → `+=` "üstüne ekle": hız her karede 1.2 artar.
- `falling.y += falling.vy` → yer, hız kadar aşağı iner.
- `const bottom = TOP + falling.row * CELL + CELL / 2` → hedef deliğin ortası (çizimdeki `y` hesabının aynısı).
- `if (falling.y >= bottom)` → vardıysa ya da biraz geçtiyse: `falling.y = bottom` ile tam yerine oturt, `land()` ile
  hamleyi bitir.
- `loop` içinde `update()` → her karede önce güncelle, sonra çiz.

# --task--

1. Under `TOP` write `GRAVITY`.
2. Above `function disc(` write `update`, followed by an empty line.
3. In `loop`, above `draw()`, write `update()`.

# --task-tr--

1. `const TOP = ...` satırının altına `GRAVITY` satırını yaz.
2. `function disc(` satırının **üstüne** `update` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır** ve tıkla: disk yarım saniye kadar sonra deliğinde belirmeli.

# --try--

Try `GRAVITY = 0.2`: a slow, floaty disc. Put 1.2 back.

# --try-tr--

`GRAVITY = 0.2` dene: yavaş, süzülen bir disk. Sonra 1.2'ye geri al.

# --tests--

A disc should fall faster and faster, and land in its hole.
tr: Disk gittikçe hızlanarak düşmeli ve deliğine inmeli.

```js
$.click(224, 300)
assert.isNotNull(falling)
$.tick(5)
assert.closeTo(falling.y, -32 + 1.2 * 15, 1e-9)
$.tick(22)
assert.isNotNull(falling)
$.tick(1)
assert.isNull(falling)
assert.strictEqual(board[5][3], 1)
assert.strictEqual(turn, 2)
```

A disc dropped on a stack should stop on top of it.
tr: Bir yığına bırakılan disk onun üstünde durmalı.

```js
board[5][2] = 1
board[4][2] = 2
play(2)
assert.strictEqual(falling.row, 3)
$.tick(60)
assert.strictEqual(board[3][2], 1)
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
const GRAVITY = 1.2
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

function update() {
  if (falling) {
    falling.vy += GRAVITY
    falling.y += falling.vy
    const bottom = TOP + falling.row * CELL + CELL / 2
    if (falling.y >= bottom) {
      falling.y = bottom
      land()
    }
  }
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
