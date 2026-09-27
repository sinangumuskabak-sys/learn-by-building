---
title: A body made of an array
title_tr: Diziden bir gövde
skills: [prog.arrays]
---

# --explanation--

A snake is a **list of cells**, head first. An array is the natural fit:

```js
let snake = [
  { x: 5, y: 5 },  // head (index 0)
  { x: 4, y: 5 },
  { x: 3, y: 5 },  // tail (last index)
]
```

How does a whole snake move one step? You do not need to move every segment. Look at the picture before and after:
the middle stays exactly where it was. Only two things change:

1. A **new head** appears one cell ahead of the old head → `snake.unshift(newHead)` adds it at the front.
2. The **tail** disappears → `snake.pop()` removes the last item.

```
before:  T B H .        after:  . T B H
```

This trick is cheap no matter how long the snake gets: two array operations per move. It will also make growing
trivial in the next step.

Drawing becomes a loop over the array: `for (const part of snake) { ... }`.

# --explanation-tr--

Yılan, baştan başlayan bir **hücre listesidir**. Dizi (array) tam buna uygundur:

```js
let snake = [
  { x: 5, y: 5 },  // baş (0. indeks)
  { x: 4, y: 5 },
  { x: 3, y: 5 },  // kuyruk (son indeks)
]
```

Koca yılan bir adım nasıl ilerler? Her parçayı taşıman gerekmez. Önceki ve sonraki resme bak: ortası tam olarak
yerinde kalır. Yalnızca iki şey değişir:

1. Eski başın bir hücre önünde **yeni bir baş** belirir → `snake.unshift(newHead)` onu başa ekler.
2. **Kuyruk** kaybolur → `snake.pop()` son elemanı siler.

```
önce:  K G B .        sonra:  . K G B
```

Bu hile yılan ne kadar uzarsa uzasın ucuzdur: hareket başına iki dizi işlemi. Bir sonraki adımda büyümeyi de çok
kolaylaştıracak.

Çizim dizi üzerinde bir döngüye dönüşür: `for (const part of snake) { ... }`.

# --task--

1. Replace `head` with `let snake` holding the three cells above, head first.
2. In `update()`, build `const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }`, add it to the front with
   `unshift`, and remove the tail with `pop`.
3. In `draw()`, paint one lime cell for every part of `snake`.

# --task-tr--

1. `head` yerine, yukarıdaki üç hücreyi baş önde olacak şekilde tutan `let snake` yaz.
2. `update()` içinde `const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }` oluştur, `unshift` ile başa
   ekle ve kuyruğu `pop` ile sil.
3. `draw()` içinde `snake`'in her parçası için bir lime hücre boya.

# --tests--

`snake` should start with three cells, head first, pointing right.
tr: `snake` üç hücreyle, baş önde ve sağa bakarak başlamalı.

```js
assert.deepEqual(snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }])
```

`update()` should add a new head in front and drop the tail.
tr: `update()` öne yeni bir baş eklemeli ve kuyruğu atmalı.

```js
update()
assert.deepEqual(snake, [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }])
```

The snake should keep its length and stay connected while turning.
tr: Yılan dönerken boyunu korumalı ve parçaları birbirine bitişik kalmalı.

```js
$.run(0.5)
$.press('ArrowDown')
$.run(0.5)
$.press('ArrowLeft')
$.run(0.3)
assert.lengthOf(snake, 3)
for (let i = 1; i < snake.length; i++) {
  const gap = Math.abs(snake[i].x - snake[i - 1].x) + Math.abs(snake[i].y - snake[i - 1].y)
  assert.strictEqual(gap, 1, 'each part should touch the one before it')
}
```

Every part of the snake should be drawn.
tr: Yılanın her parçası çizilmeli.

```js
$.run(0.5)
const drawn = $.rects('lime').map((r) => ({ x: r.x / 20, y: r.y / 20 }))
assert.sameDeepMembers(drawn, snake)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
const SPEED = 150 // milliseconds between moves
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
]
let dir = { x: 1, y: 0 }
let last = 0

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
