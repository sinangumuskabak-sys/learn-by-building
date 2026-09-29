---
title: Remember the best score
title_tr: En iyi skoru hatırla
skills: [game.state]
---

# --goal--

The best score should survive closing the page. `localStorage` keeps small pieces of text in the browser.

# --goal-tr--

Rekoru kırmak oyunun tadıdır. **En iyi skoru** tutacağız ve sayfa kapansa bile unutulmayacak.

Bunun için tarayıcının küçük not defterini kullanırız: `localStorage`. Oraya bir **ad** ile bir yazı
kaydedersin; sayfayı kapatıp açsan bile yerinde durur.

# --code--

```js
let best = Number(localStorage.getItem('snake-best')) || 0

    if (score > best) {
      best = score
      localStorage.setItem('snake-best', best)
    }

  ctx.fillText('Best: ' + best, 8, 40)
```

# --meaning--

- `localStorage.getItem('snake-best')` reads the saved text (or `null` the first time); `Number(...)` turns it
  into a number, and `|| 0` falls back to 0.
- When the game ends with a higher score, we update `best` and save it with `setItem`.
- The best score is drawn under the score.

# --meaning-tr--

- `localStorage.getItem('snake-best')` → not defterinden `snake-best` adlı kaydı okur. İlk oyunda kayıt yoktur:
  `null` gelir.
- `Number(...)` → kayıtlar hep yazıdır (`'7'`); `Number` onu sayıya (`7`) çevirir.
- `|| 0` → soldaki bir şey vermezse (kayıt yoksa) **0** kullan.
- `if (score > best)` → oyun biterken skor rekordan büyükse:
  - `best = score` → yeni rekor.
  - `localStorage.setItem('snake-best', best)` → deftere **yaz**.
- `ctx.fillText('Best: ' + best, 8, 40)` → skorun 20 piksel altına rekoru yaz.

# --task--

1. Under `let gameOver` write the `best` line.
2. In `update`, under `gameOver = true`, write the `if (score > best)` block.
3. In `draw`, under the Score line, write the Best line.

# --task-tr--

1. `let gameOver` satırının altına `best` satırını yaz.
2. `update` içinde `gameOver = true` satırının altına `if (score > best) { ... }` bloğunu yaz (`return`'den önce).
3. `draw` içinde Score satırının altına Best satırını yaz.
4. **Çalıştır**, birkaç yem ye, çarp; sonra sayfayı yenile: rekor durmalı.

# --tests--

The best score should be drawn.
tr: En iyi skor ekrana yazılmalı.

```js
$.tick()
assert.include($.texts(), 'Best: 0')
```

A new best score should be saved when the game ends.
tr: Oyun bitince yeni rekor kaydedilmeli.

```js
food = { x: 6, y: 5 }
update()
food = { x: 0, y: 19 }
$.run(4)
assert.isTrue(gameOver)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('snake-best'), '1')
assert.include($.texts(), 'Best: 1')
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
    if (score > best) {
      best = score
      localStorage.setItem('snake-best', best)
    }
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
