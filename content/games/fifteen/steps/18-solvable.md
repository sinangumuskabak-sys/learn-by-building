---
title: Which boards can be solved?
title_tr: Hangi tahtalar çözülür?
skills: [prog.loops]
---

# --goal--

Half of all arrangements of this puzzle can never be solved. A rule tells them apart: count the pairs of tiles in the
wrong order, add the gap's row counted from the bottom; the board can be solved exactly when the sum is odd.
`solvable(list)` checks it, so we can prove our shuffle keeps its promise.

# --goal-tr--

Neden kart gibi karıştırmadık? Çünkü bu bulmacanın bütün dizilişlerinin **yarısı** ne yaparsan yap **çözülemez**.
1880'lerde bir bulmacacı, sadece 14 ile 15'in yeri değişmiş tahtayı düzeltene büyük bir ödül vaat etti; kimse
kazanamadı, çünkü imkânsız.

Bir kural onları ayırır. **Ters çift** (inversion): tahtayı satır satır okurken büyük sayının küçükten **önce** geldiği
her çift. 4×4 tahta için:

```
çözülebilir  <=>  ters çiftler + (boşluğun alttan sayılan satırı, 1'den başlayarak) tek sayı
```

Her kaydırma bu toplamın tek/çift oluşunu korur; kuralı bozan bir tahta çözülmüş tahtaya asla ulaşamaz. `solvable`
fonksiyonu bunu hesaplayacak; karıştırmamızın sözünü tuttuğunu kontrol edeceğiz.

# --code--

```js
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

# --meaning--

- `numbers` is the board without the gap.
- Two loops compare every number with every number after it; a bigger one first is an inversion.
- The gap's row from the bottom is `N - row` (1 for the bottom row).
- `% 2 === 1` asks whether the sum is odd.

# --meaning-tr--

- `list.filter((t) => t !== 0)` → boşluk hariç sayılar.
- `let inversions = 0` → ters çift sayacı.
- İki **iç içe döngü**: dıştaki `a` her sayıyı seçer; içteki `b` ondan **sonra** gelen her sayıyı (`b = a + 1`'den
  başlar). Böylece her çift bir kez karşılaştırılır.
- `if (numbers[a] > numbers[b]) inversions++` → önce gelen daha büyükse ters çift: sayacı 1 artır (`++`).
- `N - rowOf(list.indexOf(0))` → boşluğun **alttan** sayılan satırı: en alt satır 1, en üst 4.
- `(...) % 2 === 1` → 2'ye bölümden kalan 1 mi, yani **tek sayı mı**? Sonuç `true` ya da `false`.

# --task--

Above `function reset()`, write the comment and `solvable`, and leave an empty line. Press **Run**.

# --task-tr--

`function reset() {` satırının **üstüne** yorum satırını ve `solvable` fonksiyonunu yaz; arada bir boş satır kalsın.
**Çalıştır**. Ekran değişmez; kontroller kuralı ünlü 14-15 tahtasında deniyor.

# --predict--

The board is solved except that 14 and 15 are swapped. How many inversions does it have?
- [ ] 0
- [x] 1
  Only the pair (15, 14) is in the wrong order. With the gap on the bottom row, 1 + 1 = 2 is even: impossible.
- [ ] 2

# --predict-tr--

Tahta çözülmüş, sadece 14 ile 15 yer değiştirmiş. Kaç ters çift var?
- [ ] 0
- [x] 1
  Sadece (15, 14) çifti ters. Boşluk en alt satırda: 1 + 1 = 2, çift sayı. Yani imkânsız.
- [ ] 2

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

Every shuffled board should be solvable.
tr: Karıştırılmış her tahta çözülebilir olmalı.

```js
for (let n = 0; n < 30; n++) {
  reset()
  assert.isTrue(solvable(tiles))
}
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
  shuffle(200)
  moves = 0
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
