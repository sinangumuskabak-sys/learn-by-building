---
title: Speed up as you grow
title_tr: Büyüdükçe hızlan
skills: [game.loop]
---

# --goal--

The last touch: every food makes the snake a little faster, down to a limit. `SPEED` becomes a variable `speed`.

# --goal-tr--

Son dokunuş: her yem yılanı **biraz hızlandırsın**; oyun ilerledikçe zorlaşsın. Ama sonsuza kadar değil: bir
sınırda dursun, yoksa oynanamaz olur.

Hız artık değişeceği için sabit `SPEED` yerine değişken `speed` kullanacağız ve her yeni oyunda 150'ye döneceğiz.

# --code--

```js
let speed // milliseconds between moves

  speed = 150

    speed = Math.max(60, speed - 8)

  if (!gameOver && time - last >= speed) {
```

# --meaning--

- `speed` replaces the constant `SPEED`; `reset` sets it to 150.
- Each food takes 8 ms off the wait. `Math.max(60, ...)` picks the bigger number, so it never goes under 60.

# --meaning-tr--

- `const SPEED = 150` satırı gidiyor; yerine değişken `let speed` geliyor (küçük harf, çünkü artık sabit değil).
- `reset` içinde `speed = 150` → her yeni oyun normal hızda başlar.
- `speed = Math.max(60, speed - 8)` → her yemde bekleme 8 ms azalır (daha hızlı). `Math.max(60, ...)` iki
  sayıdan **büyüğünü** seçer: bekleme 60'ın altına hiç inmez. Hız sınırı bu.
- `loop` içinde `SPEED` yerine `speed`.

# --task--

1. Delete the `const SPEED` line; under `let gameOver` write `let speed`.
2. In `reset`, set `speed = 150` before `placeFood()`.
3. In `update`, speed up after `score += 1`.
4. In `loop`, use `speed` instead of `SPEED`.

# --task-tr--

1. `const SPEED = 150 ...` satırını sil; `let gameOver` satırının altına `let speed ...` yaz.
2. `reset` içinde `placeFood()` satırının üstüne `speed = 150` yaz.
3. `update` içinde `score += 1` satırının altına hızlanma satırını yaz.
4. `loop` içinde `SPEED` yerine `speed` yaz.
5. **Çalıştır** ve oyna: her yemde biraz daha hızlanmalı. Oyun bitti!

# --try--

Try `Math.max(40, speed - 15)`: a much harder game. Pick the numbers you like best.

# --try-tr--

`Math.max(40, speed - 15)` dene: çok daha zor bir oyun. Sana en iyi gelen sayıları seç.

# --tests--

`speed` should start at 150 and be reset to 150 by `reset()`.
tr: `speed` 150'den başlamalı ve `reset()` onu 150'ye döndürmeli.

```js
assert.strictEqual(speed, 150)
speed = 70
reset()
assert.strictEqual(speed, 150)
```

Eating should make the snake 8 ms faster.
tr: Her yem yılanı 8 ms hızlandırmalı.

```js
food = { x: 6, y: 5 }
update()
assert.strictEqual(speed, 142)
```

The speed should never go below 60.
tr: Bekleme asla 60'ın altına inmemeli.

```js
speed = 64
food = { x: 6, y: 5 }
update()
assert.strictEqual(speed, 60)
food = { x: 7, y: 5 }
update()
assert.strictEqual(speed, 60)
```

The loop should use the current speed.
tr: Döngü o anki hızı kullanmalı.

```js
food = { x: 0, y: 19 }
speed = 60
snake = [{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
dir = nextDir = { x: 1, y: 0 }
$.run(1)
assert.isAtLeast(snake[0].x, 14, 'at 60 ms per move the snake should make about 15 moves a second')
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
