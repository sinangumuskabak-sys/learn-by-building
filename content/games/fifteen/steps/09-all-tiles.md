---
title: All the tiles
title_tr: Bütün taşlar
skills: [prog.arrays, prog.loops]
---

# --goal--

`forEach` goes through the board: every number is drawn on its square, except the gap.

# --goal-tr--

Bir taş yetmez; **bütün tahtayı** çizelim. Listenin her elemanı için: numarası neyse onu, konumu neyse oraya çiz.
Boşluğu (`0`) atla.

Listenin her elemanı için bir şey yapmanın kısa yolu: `forEach` (her biri için).

# --code--

```js
tiles.forEach((number, i) => {
  if (number === 0) return
  drawTile(number, squareX(i), squareY(i))
})
```

# --meaning--

- `forEach` runs the function once per item: `number` is the tile, `i` its position.
- `if (number === 0) return` skips the gap: `return` ends this turn only.
- Each tile is drawn at the corner of its square.

# --meaning-tr--

- `tiles.forEach((number, i) => { ... })` → listenin **her elemanı için** ok fonksiyonunu bir kez çalıştırır.
  `number` o konumdaki taşın numarası, `i` konumu (0, 1, 2 ... 15).
- `if (number === 0) return` → boşluksa **bu turu atla**. `===` "tam olarak eşit mi?" `return` sadece bu turu bitirir;
  `forEach` sonraki elemanla sürer.
- `drawTile(number, squareX(i), squareY(i))` → taşı kendi karesine çiz.

# --task--

In `draw`, replace the `drawTile(1, ...)` line with the `forEach` block. Press **Run**.

# --task-tr--

`draw` içindeki `drawTile(1, squareX(0), squareY(0))` satırını **sil**, yerine `forEach` bloğunu yaz. **Çalıştır**:
1'den 15'e sıralı taşlar ve sağ altta bir boşluk görmelisin.

# --predict--

What if you forget `if (number === 0) return`?
- [ ] Nothing changes
- [x] A tile with 0 on it fills the gap
  The gap is just the number 0 in the list; without the check it is drawn like any tile.
- [ ] An error

# --predict-tr--

`if (number === 0) return` satırını unutursan ne olur?
- [ ] Hiçbir şey değişmez
- [x] Boşlukta üstünde 0 yazan bir taş belirir
  Boşluk listede sadece 0 sayısı; kontrol olmazsa o da her taş gibi çizilir.
- [ ] Hata verir

# --tests--

Each of the 15 tiles should be drawn on its square with its number.
tr: 15 taşın her biri karesinde numarasıyla çizilmeli.

```js
draw()
const squares = $.rects('#f59e0b')
assert.lengthOf(squares, 15)
assert.deepEqual([squares[0].x, squares[0].y, squares[0].w], [11, 60, 90])
assert.deepEqual([squares[14].x, squares[14].y], [11 + 2 * 96, 60 + 3 * 96])
assert.deepEqual($.texts(), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'])
```

The drawing should follow `tiles`.
tr: Çizim `tiles`'ı izlemeli.

```js
tiles = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1]
draw()
assert.strictEqual($.texts().at(-1), '1')
assert.notDeepInclude($.rects('#f59e0b'), { x: 11, y: 60, w: 90, h: 90, color: '#f59e0b' }, 'square 0 is the gap now')
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

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
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

reset()
draw()
```
