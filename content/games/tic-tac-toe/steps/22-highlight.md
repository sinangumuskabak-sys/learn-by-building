---
title: Light up the winning line
title_tr: Kazanan çizgiyi parlat
skills: [game.canvas, prog.loops]
---

# --goal--

A small touch that makes a big difference: after dimming, we light up the three winning cells with a see-through
yellow, so the player sees at once why the round ended.

# --goal-tr--

Küçük ama etkili bir dokunuş: karartmadan sonra **kazanan üç kutuyu** yarı saydam sarıyla parlatacağız. Oyuncu turun
**neden** bittiğini hemen görür.

Üstelik bedava: `winningLine` hangi üç kutuyu boyayacağımızı zaten söylüyor.

# --code--

```js
// Dim the board, then light up the winning line on top so it stands out.
ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
ctx.fillRect(0, 0, canvas.width, canvas.height)
const line = winningLine(board)
if (line) {
  ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'
  for (const index of line) ctx.fillRect((index % 3) * CELL, Math.floor(index / 3) * CELL, CELL, CELL)
}
```

# --meaning--

- `winningLine(board)` gives the three winning cell numbers, or `undefined` after a draw (then nothing is lit).
- `for (const index of line)` repeats for each of the three numbers; a one-line body needs no braces.
- Each cell's top-left corner uses the column and row formulas from before.

# --meaning-tr--

- İlk satır bir yorum: ne yaptığımızı anlatan not.
- `const line = winningLine(board)` → kazanan çizginin üç kutu numarası. Beraberlikte `undefined`: o zaman
  `if (line)` içi çalışmaz, parlatacak bir şey yok.
- `'rgba(250, 204, 21, 0.25)'` → çeyrek güçte sarı: karartılmış kutuyu aydınlatır ama işaret görünmeye devam eder.
- `for (const index of line)` → "çizgideki **her numara** için, ona `index` de ve şunu yap". Yapılacak iş tek satırsa
  süslü parantez gerekmez.
- `(index % 3) * CELL, Math.floor(index / 3) * CELL` → 9. adımdaki formüller, bu sefer `+ CELL / 2` olmadan: kutunun
  **sol üst köşesi**. `CELL, CELL` → tam bir kutu boyu.

# --task--

In `draw`, add the comment above the dimming lines, and the `line` lines right under the dimming `fillRect`.

# --task-tr--

1. `draw` içindeki `if (result) {` satırının altına yorum satırını yaz.
2. Karartan `ctx.fillRect(0, 0, ...)` satırının **altına** `const line` satırını ve `if (line)` bloğunu yaz. Yazı
   satırları (`'white'` ile başlayanlar) altta kalsın.
3. **Çalıştır** ve bir turu kazan: üç kutu sarımsı parlamalı.

# --predict--

The round ends in a draw. What does the new code light up?
- [ ] All nine cells
- [x] Nothing
  After a draw `winningLine` returns `undefined`, so the `if (line)` block is skipped.
- [ ] The last cell played

# --predict-tr--

Tur berabere bitiyor. Yeni kod neyi parlatır?
- [ ] Dokuz kutunun hepsini
- [x] Hiçbir şeyi
  Beraberlikte `winningLine` `undefined` döner; `if (line)` bloğu atlanır.
- [ ] Son oynanan kutuyu

# --tests--

The winning cells should light up.
tr: Kazanan kutular parlamalı.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
draw()
const glow = $.rects('rgba(250, 204, 21, 0.25)').map((r) => [r.x, r.y, r.w, r.h])
assert.sameDeepMembers(glow, [[0, 0, 100, 100], [100, 0, 100, 100], [200, 0, 100, 100]])
```

A diagonal should light up too, and the text stays on top.
tr: Çapraz da parlamalı; yazı yine en üstte kalmalı.

```js
for (const index of [2, 0, 4, 1, 6]) play(index)
draw()
const glow = $.rects('rgba(250, 204, 21, 0.25)').map((r) => [r.x, r.y])
assert.sameDeepMembers(glow, [[200, 0], [100, 100], [0, 200]])
const ops = $.screen().map((c) => c.op)
assert.strictEqual(ops[ops.length - 1], 'fillText')
```

Nothing should light up after a draw.
tr: Beraberlikte hiçbir şey parlamamalı.

```js
for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) play(index)
draw()
assert.lengthOf($.rects('rgba(250, 204, 21, 0.25)'), 0)
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]

let board = ['', '', '', '', '', '', '', '', '']
let player = 'X'
let result = null // null while playing, then 'X', 'O' or 'draw'

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  return true
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
  play(index)
  draw()
})

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })

  if (result) {
    // Dim the board, then light up the winning line on top so it stands out.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const line = winningLine(board)
    if (line) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'
      for (const index of line) ctx.fillRect((index % 3) * CELL, Math.floor(index / 3) * CELL, CELL, CELL)
    }
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result === 'draw' ? "It's a draw" : result + ' wins!', canvas.width / 2, 140)
  }
}

draw()
```
