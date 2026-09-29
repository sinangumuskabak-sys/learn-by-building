---
title: A list of moves
title_tr: Bir hamle listesi
skills: [prog.arrays, prog.loops]
---

# --goal--

`pseudoMoves(color)` looks at every square, and for each knight of that color tries the 8 jumps. A jump that stays on
the board and does not land on its own piece is a move `{ from: [r, c], to: [tr, tc] }`. An enemy piece there is a
capture.

# --goal-tr--

Her tahta oyununun kalbi **hamle listesidir**: "şu an hangi hamleler yapılabilir?" `pseudoMoves(color)` bu listeyi
yapacak. Şimdilik yalnız **atlar** için; diğer taşları adım adım ekleyeceğiz.

Yöntem: 64 kareyi gez; o renkte bir at bulursan 8 sıçramayı dene. Sıçrama tahtada kalıyorsa ve orada **kendi
taşın yoksa** bu bir hamledir (rakip taş varsa onu yer). Her hamle bir nesne: `{ from: [r, c], to: [tr, tc] }`
(nereden, nereye).

Adındaki "pseudo" (sözde) şu demek: şah kuralına henüz bakmıyoruz. Üstteki yorum da bunu söylüyor; o kural sonra
gelecek.

# --code--

```js
// Every move that follows the pieces' patterns, without checking whether it leaves the king in check.
function pseudoMoves(color) {
  const moves = []
  const add = (r, c, tr, tc) => moves.push({ from: [r, c], to: [tr, tc] })
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece[0] !== color) continue
      const kind = piece[1]
      if (kind === 'N') {
        for (const [dr, dc] of KNIGHT) {
          const tr = r + dr
          const tc = c + dc
          if (inside(tr, tc) && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
      }
    }
  }
  return moves
}
```

# --meaning--

- `moves` starts empty; `add` pushes one move object onto it.
- `continue` skips to the next square when this one is not ours.
- `for (const [dr, dc] of KNIGHT)` takes each jump and unpacks its two numbers.
- `board[tr][tc][0] !== color`: an empty square's `[0]` is `undefined`, so empty squares and enemy pieces pass.
- `return moves` hands back the list.

# --meaning-tr--

- `const moves = []` → boş bir liste; bulunan hamleler buna eklenecek.
- `const add = (r, c, tr, tc) => moves.push({ ... })` → hamle ekleyen küçük yardımcı. `push` dizinin **sonuna**
  eleman ekler. `tr`, `tc` hedef satır ve sütun (target).
- İki `for` → 64 kareyi gezer (tahtayı çizerken yaptığımız gibi).
- `if (piece[0] !== color) continue` → `!==` "eşit değil". Bu karedeki taş istenen renkte değilse (ya da kare boşsa)
  `continue` döngünün **bu turunu atlar**, sonraki kareye geçer.
- `const kind = piece[1]` → taşın türü (`'N'`, `'K'`, ...).
- `for (const [dr, dc] of KNIGHT) {` → `for ... of` listenin her elemanını sırayla alır. `[dr, dc]` o elemanı
  **açar**: `[1, 2]` gelince `dr = 1`, `dc = 2`.
- `const tr = r + dr` → sıçramanın indiği satır; `tc` sütunu.
- `inside(tr, tc) && board[tr][tc][0] !== color` → hedef tahtada **ve** orada kendi rengimiz yok. Boş karenin
  `[0]`'ı `undefined` (yok) olduğu için boş kareler de geçer. `&&` soldaki yanlışsa sağdakine hiç bakmaz; bu yüzden
  tahta dışındaki kareyi okumaya çalışıp hata vermeyiz.
- `return moves` → listeyi **geri verir**; fonksiyon burada biter.

# --task--

Under `inside`, leave an empty line and write the comment and `pseudoMoves`.

# --task-tr--

1. `const inside = ...` satırının **altına** bir boş satır bırak; yorum satırını ve `pseudoMoves` fonksiyonunu yaz.
2. **Çalıştır**: ekran değişmez. Kontroller, başlangıçta beyazın 4 at hamlesi olduğunu denetleyecek.

# --hint--

`continue` must be inside the loops, and `return moves` after both loops close.

# --hint-tr--

`return moves` iki döngünün **dışında**, fonksiyonun sonunda olmalı; yoksa ilk karede döner. Süslü parantezleri
say: `pseudoMoves` en sonda `}` ile kapanır.

# --tests--

At the start each white knight should have two moves.
tr: Başta her beyaz atın iki hamlesi olmalı.

```js
const moves = pseudoMoves('w').map((m) => m.from.join() + '>' + m.to.join()).sort()
assert.deepEqual(moves, ['7,1>5,0', '7,1>5,2', '7,6>5,5', '7,6>5,7'])
```

A knight should not land on its own piece, but may take an enemy piece.
tr: At kendi taşının üstüne inmemeli ama rakip taşı alabilmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[0][0] = 'wN'
board[1][2] = 'wN'
board[2][1] = 'bN'
const to = pseudoMoves('w').filter((m) => m.from.join() === '0,0').map((m) => m.to.join())
assert.deepEqual(to, ['2,1'])
```

A move should be an object with `from` and `to`.
tr: Bir hamle `from` ve `to` alanları olan bir nesne olmalı.

```js
assert.deepEqual(pseudoMoves('b').find((m) => m.to.join() === '2,0'), { from: [0, 1], to: [2, 0] })
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

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
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
      if (kind === 'N') {
        for (const [dr, dc] of KNIGHT) {
          const tr = r + dr
          const tc = c + dc
          if (inside(tr, tc) && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
      }
    }
  }
  return moves
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
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
