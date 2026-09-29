---
title: No playing on a taken cell
title_tr: Dolu kutuya oynanmaz
skills: [game.state]
---

# --goal--

Right now `play` can overwrite a mark. It must refuse a cell that is not empty, and answer whether the move happened:
`true` or `false`.

# --goal-tr--

Şu an `play`, dolu bir kutunun üstüne yazabiliyor: X'in yerine O koymak hile olur! Kutu doluysa hamleyi
**reddetmeli**.

Ayrıca `play`, çağırana bir **cevap** verecek: hamle oldu mu, olmadı mı? Bu cevap ileride, bilgisayar oyuncusu
eklendiğinde işe yarayacak.

# --code--

```js
function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}
```

# --meaning--

- `!==` means "is not equal to". If the cell is not empty, `return false` answers "no move" and stops.
- Otherwise the move is made and `return true` answers "moved".

# --meaning-tr--

- `board[index] !== ''` → `!==` "eşit **değil** mi?" (`===`'in tersi). "Kutu boş değilse..."
- `return false` → "...hamle olmadı" cevabını ver ve fonksiyondan **hemen çık**. Alttaki satırlar çalışmaz; sıra da
  değişmez.
- `true` (doğru) ve `false` (yanlış) → evet/hayır cevapları. Tırnaksız yazılır.
- `return true` → her şey yolundaysa, en sonda "hamle oldu" cevabı.
- Bir fonksiyonun `return` ile verdiği şeye **dönüş değeri** denir: `const moved = play(4)` yazsak, `moved` bu
  cevabı tutardı.

# --task--

1. In `play`, above `board[index] = player`, add the `if` line.
2. Under the line that switches `player`, add `return true`.

# --task-tr--

1. `play` fonksiyonunda, `board[index] = player` satırının **üstüne** `if` satırını yaz.
2. Sırayı değiştiren `player = ...` satırının **altına** `return true` yaz.
3. **Çalıştır**.

# --hint--

`return false` must come before `board[index] = player`, so a taken cell stops the move before anything changes.

# --hint-tr--

`return false` satırı `board[index] = player` satırından **önce** olmalı; yoksa kutu değiştikten sonra durmanın anlamı kalmaz.

# --tests--

`play()` should answer `true` for a move on an empty cell.
tr: `play()` boş kutuya yapılan hamle için `true` dönmeli.

```js
assert.isTrue(play(4))
assert.strictEqual(board[4], 'X')
```

`play()` should refuse a taken cell: `false`, the mark stays, the turn stays.
tr: `play()` dolu kutuyu reddetmeli: `false`, işaret kalır, sıra değişmez.

```js
play(4)
assert.isFalse(play(4))
assert.strictEqual(board[4], 'X')
assert.strictEqual(player, 'O')
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']
let player = 'X'

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

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
}

draw()
```
