---
title: Move the whole body
title_tr: Bütün gövdeyi yürüt
skills: [prog.arrays]
---

# --goal--

The trick of Snake: to move, add a new head in front and remove the last cell. The body follows by itself.

# --goal-tr--

Yılan oyununun sırrı: bütün parçaları tek tek kaydırmayız. Onun yerine **önüne yeni bir baş ekler, sonundan bir
parça sileriz.** Yılan bir adım ilerlemiş olur ve gövde başı kendiliğinden takip eder.

Bir tren gibi düşün: öne bir vagon tak, arkadan bir vagon çıkar. Tren ilerlemiş görünür. Artık tek başına duran
`head` değişkenine gerek yok, onu siliyoruz.

# --code--

```js
function update() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  snake.unshift(head)
  snake.pop()
}
```

# --meaning--

- `snake[0]` is the current head. The new head is one step from it in the direction `dir`.
- `unshift` puts the new head at the front of the array; `pop` removes the last item (the tail).

# --meaning-tr--

- `snake[0]` → dizinin **ilk** elemanı (sıra 0): şu anki baş.
- `const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }` → yeni baş: eski başın **yön kadar
  ötesi**. Bu `head`, `update`'in içinde yaşayan geçici bir ad.
- `snake.unshift(head)` → yeni başı dizinin **en önüne** ekler. Yılan 4 parça oldu.
- `snake.pop()` → dizinin **son** elemanını (kuyruğu) siler. Yine 3 parça.

# --task--

1. Delete the line `let head = { x: 5, y: 5 }`.
2. Replace the two lines inside `update` with the three new ones.

# --task-tr--

1. `let head = { x: 5, y: 5 }` satırını **sil** (artık yılanın başı `snake[0]`).
2. `update` içindeki iki satırı sil; yerine üç yeni satırı yaz.
3. **Çalıştır**, oyuna tıkla ve ok tuşlarıyla yılanı döndür: gövde başı takip etmeli.

# --hint--

`unshift` adds at the **front**, `pop` removes from the **end**. If the snake grows forever you forgot `pop`.

# --hint-tr--

`unshift` **öne** ekler, `pop` **sondan** siler. Yılan durmadan uzuyorsa `pop` satırını unuttun.

# --try--

Comment out `snake.pop()` (put `//` in front) and run: the snake grows forever. That is how eating will work. Remove the `//`.

# --try-tr--

`snake.pop()` satırının başına `//` koy ve çalıştır: yılan durmadan uzar. Yem yemek tam böyle çalışacak. Sonra `//`'yi sil.

# --tests--

`update()` should add a new head in front and drop the tail.
tr: `update()` öne yeni baş eklemeli, kuyruğu silmeli.

```js
update()
assert.deepEqual(snake, [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }])
```

The snake should keep its length and stay connected while turning.
tr: Yılan dönerken boyunu korumalı ve kopmamalı.

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
