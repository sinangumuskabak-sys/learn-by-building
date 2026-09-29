---
title: Never put food on the snake
title_tr: Yemi yılanın üstüne koyma
skills: [prog.arrays, prog.loops]
---

# --goal--

Random food can land on the snake's body. We keep picking until the cell is free.

# --goal-tr--

Rastgele seçilen yem bazen **yılanın gövdesine** denk gelir; o zaman görünmez olur. Çözüm: seçilen hücre yılanın
üstündeyse **tekrar seç**, boş bir hücre bulana kadar.

# --code--

```js
function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}
```

# --meaning--

- `do { ... } while (condition)` runs the body once, then again as long as the condition is true.
- `snake.some(test)` is true if at least one part passes the test: here, "is this part on the food cell?".

# --meaning-tr--

- `do { ... }` → süslü parantez içini **önce bir kez yap** (yem seç).
- `while (...)` → parantez içindeki koşul doğru olduğu sürece **tekrar yap**.
- `snake.some((part) => part.x === food.x && part.y === food.y)` → "yılanın parçalarından **en az biri** yemle
  aynı hücrede mi?" `some` dizideki her parçaya bu soruyu sorar; birinde bile evet çıkarsa sonuç `true`.
- Sonuç: yem yılanın üstüne düştükçe yeniden seçilir; boş bir hücre bulununca döngü biter.

# --task--

Wrap the line inside `placeFood` in `do { ... } while (...)` as shown.

# --task-tr--

`placeFood` içindeki satırın üstüne `do {` yaz, satırı iki boşluk daha içeri al, altına `} while (...)` satırını
yaz. **Çalıştır**.

# --hint--

The condition goes after `while`, in parentheses, and the loop body stays between `do {` and `}`.

# --hint-tr--

Koşul `while`'dan sonra parantez içine yazılır; seçim satırı `do {` ile `}` arasında kalır.

# --tests--

`placeFood()` should never pick a cell the snake is on.
tr: `placeFood()` yılanın bulunduğu bir hücreyi asla seçmemeli.

```js
snake = []
for (let x = 0; x < 20; x++) for (let y = 0; y < 20; y++) if (x > 1 || y > 1) snake.push({ x, y })
for (let i = 0; i < 30; i++) {
  placeFood()
  assert.isTrue(food.x >= 0 && food.x <= 1 && food.y >= 0 && food.y <= 1, `food landed on ${JSON.stringify(food)}`)
}
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
let score = 0
let last = 0

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
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
  if (head.x === food.x && head.y === food.y) {
    score += 1
    placeFood()
  } else {
    snake.pop()
  }
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
