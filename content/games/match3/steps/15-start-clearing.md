---
title: Two halves of a clear
title_tr: Silmenin iki yarısı
skills: [prog.functions, game.state]
---

# --goal--

Everything happens in one instant now: one click and the board has already changed. To show it, the work must be split
in two so the halves can happen at different moments: `startClearing` finds and scores the matches, `collapse`
removes them and lets the gems fall. `matched` moves up to be shared by both.

# --goal-tr--

Oyun çalışıyor ama her şey **bir anda** oluyor: bir tıklama ve tahta çoktan değişmiş. Oyuncu neyin olduğunu
**görmeli**: eşleşen mücevherler bir an yanıp sönmeli, sonra kaybolmalı.

Bunun için işi **iki yarıya** bölüyoruz ki iki yarı farklı anlarda olabilsin:

1. `startClearing()` → eşleşmeleri bul ve puanla;
2. `collapse()` → eşleşenleri sil ve mücevherleri düşür.

İki fonksiyon da eşleşen hücrelere bakacağı için `matched` artık `trySwap`'ın içinde değil, en üstte tanımlı.
Bu adımda ekranda bir şey değişmeyecek; yalnız kodu hazırlıyoruz.

# --code--

```js
let matched // the cells being cleared

  startClearing()
  collapse()

function startClearing() {
  matched = findMatches()
  score += matched.size * 10
}

// Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
function collapse() {
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
```

# --meaning--

- `matched` is now declared at the top, so `startClearing` can fill it and `collapse` can read it later.
- `startClearing` finds and scores; `collapse` first empties the matched cells, then works as before.
- `trySwap` calls the two one after the other, so the game behaves the same for now.

# --meaning-tr--

- `let matched` → eşleşen hücreler; artık en üstte. Bir fonksiyonun içinde `const` ile tanımlanan bir ad yalnız o
  fonksiyonda yaşar; iki fonksiyonun paylaşması için dışarıda olmalı.
- `function startClearing() {` → `matched = findMatches()` (eşleşmeleri bul, başında `const` yok: yukarıdaki
  değişkene yaz) ve puanla.
- `collapse`'ın ilk satırı artık eşleşen hücreleri `-1` yapmak; yorumu da bunu anlatacak şekilde değişiyor.
- `trySwap` içinde üç satırın yerine `startClearing()` ve `collapse()`. Şimdilik ikisi arka arkaya; bir sonraki adımda
  arasına bekleme koyacağız.

# --task--

1. Under `let score` write `let matched`.
2. In `trySwap`, replace the `const matched`, `score` and `for` lines with `startClearing()`.
3. Above the `collapse` comment write `startClearing`.
4. Change the comment above `collapse` and make the `for (const cell of matched) ...` line its first line.

# --task-tr--

1. `let score` satırının altına `let matched ...` yaz.
2. `trySwap` içinde `const matched = ...`, `score += ...` ve `for (const cell of matched) ...` satırlarını sil; yerine
   `startClearing()` yaz (`collapse()` altında kalsın).
3. `collapse`'ın yorum satırının **üstüne** `startClearing` fonksiyonunu yaz.
4. `collapse`'ın yorumunu koddaki gibi değiştir; `for (const cell of matched) ...` satırını `collapse`'ın içinde **ilk
   satır** olarak yaz.
5. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --tests--

A matching swap should leave the cleared cells in `matched`.
tr: Eşleşen bir takas silinen hücreleri `matched`'de bırakmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
assert.sameMembers([...matched], [0, 1, 2])
assert.strictEqual(score, 30)
```

`startClearing` should find and score, and `collapse` should then clear.
tr: `startClearing` bulup puanlamalı, sonra `collapse` silmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[4][1] = board[4][2] = board[4][3] = 2
startClearing()
assert.strictEqual(matched.size, 3)
assert.strictEqual(score, 30)
assert.strictEqual(board[4][2], 2, 'nothing is removed yet')
collapse()
assert.deepEqual(board[4].slice(1, 4), [(3 + 2) % 6, (3 + 4) % 6, (3 + 6) % 6], 'the run is gone; the gems above fell into it')
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
let matched // the cells being cleared

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
  startClearing()
  collapse()
  return true
}

function startClearing() {
  matched = findMatches()
  score += matched.size * 10
}

// Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
function collapse() {
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
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
