---
title: Who won?
title_tr: Kim kazandı?
skills: [prog.arrays, prog.functions]
---

# --explanation--

How do you check for three in a row? You could write a long chain of `if`s for every row, column and diagonal. A much
better idea: there are only **8 winning lines**, so write them down as **data** and loop over them.

```js
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
]
```

A line wins when its three cells hold the **same mark, and that mark is not empty**. (Forget the "not empty" part and
an empty board has eight winning lines of nothing!) Array destructuring gives the three indexes names:

```js
LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
```

`find` returns the first matching line, or `undefined` if there is none.

Turning a pile of special cases into a small table plus one generic loop is called **data-driven code**. It is shorter,
and adding a rule (a bigger board, new line shapes) means editing data, not logic.

Both functions take the board as a parameter (`cells`) instead of reading the global `board`. That makes them
**pure**: same input, same output, easy to test. The computer player will need exactly that later, to try out moves
on copies of the board.

# --explanation-tr--

**Bu adımda:** kazananı bulan iki fonksiyon yazacağız. Oyunda görünür bir değişiklik olmayacak (onu bir sonraki
adımda kullanacağız); kontroller bu fonksiyonlara farklı tahtalar verip doğru cevabı bulup bulmadıklarına bakacak.

**Üçü yan yana nasıl bulunur?** Her satır, sütun ve çapraz için uzun bir `if` zinciri yazabilirdin. Çok daha iyi
bir fikir: kazandıran sadece **8 çizgi** var. Onları **veri** olarak bir kez yaz, sonra hepsine sırayla bak.

```js
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // satırlar
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // sütunlar
  [0, 4, 8], [2, 4, 6],              // çaprazlar
]
```

Bu bir **dizilerin dizisi**: 8 elemanı var, her eleman da 3 kutu numarası tutan küçük bir dizi. (Kutu
numaralarını 2. adımdaki resimden hatırla: 0 sol üst, 4 orta, 8 sağ alt.)

**Bir çizgi ne zaman kazandırır?** Üç kutusunda **aynı işaret varsa ve o işaret boş değilse**. ("Boş değil"
kısmını unutursan boş tahtada sekiz tane "hiçlik kazandı" çizgisi bulursun!)

```js
LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
```

Bunu parça parça okuyalım:

- `LINES.find(test)` → "testi geçen **ilk** çizgiyi bul ve ver". Hiçbiri geçmezse **boş** bir değer verir:
  `undefined` ("tanımsız, yok").
- `([a, b, c]) => ...` → her çizgi için çalışan küçük fonksiyon. Köşeli parantezli yazım, çizginin üç numarasına
  sırayla `a`, `b`, `c` adlarını verir. `[0, 4, 8]` için `a` 0, `b` 4, `c` 8 olur.
- `&&` → "**ve**": üç koşulun hepsi doğru olmalı. `a` boş değil **ve** `a` ile `b` aynı **ve** `a` ile `c` aynı.

Bir yığın özel durumu küçük bir tablo artı tek bir genel döngüye çevirmeye **veriye dayalı kod** denir. Daha
kısadır ve yeni bir kural eklemek (daha büyük tahta gibi) mantığı değil, veriyi değiştirmeyi gerektirir.

**Sonuç: kazanan, berabere ya da devam.**

```js
function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}
```

- `if (line)` → "bir çizgi bulunduysa". `undefined` yanlış sayılır, bulunmuş bir dizi doğru sayılır.
- `cells[line[0]]` → çizginin ilk kutusundaki işaret: `'X'` ya da `'O'`, yani kazanan.
- `cells.every(test)` → "**her** kutu testi geçiyor mu?" Hepsi doluysa ve kimse kazanmadıysa: `'draw'` (berabere).
- `return null` → `null` "henüz bir şey yok" demenin değeridir: oyun sürüyor. `return` fonksiyondan hemen çıktığı
  için, yukarıdaki bir `return` çalıştıysa aşağıdakiler hiç çalışmaz.

**Neden `board` değil de `cells`?** İki fonksiyon da tahtayı bir **parametre** olarak alıyor, dışarıdaki `board`'a
kendileri bakmıyor. Böylece aynı girdiye hep aynı cevabı verirler ve denemesi kolay olur. Bilgisayar oyuncusu
ileride tam buna ihtiyaç duyacak: hamleleri tahtanın kopyaları üzerinde deneyecek.

# --task--

1. Add the `LINES` constant above.
2. Write `function winningLine(cells)` that returns the first winning line (an array of 3 indexes) or `undefined`.
3. Write `function outcome(cells)` that returns `'X'` or `'O'` if that mark has a winning line, `'draw'` if every
   cell is filled and nobody won, and `null` while the game is still going.

# --task-tr--

1. `const CELL = 100` satırının hemen altına 8 kazanan çizgiyi ekle:

   ```js
   const LINES = [
     [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
     [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
     [0, 4, 8], [2, 4, 6], // diagonals
   ]
   ```

2. `let player = 'X'` satırının altına bir boş satır bırak ve kazanan çizgiyi bulan fonksiyonu yaz
   (`function play(index)`'ten önce):

   ```js
   function winningLine(cells) {
     return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
   }
   ```

   `return` burada `find`'ın bulduğu cevabı fonksiyonun cevabı olarak geri verir.

3. Onun altına bir boş satır bırak ve sonucu söyleyen fonksiyonu yaz:

   ```js
   function outcome(cells) {
     const line = winningLine(cells)
     if (line) return cells[line[0]]
     if (cells.every((cell) => cell !== '')) return 'draw'
     return null
   }
   ```

4. **Çalıştır**'a bas. Oyun bir öncekiyle aynı çalışmalı (kazanan henüz ekranda gösterilmiyor). Alttaki
   kontrollerin hepsi yeşil olmalı. "Son hamlede kazanmak berabere değil kazançtır" kontrolü kırmızıysa,
   `outcome` içinde `every` satırını `if (line)` satırının **üstüne** yazmış olabilirsin; sıra önemli.

# --tests--

`LINES` should list the 8 winning lines.
tr: `LINES` 8 kazanan çizgiyi listelemeli.

```js
assert.lengthOf(LINES, 8)
assert.sameDeepMembers(LINES.map((line) => [...line].sort()), [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
])
```

`winningLine()` should find rows, columns and diagonals, and ignore empty lines.
tr: `winningLine()` satırları, sütunları ve köşegenleri bulmalı; boş çizgileri görmezden gelmeli.

```js
assert.isUndefined(winningLine(['', '', '', '', '', '', '', '', '']))
assert.sameMembers(winningLine(['O', 'O', 'O', 'X', 'X', '', '', '', '']), [0, 1, 2])
assert.sameMembers(winningLine(['X', 'O', '', 'X', 'O', '', '', 'O', 'X']), [1, 4, 7])
assert.sameMembers(winningLine(['', '', 'X', 'O', 'X', 'O', 'X', '', '']), [2, 4, 6])
assert.isUndefined(winningLine(['X', 'O', 'X', '', '', '', '', '', '']))
```

`outcome()` should report a winner, a draw, or `null`.
tr: `outcome()` bir kazanan, beraberlik ya da `null` bildirmeli.

```js
assert.isNull(outcome(['X', '', '', '', 'O', '', '', '', '']))
assert.strictEqual(outcome(['X', 'X', 'X', 'O', 'O', '', '', '', '']), 'X')
assert.strictEqual(outcome(['O', 'X', 'X', 'X', 'O', '', '', '', 'O']), 'O')
assert.strictEqual(outcome(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']), 'draw')
assert.strictEqual(outcome(['X', 'O', 'O', 'X', 'O', 'X', 'X', 'X', 'O']), 'X', 'a win on the last move is a win, not a draw')
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

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
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
