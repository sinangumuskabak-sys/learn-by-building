---
title: One function that starts a game
title_tr: Oyunu başlatan tek fonksiyon
skills: [game.state, prog.functions]
---

# --goal--

To play again we must put every value back to its start. We gather all the starting values in `reset()` and call it
once at the start.

# --goal-tr--

Oyunu **yeniden başlatabilmek** için her şeyi başlangıç hâline döndürmemiz gerekecek: yılan, yön, skor, yem...
Bu değerler şu an değişkenlerin tanımlandığı satırlara dağılmış durumda.

Hepsini tek bir fonksiyonda toplayacağız: `reset()` (sıfırla). Değişkenler en üstte **boş** tanımlanır, değerlerini
`reset` verir. Oyun açılırken `reset()` bir kez çağrılır; bir sonraki adımda Boşluk tuşu da onu çağıracak.

# --code--

```js
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

reset()
requestAnimationFrame(loop)
```

# --meaning--

- The variables are declared at the top without values.
- `reset()` gives them their starting values and places the first food.
- The old `placeFood()` call is replaced by `reset()` at the bottom, before the loop starts.

# --meaning-tr--

- `let snake` → değişken **tanımlanır ama değer verilmez**; değeri `reset` verecek.
- `function reset() {` → oyunun başlangıç hâlini kuran fonksiyon. Değerlerin hepsi burada, tek yerde.
  Dikkat: içeride `let` yok, çünkü değişkenler zaten yukarıda tanımlı; burada yalnız **değer veriyoruz**.
- `placeFood()` artık `reset`'in içinde: her yeni oyunda yeni yem.
- En alttaki `reset()` → oyun açılırken ilk oyunu kurar, sonra döngü başlar.

# --task--

1. Replace the variable lines (from `let snake = [` to `let gameOver = false`) with the empty declarations and `reset`.
2. Delete the lone `placeFood()` call under `placeFood`.
3. Call `reset()` right before `requestAnimationFrame(loop)` at the bottom.

# --task-tr--

1. `let snake = [` satırından `let gameOver = false` satırına kadar olan değişkenleri sil; yerine değer vermeden
   tanımlanan değişkenleri ve `reset` fonksiyonunu yaz (`let last = 0` aynı kalır).
2. `placeFood` fonksiyonunun altındaki tek başına `placeFood()` çağrısını sil.
3. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `reset()` yaz.
4. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --hint--

Inside `reset` write `snake = ...`, not `let snake = ...`: a `let` there would make a new variable that only lives inside `reset`.

# --hint-tr--

`reset` içinde `let snake = ...` değil `snake = ...` yaz: oradaki bir `let` yalnız `reset`'in içinde yaşayan yeni bir değişken yaratır.

# --tests--

`reset()` should bring back a fresh game.
tr: `reset()` yepyeni bir oyun getirmeli.

```js
snake = [{ x: 1, y: 1 }]
score = 9
gameOver = true
dir = nextDir = { x: 0, y: 1 }
reset()
assert.deepEqual(snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }])
assert.deepEqual(dir, { x: 1, y: 0 })
assert.deepEqual(nextDir, { x: 1, y: 0 })
assert.strictEqual(score, 0)
assert.isFalse(gameOver)
assert.isObject(food)
```

The game should still start and run.
tr: Oyun yine başlamalı ve çalışmalı.

```js
food = { x: 0, y: 19 }
$.run(0.5)
assert.isAbove(snake[0].x, 5)
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

reset()
requestAnimationFrame(loop)
```
