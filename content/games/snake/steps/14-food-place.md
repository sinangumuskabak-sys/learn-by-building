---
title: Pick a spot for the food
title_tr: Yeme bir yer seç
skills: [prog.functions]
---

# --goal--

The snake needs something to eat. `placeFood` picks a random cell on the board and keeps it in `food`.

# --goal-tr--

Yılanın yiyecek bir şeye ihtiyacı var. Yemi tahtada **rastgele bir hücreye** koyacağız.

Önce tahtada kaç sütun ve satır olduğunu hesaplıyoruz (400 ÷ 20 = 20). Sonra `placeFood` (yemi yerleştir)
fonksiyonu 0 ile 19 arasında rastgele bir sütun ve satır seçecek. Bu adımda yem henüz **görünmeyecek**; yerini
seçiyoruz, çizimi bir sonraki adımda.

# --code--

```js
const COLS = canvas.width / CELL
const ROWS = canvas.height / CELL
let food

function placeFood() {
  food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

placeFood()
```

# --meaning--

- `COLS` and `ROWS` are how many cells fit: 400 / 20 = 20 each way.
- `let food` makes an empty variable that `placeFood` fills.
- `Math.random()` gives a number from 0 up to (not including) 1; times 20 is 0 to 19.99…;
  `Math.floor` cuts off the decimals, giving a whole column 0–19.

# --meaning-tr--

- `const COLS = canvas.width / CELL` → `/` bölme: 400 ÷ 20 = **20 sütun**. `ROWS` aynı hesapla 20 satır.
- `let food` → değeri **henüz olmayan** bir değişken. `placeFood` onu dolduracak.
- `Math.random()` → 0 ile 1 arasında rastgele bir ondalık sayı (ör. 0.4373...). 1'in kendisi hiç gelmez.
- `Math.random() * COLS` → 0 ile 19.99... arası (ör. 8.746).
- `Math.floor(...)` → virgülden sonrasını **atar**: 8.746 → 8. Böylece tam bir sütun numarası (0–19) çıkar.
- `placeFood()` → oyun başlarken fonksiyonu bir kez çağırır, yem yerini alır.

# --task--

1. Under `const CELL = 20` write `COLS` and `ROWS`.
2. Under `let dir = ...` write `let food`.
3. Under `let last = 0`, after an empty line, write `placeFood` and the call `placeFood()`.

# --task-tr--

1. `const CELL = 20` satırının altına `COLS` ve `ROWS` satırlarını yaz.
2. `let dir = ...` satırının altına `let food` yaz.
3. `let last = 0` satırının altına, bir boş satırdan sonra, `placeFood` fonksiyonunu ve altına `placeFood()`
   çağrısını yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

Without `Math.floor` the food lands between cells, like column 8.746.

# --hint-tr--

`Math.floor` olmadan yem hücrelerin arasına düşer (ör. 8.746. sütun).

# --tests--

`COLS` and `ROWS` should both be 20.
tr: `COLS` ve `ROWS` 20 olmalı.

```js
assert.strictEqual(COLS, 20)
assert.strictEqual(ROWS, 20)
```

`placeFood()` should always pick a whole-numbered cell inside the board.
tr: `placeFood()` her zaman tahtanın içinde, tam sayılı bir hücre seçmeli.

```js
for (let i = 0; i < 50; i++) {
  placeFood()
  assert.isTrue(Number.isInteger(food.x) && Number.isInteger(food.y), `food should be on a whole cell: ${JSON.stringify(food)}`)
  assert.isTrue(food.x >= 0 && food.x < 20 && food.y >= 0 && food.y < 20, `food landed outside: ${JSON.stringify(food)}`)
}
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
  snake.pop()
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
