---
title: No U-turns
title_tr: Geri dönüş yok
skills: [game.input, game.state]
---

# --goal--

A snake cannot turn straight back into its own neck. We ignore the opposite direction, and keep the chosen turn
in `nextDir` until the snake actually moves.

# --goal-tr--

Sağa giden yılan birden **sola** dönerse kendi boynuna çarpar. Gerçek Yılan oyununda bu yasaktır: **tam ters
yöne** basılırsa görmezden gelinir.

Bir incelik daha: oyuncu iki tuşa çok hızlı basarsa (yukarı, hemen sonra sol) yılan daha hareket etmeden yön iki
kez değişir ve yine geri dönmüş olur. Bu yüzden seçilen yönü `nextDir`'de (sıradaki yön) bekletip, yılan
**gerçekten hareket ederken** `dir`'e aktaracağız.

# --code--

```js
let nextDir = dir

  // Ignore a turn straight back into the snake's own neck.
  if (turn.x === -dir.x && turn.y === -dir.y) return
  nextDir = turn

function update() {
  dir = nextDir
```

# --meaning--

- The opposite of `{ x: 1, y: 0 }` is `{ x: -1, y: 0 }`: both numbers negated. If the new turn is exactly that, ignore it.
- Keys only set `nextDir`; `update` copies it into `dir` right before moving, once per move.

# --meaning-tr--

- `let nextDir = dir` → **sıradaki yön**; başta şu anki yönle aynı.
- `if (turn.x === -dir.x && turn.y === -dir.y) return` → ters yön, iki sayının **eksi** işaretlisidir:
  sağın (`1, 0`) tersi solun (`-1, 0`). Yeni yön şu anki yönün tam tersiyse hiçbir şey yapma.
- `nextDir = turn` → yönü hemen değiştirmiyoruz, **sıraya koyuyoruz**.
- `update` içindeki `dir = nextDir` → yılan hareket etmeden hemen önce sıradaki yön asıl yön olur. Böylece her
  harekette yön en fazla **bir kez** değişir.

# --task--

1. Under `let dir = ...` write `let nextDir = dir`.
2. In the listener, add the comment and the reverse check, and change `dir = turn` to `nextDir = turn`.
3. Make `dir = nextDir` the first line of `update`.

# --task-tr--

1. `let dir = ...` satırının altına `let nextDir = dir` yaz.
2. Dinleyicide `if (!turn) return` satırının altına yorum satırını ve ters yön kontrolünü yaz; `dir = turn`
   satırını `nextDir = turn` yap.
3. `update` fonksiyonunun **ilk satırı** `dir = nextDir` olsun.
4. **Çalıştır**: sağa giderken sol oka bas, yılan umursamamalı.

# --tests--

Pressing Left while moving right should be ignored.
tr: Sağa giderken sol ok görmezden gelinmeli.

```js
$.press('ArrowLeft')
$.run(0.5)
assert.isAbove(snake[0].x, 5)
assert.strictEqual(snake[0].y, 5)
```

Keys should set `nextDir`, and `dir` should change only when the snake moves.
tr: Tuşlar `nextDir`'i değiştirmeli; `dir` yalnız yılan hareket edince değişmeli.

```js
$.press('ArrowUp')
assert.deepEqual(nextDir, { x: 0, y: -1 })
assert.deepEqual(dir, { x: 1, y: 0 })
update()
assert.deepEqual(dir, { x: 0, y: -1 })
```

Quickly pressing Up then Left while moving right should move the snake up, not into its neck.
tr: Sağa giderken hızlıca yukarı sonra sol basmak yılanı yukarı götürmeli, boynuna değil.

```js
food = { x: 0, y: 19 }
$.press('ArrowUp')
$.press('ArrowLeft')
update()
assert.deepEqual(snake[0], { x: 5, y: 4 })
assert.deepEqual(snake[1], { x: 5, y: 5 })
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
