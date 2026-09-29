---
title: The solved board from N
title_tr: N'den çözülmüş tahta
skills: [prog.arrays]
---

# --goal--

Instead of typing sixteen numbers, `solvedTiles()` builds the solved board from `N`. We will need it again to check
whether the puzzle is solved.

# --goal-tr--

16 sayıyı elle yazdık. Ama çözülmüş tahtaya birazdan **tekrar** ihtiyacımız olacak ("bulmaca çözüldü mü?" diye
karşılaştırmak için), ve `N`'yi 3 ya da 5 yapsak elle yazdığımız liste bozulur.

Bu yüzden çözülmüş tahtayı `N`'den **üreten** bir fonksiyon yazıyoruz: `solvedTiles`. Tek satır, ama parça parça
okuyunca basit.

# --code--

```js
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

function reset() {
  tiles = solvedTiles()
}
```

# --meaning--

- `Array(15).keys()` counts 0 to 14; `[... ]` puts those numbers in an array.
- `.map((i) => i + 1)` adds one to each: 1 to 15.
- `.concat(0)` adds the gap at the end.
- Each call builds a new array, so changing `tiles` never changes the "solved" list.

# --meaning-tr--

- `N * N - 1` → taş sayısı: 16 − 1 = 15.
- `Array(15)` → 15 boş yeri olan bir liste. `.keys()` → o yerlerin numaraları: 0, 1, ... 14.
- `[... ]` → üç nokta bu numaraları **dağıtır**, köşeli parantez onları bir listeye koyar: `[0, 1, ..., 14]`.
- `.map((i) => i + 1)` → her elemana 1 ekleyip **yeni bir liste** yapar: `[1, 2, ..., 15]`.
- `.concat(0)` → listenin sonuna `0` (boşluk) ekler: `[1, 2, ..., 15, 0]`.
- `reset` artık bu listeyi kullanıyor. Her çağrı **yeni** bir liste ürettiği için `tiles`'ı değiştirmek çözülmüş hâli
  bozmaz.

# --task--

1. Under `colOf`, write the `solvedTiles` line.
2. In `reset`, replace the long list with `solvedTiles()`. Press **Run**.

# --task-tr--

1. `const colOf = ...` satırının altına `solvedTiles` satırını yaz.
2. `reset` içindeki uzun listeyi sil, yerine `solvedTiles()` yaz: `tiles = solvedTiles()`.
3. **Çalıştır**: ekran aynı görünmeli.

# --tests--

`solvedTiles()` should build 1 to 15 and the gap.
tr: `solvedTiles()` 1'den 15'e ve boşluğu üretmeli.

```js
assert.deepEqual(solvedTiles(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
assert.notStrictEqual(solvedTiles(), solvedTiles(), 'a new list every time')
```

`reset()` should use it.
tr: `reset()` onu kullanmalı.

```js
tiles = []
reset()
assert.deepEqual(tiles, solvedTiles())
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

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

function reset() {
  tiles = solvedTiles()
}

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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
