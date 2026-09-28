---
title: A shuffle that can be solved
title_tr: Çözülebilen bir karıştırma
skills: [prog.arrays, prog.loops]
---

# --explanation--

The obvious way to mix the tiles is to shuffle the array like a deck of cards. That is a trap: **half** of all
arrangements of this puzzle can never be solved, whatever you do. In the 1880s a puzzle maker offered a prize for swapping
just the 14 and the 15 back; nobody ever won it, because it is impossible.

Why? Every slide changes two things together: the number of **inversions** (pairs of tiles in the wrong order when you read
the board row by row) and the row the gap is in. The result is a rule for a 4 by 4 board:

```
solvable  <=>  inversions + (gap's row counted from the bottom, starting at 1) is odd
```

A slide can never break that rule, so an arrangement that breaks it can never reach the solved board.

The safe way to shuffle is to start solved and make **real moves**: 200 random slides of a tile into the gap, never undoing
the one just made. Every position you reach this way can be solved by playing the moves backwards. `solvable()` is kept to
check that promise.

# --explanation-tr--

**Bu adımda:** oyun her açılışta taşları karıştıracak. Sağda artık karışık bir tahta göreceksin ve onu kaydırarak
yeniden sıraya dizmeye çalışacaksın. Karıştırma, tahtanın **her zaman çözülebilir** olmasını garanti edecek.

**Neden kart gibi karıştırmıyoruz?** Akla gelen ilk yol listeyi bir deste kart gibi karıştırmak. Ama bu bir tuzak:
bu bulmacanın bütün dizilişlerinin **yarısı** ne yaparsan yap çözülemez. 1880'lerde bir bulmacacı yalnızca 14 ile
15'in yeri değişmiş tahtayı düzeltene ödül vaat etti; kimse kazanamadı, çünkü imkânsız.

**Kural.** Her kaydırma iki şeyi birlikte değiştirir: **ters çiftlerin** (inversion) sayısını (tahtayı satır satır
okurken büyük sayının küçükten önce geldiği çiftler) ve boşluğun satırını. 4×4 tahta için sonuç:

```
çözülebilir  <=>  ters çiftler + (boşluğun alttan sayılan satırı, 1'den başlayarak) tek sayıdır
```

Bir kaydırma bu kuralı asla bozamaz; kuralı bozan bir diziliş de çözülmüş tahtaya asla ulaşamaz.

**Güvenli karıştırma: gerçek hamleler.** Çözülmüş tahtadan başlayıp 200 kez rastgele gerçek bir kaydırma yaparız;
az önce yapılanı hiç geri almayız. Böyle ulaşılan her diziliş, hamleleri tersinden oynayarak çözülebilir.
`solvable()` fonksiyonunu bu sözü kontrol etmek için yine de yazarız.

**Yeni parçalar:**

- `Math.random()` 0 ile 1 arasında rastgele bir ondalık sayı verir; `options[Math.floor(Math.random() * options.length)]`
  listeden rastgele bir eleman seçer.
- `neighbors(gap).filter((i) => i !== previous)` → boşluğun komşularından, boşluğun az önce geldiği kare **hariç**
  olanları tutar (`filter` süzer, `!==` "eşit değil").
- `let previous = -1` → başta "önceki yok" demek için hiçbir kareye denk gelmeyen bir sayı.
- `for (let b = a + 1; ...)` iç döngü: her sayıyı kendinden sonra gelen **her** sayıyla karşılaştırır; büyükse
  `inversions++` (1 artır).
- `% 2 === 1` → 2'ye bölümden kalan 1 mi, yani **tek sayı mı?**
- `tiles.every((t, i) => t === solvedTiles()[i])` → her konumdaki taş, çözülmüş tahtadakiyle aynı mı? Hepsi aynıysa
  `true`.
- `do shuffle(200) while (isSolved())` → **önce yap, sonra kontrol et** döngüsü: karıştır; sonuç şans eseri
  çözülmüş çıktıysa yeniden karıştır.

# --task--

1. Write `shuffle(count)`: starting from the gap, `count` times pick a random neighbour of the gap, except the square the gap
   just came from, and slide that tile into the gap.
2. Write `solvable(list)`: count the inversions among the tiles (without the gap), add the gap's row counted from the bottom
   (`N - rowOf(gap)`), and check the sum is odd.
3. Write `isSolved()`. `reset()` starts solved and shuffles with 200 slides, again while the result happens to be solved, then
   sets `moves = 0`.

# --task-tr--

1. `neighbors` fonksiyonunun kapanış `}`'sinden sonra, `function reset()`'ten önce bir satır boşluk bırakıp iki
   fonksiyon ekle:

   ```js
   // Mix the tiles by making random slides, so the puzzle can always be solved.
   function shuffle(count) {
     let gap = tiles.indexOf(0)
     let previous = -1
     for (let n = 0; n < count; n++) {
       const options = neighbors(gap).filter((i) => i !== previous) // do not undo the last slide
       const i = options[Math.floor(Math.random() * options.length)]
       tiles[gap] = tiles[i]
       tiles[i] = 0
       previous = gap
       gap = i
     }
   }

   // A position can be solved when the number of pairs out of order, plus the gap's row counted from the bottom, is odd.
   function solvable(list) {
     const numbers = list.filter((t) => t !== 0)
     let inversions = 0
     for (let a = 0; a < numbers.length; a++) {
       for (let b = a + 1; b < numbers.length; b++) if (numbers[a] > numbers[b]) inversions++
     }
     const gapRowFromBottom = N - rowOf(list.indexOf(0))
     return (inversions + gapRowFromBottom) % 2 === 1
   }
   ```

2. `reset()` fonksiyonunu şöyle değiştir ve hemen altına `isSolved`'u ekle:

   ```js
   function reset() {
     tiles = solvedTiles()
     do shuffle(200)        // ← yeni
     while (isSolved())     // ← yeni
     moves = 0
   }

   function isSolved() {
     return tiles.every((t, i) => t === solvedTiles()[i])
   }
   ```

   `moves = 0` karıştırmadan **sonra** gelmeli ki karıştırma hamle sayılmasın. `isSolved` `reset`'in altında
   tanımlansa da sorun yok: `function` ile yazılan fonksiyonlar dosyanın her yerinden çağrılabilir.

3. **Çalıştır**'a bas. Sağda karışık bir tahta görmelisin; her çalıştırmada farklı olmalı. Oynamak için önce oyuna
   tıkla ve taşları kaydır. Alttaki kontrollerin hepsi yeşil olmalı. Karıştırma kontrolü kırmızıysa `previous = gap` ve
   `gap = i` satırlarının sırasını kontrol et.

# --tests--

The rule should tell solvable boards from impossible ones.
tr: Kural çözülebilir tahtaları imkânsız olanlardan ayırmalı.

```js
assert.isTrue(solvable(solvedTiles()))
const swapped = solvedTiles()
;[swapped[13], swapped[14]] = [swapped[14], swapped[13]]
assert.isFalse(solvable(swapped), 'the famous 14-15 puzzle cannot be solved')
const oneSlide = solvedTiles()
;[oneSlide[11], oneSlide[15]] = [oneSlide[15], oneSlide[11]]
assert.isTrue(solvable(oneSlide), 'one real slide from solved')
```

The shuffled board should be mixed, complete and always solvable.
tr: Karıştırılmış tahta karışık, eksiksiz ve her zaman çözülebilir olmalı.

```js
for (let n = 0; n < 50; n++) {
  reset()
  assert.isFalse(isSolved())
  assert.isTrue(solvable(tiles))
  assert.deepEqual([...tiles].sort((a, b) => a - b), [...Array(16).keys()])
}
assert.strictEqual(moves, 0)
```

A shuffle should be made of slides and never undo the last one.
tr: Bir karıştırma kaydırmalardan oluşmalı ve sonuncuyu asla geri almamalı.

```js
tiles = solvedTiles()
shuffle(1)
assert.include([11, 14], tiles.indexOf(0))
tiles = solvedTiles()
shuffle(2)
assert.notStrictEqual(tiles.indexOf(0), 15, 'the second slide must not undo the first')
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row
let moves

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

// The squares next to position i (up, down, left, right), staying inside the board.
function neighbors(i) {
  const list = []
  if (rowOf(i) > 0) list.push(i - N)
  if (rowOf(i) < N - 1) list.push(i + N)
  if (colOf(i) > 0) list.push(i - 1)
  if (colOf(i) < N - 1) list.push(i + 1)
  return list
}

// Mix the tiles by making random slides, so the puzzle can always be solved.
function shuffle(count) {
  let gap = tiles.indexOf(0)
  let previous = -1
  for (let n = 0; n < count; n++) {
    const options = neighbors(gap).filter((i) => i !== previous) // do not undo the last slide
    const i = options[Math.floor(Math.random() * options.length)]
    tiles[gap] = tiles[i]
    tiles[i] = 0
    previous = gap
    gap = i
  }
}

// A position can be solved when the number of pairs out of order, plus the gap's row counted from the bottom, is odd.
function solvable(list) {
  const numbers = list.filter((t) => t !== 0)
  let inversions = 0
  for (let a = 0; a < numbers.length; a++) {
    for (let b = a + 1; b < numbers.length; b++) if (numbers[a] > numbers[b]) inversions++
  }
  const gapRowFromBottom = N - rowOf(list.indexOf(0))
  return (inversions + gapRowFromBottom) % 2 === 1
}

function reset() {
  tiles = solvedTiles()
  do shuffle(200)
  while (isSolved())
  moves = 0
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
  moves += 1
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const col = Math.floor(x / (SIZE + GAP))
  const row = Math.floor(y / (SIZE + GAP))
  if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
})

// An arrow moves the tile on the other side of the gap in that direction: Left slides the tile right of the gap to the left.
document.addEventListener('keydown', (event) => {
  const gap = tiles.indexOf(0)
  const from = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }[event.key]
  if (from !== undefined) {
    event.preventDefault()
    if (neighbors(gap).includes(gap + from)) move(gap + from)
  }
})

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
