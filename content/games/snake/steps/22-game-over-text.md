---
title: The game over message
title_tr: Oyun bitti yazısı
skills: [game.canvas]
---

# --goal--

When the game ends, write "Game Over" in the middle of the board.

# --goal-tr--

Oyun bitince oyuncu bunu görmeli: tahtanın ortasına büyük harflerle **Game Over** (oyun bitti) yazacağız.
Canvas'a yazı da tıpkı kare gibi kalemle çizilir.

# --code--

```js
if (gameOver) {
  ctx.fillStyle = 'white'
  ctx.font = '32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
}
```

# --meaning--

- Only when `gameOver` is true: pick white, a 32-pixel font, center alignment.
- `fillText(text, x, y)` writes the text; half the width and height is the middle of the board.

# --meaning-tr--

- `if (gameOver) {` → yalnız oyun bittiyse yaz.
- `ctx.font = '32px sans-serif'` → yazı boyu 32 piksel, düz (tırnaksız) bir yazı tipi.
- `ctx.textAlign = 'center'` → yazıyı verdiğimiz noktaya **ortala**.
- `ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)` → yazıyı çiz. `canvas.width / 2` = 200:
  tahtanın tam ortası.

# --task--

In `draw`, after the snake's `for` loop, leave an empty line and write the `if (gameOver)` block.

# --task-tr--

`draw` içinde yılanı çizen `for` döngüsünün altına bir boş satır bırak ve `if (gameOver)` bloğunu yaz. **Çalıştır** ve duvara çarp.

# --tests--

"Game Over" should be drawn when the game ends, and not before.
tr: Oyun bitince "Game Over" yazmalı, öncesinde yazmamalı.

```js
food = { x: 0, y: 19 }
$.run(1)
assert.notInclude($.texts(), 'Game Over')
$.run(3)
assert.include($.texts(), 'Game Over')
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
let nextDir = dir
let food
let score = 0
let gameOver = false
let last = 0

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}

placeFood()

const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  const turn = turns[event.key]
  if (!turn) return
  // Ignore a turn straight back into the snake's own neck.
  if (turn.x === -dir.x && turn.y === -dir.y) return
  nextDir = turn
})

function update() {
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
  const hitSelf = snake.slice(0, -1).some((part) => part.x === head.x && part.y === head.y)
  if (hitWall || hitSelf) {
    gameOver = true
    return
  }
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

  if (gameOver) {
    ctx.fillStyle = 'white'
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  }
}

function loop(time) {
  if (!gameOver && time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
