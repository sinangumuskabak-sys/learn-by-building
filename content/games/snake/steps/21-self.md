---
title: Crash into yourself
title_tr: Kendine çarpma
skills: [game.collision, prog.arrays]
---

# --goal--

Running into your own body ends the game too. The tail is left out of the check, because it moves away this turn.

# --goal-tr--

İkinci ölüm kuralı: yılan **kendi gövdesine** çarparsa oyun biter. Yeni baş, gövdenin herhangi bir parçasıyla
aynı hücreye geliyorsa çarpmıştır.

Küçük bir istisna: **kuyruk** bu turda zaten yerinden çekileceği için ona "çarpmak" sayılmaz.

# --code--

```js
const hitSelf = snake.slice(0, -1).some((part) => part.x === head.x && part.y === head.y)
if (hitWall || hitSelf) {
```

# --meaning--

- `snake.slice(0, -1)` is a copy of the snake without its last part (the tail).
- `.some(...)` is true if any of those parts is on the new head's cell.
- The game ends on a wall **or** on yourself.

# --meaning-tr--

- `snake.slice(0, -1)` → yılanın **kuyruksuz kopyası**. `slice(0, -1)` "baştan başla, sondan bir önceki parçada
  dur" demek.
- `.some((part) => part.x === head.x && part.y === head.y)` → bu parçalardan **en az biri** yeni başla aynı
  hücrede mi? (Yemin yılana düşmemesi için kullandığımız sorunun aynısı.)
- `if (hitWall || hitSelf)` → duvara **veya** kendine çarptıysa oyun biter.

# --task--

Under `hitWall` write `hitSelf`, and change `if (hitWall)` to `if (hitWall || hitSelf)`.

# --task-tr--

1. `const hitWall = ...` satırının altına `hitSelf` satırını yaz.
2. `if (hitWall) {` satırını `if (hitWall || hitSelf) {` yap.
3. **Çalıştır**: yılanı birkaç yem yiyerek uzat ve kendi üstüne döndür.

# --tests--

Running into its own body should end the game.
tr: Kendi gövdesine çarpmak oyunu bitirmeli.

```js
food = { x: 0, y: 19 }
snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }]
dir = { x: 0, y: -1 }
nextDir = { x: -1, y: 0 }
update()
assert.isTrue(gameOver)
assert.lengthOf(snake, 5)
```

Following your own tail is allowed.
tr: Kendi kuyruğunun peşinden gitmek serbest olmalı.

```js
food = { x: 0, y: 19 }
snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }]
dir = nextDir = { x: -1, y: 0 }
update()
assert.isFalse(gameOver)
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
