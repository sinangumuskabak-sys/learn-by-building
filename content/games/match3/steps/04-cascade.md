---
title: Clear, fall, cascade
title_tr: Temizle, düşür, zincirle
skills: [prog.arrays, game.state]
---

# --explanation--

Now the matched gems disappear. We mark them empty with `-1`, and then **gravity**: in each column, the gems above a gap fall
down to fill it and new random gems drop in at the top.

Gravity is a neat two-pointer trick. Walk a column from the **bottom up** with `r`, and keep a second index `write` for the
lowest spot not yet filled. Every gem found is copied down to `write`, and `write` moves up by one:

```js
let write = N - 1
for (let r = N - 1; r >= 0; r--) {
  if (board[r][c] < 0) continue   // a gap: skip it
  board[write][c] = board[r][c]
  write--
}
// rows 0..write are left over: new gems
```

The gems keep their order, and the empty cells end up at the top, exactly where new ones belong.

The fallen and new gems may line up by themselves. That is a **cascade**, the best moment in the game, so the clearing
repeats in a `while` loop until the board is quiet. Each round of the chain is worth more: the first clear scores 10 per gem,
the second 20, the third 30.

# --explanation-tr--

Şimdi eşleşen mücevherler kaybolur. Onları `-1` ile boş işaretleriz, sonra **yerçekimi**: her sütunda bir boşluğun
üstündeki mücevherler onu doldurmak için aşağı düşer ve tepeden yeni rastgele mücevherler düşer.

Yerçekimi zarif bir iki işaretçi numarasıdır. Bir sütunu `r` ile **aşağıdan yukarı** gez ve henüz doldurulmamış en alçak yer
için ikinci bir sıra `write` tut. Bulunan her mücevher `write`'a kopyalanır ve `write` bir yukarı çıkar:

```js
let write = N - 1
for (let r = N - 1; r >= 0; r--) {
  if (board[r][c] < 0) continue   // bir boşluk: atla
  board[write][c] = board[r][c]
  write--
}
// 0..write satırları arta kaldı: yeni mücevherler
```

Mücevherler sıralarını korur ve boş hücreler tam yeni mücevherlerin gelmesi gereken yere, tepeye düşer.

Düşen ve yeni mücevherler kendiliğinden sıraya girebilir. Bu bir **zincirleme**dir, oyunun en güzel anı; bu yüzden temizleme
tahta sakinleşene kadar bir `while` döngüsünde tekrarlanır. Zincirin her turu daha değerlidir: ilk temizleme mücevher başına
10, ikincisi 20, üçüncüsü 30 puan getirir.

# --task--

1. Add `score` (`0` in `reset()`) and draw `Score 120` at the top left (`LEFT`, `y = 30`, white, `'bold 18px sans-serif'`).
2. Write `collapse()`: in each column, let the gems fall into the `-1` gaps with the two-pointer loop and fill the top with
   `randomGem()`.
3. In `trySwap`, after a swap that matched: start `chain` at `0`, and while `findMatches()` finds cells, add 1 to `chain`, add
   `size * 10 * chain` to `score`, set those cells to `-1` and `collapse()`.
4. Since `board` can now hold `-1`, skip empty cells in `findMatches` and in `draw`.

# --task-tr--

1. `score` ekle (`reset()`'te `0`) ve sol üste `Score 120` çiz (`LEFT`, `y = 30`, beyaz, `'bold 18px sans-serif'`).
2. `collapse()` yaz: her sütunda mücevherleri iki işaretçili döngüyle `-1` boşluklarına düşür ve tepeyi `randomGem()` ile
   doldur.
3. `trySwap`'ta eşleşen bir takastan sonra: `chain`'i `0`'dan başlat ve `findMatches()` hücre buldukça `chain`'e 1 ekle,
   `score`'a `size * 10 * chain` ekle, o hücreleri `-1` yap ve `collapse()` et.
4. `board` artık `-1` tutabildiği için `findMatches`'te ve `draw`'da boş hücreleri atla.

# --tests--

`collapse` should drop the gems above a gap down into it and leave the gems below where they are.
tr: `collapse` bir boşluğun üstündeki mücevherleri ona düşürmeli, alttaki mücevherleri yerinde bırakmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[3][4] = -1
board[5][4] = -1
const above = [0, 1, 2, 4].map((r) => board[r][4])
collapse()
assert.deepEqual([2, 3, 4, 5].map((r) => board[r][4]).join(), above.join(), 'the gems above fall down')
assert.deepEqual([6, 7].map((r) => board[r][4]).join(), [(6 + 8) % 6, (7 + 8) % 6].join(), 'the gems below stay')
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) assert.include([0, 1, 2, 3, 4, 5], board[r][c])
```

After a matching swap, the gems should be cleared and scored, and the board should be full with no matches left.
tr: Eşleşen bir takastan sonra mücevherler temizlenip puanlanmalı; tahta dolu olmalı ve hiç eşleşme kalmamalı.

```js
for (let game = 0; game < 20; game++) {
  board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
  board[0][0] = board[0][1] = board[1][2] = 1
  score = 0
  assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
  assert.isAtLeast(score, 30)
  assert.strictEqual(findMatches().size, 0, 'no matches are left after a move')
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) assert.isAtLeast(board[r][c], 0)
}
```

The score should be drawn.
tr: Puan çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Score 0')
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

let board // board[row][col]: a color index, or -1 while empty
let selected
let score

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
  selected = null
  score = 0
}

// Every cell that is part of three or more of the same color in a row or a column.
function findMatches() {
  const cells = new Set()
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const gem = board[r][c]
      if (gem < 0) continue
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        // Only start counting at the first gem of a run.
        const pr = r - dr
        const pc = c - dc
        if (pr >= 0 && pc >= 0 && board[pr][pc] === gem) continue
        let length = 1
        while (r + dr * length < N && c + dc * length < N && board[r + dr * length][c + dc * length] === gem) length++
        if (length >= 3) for (let i = 0; i < length; i++) cells.add((r + dr * i) * N + (c + dc * i))
      }
    }
  }
  return cells
}

function swap(a, b) {
  const gem = board[a.r][a.c]
  board[a.r][a.c] = board[b.r][b.c]
  board[b.r][b.c] = gem
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  if (findMatches().size === 0) {
    swap(a, b) // no match: the gems go back
    return false
  }
  // Clear the matches, let everything fall, and keep going while the fallen gems make new matches.
  let chain = 0
  let matched = findMatches()
  while (matched.size > 0) {
    chain += 1
    score += matched.size * 10 * chain // cascades are worth more and more
    for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
    collapse()
    matched = findMatches()
  }
  return true
}

// Everything above a gap falls down to fill it, and new gems drop in at the top.
function collapse() {
  for (let c = 0; c < N; c++) {
    let write = N - 1
    for (let r = N - 1; r >= 0; r--) {
      if (board[r][c] < 0) continue
      board[write][c] = board[r][c]
      write--
    }
    for (let r = write; r >= 0; r--) board[r][c] = randomGem()
  }
}

function cellAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SIZE)
  const c = Math.floor(x / SIZE)
  return r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null
}

canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(event)
  if (!cell) return
  if (selected && trySwap(selected, cell)) selected = null
  else selected = selected && selected.r === cell.r && selected.c === cell.c ? null : cell
})

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
      if (gem < 0) continue
      ctx.fillStyle = COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (selected) {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(LEFT + selected.c * SIZE + 2, TOP + selected.r * SIZE + 2, SIZE - 4, SIZE - 4)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
