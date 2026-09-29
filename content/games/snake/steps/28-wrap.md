---
title: "Build it yourself: through the walls"
title_tr: "Kendin yap: duvarlardan geç"
skills: [game.collision, game.state]
---

# --goal--

Your game, your rules. Change it so the walls are open: a snake that leaves one edge comes back on the opposite edge,
and only running into itself ends the game.

# --goal-tr--

Oyun senin, kurallar da! Duvarları **açık** yap: bir kenardan çıkan yılan **karşı kenardan** geri girsin; oyunu
yalnız kendine çarpmak bitirsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: yeni başın yeri, `COLS` ve `ROWS`, `%` (bölümden kalan)... Kontroller
çalıştığında yeşile döner.

# --task--

Make the snake wrap around the edges instead of crashing into them.

# --task-tr--

- Sağ kenardan çıkan yılan aynı satırda sol kenardan girsin (ve tersi).
- Üst kenardan çıkan alt kenardan girsin (ve tersi).
- Kendine çarpmak oyunu yine bitirsin.

Değiştireceğin yer `update` fonksiyonu. Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Adding `COLS` before `% COLS` keeps the number from going below zero: `(-1 + 20) % 20` is `19`.

# --hint-tr--

Yeni başın sütununu `(snake[0].x + dir.x + COLS) % COLS` gibi hesaplayabilirsin: `COLS` eklemek sayının sıfırın altına
düşmesini önler, `(-1 + 20) % 20` = `19`. Artık `hitWall`'a gerek kalmıyor.

# --tests--

Leaving the right edge should bring the snake back on the left, and the game goes on.
tr: Sağ kenardan çıkan yılan soldan geri gelmeli ve oyun sürmeli.

```js
food = { x: 10, y: 19 }
snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }]
dir = nextDir = { x: 1, y: 0 }
update()
assert.isFalse(gameOver)
assert.deepEqual(snake[0], { x: 0, y: 5 })
```

Leaving the top edge should bring the snake back at the bottom.
tr: Üst kenardan çıkan yılan alttan geri gelmeli.

```js
food = { x: 10, y: 10 }
snake = [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }]
dir = nextDir = { x: 0, y: -1 }
update()
assert.isFalse(gameOver)
assert.deepEqual(snake[0], { x: 3, y: 19 })
```

Running into its own body should still end the game.
tr: Kendi gövdesine çarpmak oyunu yine bitirmeli.

```js
food = { x: 0, y: 19 }
snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }]
dir = { x: 0, y: -1 }
nextDir = { x: -1, y: 0 }
update()
assert.isTrue(gameOver)
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
let snake
let dir
let nextDir
let food
let score
let gameOver
let speed // milliseconds between moves
let best = Number(localStorage.getItem('snake-best')) || 0
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
  speed = 150
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
  const head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS }
  const hitSelf = snake.slice(0, -1).some((part) => part.x === head.x && part.y === head.y)
  if (hitSelf) {
    gameOver = true
    if (score > best) {
      best = score
      localStorage.setItem('snake-best', best)
    }
    return
  }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score += 1
    speed = Math.max(60, speed - 8)
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
  ctx.fillText('Best: ' + best, 8, 40)

  if (gameOver) {
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop(time) {
  if (!gameOver && time - last >= speed) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
