---
title: Food, growing and score
title_tr: Yem, büyüme ve skor
skills: [game.collision, prog.arrays]
---

# --explanation--

Now the snake needs a goal. Food is one more cell on the grid, placed at random:

```js
Math.random()                    // a number from 0 up to (not including) 1
Math.random() * COLS             // 0 up to 20
Math.floor(Math.random() * COLS) // a whole number: 0, 1, ... 19
```

Food must never appear **inside** the snake, so keep picking until you find a free cell. A `do ... while` loop runs
its body at least once, then repeats while the condition is true:

```js
do {
  food = { x: ..., y: ... }
} while (snake.some((part) => part.x === food.x && part.y === food.y))
```

`array.some(test)` answers "is there at least one item for which `test` is true?".

**Collision** on a grid is simple: two things touch when they are in the same cell, meaning their `x` and `y` are
equal. When the new head lands on the food, the snake should grow. Remember the move trick from the last step? To
grow, just **skip the `pop()`**: the new head is added and the tail stays.

# --explanation-tr--

Yılanın artık bir amaca ihtiyacı var. Yem, ızgarada rastgele yere konan bir hücre daha:

```js
Math.random()                    // 0 ile 1 arası bir sayı (1 hariç)
Math.random() * COLS             // 0 ile 20 arası
Math.floor(Math.random() * COLS) // bir tam sayı: 0, 1, ... 19
```

Yem asla yılanın **içinde** çıkmamalı; boş bir hücre bulana kadar seçmeye devam et. `do ... while` döngüsü gövdesini
en az bir kez çalıştırır, sonra koşul doğru olduğu sürece tekrarlar:

```js
do {
  food = { x: ..., y: ... }
} while (snake.some((part) => part.x === food.x && part.y === food.y))
```

`array.some(test)` şu soruyu cevaplar: "`test`'in doğru olduğu en az bir eleman var mı?".

Izgarada **çarpışma** basittir: iki şey aynı hücredeyse, yani `x` ve `y` değerleri eşitse değiyorlardır. Yeni baş
yemin üstüne gelince yılan büyümeli. Önceki adımdaki hareket hilesini hatırla: büyümek için **`pop()`'u atla**. Yeni
baş eklenir, kuyruk yerinde kalır.

# --task--

1. Add `const COLS = canvas.width / CELL` and `const ROWS = canvas.height / CELL`.
2. Add `let food` and `let score = 0`, and a function `placeFood()` that sets `food` to a random `{ x, y }` cell
   (whole numbers inside the grid) that is not part of the snake. Call `placeFood()` once after `snake` is created.
3. In `update()`, after adding the new head: if it is on the food, add 1 to `score` and call `placeFood()`;
   otherwise `pop()` the tail as before.
4. In `draw()`, paint the food as a `'red'` cell (before the snake).

# --task-tr--

1. `const COLS = canvas.width / CELL` ve `const ROWS = canvas.height / CELL` ekle.
2. `let food` ve `let score = 0` ekle; `food`'u yılana ait olmayan, ızgara içinde rastgele bir `{ x, y }` hücresine
   (tam sayılar) ayarlayan bir `placeFood()` fonksiyonu yaz. `snake` oluşturulduktan sonra `placeFood()`'u bir kez
   çağır.
3. `update()` içinde yeni başı ekledikten sonra: baş yemin üstündeyse `score`'u 1 artır ve `placeFood()` çağır; değilse
   eskisi gibi kuyruğu `pop()` ile sil.
4. `draw()` içinde yemi (yılandan önce) `'red'` bir hücre olarak boya.

# --tests--

`COLS` and `ROWS` should both be 20.
tr: `COLS` ve `ROWS` ikisi de 20 olmalı.

```js
assert.strictEqual(COLS, 20)
assert.strictEqual(ROWS, 20)
```

`placeFood()` should always pick a whole-numbered cell inside the grid that is not on the snake.
tr: `placeFood()` her zaman ızgara içinde, tam sayılı ve yılanın üstünde olmayan bir hücre seçmeli.

```js
snake = []
for (let x = 0; x < 20; x++) for (let y = 0; y < 20; y++) if (x > 1 || y > 1) snake.push({ x, y })
for (let i = 0; i < 30; i++) {
  placeFood()
  assert.isTrue(food.x >= 0 && food.x <= 1 && food.y >= 0 && food.y <= 1, `food landed on ${JSON.stringify(food)}`)
  assert.isTrue(Number.isInteger(food.x) && Number.isInteger(food.y))
}
```

Eating food should grow the snake by one and add a point.
tr: Yem yemek yılanı bir büyütmeli ve bir puan eklemeli.

```js
food = { x: 6, y: 5 }
update()
assert.lengthOf(snake, 4)
assert.strictEqual(score, 1)
assert.notDeepEqual(food, { x: 6, y: 5 }, 'new food should be placed')
```

Moving without eating should keep the length the same.
tr: Yemeden ilerlemek boyu değiştirmemeli.

```js
food = { x: 0, y: 19 }
update()
update()
assert.lengthOf(snake, 3)
assert.strictEqual(score, 0)
```

The food should be drawn as a red cell.
tr: Yem kırmızı bir hücre olarak çizilmeli.

```js
$.tick()
assert.deepEqual($.rects('red'), [{ x: food.x * 20, y: food.y * 20, w: 20, h: 20, color: 'red' }])
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
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some((part) => part.x === food.x && part.y === food.y))
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
