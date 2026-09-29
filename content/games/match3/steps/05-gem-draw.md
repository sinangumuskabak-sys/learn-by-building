---
title: Draw the gems
title_tr: Mücevherleri çiz
skills: [game.canvas]
---

# --goal--

Each gem is a filled circle in the middle of its square, in the color its number points to.

# --goal-tr--

Şimdi mücevherleri çiziyoruz: her kare için ortasına, kendi renginde, içi dolu bir **daire**. Rengi, hücredeki
sayının `COLORS`'taki karşılığı.

# --code--

```js
const gem = board[r][c]
ctx.fillStyle = COLORS[gem]
ctx.beginPath()
ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
ctx.fill()
```

# --meaning--

- `COLORS[gem]` turns the number into a color.
- `arc(x, y, radius, start, end)` plans a circle; `Math.PI * 2` is a full turn. The centre is the middle of the
  square and the radius 18 leaves a 6-pixel margin.
- `fill()` fills the planned circle.

# --meaning-tr--

- `const gem = board[r][c]` → bu hücredeki mücevherin sayısı.
- `ctx.fillStyle = COLORS[gem]` → sayıyı renge çevir: `gem` 3 ise mavi.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)` → bir daire planlar:
  - `x + SIZE / 2`, `y + SIZE / 2` → merkez: karenin tam ortası (24 piksel içeride).
  - `SIZE / 2 - 6` → yarıçap 18: kenarlarda 6 piksel boşluk kalır.
  - `0, Math.PI * 2` → açılar **radyan** ile; `Math.PI` yarım tur, `Math.PI * 2` tam tur: bütün daire.
- `ctx.fill()` → planlanan dairenin içini boya.

# --task--

In `draw`, inside the inner loop, under `ctx.fillRect(x, y, SIZE, SIZE)`, write the five lines.

# --task-tr--

1. `draw` içinde, iç döngüde `ctx.fillRect(x, y, SIZE, SIZE)` satırının **altına** beş satırı yaz.
2. **Çalıştır**: 64 renkli mücevher görmelisin. Birkaç kez çalıştır ve dikkatle bak.

# --predict--

Look at the new board: are there already three gems of one color in a row somewhere?
- [x] Almost always, yes
  With random colors, 64 gems nearly always contain a run of three. The game would start by clearing gems the player
  never touched. The next step fixes this.
- [ ] Never
- [ ] Only on the edges

# --predict-tr--

Yeni tahtaya bak: bir yerde aynı renkten üç mücevher zaten yan yana ya da alt alta mı?
- [x] Neredeyse her zaman, evet
  Rastgele renklerle 64 mücevherde neredeyse hep bir üçlü olur. Oyun, oyuncunun dokunmadığı mücevherleri silerek
  başlardı. Bir sonraki adım bunu düzeltecek.
- [ ] Asla
- [ ] Yalnız kenarlarda

# --tests--

Each gem should be drawn as a circle in the middle of its cell, in its color.
tr: Her mücevher kendi hücresinin ortasında, kendi renginde bir daire olarak çizilmeli.

```js
$.tick(1)
const gems = $.arcs().filter((a) => a.r === 18)
assert.lengthOf(gems, 64)
assert.deepInclude(gems, { x: 32, y: 96, r: 18, color: COLORS[board[0][0]] })
assert.deepInclude(gems, { x: 368, y: 432, r: 18, color: COLORS[board[7][7]] })
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

let board // board[row][col]: a color index

const randomGem = () => Math.floor(Math.random() * COLORS.length)

function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      board[r].push(randomGem())
    }
  }
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      ctx.fillStyle = COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newBoard()
requestAnimationFrame(loop)
```
