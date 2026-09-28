---
title: Flash and fall
title_tr: Parla ve düş
skills: [game.state, game.loop]
---

# --explanation--

The game works, but it is instant: one click and the board is already different. Players need to **see** what happened. So
the `while` loop from the last step is broken into **phases** that play out over frames:

| phase | what happens | then |
|---|---|---|
| `'idle'` | waiting for the player | a matching swap → `'clearing'` |
| `'clearing'` | the matched gems flash for 14 frames | `collapse()` → `'falling'` |
| `'falling'` | gems slide down into place | new matches → `'clearing'`, otherwise `'idle'` |

This is a **state machine**: the loop is the same, the `update()` function asks "which phase are we in?" each frame. Clicks
are ignored unless the phase is `'idle'`, so the player cannot swap gems in the middle of a fall.

The falling is a drawing trick. The board data changes at once in `collapse()`, but each gem remembers how many pixels
**above** its new place it used to be, in `drop[r][c]`. A gem that fell two rows starts with `drop = 96`, a new gem starts
above the board. Every frame each `drop` shrinks by `FALL` pixels until it reaches `0`, and the gem is drawn at
`y - drop[r][c]`. When no gem is moving any more, the fall is over.

# --explanation-tr--

**Bu adımda:** oyunu gözle takip edilebilir yapacağız. Eşleşen mücevherler bir an beyaz yanıp sönecek, sonra
kaybolacak; üsttekiler **kayarak** aşağı inecek, yenileri tahtanın üstünden süzülerek düşecek. Her şey yere inene
kadar tıklamalar beklenecek.

**Sorun.** Oyun çalışıyor ama her şey bir anda oluyor: bir tıklama ve tahta çoktan değişmiş. Oyuncu neyin olduğunu
**görmeli**. Bir önceki adımdaki `while` döngüsü her şeyi tek karede bitiriyordu; onu karelere yayılan **evrelere**
bölüyoruz:

| evre | ne olur | sonra |
|---|---|---|
| `'idle'` | oyuncuyu bekler | eşleşen bir takas → `'clearing'` |
| `'clearing'` | eşleşen mücevherler 14 kare yanıp söner | `collapse()` → `'falling'` |
| `'falling'` | mücevherler yerlerine kayar | yeni eşleşme → `'clearing'`, yoksa `'idle'` |

**Durum makinesi (state machine).** Döngü aynı kalır; yeni `update()` fonksiyonu her karede "hangi evredeyiz?"
diye sorar ve o evrenin işini biraz ilerletir. `loop()` onu `draw()`'dan önce çağırır. Tıklamalar yalnızca `'idle'`
evresinde kabul edilir; oyuncu düşüşün ortasında takas yapamaz.

**Sayaç.** `timer = 14` ile başlar, her karede bir azalır (`timer -= 1`); 0 olunca yanıp sönme biter. Yanıp sönme:
`Math.floor(timer / 3) % 2 === 0` birkaç karede bir doğru/yanlış arasında gidip gelir; doğruyken mücevher beyaz
çizilir. `matched.has(sayı)` "bu hücre kümede var mı?" diye sorar.

**Düşme bir çizim hilesidir.** Tahta verisi `collapse()`'ta bir anda değişir. Ama her mücevher yeni yerinin kaç
piksel **üstünde** olduğunu `drop[r][c]`'de hatırlar. İki satır düşen bir mücevher `drop = 96` (2 × 48) ile başlar;
yeni bir mücevher tahtanın üstünden başlar. Her karede her `drop` `FALL` (8) piksel küçülür, 0'a inene kadar;
mücevher `y - drop[r][c]`'de çizilir. Hiçbir mücevher hareket etmiyorsa düşüş bitmiştir.

- `Math.max(0, drop - FALL)` iki sayının **büyüğünü** verir: `drop` 0'ın altına inmez.
- `let moving = false` ile başlarız; herhangi bir mücevher hâlâ havadaysa `true` yaparız. Döngü bitince hâlâ
  `false` ise herkes yere inmiştir.
- `drop = board.map((row) => row.map(() => 0))` tahta boyutunda, her yeri `0` olan bir ızgara yapar.

Artık sıfırlanan tahtada `matched` ve `chain` fonksiyonlar arasında paylaşıldığı için yukarıda `let` ile
tanımlanır; `trySwap` içindeki yerel `chain` ve `matched` ortadan kalkar.

# --task--

1. Add `FALL = 8`, and `phase` (`'idle'` in `reset()`), `timer`, `matched`, `chain` and `drop` (a grid of zeros in `reset()`).
2. Write `startClearing()`: set `matched = findMatches()`, add 1 to `chain`, score `matched.size * 10 * chain`, and set
   `phase = 'clearing'`, `timer = 14`. In `trySwap`, a matching swap now sets `chain = 0` and calls `startClearing()`.
3. `collapse()` now empties the `matched` cells itself, sets each moved gem's `drop` to `(write - r) * SIZE`, each new gem's
   to `(write + 1) * SIZE`, and sets `phase = 'falling'`.
4. Write `update()`, called before `draw()`: in `'clearing'`, count `timer` down and `collapse()` at `0`; in `'falling'`, shrink
   every `drop` by `FALL` (not below `0`), and once none is above `0`, `startClearing()` if there are matches, otherwise go
   back to `'idle'`.
5. Ignore clicks unless `phase === 'idle'`. Draw each gem `drop[r][c]` pixels higher, and white (`'#ffffff'`) instead of its
   color while it is `matched` in `'clearing'` and `Math.floor(timer / 3) % 2 === 0`.

# --task-tr--

1. `const COLORS = ...` satırının hemen **altına** düşme hızını ekle:

   ```js
   const FALL = 8 // pixels a gem falls per frame
   ```

2. `let score` satırının hemen **altına** beş değişken ekle:

   ```js
   let chain // how many clears in a row this move has caused
   let phase // 'idle', 'clearing' (matched gems flash) or 'falling'
   let timer
   let matched // the cells being cleared
   let drop // drop[row][col]: how many pixels above its place a gem is still drawn
   ```

3. `reset()` fonksiyonunun sonuna iki satır ekle:

   ```js
     score = 0
     phase = 'idle'                               // ← yeni
     drop = board.map((row) => row.map(() => 0))  // ← yeni
   }
   ```

4. `trySwap()` içinde `// Clear the matches...` yorumundan `return true`'dan önceki `}`'ye kadar olan kısmı
   (`let chain`, `let matched` ve bütün `while` döngüsü) sil. Fonksiyon şöyle olmalı; altına da `startClearing()`'i
   yaz:

   ```js
   function trySwap(a, b) {
     if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
     swap(a, b)
     if (findMatches().size === 0) {
       swap(a, b) // no match: the gems go back
       return false
     }
     chain = 0        // ← yeni
     startClearing()  // ← yeni
     return true
   }

   function startClearing() {
     matched = findMatches()
     chain += 1
     score += matched.size * 10 * chain // cascades are worth more and more
     phase = 'clearing'
     timer = 14
   }
   ```

5. `collapse()` fonksiyonunu tamamen şununla değiştir:

   ```js
   // Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
   function collapse() {
     for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1   // ← yeni
     for (let c = 0; c < N; c++) {
       let write = N - 1
       for (let r = N - 1; r >= 0; r--) {
         if (board[r][c] < 0) continue
         board[write][c] = board[r][c]
         drop[write][c] = (write - r) * SIZE                                  // ← yeni
         write--
       }
       for (let r = write; r >= 0; r--) {                                     // ← değişti
         board[r][c] = randomGem()
         drop[r][c] = (write + 1) * SIZE                                      // ← yeni
       }
     }
     phase = 'falling'                                                        // ← yeni
   }
   ```

   `write - r` mücevherin kaç satır düştüğü. Yeni mücevherler, boşluk sayısı (`write + 1`) kadar satır yukarıdan
   başlar.

6. `collapse()`'ın altına `update()` fonksiyonunu yaz:

   ```js
   function update() {
     if (phase === 'clearing') {
       timer -= 1
       if (timer === 0) collapse()
       return
     }
     if (phase === 'falling') {
       let moving = false
       for (let r = 0; r < N; r++) {
         for (let c = 0; c < N; c++) {
           drop[r][c] = Math.max(0, drop[r][c] - FALL)
           if (drop[r][c] > 0) moving = true
         }
       }
       if (moving) return
       // Landed: new matches make a cascade; otherwise the move is over.
       if (findMatches().size > 0) startClearing()
       else phase = 'idle'
     }
   }
   ```

7. Tıklama dinleyicisinin ilk satırı olarak ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (phase !== 'idle') return // ← yeni
     const cell = cellAt(event)
   ```

8. `draw()` içinde, `if (gem < 0) continue` satırından sonraki mücevher çizimini şöyle değiştir:

   ```js
         if (gem < 0) continue
         const flashing = phase === 'clearing' && matched.has(r * N + c) && Math.floor(timer / 3) % 2 === 0 // ← yeni
         ctx.fillStyle = flashing ? '#ffffff' : COLORS[gem]                                                  // ← değişti
         ctx.beginPath()
         ctx.arc(x + SIZE / 2, y + SIZE / 2 - drop[r][c], SIZE / 2 - 6, 0, Math.PI * 2)                     // ← değişti
         ctx.fill()
   ```

9. En alttaki `loop()` fonksiyonunda `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

10. **Çalıştır**'a bas. Bir üçlü yap: mücevherler beyaz yanıp sönmeli, sonra üsttekiler kayarak inmeli ve yenileri
    yukarıdan düşmeli. Alttaki kontrollerin hepsi yeşil olmalı. Hiçbir şey düşmüyorsa `loop()` içine `update()`'i
    eklediğini kontrol et.

# --tests--

A matching swap should first flash the matched gems, then drop new gems in from above.
tr: Eşleşen bir takas önce eşleşen mücevherleri yakıp söndürmeli, sonra yeni mücevherleri yukarıdan düşürmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
assert.strictEqual(phase, 'clearing')
assert.strictEqual(score, 30)
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'the matched gems stay while they flash')
$.tick(2)
assert.lengthOf($.arcs().filter((a) => a.color === '#ffffff'), 3, 'they flash white')
$.tick(12)
assert.strictEqual(phase, 'falling')
assert.isAbove(drop[0][0], 0, 'the new gem starts above the board')
```

Clicks should wait until everything has landed, and then the board should be quiet.
tr: Tıklamalar her şey yere inene kadar beklemeli, sonra tahta sakin olmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
$.click(32 + 48 * 6, 96 + 48 * 6)
assert.isNull(selected, 'clicks wait until the gems land')
for (let i = 0; i < 300 && phase !== 'idle'; i++) $.tick(1)
assert.strictEqual(phase, 'idle')
assert.strictEqual(findMatches().size, 0)
for (const row of drop) for (const d of row) assert.strictEqual(d, 0)
```

A gem that fell one row should start one row higher and slide down `FALL` pixels per frame.
tr: Bir satır düşen bir mücevher bir satır yukarıdan başlamalı ve her karede `FALL` piksel aşağı kaymalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
matched = new Set([7 * N + 3])
collapse()
assert.strictEqual(board[7][3], (6 + 6) % 6, 'the gem above fell into the gap')
assert.strictEqual(drop[7][3], 48)
assert.strictEqual(drop[0][3], 48, 'the new gem starts one row above')
$.tick(1)
assert.strictEqual(drop[7][3], 48 - FALL)
assert.deepInclude($.arcs(), { x: 32 + 48 * 3, y: 96 + 48 * 7 - 48 + FALL, r: 18, color: COLORS[board[7][3]] })
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
const FALL = 8 // pixels a gem falls per frame

let board // board[row][col]: a color index, or -1 while empty
let selected
let score
let chain // how many clears in a row this move has caused
let phase // 'idle', 'clearing' (matched gems flash) or 'falling'
let timer
let matched // the cells being cleared
let drop // drop[row][col]: how many pixels above its place a gem is still drawn

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
  phase = 'idle'
  drop = board.map((row) => row.map(() => 0))
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
  chain = 0
  startClearing()
  return true
}

function startClearing() {
  matched = findMatches()
  chain += 1
  score += matched.size * 10 * chain // cascades are worth more and more
  phase = 'clearing'
  timer = 14
}

// Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
function collapse() {
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
  for (let c = 0; c < N; c++) {
    let write = N - 1
    for (let r = N - 1; r >= 0; r--) {
      if (board[r][c] < 0) continue
      board[write][c] = board[r][c]
      drop[write][c] = (write - r) * SIZE
      write--
    }
    for (let r = write; r >= 0; r--) {
      board[r][c] = randomGem()
      drop[r][c] = (write + 1) * SIZE
    }
  }
  phase = 'falling'
}

function update() {
  if (phase === 'clearing') {
    timer -= 1
    if (timer === 0) collapse()
    return
  }
  if (phase === 'falling') {
    let moving = false
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        drop[r][c] = Math.max(0, drop[r][c] - FALL)
        if (drop[r][c] > 0) moving = true
      }
    }
    if (moving) return
    // Landed: new matches make a cascade; otherwise the move is over.
    if (findMatches().size > 0) startClearing()
    else phase = 'idle'
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
  if (phase !== 'idle') return
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
      const flashing = phase === 'clearing' && matched.has(r * N + c) && Math.floor(timer / 3) % 2 === 0
      ctx.fillStyle = flashing ? '#ffffff' : COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2 - drop[r][c], SIZE / 2 - 6, 0, Math.PI * 2)
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
