---
title: Play again with Space
title_tr: Boşlukla yeniden oyna
skills: [game.input]
---

# --goal--

After game over, Space (or Enter) calls `reset()`. A line under "Game Over" tells the player how.

# --goal-tr--

Oyun bitince **Boşluk** (ya da Enter) tuşu yeni bir oyun başlatsın. Oyuncu bunu bilsin diye "Game Over"ın altına
küçük bir yazı ekliyoruz.

# --code--

```js
if (gameOver && (event.key === ' ' || event.key === 'Enter')) {
  reset()
  return
}

  ctx.font = '16px sans-serif'
  ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
```

# --meaning--

- Only when the game is over **and** the key is Space (`' '`) or Enter: start a new game and stop there.
- The second text goes 32 pixels below the middle in a smaller font.

# --meaning-tr--

- `if (gameOver && (event.key === ' ' || event.key === 'Enter'))` → oyun bittiyse **ve** basılan tuş Boşluk
  (`' '`, tırnak içinde bir boşluk) **veya** Enter ise. İç parantez "veya"yı bir arada tutar.
- `reset()` → yeni oyun. `return` → dinleyicinin geri kalanı (yön değiştirme) çalışmasın.
- `ctx.font = '16px sans-serif'` → daha küçük yazı.
- `canvas.height / 2 + 32` → ortanın 32 piksel **altı**: Game Over'ın altına.

# --task--

1. Make the Space check the first lines inside the listener.
2. In the `if (gameOver)` block of `draw`, under the Game Over line, add the two lines.

# --task-tr--

1. Dinleyicinin içinde, `const turn = ...` satırının **üstüne** Boşluk kontrolünü yaz.
2. `draw` içindeki `if (gameOver)` bloğunda "Game Over" satırının altına iki satırı ekle.
3. **Çalıştır**, duvara çarp, Boşluk'a bas.

# --tests--

Space should start a new game after game over, and only then.
tr: Boşluk oyun bitince yeni oyun başlatmalı, yalnız o zaman.

```js
food = { x: 0, y: 19 }
$.run(0.5)
$.tap(' ')
assert.isAbove(snake[0].x, 5, 'Space during a game should do nothing')
$.run(4)
assert.isTrue(gameOver)
$.tap(' ')
assert.isFalse(gameOver)
assert.strictEqual(score, 0)
assert.deepEqual(snake[0], { x: 5, y: 5 })
```

The game over screen should say how to play again.
tr: Oyun bitti ekranı yeniden oynamanın yolunu söylemeli.

```js
food = { x: 0, y: 19 }
$.run(4)
assert.include($.texts(), 'Press Space to play again')
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
let snake
let dir
let nextDir
let food
let score
let gameOver
let last = 0

function reset() {
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]
  dir = { x: 1, y: 0 }
  nextDir = dir
  score = 0
  gameOver = false
  placeFood()
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
}

const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  if (gameOver && (event.key === ' ' || event.key === 'Enter')) {
    reset()
    return
  }
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

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 8, 20)

  if (gameOver) {
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
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

reset()
requestAnimationFrame(loop)
```
