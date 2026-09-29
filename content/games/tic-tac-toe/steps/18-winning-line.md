---
title: Find three in a row
title_tr: Üçü yan yana bul
skills: [prog.arrays, prog.functions]
---

# --goal--

`winningLine(cells)` looks through `LINES` and returns the first line whose three cells hold the same mark, and
that mark is not empty.

# --goal-tr--

Şimdi 8 çizgiye sırayla bakıp **kazanan bir çizgi var mı** diye soran fonksiyonu yazıyoruz.

Bir çizgi ne zaman kazandırır? Üç kutusunda **aynı işaret varsa ve o işaret boş değilse**. ("Boş değil" kısmını
unutursan, boş tahtada sekiz tane "hiçlik kazandı" çizgisi bulursun!) Ekranda yine bir şey değişmeyecek; kontroller
fonksiyona farklı tahtalar verip deneyecek.

# --code--

```js
function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}
```

# --meaning--

- `LINES.find(test)` returns the first line that passes the test, or `undefined` if none does.
- `([a, b, c]) => ...` names the three numbers of each line `a`, `b` and `c`.
- `&&` means "and": all three conditions must be true.
- The board comes in as a parameter `cells` instead of reading `board`, so we can test any board.

# --meaning-tr--

- `function winningLine(cells)` → tahtayı **parametre** olarak alır (`cells`, yani hücreler). Dışarıdaki `board`'a
  kendisi bakmıyor; böylece ona istediğimiz tahtayı verip deneyebiliriz. Bu, ileride bilgisayar oyuncusu için çok
  işe yarayacak.
- `return` → bulunan cevabı fonksiyonun cevabı olarak geri verir.
- `LINES.find(test)` → "testi geçen **ilk** çizgiyi bul ve ver". Hiçbiri geçmezse `undefined` verir: "tanımsız, yok".
- `([a, b, c]) => ...` → her çizgi için çalışan küçük fonksiyon. Köşeli parantezli yazım, çizginin üç numarasına
  sırayla `a`, `b`, `c` adlarını verir. `[0, 4, 8]` için `a` 0, `b` 4, `c` 8 olur.
- `cells[a] !== ''` → ilk kutu boş değil...
- `&&` → "**ve**". `cells[a] === cells[b] && cells[a] === cells[c]` → ...ve üç kutu aynı.

# --task--

Under `let player = 'X'`, leave an empty line and write `winningLine`. It stays above `function play`.

# --task-tr--

1. `let player = 'X'` satırının altına bir boş satır bırak.
2. `winningLine` fonksiyonunu yaz. `function play(index)`'in üstünde kalsın, arada bir boş satır olsun.
3. Uzun satırı dikkatle yaz: iki tane `&&` ve üç karşılaştırma var. **Çalıştır**.

# --predict--

What does `winningLine(['', '', '', '', '', '', '', '', ''])` return?
- [ ] `[0, 1, 2]`, because three empty cells are "the same"
  That is exactly why we check `cells[a] !== ''` first.
- [x] `undefined`: no line is found
- [ ] An error

# --predict-tr--

`winningLine(['', '', '', '', '', '', '', '', ''])` ne döner?
- [ ] `[0, 1, 2]`, çünkü üç boş kutu "aynı"
  Önce `cells[a] !== ''` diye sormamızın sebebi tam da bu.
- [x] `undefined`: hiçbir çizgi bulunmaz
- [ ] Bir hata

# --hint--

If the empty board finds a line, you forgot `cells[a] !== '' &&` at the start of the test.

# --hint-tr--

Boş tahtada çizgi bulunuyorsa testin başındaki `cells[a] !== '' &&` kısmını unuttun.

# --tests--

`winningLine()` should find rows, columns and diagonals.
tr: `winningLine()` satırları, sütunları ve çaprazları bulmalı.

```js
assert.sameMembers(winningLine(['O', 'O', 'O', 'X', 'X', '', '', '', '']), [0, 1, 2])
assert.sameMembers(winningLine(['X', 'O', '', 'X', 'O', '', '', 'O', 'X']), [1, 4, 7])
assert.sameMembers(winningLine(['', '', 'X', 'O', 'X', 'O', 'X', '', '']), [2, 4, 6])
```

`winningLine()` should ignore empty lines and mixed lines.
tr: `winningLine()` boş ve karışık çizgileri saymamalı.

```js
assert.isUndefined(winningLine(['', '', '', '', '', '', '', '', '']))
assert.isUndefined(winningLine(['X', 'O', 'X', '', '', '', '', '', '']))
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

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
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
}

draw()
```
