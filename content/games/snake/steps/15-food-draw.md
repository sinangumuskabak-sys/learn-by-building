---
title: Draw the food
title_tr: Yemi çiz
skills: [game.canvas]
---

# --goal--

Now the food appears: a red cell, drawn after the background and before the snake.

# --goal-tr--

Yem artık görünsün: **kırmızı** bir hücre. Arka plandan sonra, yılandan önce çizeceğiz; böylece yılan yemin
üstünden geçerken onu örter.

# --code--

```js
ctx.fillStyle = 'red'
ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL)
```

# --meaning--

- The same two drawing steps as always: pick red, fill one cell at `food`'s column and row.

# --meaning-tr--

- `ctx.fillStyle = 'red'` → rengi kırmızı yap.
- `ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL)` → yemin sütun ve satırındaki hücreyi doldur.
  Yılanın parçalarını çizdiğimiz satırın aynısı; yalnız `part` yerine `food`.

# --task--

In `draw`, after the background's `fillRect` line, leave an empty line and write the two red lines.

# --task-tr--

`draw` içinde arka planı boyayan `ctx.fillRect(0, 0, ...)` satırının altına bir boş satır bırak ve iki kırmızı
satırı yaz. **Çalıştır**: tahtada kırmızı bir kare görünmeli.

# --predict--

What happens when the snake reaches the food?
- [ ] It eats it and grows
  Not yet: nothing checks whether the head is on the food.
- [x] It slides over it; nothing happens
- [ ] The game ends

# --predict-tr--

Yılan yeme ulaşınca ne olur?
- [ ] Yer ve uzar
  Henüz değil: başın yemin üstünde olup olmadığına bakan bir kod yok.
- [x] Üstünden geçer, bir şey olmaz
- [ ] Oyun biter

# --tests--

The food should be drawn as a red cell.
tr: Yem kırmızı bir hücre olarak çizilmeli.

```js
$.tick()
assert.deepEqual($.rects('red'), [{ x: food.x * 20, y: food.y * 20, w: 20, h: 20, color: 'red' }])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
const COLS = canvas.width / CELL
const ROWS = canvas.height / CELL
const SPEED = 150 // milliseconds between moves
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
]
let dir = { x: 1, y: 0 }
let food
let last = 0

function placeFood() {
  food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

placeFood()

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
  if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
  if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
  if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
})

function update() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  snake.unshift(head)
  snake.pop()
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'red'
  ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL)

  ctx.fillStyle = 'lime'
  for (const part of snake) {
    ctx.fillRect(part.x * CELL, part.y * CELL, CELL, CELL)
  }
}

function loop(time) {
  if (time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
