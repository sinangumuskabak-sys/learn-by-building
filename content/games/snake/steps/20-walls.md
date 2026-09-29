---
title: Crash into the walls
title_tr: Duvara çarpma
skills: [game.collision, game.state]
---

# --goal--

Leaving the board ends the game. Before moving, we check whether the new head would be outside; if so we set
`gameOver` and stop moving.

# --goal-tr--

Şu an yılan tahtadan çıkıp kayboluyor. Kural: **duvara çarpan yılan ölür.** Hareket etmeden önce yeni başın
tahtanın dışında kalıp kalmayacağına bakacağız. Dışındaysa oyun biter ve yılan durur.

Oyunun bitip bitmediğini bir **doğru/yanlış** değişkeninde tutarız: `gameOver`.

# --code--

```js
let gameOver = false

  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
  if (hitWall) {
    gameOver = true
    return
  }

  if (!gameOver && time - last >= SPEED) {
```

# --meaning--

- `gameOver` is a boolean: `true` or `false`.
- `hitWall` is true if the head is left of column 0, past the last column, above row 0 or below the last row (`||` means "or").
- On a hit we set `gameOver` and `return` before the snake moves, so it stays inside the board.
- The loop only moves while `!gameOver` (not game over).

# --meaning-tr--

- `let gameOver = false` → **doğru/yanlış** (boolean) değişken: oyun bitti mi? Başta `false` (hayır).
- `const hitWall = ...` → dört durumdan **biri** doğruysa duvara çarptı: `||` "veya" demek.
  - `head.x < 0` → en soldan da sola çıktı. `head.x >= COLS` → en sağdan dışarı (sütunlar 0–19, 20 dışarıda).
  - `head.y < 0` → yukarıdan, `head.y >= ROWS` → aşağıdan dışarı.
- `if (hitWall) { gameOver = true; return }` → çarptıysa oyunu bitir ve `return` ile fonksiyondan **hemen çık**:
  `unshift` çalışmaz, yılan tahtanın içinde kalır.
- `if (!gameOver && ...)` → döngü yalnız oyun **bitmemişken** hareket ettirir. Çizim sürer, yılan donar.

# --task--

1. Under `let score = 0` write `let gameOver = false`.
2. In `update`, under the `const head` line, write the `hitWall` check.
3. In `loop`, add `!gameOver && ` at the start of the `if` condition.

# --task-tr--

1. `let score = 0` satırının altına `let gameOver = false` yaz.
2. `update` içinde `const head = ...` satırının altına `hitWall` satırını ve `if (hitWall) { ... }` bloğunu yaz.
3. `loop` içindeki `if (` koşulunun başına `!gameOver && ` ekle.
4. **Çalıştır** ve duvara çarp: yılan durmalı.

# --hint--

Columns go from 0 to 19, so column 20 (`COLS`) is already outside: use `>=`, not `>`.

# --hint-tr--

Sütunlar 0'dan 19'a kadar; 20. sütun (`COLS`) zaten dışarıda. Bu yüzden `>` değil `>=`.

# --tests--

Running into the right wall should end the game with the snake still inside the board.
tr: Sağ duvara çarpmak oyunu bitirmeli; yılan hâlâ tahtanın içinde olmalı.

```js
food = { x: 0, y: 19 }
$.run(4)
assert.isTrue(gameOver)
assert.deepEqual(snake[0], { x: 19, y: 5 })
```

Running into the top wall should end the game too.
tr: Üst duvara çarpmak da oyunu bitirmeli.

```js
food = { x: 0, y: 19 }
$.press('ArrowUp')
$.run(2)
assert.isTrue(gameOver)
assert.deepEqual(snake[0], { x: 5, y: 0 })
```

After game over the snake should stop moving.
tr: Oyun bitince yılan durmalı.

```js
food = { x: 0, y: 19 }
$.run(4)
const frozen = JSON.stringify(snake)
$.run(1)
assert.strictEqual(JSON.stringify(snake), frozen)
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
  if (hitWall) {
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
