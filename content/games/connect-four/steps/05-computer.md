---
title: A computer opponent
title_tr: Bir bilgisayar rakip
skills: [game.state]
---

# --explanation--

A good opponent does not have to be clever, only **sensible**. A few rules, checked in order, already play a decent game:

1. If I can win with this move, play it.
2. If the player could win next move, block that column.
3. Never play right **under** a hole where the player would win: my disc would give them the square they need.
4. Otherwise prefer the middle columns, where the most lines of four pass, with a little randomness so games differ.

The trick for rules 1 to 3 is to **try a move and take it back**: put a disc on the board, ask `wins4`, remove it again.
The computer "imagines" the move with the same code the real game uses:

```js
board[row][col] = who
const result = wins4(row, col) !== null
board[row][col] = 0
```

This is the first step towards real game AI: looking ahead at what a move would lead to. The tic-tac-toe game takes it all
the way with minimax; here, one move ahead is enough to make the computer hard to beat for most players.

The computer waits half a second before moving, so you can see what happened, and you can only drop a disc on your own
turn.

# --explanation-tr--

İyi bir rakibin zeki olması gerekmez, yalnızca **mantıklı** olması gerekir. Sırayla kontrol edilen birkaç kural zaten iyi bir
oyun oynar:

1. Bu hamleyle kazanabiliyorsam onu oyna.
2. Oyuncu bir sonraki hamlede kazanabilecekse o sütunu engelle.
3. Oyuncunun kazanacağı bir deliğin hemen **altına** asla oynama: benim diskim ona gereken kareyi verir.
4. Değilse en çok dörtlü çizginin geçtiği orta sütunları tercih et; oyunlar farklı olsun diye biraz rastgelelikle.

1'den 3'e kadar olan kuralların hilesi **bir hamleyi deneyip geri almaktır**: tahtaya bir disk koy, `wins4`'e sor, yeniden
kaldır. Bilgisayar hamleyi gerçek oyunun kullandığı aynı kodla "hayal eder":

```js
board[row][col] = who
const result = wins4(row, col) !== null
board[row][col] = 0
```

Bu, gerçek oyun yapay zekâsına doğru ilk adımdır: bir hamlenin neye yol açacağına ileriden bakmak. XOX oyunu bunu minimax ile
sonuna kadar götürür; burada bir hamle ilerisi, bilgisayarı çoğu oyuncu için yenmesi zor yapmaya yeter.

Bilgisayar ne olduğunu görebilesin diye hamle yapmadan önce yarım saniye bekler ve yalnızca kendi sıranda disk bırakabilirsin.

# --task--

1. You are player 1 (red), the computer player 2 (yellow). Add `thinking`: when the turn passes to the computer, set it to
   `30` frames; `update()` counts it down while nothing is falling, and at `0` plays `computerMove()`.
2. Write `winsWith(col, who)`: whether dropping `who` in that column would win (try it, check, take it back).
3. Write `computerMove()` with the four rules above. For rule 3, a column is unsafe if, after the computer's disc in it,
   the player would win in the same column. For rule 4 score each column `-Math.abs(col - 3) + Math.random() * 0.5` once
   and take the best.
4. Clicks and keys only play on your turn. The hovering disc shows only on your turn, and the messages become
   `Your turn`, `Computer...`, `You win! Click to play again` and `Computer wins. Click to play again`.

# --task-tr--

1. Sen 1. oyuncusun (kırmızı), bilgisayar 2. oyuncu (sarı). `thinking` ekle: sıra bilgisayara geçince onu `30` kare yap;
   `update()` hiçbir şey düşmezken onu geri sayar ve `0`'da `computerMove()` oynar.
2. `winsWith(col, who)` yaz: `who`'yu o sütuna bırakmak kazandırır mı (dene, kontrol et, geri al).
3. Yukarıdaki dört kuralla `computerMove()` yaz. 3. kural için bir sütun, bilgisayarın diski oraya düştükten sonra oyuncu aynı
   sütunda kazanacaksa güvensizdir. 4. kural için her sütunu bir kez `-Math.abs(col - 3) + Math.random() * 0.5` ile puanla ve
   en iyisini al.
4. Tıklamalar ve tuşlar yalnızca senin sıranda oynar. Süzülen disk yalnızca senin sıranda görünür ve mesajlar `Your turn`,
   `Computer...`, `You win! Click to play again` ve `Computer wins. Click to play again` olur.

# --tests--

The computer should take a win, and block yours.
tr: Bilgisayar kazancı almalı ve seninkini engellemeli.

```js
board[5][0] = board[5][1] = board[5][2] = 2
assert.strictEqual(computerMove(), 3)
reset()
board[5][0] = board[5][1] = board[5][2] = 1
assert.strictEqual(computerMove(), 3)
assert.isTrue(winsWith(3, 1))
assert.strictEqual(board[5][3], 0, 'trying a move must take it back')
```

The computer should not play under a hole where you would win.
tr: Bilgisayar kazanacağın bir deliğin altına oynamamalı.

```js
board[5] = [2, 2, 1, 0, 0, 0, 0]
board[4] = [1, 1, 1, 0, 0, 0, 0]
for (let i = 0; i < 20; i++) {
  const col = computerMove()
  assert.notStrictEqual(col, 3, 'a disc in column 3 would let red win on top of it')
  assert.include([2, 4], col, 'otherwise as close to the middle as possible')
}
```

On an empty board the computer should take the middle.
tr: Boş bir tahtada bilgisayar ortayı almalı.

```js
turn = 2
assert.strictEqual(computerMove(), 3)
```

The computer should answer your move after a short pause, and you cannot play for it.
tr: Bilgisayar hamlene kısa bir duraklamadan sonra cevap vermeli ve onun yerine oynayamazsın.

```js
$.click(32, 300) // column 0
$.tick(28)
assert.strictEqual(turn, 2)
assert.include($.texts(), 'Computer...')
$.click(96, 300)
$.tick(20)
assert.strictEqual(board[5][1], 0, 'not your turn')
$.tick(60)
assert.strictEqual(turn, 1)
assert.strictEqual(board.flat().filter((cell) => cell === 2).length, 1)
assert.include($.texts(), 'Your turn')
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
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 is you, player 2 the computer
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
]

let board // board[row][col]: 0 empty, 1 or 2
let turn
let winner // 0 while playing, 1 or 2, or 'draw'
let line // the four winning cells
let falling // the disc on its way down, or null
let hoverCol = 3
let thinking // frames until the computer moves

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  winner = 0
  line = []
  falling = null
  thinking = 0
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

const inside = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS

// Count the discs in a row through (row, col) in one direction and its opposite.
function lineThrough(row, col, [dx, dy]) {
  const who = board[row][col]
  const cells = [[row, col]]
  for (const sign of [1, -1]) {
    let r = row + dy * sign
    let c = col + dx * sign
    while (inside(r, c) && board[r][c] === who) {
      cells.push([r, c])
      r += dy * sign
      c += dx * sign
    }
  }
  return cells
}

function wins4(row, col) {
  for (const dir of DIRECTIONS) {
    const cells = lineThrough(row, col, dir)
    if (cells.length >= 4) return cells
  }
  return null
}

function play(col) {
  if (winner || falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
  const four = wins4(row, col)
  if (four) {
    winner = who
    line = four
  } else if (board[0].every((cell) => cell !== 0)) {
    winner = 'draw'
  } else {
    turn = 3 - turn
    if (turn === 2) thinking = 30
  }
}

// Would dropping in this column win for `who`? Try it, look, and take it back.
function winsWith(col, who) {
  const row = dropRow(col)
  if (row === -1) return false
  board[row][col] = who
  const result = wins4(row, col) !== null
  board[row][col] = 0
  return result
}

function computerMove() {
  const open = [...Array(COLS).keys()].filter((col) => dropRow(col) !== -1)
  // 1. Win if we can. 2. Block the player's win.
  for (const who of [2, 1]) {
    const col = open.find((c) => winsWith(c, who))
    if (col !== undefined) return col
  }
  // 3. Do not play right under a square where the player would win.
  const safe = open.filter((col) => {
    const row = dropRow(col)
    if (row === 0) return true
    board[row][col] = 2
    const danger = winsWith(col, 1)
    board[row][col] = 0
    return !danger
  })
  const choices = safe.length > 0 ? safe : open
  // 4. Prefer the middle, where most lines of four pass; a little randomness breaks ties.
  let best = choices[0]
  let bestScore = -Infinity
  for (const col of choices) {
    const score = -Math.abs(col - 3) + Math.random() * 0.5
    if (score > bestScore) {
      best = col
      bestScore = score
    }
  }
  return best
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
  if (winner) {
    reset()
    return
  }
  hoverCol = colAt(event)
  if (turn === 1) play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    if (winner) reset()
    else if (turn === 1) play(hoverCol)
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
    return
  }
  if (!winner && turn === 2) {
    thinking -= 1
    if (thinking <= 0) play(computerMove())
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
  if (!winner && !falling && turn === 1) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[1])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  // The falling disc goes over the board, on its way to its hole.
  if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])

  for (const [row, col] of line) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(col * CELL + CELL / 2, TOP + row * CELL + CELL / 2, CELL / 2 - 10, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? 'Your turn' : 'Computer...'
  if (winner === 1) message = 'You win! Click to play again'
  if (winner === 2) message = 'Computer wins. Click to play again'
  if (winner === 'draw') message = 'Draw. Click to play again'
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
