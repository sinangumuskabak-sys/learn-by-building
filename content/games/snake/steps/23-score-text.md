---
title: Show the score
title_tr: Skoru göster
skills: [game.canvas]
---

# --goal--

The score is counted but never shown. We write it in the top-left corner on every frame.

# --goal-tr--

Puanı sayıyoruz ama oyuncu göremiyor. Sol üst köşeye her karede **Score: 3** gibi yazacağız.

Beyaz rengi artık skor yazısı seçtiği için "Game Over" bloğundaki `ctx.fillStyle = 'white'` satırına gerek
kalmıyor; onu siliyoruz.

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = '16px sans-serif'
ctx.textAlign = 'left'
ctx.fillText('Score: ' + score, 8, 20)
```

# --meaning--

- `'Score: ' + score` joins text and a number: `Score: 3`.
- `8, 20` is 8 pixels from the left, 20 from the top.
- White is already picked here, so the Game Over block no longer needs its own `fillStyle`.

# --meaning-tr--

- `ctx.textAlign = 'left'` → yazı verdiğimiz noktadan **sağa doğru** başlasın.
- `'Score: ' + score` → metinle sayıyı yan yana ekler: `score` 3 ise `Score: 3` olur. `+` metinlerde "yapıştır"
  demektir.
- `8, 20` → soldan 8, yukarıdan 20 piksel: sol üst köşe.
- "Game Over" bloğu bu satırlardan **sonra** çizildiği için beyaz renk zaten seçili; oradaki `fillStyle` satırı
  gereksiz.

# --task--

1. After the snake's `for` loop, leave an empty line and write the four score lines.
2. Delete `ctx.fillStyle = 'white'` inside the `if (gameOver)` block.

# --task-tr--

1. Yılanı çizen `for` döngüsünün altına bir boş satır bırak ve dört skor satırını yaz.
2. `if (gameOver) {` bloğunun içindeki `ctx.fillStyle = 'white'` satırını sil.
3. **Çalıştır** ve bir yem ye: sol üstte skor artmalı.

# --hint--

Mind the space after the colon: `'Score: '`.

# --hint-tr--

İki noktadan sonraki boşluğa dikkat: `'Score: '`.

# --tests--

The score should be drawn.
tr: Skor ekrana yazılmalı.

```js
food = { x: 6, y: 5 }
$.run(0.2)
assert.include($.texts(), 'Score: 1')
```

"Game Over" should still be drawn when the game ends.
tr: Oyun bitince "Game Over" yine yazmalı.

```js
food = { x: 0, y: 19 }
$.run(4)
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

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 8, 20)

  if (gameOver) {
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
