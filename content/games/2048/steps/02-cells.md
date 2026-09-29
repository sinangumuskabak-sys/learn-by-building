---
title: Sixteen cells
title_tr: On altı hücre
skills: [prog.loops, game.canvas]
---

# --goal--

Where does a cell go? `cellX(col)` and `cellY(row)` turn a column and a row into pixels. Two nested loops draw all
16 empty cells.

# --goal-tr--

Tahtanın üstüne 16 boş hücre çizeceğiz. Önce bir soruyu cevaplayan iki küçük fonksiyon: "**şu sütun / şu satır**
ekranda hangi piksele düşer?" Sonra iki iç içe döngüyle bütün hücreleri geziyoruz: satır satır, her satırda
soldan sağa.

# --code--

```js
function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      ctx.fillStyle = '#cdc1b4'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
    }
  }
```

# --meaning--

- Each cell takes `CELL + GAP` pixels, after a first `GAP` at the left: column 0 is at 12, column 3 at 303.
- `cellY` does the same downwards, starting below the `TOP` strip.
- The outer loop runs over the 4 rows, the inner one over the 4 columns of each row: 16 cells.

# --meaning-tr--

- `cellX(col)` → soldan önce bir `GAP`, sonra her sütun için bir hücre ve bir boşluk (`CELL + GAP` = 97):
  0. sütun **12**, 1. sütun 109, 3. sütun **303**. `return` sonucu geri verir.
- `cellY(row)` → aynısı aşağı doğru; ama tahta `TOP`'tan başladığı için onu da ekler: 0. satır **72**.
- Dıştaki `for` 4 satırı, içteki `for` her satırın 4 sütununu gezer: 4 × 4 = **16** tur.
- Her turda açık kahverengi (`'#cdc1b4'`) bir kare, `CELL` × `CELL` boyunda.

# --task--

1. Above `function draw() {` write `cellX` and `cellY`.
2. In `draw`, under the board's `fillRect`, leave an empty line and write the two loops.

# --task-tr--

1. `function draw() {` satırının **üstüne** `cellX` ve `cellY` fonksiyonlarını yaz; aralarında ve altlarında birer boş
   satır kalsın.
2. `draw` içinde tahtayı boyayan `ctx.fillRect(0, TOP, ...)` satırının altında bir boş satır bırak ve iki döngüyü yaz.
3. **Çalıştır**: tahtada 4×4 boş hücre görmelisin.

# --try--

Set `SIZE` to `5` and run: 25 smaller cells, and everything still fits. Put `4` back.

# --try-tr--

`SIZE`'ı `5` yap ve çalıştır: 25 daha küçük hücre, ve her şey yine sığıyor. Sonra `4`'e geri al.

# --tests--

Cells should be laid out with gaps below the score strip.
tr: Hücreler skor şeridinin altında boşluklarla dizilmeli.

```js
assert.deepEqual([cellX(0), cellX(1), cellX(3)], [12, 109, 303])
assert.deepEqual([cellY(0), cellY(3)], [72, 363])
```

Sixteen empty 85×85 cells should be drawn.
tr: 85×85'lik on altı boş hücre çizilmeli.

```js
const cells = $.rects('#cdc1b4')
assert.lengthOf(cells, 16)
assert.deepInclude(cells, { x: 12, y: 72, w: 85, h: 85, color: '#cdc1b4' })
assert.deepInclude(cells, { x: 303, y: 363, w: 85, h: 85, color: '#cdc1b4' })
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      ctx.fillStyle = '#cdc1b4'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
    }
  }
}

draw()
```
