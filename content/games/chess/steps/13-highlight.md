---
title: Light up the selected square
title_tr: Seçili kareyi yak
skills: [game.canvas]
---

# --goal--

Show the choice: the selected square gets a see-through yellow layer. `same(a, b)` says whether two squares are the
same; arrays cannot be compared with `===`.

# --goal-tr--

Oyuncu neyi seçtiğini görmeli: seçili kare **yarı saydam sarı** bir katmanla parlayacak.

Bunun için "bu kare, seçili kare mi?" diye sormamız gerek. Ama iki diziyi `===` ile karşılaştıramayız: `[7, 1] ===
[7, 1]` bile `false` çıkar, çünkü `===` iki dizinin **aynı dizi** olup olmadığına bakar, içlerine değil. Bu yüzden
küçük bir `same` yardımcısı yazacağız.

# --code--

```js
const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

      ctx.fillRect(x, y, SQ, SQ)
      if (same(selected, [r, c])) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)'
        ctx.fillRect(x, y, SQ, SQ)
      }
```

# --meaning--

- `same` compares the row and the column. `a && b` first makes sure neither is `null`.
- `rgba(250, 204, 21, 0.45)` is yellow with 45% opacity, painted over the square so its color shows through.

# --meaning-tr--

- `const same = (a, b) => a && b && ...` → iki kareyi karşılaştırır. Önce `a && b`: ikisi de var mı? (`selected`
  `null` olabilir; `null[0]` hata verirdi.) Sonra satırlar eşit **ve** sütunlar eşit mi?
- `if (same(selected, [r, c])) {` → çizilen kare seçili kareyse:
- `'rgba(250, 204, 21, 0.45)'` → kırmızı, yeşil, mavi ve **saydamlık**: sarı, %45 opak. Karenin kendi rengi altından
  görünür.
- İkinci `fillRect` → sarı katmanı karenin üstüne boyar. Taş bundan **sonra** çizildiği için taşın altında kalır.

# --task--

1. Above `function clickSquare` write `same`.
2. In `draw`, under `ctx.fillRect(x, y, SQ, SQ)` write the `if` block (above `const piece = ...`).

# --task-tr--

1. `function clickSquare(r, c) {` satırının **üstüne** `same` satırını yaz; altında bir boş satır kalsın.
2. `draw` içinde `ctx.fillRect(x, y, SQ, SQ)` satırının **altına**, `const piece = board[r][c]` satırının **üstüne**
   `if` bloğunu yaz.
3. **Çalıştır** ve bir kareye tıkla: sararmalı. Başka bir kareye tıklayınca sarılık oraya geçmeli.

# --try--

Change `0.45` to `1` and click a square: the yellow hides the square completely. Put `0.45` back.

# --try-tr--

`0.45`'i `1` yap ve bir kareye tıkla: sarı kareyi tamamen örter. Sonra `0.45`'e geri al.

# --tests--

`same` should compare two squares.
tr: `same` iki kareyi karşılaştırmalı.

```js
assert.isTrue(same([7, 1], [7, 1]))
assert.isFalse(same([7, 1], [1, 7]))
assert.notOk(same(null, [7, 1]))
```

The clicked square should be painted with a yellow layer.
tr: Tıklanan kare sarı bir katmanla boyanmalı.

```js
$.click(100, 476)
$.tick(1)
assert.deepEqual($.rects('rgba(250, 204, 21, 0.45)'), [{ x: 72, y: 448, w: 56, h: 56, color: 'rgba(250, 204, 21, 0.45)' }])
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages
const GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
// Row 0 is black's back rank at the top, row 7 white's at the bottom. Capitals are white.
const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
const KING = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'
let selected // the square of the piece you picked up, or null

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  selected = null
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

// Every move that follows the pieces' patterns, without checking whether it leaves the king in check.
function pseudoMoves(color) {
  const moves = []
  const add = (r, c, tr, tc) => moves.push({ from: [r, c], to: [tr, tc] })
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece[0] !== color) continue
      const kind = piece[1]
      if (kind === 'N' || kind === 'K') {
        for (const [dr, dc] of kind === 'N' ? KNIGHT : KING) {
          const tr = r + dr
          const tc = c + dc
          if (inside(tr, tc) && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
      }
    }
  }
  return moves
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
  selected = [r, c]
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SQ)
  const c = Math.floor(x / SQ)
  if (inside(r, c)) clickSquare(r, c)
})

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
      if (same(selected, [r, c])) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)'
        ctx.fillRect(x, y, SQ, SQ)
      }
      const piece = board[r][c]
      if (piece) {
        ctx.font = '44px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // White pieces get a dark outline, drawn first so the white fill goes on top of it.
        if (piece[0] === 'w') {
          ctx.strokeStyle = '#0f172a'
          ctx.lineWidth = 3
          ctx.strokeText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
        }
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
        ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
