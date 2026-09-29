---
title: Nine by nine
title_tr: Dokuza dokuz
skills: [game.canvas, prog.loops]
---

# --goal--

Sudoku is played on 9 × 9 cells. We draw them, centered, as white squares on a light background.

# --goal-tr--

**Sudoku** yapıyoruz: önce oynanabilir bir bulmaca, sonra bilgisayara onu **çözmeyi** ve yeni bulmacalar **icat
etmeyi** öğreteceğiz. Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

Sudoku **9 × 9 = 81** hücrede oynanır. Önce hücreleri çiziyoruz: açık bir arka plan üstünde, ortalanmış beyaz kareler.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, SIZE, SIZE)
    }
  }
}

draw()
```

# --meaning--

- `SIZE` is a cell's width; `LEFT` is the free space on each side, so the 9-cell board is centered; `TOP` leaves room
  for the time above.
- Two nested loops go through the 9 rows (`r`) and, in each, the 9 columns (`c`): 81 cells.
- Each cell's corner is `LEFT + c * SIZE`, `TOP + r * SIZE`.

# --meaning-tr--

- `const SIZE = 48` → bir hücrenin kenarı, piksel.
- `const LEFT = (canvas.width - 9 * SIZE) / 2` → 9 hücrelik tahtadan artan genişliğin yarısı: tahta yatayda **ortalanır**.
- `const TOP = 56` → üstte süre yazısı için boşluk.
- `for (let r = 0; r < 9; r++)` ve içindeki `for (let c ...)` → iç içe iki döngü: 9 satır × 9 sütun = 81 tur.
- `const x = LEFT + c * SIZE`, `const y = TOP + r * SIZE` → o hücrenin sol üst köşesi.
- Her hücre beyaz bir kare: `fillRect(x, y, SIZE, SIZE)`.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: ortada büyük beyaz bir kare görmelisin (hücreler arası çizgiler sonraki adımda).

# --tests--

81 white cells should be drawn, centered.
tr: Ortalanmış 81 beyaz hücre çizilmeli.

```js
assert.strictEqual(LEFT, 14)
const cells = $.rects('#ffffff')
assert.lengthOf(cells, 81)
assert.deepEqual(cells[0], { x: 14, y: 56, w: 48, h: 48, color: '#ffffff' })
assert.deepEqual(cells[80], { x: 14 + 8 * 48, y: 56 + 8 * 48, w: 48, h: 48, color: '#ffffff' })
```

# --seed--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, SIZE, SIZE)
    }
  }
}

draw()
```
