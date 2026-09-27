---
title: Pick and swap
title_tr: Seç ve takas et
skills: [game.input, prog.arrays]
---

# --explanation--

A move takes two clicks: the first **selects** a gem, the second picks its partner. The rules for the second click decide how
the game feels:

- the same gem again: **unselect** it;
- a **neighbour** (directly left, right, above or below): swap the two;
- any other gem: it becomes the new selection, so a wrong first pick is easy to fix.

"Neighbour" has a short test. Two cells are neighbours when their rows and columns differ by one **in total**; this is the
*Manhattan distance*, and a diagonal has distance 2:

```js
Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1
```

To find the cell under the pointer, convert to canvas pixels (the canvas may be drawn smaller than its real size), subtract
the board's corner, and divide by `SIZE`. Outside the board there is no cell, so `cellAt` returns `null`.

Swapping two array entries needs a temporary variable: after `board[a.r][a.c] = board[b.r][b.c]` the old value of `a` is gone
unless we saved it first.

# --explanation-tr--

Bir hamle iki tıklama sürer: ilki bir mücevheri **seçer**, ikincisi eşini seçer. İkinci tıklamanın kuralları oyunun nasıl
hissettirdiğine karar verir:

- yine aynı mücevher: seçimi **kaldır**;
- bir **komşu** (hemen solu, sağı, üstü ya da altı): ikisini takas et;
- başka herhangi bir mücevher: yeni seçim o olur, böylece yanlış bir ilk seçim kolayca düzelir.

"Komşu"nun kısa bir testi var. İki hücrenin satırları ve sütunları **toplamda** bir farklıysa komşudurlar; bu *Manhattan
uzaklığıdır* ve bir çaprazın uzaklığı 2'dir:

```js
Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1
```

İşaretçinin altındaki hücreyi bulmak için canvas piksellerine çevir (canvas gerçek boyutundan küçük çizilmiş olabilir),
tahtanın köşesini çıkar ve `SIZE`'a böl. Tahtanın dışında hücre yoktur, bu yüzden `cellAt` `null` döndürür.

İki dizi öğesini takas etmek geçici bir değişken ister: `board[a.r][a.c] = board[b.r][b.c]`'den sonra, önceden kaydetmediysek
`a`'nın eski değeri kaybolur.

# --task--

1. Add `selected` (`null` in `reset()`).
2. Write `swap(a, b)` for two cells `{ r, c }`, and `trySwap(a, b)`: if they are not neighbours return `false`, otherwise swap
   them and return `true`.
3. Write `cellAt(event)`: the `{ r, c }` under the pointer, or `null` off the board.
4. On `pointerdown`: if a gem is selected and `trySwap(selected, cell)` works, clear `selected`. Otherwise, clicking the
   selected gem again unselects it and any other gem becomes `selected`.
5. Draw a white (`'#ffffff'`) outline around the selected gem: `lineWidth = 3`, `strokeRect` 2 pixels inside its cell
   (`SIZE - 4` wide).

# --task-tr--

1. `selected` ekle (`reset()`'te `null`).
2. İki `{ r, c }` hücresi için `swap(a, b)` ve `trySwap(a, b)` yaz: komşu değillerse `false` döndür, değilse takas et ve
   `true` döndür.
3. `cellAt(event)` yaz: işaretçinin altındaki `{ r, c }`, tahtanın dışında `null`.
4. `pointerdown`'da: bir mücevher seçiliyse ve `trySwap(selected, cell)` işe yararsa `selected`'ı temizle. Değilse seçili
   mücevhere yeniden tıklamak seçimi kaldırır, başka herhangi bir mücevher `selected` olur.
5. Seçili mücevherin çevresine beyaz (`'#ffffff'`) bir çerçeve çiz: `lineWidth = 3`, hücresinin 2 piksel içinden `strokeRect`
   (`SIZE - 4` genişliğinde).

# --tests--

Clicking a gem should select and outline it; clicking it again, or off the board, should leave nothing selected.
tr: Bir mücevhere tıklamak onu seçmeli ve çerçevelemeli; yeniden ya da tahtanın dışına tıklamak hiçbir şeyi seçili bırakmamalı.

```js
$.click(32 + 48 * 2, 96 + 48 * 3)
assert.deepEqual(selected, { r: 3, c: 2 })
$.tick(1)
const outline = $.screen().filter((d) => d.op === 'strokeRect')
assert.lengthOf(outline, 1)
assert.strictEqual(outline[0].stroke, '#ffffff')
$.click(32 + 48 * 2, 96 + 48 * 3)
assert.isNull(selected, 'clicking the selected gem again unselects it')
$.click(5, 5)
assert.isNull(selected)
```

Clicking a neighbour of the selected gem should swap the two.
tr: Seçili mücevherin bir komşusuna tıklamak ikisini takas etmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32 + 48 * 4, 96 + 48 * 5)
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.strictEqual(board[5][4], (5 + 10) % 6)
assert.strictEqual(board[5][5], (5 + 8) % 6)
assert.isNull(selected)
```

A gem that is not a neighbour should not be swapped but selected instead.
tr: Komşu olmayan bir mücevher takas edilmemeli, onun yerine seçilmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32, 96)
$.click(32 + 48 * 3, 96 + 48 * 3)
assert.strictEqual(board[0][0], 0, 'a far gem is not swapped')
assert.deepEqual(selected, { r: 3, c: 3 }, 'it becomes the new selection')
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

let board // board[row][col]: a color index
let selected

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
}

function swap(a, b) {
  const gem = board[a.r][a.c]
  board[a.r][a.c] = board[b.r][b.c]
  board[b.r][b.c] = gem
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  return true
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
