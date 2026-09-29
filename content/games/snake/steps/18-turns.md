---
title: A table of turns
title_tr: Yön tablosu
skills: [se.refactoring]
---

# --goal--

Four almost identical `if` lines become one lookup table: key name → direction. Same behavior, easier to change.

# --goal-tr--

Dört `if` satırı neredeyse aynıydı. Bunu bir **tabloya** çevireceğiz: "tuş adı → yön". Oyun aynı çalışacak;
ama kod daha kısa ve bir sonraki adımda yapacağımız kontrol tek yere yazılacak.

Kodun davranışını değiştirmeden düzenlemeye **refactoring** (yeniden düzenleme) denir.

# --code--

```js
const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  const turn = turns[event.key]
  if (!turn) return
  dir = turn
})
```

# --meaning--

- `turns` is an object used as a table: each key name leads to a direction.
- `turns[event.key]` looks the pressed key up; for other keys there is no entry, so it is `undefined`.
- `if (!turn) return` stops early when the key is not an arrow.

# --meaning-tr--

- `const turns = { ... }` → bir nesne, ama bu sefer **sözlük** gibi kullanılıyor: sol tarafta tuş adı, sağda yön.
- `turns[event.key]` → köşeli parantezle **tablodan bakar**: basılan tuş `'ArrowUp'` ise `{ x: 0, y: -1 }` gelir.
  Tabloda olmayan bir tuşsa (ör. `a`) hiçbir şey gelmez: `undefined`.
- `if (!turn) return` → `!` "değil" demek: **yön bulunamadıysa** fonksiyondan hemen çık (`return`), başka bir şey
  yapma.
- `dir = turn` → bulunan yöne dön.

# --task--

Replace the whole listener with `turns` and the shorter listener.

# --task-tr--

1. Eski dinleyiciyi (dört `if` satırıyla birlikte) sil.
2. Yerine `turns` tablosunu, bir boş satırı ve yeni kısa dinleyiciyi yaz.
3. **Çalıştır**: ok tuşları eskisi gibi çalışmalı.

# --tests--

`turns` should map the four arrow keys to their directions.
tr: `turns` dört ok tuşunu yönlerine eşlemeli.

```js
assert.deepEqual(turns, {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
})
```

The arrow keys should still steer, and other keys should not.
tr: Ok tuşları yine yönlendirmeli, başka tuşlar yönlendirmemeli.

```js
$.press('ArrowDown')
assert.deepEqual(dir, { x: 0, y: 1 })
$.press('x')
assert.deepEqual(dir, { x: 0, y: 1 })
$.press('ArrowLeft')
assert.deepEqual(dir, { x: -1, y: 0 })
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

const turns = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

document.addEventListener('keydown', (event) => {
  const turn = turns[event.key]
  if (!turn) return
  dir = turn
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
