---
title: Make a move
title_tr: Hamle yap
skills: [game.state, prog.functions]
---

# --goal--

A move puts the current player's mark in a cell, then hands the turn to the other player. We remember whose turn it
is in `player` and write the move as a function `play(index)`.

# --goal-tr--

Bir **hamle** iki şeydir: sırası gelen oyuncunun işaretini kutuya koymak, sonra **sırayı** öbür oyuncuya vermek.

Sıranın kimde olduğu da bir durum bilgisi: `player`. X başlar. Hamleyi, kutu numarası alan bir fonksiyon olarak
yazıyoruz: `play(4)` "4 numaralı kutuya oyna" demek. Henüz tıklama yok, onu sonra bağlayacağız.

# --code--

```js
let player = 'X'

function play(index) {
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
}
```

# --meaning--

- `player` holds whose turn it is.
- `play(index)` takes a cell number as a parameter.
- `board[index] = player` puts the mark in that cell of the array.
- The last line switches the turn: X becomes O, O becomes X.

# --meaning-tr--

- `let player = 'X'` → sıra kimde: X başlar. `let`, çünkü değişecek.
- `function play(index) {` → parantezdeki `index` bir **parametre**: fonksiyonu çağıran, kutu numarasını verir.
  `play(4)` çağrısında `index` 4 olur.
- `board[index] = player` → dizinin `index` numaralı kutusuna sıradaki işareti koy. Tek `=` "değer ver" demek;
  `===` ise "eşit mi?" diye sorar. Karıştırma.
- `player = player === 'X' ? 'O' : 'X'` → önceki adımdaki kısa soru: "Şu an X mi? Evetse O yap, değilse X yap."
  Yani sırayı değiştir.

# --task--

1. Under the `board` line, write `let player = 'X'`.
2. Leave an empty line and write the `play` function, above `function draw() {`.

# --task-tr--

1. `let board = [...]` satırının hemen altına `let player = 'X'` yaz.
2. Bir boş satır bırak ve `play` fonksiyonunu yaz. `function draw() {` satırının **üstünde** kalsın, aralarında bir
   boş satır olsun.
3. **Çalıştır**: ekran değişmez (henüz kimse `play`'i çağırmıyor), kontroller yeşil olmalı.

# --try--

Above the last `draw()`, write `play(4)` and `play(0)` and run: an X in the middle, an O top-left. Delete the two lines.

# --try-tr--

En alttaki `draw()` satırının üstüne `play(4)` ve `play(0)` yazıp çalıştır: ortada X, sol üstte O. Sonra bu iki satırı sil.

# --tests--

`player` should start as `'X'`.
tr: `player` başta `'X'` olmalı.

```js
assert.strictEqual(player, 'X')
```

`play()` should put the current mark in the cell and switch turns.
tr: `play()` sıradaki işareti kutuya koymalı ve sırayı değiştirmeli.

```js
play(4)
assert.strictEqual(board[4], 'X')
assert.strictEqual(player, 'O')
play(0)
assert.strictEqual(board[0], 'O')
assert.strictEqual(player, 'X')
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
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
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
