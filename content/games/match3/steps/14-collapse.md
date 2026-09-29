---
title: Let the gems fall
title_tr: Mücevherler düşsün
skills: [prog.arrays, prog.loops]
---

# --goal--

Gravity: in every column the gems above a gap fall down to fill it, and new random gems fill the top. Two counters do
it in one pass from the bottom up: `r` reads, `write` points to the lowest place still to fill.

# --goal-tr--

Şimdi **yerçekimi**: her sütunda deliklerin üstündeki mücevherler aşağı düşüp delikleri doldursun; yukarıda açılan
yerlere yeni rastgele mücevherler gelsin.

Bir sütunu **aşağıdan yukarı** gezeceğiz, iki sayaçla:

- `r` → okuduğumuz hücre;
- `write` → henüz doldurulmamış **en alttaki** yer.

Bulduğumuz her mücevheri `write`'a kopyalar, `write`'ı bir yukarı çıkarırız. Delikleri atlarız. Sonunda `write`'ın
üstünde kalan yerler yeni mücevherlerle dolar. Buna **iki işaretçi** (two pointers) yöntemi denir.

# --code--

```js
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

  collapse()
```

# --meaning--

- For each column, `write` starts at the bottom row.
- `r` goes up from the bottom (`r--`). Gaps are skipped; each gem is copied down to `write`, and `write` moves up.
- The gems keep their order, and the gaps end up at the top, from row `write` up to 0: they get new random gems.
- `trySwap` calls `collapse()` right after clearing.

# --meaning-tr--

- `for (let c = 0; c < N; c++) {` → her sütun için ayrı ayrı.
- `let write = N - 1` → doldurulacak ilk yer: en alt satır (7).
- `for (let r = N - 1; r >= 0; r--) {` → `r` 7'den 0'a **geri sayar** (`r--` 1 azaltır): aşağıdan yukarı.
  - `if (board[r][c] < 0) continue` → delikse atla.
  - `board[write][c] = board[r][c]` → mücevheri aşağıdaki boş yere indir. (Delik yoksa `write` ile `r` aynıdır;
    mücevher kendi yerine yazılır.)
  - `write--` → bir sonraki boş yer bir üstte.
- `for (let r = write; r >= 0; r--) board[r][c] = randomGem()` → `write`'tan yukarısı arta kaldı: yeni mücevherler.
- Örnek: bir deliği olan sütunda 7 mücevher birer aşağı iner, `write` 0'da kalır ve yalnız 0. satıra yeni mücevher
  gelir.
- `collapse()` (`trySwap` içinde) → silmeden hemen sonra.

# --task--

1. Above `function cellAt(event) {` write the comment and `collapse`.
2. In `trySwap`, call `collapse()` above `return true`.

# --task-tr--

1. `function cellAt(event) {` satırının **üstüne** yorum satırını ve `collapse` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. `trySwap` içinde en sondaki `return true` satırının **üstüne** `collapse()` yaz.
3. **Çalıştır** ve üçlüler yap: delikler anında dolmalı.

# --predict--

The fallen and new gems can line up by chance. What happens to such a new row of three?
- [ ] It is cleared at once
- [x] It stays on the board
  Nothing looks for matches after the fall yet. We add that soon.
- [ ] The game ends

# --predict-tr--

Düşen ve yeni gelen mücevherler şans eseri sıraya girebilir. Böyle yeni bir üçlüye ne olur?
- [ ] Hemen silinir
- [x] Tahtada kalır
  Düşüşten sonra eşleşme arayan bir şey henüz yok. Birazdan ekleyeceğiz.
- [ ] Oyun biter

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

After a matching swap the board should be full again.
tr: Eşleşen bir takastan sonra tahta yine dolu olmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) assert.isAtLeast(board[r][c], 0)
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
  const matched = findMatches()
  score += matched.size * 10
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
  collapse()
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
