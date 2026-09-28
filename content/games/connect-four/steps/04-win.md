---
title: Four in a row
title_tr: Dördü yan yana
skills: [prog.arrays, game.state]
---

# --explanation--

You could check the whole board for four in a row after every move, but there is a smarter observation: a new line of
four must go **through the disc that just landed**. So only look around that one disc.

A line goes in one of four directions: across `[1, 0]`, down `[0, 1]`, and the two diagonals `[1, 1]` and `[1, -1]`. For
each direction, start at the new disc and walk **both ways** while the discs are the same color, counting as you go:

```js
for (const sign of [1, -1]) {
  let r = row + dy * sign
  let c = col + dx * sign
  while (inside(r, c) && board[r][c] === who) { ...count, then step again... }
}
```

If any direction gives 4 or more, that player wins. Walking both ways matters: a disc dropped into the **middle** of a
gap (`X X _ X`) completes a line even though it is not at either end.

If the top row is full and nobody has won, the board is full: a draw. The winning cells are circled in white, and a
click starts a new game.

# --explanation-tr--

**Bu adımda:** oyun kazananı bulacak. Aynı renkten dört disk yan yana, alt alta ya da çapraz gelince o dört diskin
etrafına beyaz halka çizilecek ve üstte `Red wins! Click to play again` (Kırmızı kazandı! Yeniden oynamak için
tıkla) yazacak. Tahta kimse kazanmadan dolarsa `Draw` (berabere) yazacak.

**Akıllıca bir gözlem.** Her hamleden sonra bütün tahtada dörtlü arayabilirdin. Ama yeni bir dörtlü mutlaka **az
önce inen diskten geçer**. O yüzden sadece o diskin çevresine bakarız.

**Dört yön.** Bir çizgi dört yönden birinde uzanır: yatay `[1, 0]`, dikey `[0, 1]` ve iki çapraz `[1, 1]` ile
`[1, -1]`. Her çift "bir adımda sütun (`dx`) ve satır (`dy`) ne kadar değişir" demektir.

**İki yöne yürümek.** Her yön için yeni diskten başlar, disk aynı renk olduğu sürece **iki yöne de** yürür ve
sayarız:

```js
for (const sign of [1, -1]) {
  let r = row + dy * sign
  let c = col + dx * sign
  while (inside(r, c) && board[r][c] === who) {
    cells.push([r, c])
    r += dy * sign
    c += dx * sign
  }
}
```

Bunu parça parça okuyalım:

- `for (const sign of [1, -1])` → "dizideki her değer için": önce `sign = 1` (ileri), sonra `sign = -1` (geri).
- `while (koşul) { ... }` → yeni bir döngü türü: "koşul doğru **olduğu sürece** tekrarla". Kaç kez döneceğini
  önceden bilmediğimizde kullanılır: aynı renk bitene kadar yürürüz.
- `inside(r, c)` → tahtanın içinde miyiz? Dışarı taşarsak `board[r]` yok olur, bu yüzden önce bunu sorarız.
  `&&` sayesinde ilk koşul yanlışsa ikincisine hiç bakılmaz.
- `cells.push([r, c])` → bulunan hücreyi listeye ekle (`push` dizinin sonuna ekler). Liste yeni diskle başlar:
  `const cells = [[row, col]]`.

Herhangi bir yönde 4 ya da daha fazla hücre bulunursa o oyuncu kazanır. İki yöne yürümek önemli: boşluğun
**ortasına** atılan bir disk (`X X _ X`) ucunda olmasa da dörtlüyü tamamlar.

**Yeni yazımlar.**

- `const inside = (row, col) => ...` → bir fonksiyonu bir sabitte saklamak. `=>`'dan sonra süslü parantez yoksa
  sağdaki sonuç doğrudan geri verilir.
- `function lineThrough(row, col, [dx, dy])` → üçüncü bilgi bir dizi olarak gelir; köşeli parantezli yazım onun
  iki elemanına `dx` ve `dy` adlarını verir. Aynı şekilde `for (const [row, col] of line)` her `[satır, sütun]`
  çiftini açar.
- `board[0].every((cell) => cell !== 0)` → "en üst satırın **her** hücresi dolu mu?" Doluysa tahta tamamen
  doludur.
- `else if` → "değilse, eğer...". Kazanma yoksa berabereliğe, o da yoksa sıra değişimine bakarız.

**Halka çizmek.** Daireyi boyamak yerine sadece **kenarını** çizmek için `fill` yerine `stroke` kullanılır:
`ctx.strokeStyle` çizgi rengi, `ctx.lineWidth` çizgi kalınlığıdır.

**Kazanan durum.** `winner` oynarken `0`, sonra `1`, `2` ya da `'draw'`. `0` "yok" sayıldığı için `if (winner)`
"oyun bittiyse" demektir. Oyun bitince tıklama ya da tuş `reset()` ile yeni oyun başlatır.

# --task--

1. Add `DIRECTIONS` (the four above), `winner` (`0` while playing, `1`, `2` or `'draw'`) and `line` (the winning cells).
2. Write `inside(row, col)`, `lineThrough(row, col, [dx, dy])` returning the list of `[row, col]` cells of the same color
   through that cell in that direction (both ways), and `wins4(row, col)` returning the first such list with 4 or more
   cells, or `null`.
3. In `land()`: if the new disc wins, set `winner` and `line`; else if the top row is full, it is a `'draw'`; otherwise
   switch turns. `play` does nothing once there is a winner, and a click or key then calls `reset()`.
4. Circle each winning cell with a white 4-pixel line (radius `CELL / 2 - 10`), and show `Red wins! Click to play again`,
   `Yellow wins! Click to play again` or `Draw. Click to play again`.

# --task-tr--

1. `const COLORS = ...` satırının altına dört yönü ekle:

   ```js
   const DIRECTIONS = [
     [1, 0],
     [0, 1],
     [1, 1],
     [1, -1],
   ]
   ```

2. `let turn` satırının altına iki değişken ekle:

   ```js
   let winner // 0 while playing, 1 or 2, or 'draw'
   let line // the four winning cells
   ```

3. `reset()` fonksiyonunda `turn = 1` satırının altına ekle:

   ```js
     turn = 1
     winner = 0 // ← yeni
     line = [] // ← yeni
     falling = null
   ```

4. `dropRow` fonksiyonunun altına (`function play`'den önce) bir boş satır bırak ve şunları yaz:

   ```js
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
   ```

5. `play()` fonksiyonunun ilk satırına `winner ||` ekle:

   ```js
     if (winner || falling || dropRow(col) === -1) return // ← değişti
   ```

6. `land()` fonksiyonunu şöyle değiştir (son satır olan `turn = 3 - turn` artık `else`'in içinde):

   ```js
   function land() {
     const { col, row, who } = falling
     board[row][col] = who
     falling = null
     const four = wins4(row, col) // ← yeni
     if (four) { // ← yeni
       winner = who // ← yeni
       line = four // ← yeni
     } else if (board[0].every((cell) => cell !== 0)) { // ← yeni
       winner = 'draw' // ← yeni
     } else { // ← yeni
       turn = 3 - turn
     } // ← yeni
   }
   ```

7. `pointerdown` dinleyicisinin başına oyun bitti kontrolünü ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (winner) { // ← yeni
       reset() // ← yeni
       return // ← yeni
     } // ← yeni
     hoverCol = colAt(event)
     play(hoverCol)
   })
   ```

8. `keydown` dinleyicisinde, `event.preventDefault()`'tan sonraki `play(hoverCol)` satırını iki satırla değiştir:

   ```js
       event.preventDefault()
       if (winner) reset() // ← yeni
       else play(hoverCol) // ← değişti
   ```

9. `draw()` fonksiyonunda üç değişiklik:

   - Bekleyen disk satırının koşulunu `if (!winner && !falling)` yap:

     ```js
       if (!winner && !falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn]) // ← değişti
     ```

   - Düşen diski çizen `if (falling) disc(...)` satırının altına halkaları ekle:

     ```js
       for (const [row, col] of line) {
         ctx.strokeStyle = 'white'
         ctx.lineWidth = 4
         ctx.beginPath()
         ctx.arc(col * CELL + CELL / 2, TOP + row * CELL + CELL / 2, CELL / 2 - 10, 0, Math.PI * 2)
         ctx.stroke()
       }
     ```

   - En sondaki `ctx.fillText(turn === 1 ? "Red's turn" : "Yellow's turn", canvas.width / 2, 26)` satırını sil ve
     yerine şunu yaz:

     ```js
       let message = turn === 1 ? "Red's turn" : "Yellow's turn"
       if (winner === 1) message = 'Red wins! Click to play again'
       if (winner === 2) message = 'Yellow wins! Click to play again'
       if (winner === 'draw') message = 'Draw. Click to play again'
       ctx.fillText(message, canvas.width / 2, 26)
     ```

10. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Aynı renkten dört diski yan yana getir: dördünün etrafında
    beyaz halka çıkmalı ve üstte kazanan yazmalı; bir tıklama yeni oyun başlatmalı. Alttaki kontrollerin hepsi
    yeşil olmalı. Ortaya atılan disk dörtlüyü tamamlamıyorsa `lineThrough` içindeki `[1, -1]` (iki yön) kısmını
    kontrol et.

# --tests--

Four across should win, even when the last disc goes into the middle.
tr: Yatay dört kazandırmalı, son disk ortaya gitse bile.

```js
board[5][0] = 1
board[5][1] = 1
board[5][3] = 1
play(2)
$.tick(60)
assert.strictEqual(winner, 1)
assert.sameDeepMembers(line, [[5, 0], [5, 1], [5, 2], [5, 3]])
assert.include($.texts(), 'Red wins! Click to play again')
```

Four down and four diagonally should win too.
tr: Dikey ve çapraz dört de kazandırmalı.

```js
board[5][0] = board[4][0] = board[3][0] = 2
board[2][0] = 2
assert.lengthOf(wins4(2, 0), 4)
reset()
board[5][0] = 1
board[4][1] = 1
board[3][2] = 1
board[2][3] = 1
assert.lengthOf(wins4(3, 2), 4)
assert.lengthOf(lineThrough(3, 2, [1, -1]), 4)
```

Three in a row should not win.
tr: Üç tane yan yana kazandırmamalı.

```js
board[5][0] = 1
board[5][1] = 1
board[5][2] = 1
assert.isNull(wins4(5, 1))
assert.lengthOf(lineThrough(5, 1, [1, 0]), 3)
```

A full board with no four should be a draw, and a click should start again.
tr: Dörtlüsüz dolu bir tahta beraberlik olmalı ve bir tıklama yeniden başlatmalı.

```js
const A = [1, 1, 2, 2, 1, 1, 2]
const B = [2, 2, 1, 1, 2, 2, 1]
board = [A, B, A, B, A, B].map((row) => [...row])
board[0][0] = 0
turn = 1
play(0)
$.tick(60)
assert.strictEqual(winner, 'draw')
assert.include($.texts(), 'Draw. Click to play again')
$.click(100, 300)
assert.strictEqual(winner, 0)
assert.isTrue(board.every((row) => row.every((cell) => cell === 0)))
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
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow
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

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  winner = 0
  line = []
  falling = null
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
  }
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
  play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    if (winner) reset()
    else play(hoverCol)
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
  if (!winner && !falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

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
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  if (winner === 1) message = 'Red wins! Click to play again'
  if (winner === 2) message = 'Yellow wins! Click to play again'
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
