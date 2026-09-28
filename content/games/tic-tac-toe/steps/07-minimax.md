---
title: A computer that never loses
title_tr: Hiç kaybetmeyen bir bilgisayar
skills: [prog.functions]
---

# --explanation--

The rule-based computer has a weakness. Play X in a corner, it takes the center, then play the **opposite** corner.
With nothing to win or block, it picks a random cell. If that is a corner, X can threaten two lines at once (a
**fork**) and it can only block one. Adding more rules for every trap gets messy fast.

The real fix is to stop guessing and **look ahead through every possible future**. Tic-tac-toe is small enough to do
that completely. This is **minimax**:

- Give every finished game a score from O's point of view: `1` if O won, `-1` if X won, `0` for a draw.
- For an unfinished position, try every free cell, score each resulting position **recursively**, and assume both
  sides play their best: O picks the **max**imum, X picks the **min**imum.

```js
function score(cells, turn) {
  const end = outcome(cells)
  if (end === 'O') return 1
  if (end === 'X') return -1
  if (end === 'draw') return 0
  const scores = []
  for (each free cell i) {
    cells[i] = turn                                  // try the move
    scores.push(score(cells, turn === 'O' ? 'X' : 'O'))
    cells[i] = ''                                    // undo it
  }
  return turn === 'O' ? Math.max(...scores) : Math.min(...scores)
}
```

A function that calls itself is **recursive**. It always needs a **base case** that stops the calls (here: the game is
over), and each call must move closer to it (here: one more cell is filled). Try a move, recurse, **undo**: this
"backtracking" pattern also solves Sudoku, mazes and chess puzzles.

Then `computerMove` simply picks the free cell whose resulting position scores highest for O. From the empty board
this explores about half a million positions, and a computer does that in a blink.

# --explanation-tr--

**Bu adımda:** bilgisayarı yenilmez yapacağız. Oynadığında bilgisayarın hiçbir tuzağa düşmediğini göreceksin: en
iyi ihtimalle berabere kalırsın.

**Kurallı bilgisayarın zayıf noktası.** X'i bir köşeye koy; bilgisayar ortayı alır. Sonra **karşı** köşeye koy.
Kazanacak ya da engelleyecek bir şey olmadığı için bilgisayar rastgele bir kutu seçer. O kutu bir köşeyse, X aynı
anda iki çizgiyi tehdit edebilir (buna **çatal** denir) ve bilgisayar yalnızca birini kapatabilir. Her tuzak için
yeni kural eklemek hızla karmaşıklaşır.

**Gerçek çözüm: geleceğin tamamına bakmak.** Tahmin etmek yerine **olası her devamı** deneriz. XOX bunu tamamen
yapabilecek kadar küçük. Bu yönteme **minimax** denir:

- Bitmiş her oyuna O'nun gözünden bir puan ver: O kazandıysa `1`, X kazandıysa `-1`, beraberlik `0`.
- Bitmemiş bir durum için her boş kutuyu dene, çıkan durumu **aynı yöntemle** puanla ve iki tarafın da en iyi
  oynadığını varsay: O en **büyük** puanı (maksimum), X en **küçük** puanı (minimum) seçer.

```js
function score(cells, turn) {
  const end = outcome(cells)
  if (end === 'O') return 1
  if (end === 'X') return -1
  if (end === 'draw') return 0
  const scores = []
  for (let index = 0; index < 9; index++) {
    if (cells[index] !== '') continue
    cells[index] = turn                                  // hamleyi dene
    scores.push(score(cells, turn === 'O' ? 'X' : 'O'))  // sonucu puanla
    cells[index] = ''                                    // hamleyi geri al
  }
  return turn === 'O' ? Math.max(...scores) : Math.min(...scores)
}
```

Bunu parça parça okuyalım:

- `turn` → sıranın kimde olduğu (`'X'` ya da `'O'`).
- `for (let index = 0; index < 9; index++)` → 1. adımdaki döngü: `index` 0'dan 8'e kadar her kutu.
- `continue` → "bu turu atla, döngünün bir sonraki turuna geç". Dolu kutular denenmez.
- `score(cells, ...)` fonksiyonun **içinde** yine `score` çağrılıyor. Kendini çağıran fonksiyona **özyinelemeli
  (recursive)** denir. İç içe geçmiş Rus bebekleri gibi: her bebeğin içinde biraz daha küçüğü var, en sonda
  açılmayan küçük bir bebek.
- Özyinelemenin her zaman bir **durma noktası** olmalı: burada oyunun bitmesi (üstteki üç `return`). Her çağrı ona
  biraz yaklaşmalı: burada her seferinde bir kutu daha doluyor.
- `Math.max(...scores)` → dizideki en büyük sayı; `Math.min` en küçüğü. `...` (6. adımda gördüğün üç nokta)
  dizinin elemanlarını tek tek verir.

**Dene, derinleş, geri al.** Hamleyi gerçek dizide deneyip sonra `cells[index] = ''` ile geri almaya
**geri izleme (backtracking)** denir. Sudoku, labirent ve satranç bulmacaları da böyle çözülür. Geri almayı
unutursan tahta bozulur.

**En iyi hamleyi seçmek.** `computerMove` artık her boş kutuya O koyup `score(cells, 'X')` ile puanlar, geri alır
ve en yüksek puanlı kutuyu seçer:

```js
let best = -1
let bestScore = -Infinity
```

`-Infinity` "eksi sonsuz", her sayıdan küçük bir başlangıç değeridir; böylece ilk denenen kutu mutlaka "şimdiye
kadarki en iyi" olur. `>` "büyüktür" demektir. Boş tahtadan başlayınca bu yaklaşık yarım milyon durumu inceler;
bilgisayar bunu göz açıp kapayıncaya kadar yapar.

# --task--

1. Write `function score(cells, turn)` as described: return `1`, `-1` or `0` for finished positions; otherwise try
   `turn` in every free cell, score the result with the other player to move, undo the move, and return the maximum
   (O to move) or minimum (X to move).
2. Rewrite `computerMove(cells)`: for every free cell, place `'O'`, compute `score(cells, 'X')`, undo, and return the
   cell with the highest score. It must leave `cells` unchanged.

Now try to beat it. You can't. The best you can do is a draw.

# --task-tr--

1. `outcome` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak ve puanlama fonksiyonunu yaz
   (`function computerMove`'dan önce):

   ```js
   // How good `cells` is for O if both sides play perfectly: 1 = O wins, -1 = X wins, 0 = draw.
   function score(cells, turn) {
     const end = outcome(cells)
     if (end === 'O') return 1
     if (end === 'X') return -1
     if (end === 'draw') return 0
     const scores = []
     for (let index = 0; index < 9; index++) {
       if (cells[index] !== '') continue
       cells[index] = turn
       scores.push(score(cells, turn === 'O' ? 'X' : 'O'))
       cells[index] = ''
     }
     return turn === 'O' ? Math.max(...scores) : Math.min(...scores)
   }
   ```

2. Eski `computerMove` fonksiyonunun **tamamını** (`function computerMove(cells) {` satırından onun kapanan `}`
   işaretine kadar, içindeki `free`, `completes` ve `random` dahil) sil ve yerine şunu yaz:

   ```js
   function computerMove(cells) {
     let best = -1
     let bestScore = -Infinity
     for (let index = 0; index < 9; index++) {
       if (cells[index] !== '') continue
       cells[index] = 'O'
       const value = score(cells, 'X')
       cells[index] = ''
       if (value > bestScore) {
         bestScore = value
         best = index
       }
     }
     return best
   }
   ```

   Tıklama dinleyicisi aynı kalıyor; o zaten `computerMove(board)`'u çağırıyor.

3. **Çalıştır**'a bas. Oynamak için kutulara tıkla ve bilgisayarı yenmeye çalış: yenemezsin, en fazla berabere
   kalırsın. Alttaki kontrollerin hepsi yeşil olmalı (son kontrol binlerce oyunu denediği için birkaç saniye
   sürebilir). "`score()` tahtayı bulduğu gibi bırakmalı" kontrolü kırmızıysa `cells[index] = ''` geri alma
   satırını unutmuş olabilirsin.

Tebrikler, XOX oyunun bitti!

# --tests--

`score()` should rate finished games from O's point of view.
tr: `score()` biten oyunları O'nun gözünden puanlamalı.

```js
assert.strictEqual(score(['O', 'O', 'O', 'X', 'X', '', 'X', '', ''], 'X'), 1)
assert.strictEqual(score(['X', 'X', 'X', 'O', 'O', '', '', '', ''], 'O'), -1)
assert.strictEqual(score(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'], 'X'), 0)
```

`score()` should look ahead: perfect play from an empty board is a draw, and a fork is a lost position.
tr: `score()` ileriye bakmalı: boş tahtadan kusursuz oyun beraberliktir, çatal ise kaybedilmiş bir konumdur.

```js
assert.strictEqual(score(['', '', '', '', '', '', '', '', ''], 'X'), 0)
assert.strictEqual(score(['X', 'X', '', '', 'O', '', '', '', 'O'], 'X'), -1, 'X can win at once')
assert.strictEqual(score(['X', '', '', '', 'X', 'O', '', '', 'O'], 'X'), -1, 'X has a winning fork')
```

`score()` should leave the board as it found it.
tr: `score()` tahtayı bulduğu gibi bırakmalı.

```js
const cells = ['X', '', '', '', 'O', '', '', '', '']
score(cells, 'X')
assert.deepEqual(cells, ['X', '', '', '', 'O', '', '', '', ''])
```

Against opposite corners, the computer should play an edge, not a corner.
tr: Karşılıklı köşelere karşı bilgisayar köşe değil kenar oynamalı.

```js
const cells = ['X', '', '', '', 'O', '', '', '', 'X']
const move = computerMove(cells)
assert.include([1, 3, 5, 7], move)
assert.deepEqual(cells, ['X', '', '', '', 'O', '', '', '', 'X'], 'computerMove must not change the board')
```

No sequence of X moves should ever beat the computer.
tr: Hiçbir X hamle dizisi bilgisayarı yenememeli.

```js
let games = 0
function explore(cells) {
  for (let i = 0; i < 9; i++) {
    if (cells[i] !== '') continue
    const next = [...cells]
    next[i] = 'X'
    assert.notStrictEqual(outcome(next), 'X', 'X won: ' + next.join(','))
    if (outcome(next)) {
      games++
      continue
    }
    next[computerMove(next)] = 'O'
    if (outcome(next)) games++
    else explore(next)
  }
}
explore(['', '', '', '', '', '', '', '', ''])
assert.isAbove(games, 100)
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

let board
let player
let result // null while playing, then 'X', 'O' or 'draw'

function reset() {
  board = ['', '', '', '', '', '', '', '', '']
  player = 'X'
  result = null
}

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

// How good `cells` is for O if both sides play perfectly: 1 = O wins, -1 = X wins, 0 = draw.
function score(cells, turn) {
  const end = outcome(cells)
  if (end === 'O') return 1
  if (end === 'X') return -1
  if (end === 'draw') return 0
  const scores = []
  for (let index = 0; index < 9; index++) {
    if (cells[index] !== '') continue
    cells[index] = turn
    scores.push(score(cells, turn === 'O' ? 'X' : 'O'))
    cells[index] = ''
  }
  return turn === 'O' ? Math.max(...scores) : Math.min(...scores)
}

function computerMove(cells) {
  let best = -1
  let bestScore = -Infinity
  for (let index = 0; index < 9; index++) {
    if (cells[index] !== '') continue
    cells[index] = 'O'
    const value = score(cells, 'X')
    cells[index] = ''
    if (value > bestScore) {
      bestScore = value
      best = index
    }
  }
  return best
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  return true
}

canvas.addEventListener('click', (event) => {
  if (result) {
    reset()
  } else if (player === 'X') {
    // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    const moved = play(Math.floor(y / CELL) * 3 + Math.floor(x / CELL))
    if (moved && !result) play(computerMove(board))
  }
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
    ctx.font = '14px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 172)
  }
}

reset()
draw()
```
