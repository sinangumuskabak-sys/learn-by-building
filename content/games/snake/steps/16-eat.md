---
title: Eat and grow
title_tr: Ye ve büyü
skills: [game.collision]
---

# --goal--

When the new head lands on the food: add a point, place new food, and skip removing the tail, so the snake grows
by one.

# --goal-tr--

Yılan yemi yiyince **bir parça uzamalı** ve **bir puan** kazanmalı.

Uzamanın yolu çok basit: hatırlarsan her adımda öne bir baş ekleyip sondan bir parça siliyorduk. Yem yenen
turda **sondan silmeyiz**. Önüne bir parça eklenmiş olur, yılan uzar.

# --code--

```js
let score = 0

  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score += 1
    placeFood()
  } else {
    snake.pop()
  }
```

# --meaning--

- `score` counts eaten food.
- The `if` asks: is the new head on the food (same column **and** same row)?
- Yes: one more point, new food, and no `pop`, so the snake keeps its extra cell. No (`else`): remove the tail as before.

# --meaning-tr--

- `let score = 0` → **puan**: 0'dan başlar.
- `if (head.x === food.x && head.y === food.y) {` → **eğer** yeni başın sütunu yemin sütunuyla **ve** satırı
  yemin satırıyla aynıysa (yani baş yemin üstündeyse). `&&` "ve" demek: iki koşul da doğru olmalı.
  - `score += 1` → bir puan ekle.
  - `placeFood()` → yeni yem koy.
- `} else {` → **değilse** (yem yenmediyse):
  - `snake.pop()` → kuyruğu her zamanki gibi sil.
- Yem yenen turda `pop` çalışmadığı için yılan **bir parça uzun** kalır.

# --task--

1. Under `let food` write `let score = 0`.
2. In `update`, replace the `snake.pop()` line with the `if ... else` block.

# --task-tr--

1. `let food` satırının altına `let score = 0` yaz.
2. `update` içindeki `snake.pop()` satırını sil; yerine `if ... else` bloğunu yaz (`snake.pop()` artık `else`'in
   içinde).
3. **Çalıştır** ve yılanı yeme götür: yem yer değiştirmeli, yılan uzamalı.

# --predict--

Why does the snake get longer when it eats?
- [x] That turn we add a head but do not remove the tail
- [ ] `unshift` adds two cells when there is food
  `unshift` always adds exactly one; the difference is the missing `pop`.
- [ ] `placeFood` adds a cell to the snake

# --predict-tr--

Yılan yem yiyince neden uzuyor?
- [x] O turda öne baş ekliyoruz ama kuyruğu silmiyoruz
- [ ] Yem varken `unshift` iki parça ekliyor
  `unshift` her zaman tek parça ekler; fark, çalışmayan `pop`.
- [ ] `placeFood` yılana bir parça ekliyor

# --try--

Make each food worth 10 points (`score += 10`) and check `score` with Maymun or `console.log(score)`. Put it back to 1.

# --try-tr--

Her yem 10 puan olsun (`score += 10`); `update` içine `console.log(score)` ekleyip Konsol'da izle. Sonra 1'e geri al ve `console.log`'u sil.

# --tests--

Eating food should grow the snake by one and add a point.
tr: Yem yemek yılanı bir uzatmalı ve bir puan eklemeli.

```js
food = { x: 6, y: 5 }
update()
assert.lengthOf(snake, 4)
assert.strictEqual(score, 1)
assert.notDeepEqual(food, { x: 6, y: 5 }, 'new food should be placed')
```

Moving without eating should keep the length the same.
tr: Yem yemeden ilerlemek boyu değiştirmemeli.

```js
food = { x: 0, y: 19 }
update()
update()
assert.lengthOf(snake, 3)
assert.strictEqual(score, 0)
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
let food
let score = 0
let last = 0

function placeFood() {
  food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

placeFood()

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') dir = { x: 0, y: -1 }
  if (event.key === 'ArrowDown') dir = { x: 0, y: 1 }
  if (event.key === 'ArrowLeft') dir = { x: -1, y: 0 }
  if (event.key === 'ArrowRight') dir = { x: 1, y: 0 }
})

function update() {
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
