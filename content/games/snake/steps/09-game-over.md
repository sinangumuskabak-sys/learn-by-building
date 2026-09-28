---
title: Crashing and game over
title_tr: Çarpma ve oyun sonu
skills: [game.collision, game.state]
---

# --explanation--

A game needs a way to lose. Snake has two:

- **Hitting a wall**: the new head is outside the grid. Columns go from `0` to `COLS - 1`, so "outside" means
  `x < 0`, `x >= COLS`, `y < 0` or `y >= ROWS`.
- **Hitting yourself**: the new head is on a cell the body already uses. That is the same `snake.some(...)` question
  you asked when placing food.

Check both **before** adding the new head. If either is true, the move does not happen: the game ends.

"The game is over" is state, like everything else: a boolean.

```js
let gameOver = false
```

Once it is `true`, the loop keeps drawing (so the player sees the final board) but stops calling `update()`. The draw
function checks it too and paints a message on top.

Text is drawn like shapes: set a font and alignment, then `fillText(text, x, y)`. With `textAlign = 'center'`, `x` is
the middle of the text, which makes centering easy.

# --explanation-tr--

**Bu adımda:** oyunu kaybedilebilir yapacağız. Yılan duvara ya da kendi gövdesine çarpınca duracak ve tahtanın
ortasında beyaz harflerle `Game Over` (Oyun Bitti) yazısı çıkacak.

**İki kaybetme yolu:**

- **Duvara çarpmak:** yeni baş ızgaranın dışına çıkar. Sütunlar `0`'dan `COLS - 1`'e (yani 19'a) kadar gider.
  "Dışarıda" demek: `x < 0` (solda dışarıda), `x >= COLS` (sağda dışarıda), `y < 0` (yukarıda) ya da
  `y >= ROWS` (aşağıda). `<` "küçüktür" demektir.
- **Kendine çarpmak:** yeni baş, gövdenin zaten kullandığı bir hücreye gelir. Bu, 7. adımda yemi yerleştirirken
  sorduğun `snake.some(...)` sorusunun aynısı.

```js
const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
```

`||` "**veya**" demektir: dört koşuldan **herhangi biri** doğruysa sonuç doğrudur. (7. adımdaki `&&` ise
"hepsi doğruysa" demekti.)

İki kontrolü de yeni başı yılana **eklemeden önce** yaparız. Biri doğruysa hamle hiç yapılmaz: oyun biter ve
`return` ile `update()`'ten çıkarız. Böylece yılan tahtanın içinde, son hâlinde kalır.

**Doğru/yanlış değeri (boolean).** "Oyun bitti mi?" de bir durumdur. Cevabı ya **evet** ya **hayır** olan
bilgiler için iki özel değer vardır: `true` (doğru) ve `false` (yanlış). Bunlar tırnaksız yazılır.

```js
let gameOver = false
```

Oyun bitince `gameOver = true` olur. Döngü çizmeye devam eder (oyuncu son tahtayı görsün diye) ama artık
`update()`'i çağırmaz:

```js
if (!gameOver && time - last >= SPEED) {
```

"Oyun bitmediyse **ve** yeterince zaman geçtiyse". `!gameOver` "oyun bitmedi" diye okunur (8. adımdaki `!`).

**Yazı çizmek.** Yazı da şekil gibi boyanır: önce yazı tipi ve hizalama, sonra `fillText(yazı, x, y)`.

```js
ctx.font = '32px sans-serif'   // 32 piksel boyunda, sade bir yazı tipi
ctx.textAlign = 'center'       // x noktası yazının ortası olsun
ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
```

`textAlign = 'center'` olunca `x` yazının **ortasını** gösterir. `canvas.width / 2` tahtanın tam ortası (200)
olduğu için yazı ortalanır.

# --task--

1. Add `let gameOver = false`.
2. In `update()`, right after computing the new `head`: if it is outside the grid or on any part of the snake, set
   `gameOver = true` and `return` without changing the snake.
3. In `loop()`, only call `update()` when the game is not over (keep drawing every frame).
4. At the end of `draw()`, when `gameOver` is true, draw the text `Game Over` in `'white'`, centered on the board
   (for example `ctx.font = '32px sans-serif'`, `ctx.textAlign = 'center'`).

# --task-tr--

1. `let score = 0` satırının hemen altına şunu ekle:

   ```js
   let gameOver = false
   ```

2. `update()` fonksiyonunda, yeni başı hesaplayan `const head = ...` satırının **hemen altına** çarpma
   kontrollerini ekle (`snake.unshift(head)` satırından önce). Fonksiyonun başı şöyle olsun:

   ```js
   function update() {
     dir = nextDir
     const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
     const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS // ← yeni
     const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y) // ← yeni
     if (hitWall || hitSelf) { // ← yeni
       gameOver = true // ← yeni
       return // ← yeni
     } // ← yeni
     snake.unshift(head)
     // ... geri kalanı aynı
   ```

3. `draw()` fonksiyonunda, yılanı çizen `for` döngüsünün kapanan `}` işaretinden sonra, fonksiyonun kapanan
   `}` işaretinden **önce** şunu ekle:

   ```js
     if (gameOver) {
       ctx.fillStyle = 'white'
       ctx.font = '32px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
     }
   ```

4. `loop()` fonksiyonunda `if` satırına `!gameOver &&` ekle:

   ```js
   function loop(time) {
     if (!gameOver && time - last >= SPEED) { // ← değişti
       last = time
       update()
     }
     draw()
     requestAnimationFrame(loop)
   }
   ```

5. **Çalıştır**'a bas ve hiçbir tuşa basmadan bekle: yılan sağ duvara çarpıp durmalı ve ortada `Game Over`
   yazmalı. Alttaki kontrollerin hepsi yeşil olmalı. Yılan duvardan çıkıp kayboluyorsa, çarpma kontrolünü
   `snake.unshift(head)` satırının **altına** yazmış olabilirsin; üstüne taşı.

# --tests--

Running into the right wall should end the game with the snake still inside the board.
tr: Sağ duvara çarpmak oyunu bitirmeli; yılan hâlâ tahtanın içinde olmalı.

```js
food = { x: 0, y: 19 }
$.run(4)
assert.isTrue(gameOver)
assert.deepEqual(snake[0], { x: 19, y: 5 })
```

Running into the top wall should end the game too.
tr: Üst duvara çarpmak da oyunu bitirmeli.

```js
food = { x: 0, y: 19 }
$.press('ArrowUp')
$.run(2)
assert.isTrue(gameOver)
assert.deepEqual(snake[0], { x: 5, y: 0 })
```

Running into its own body should end the game.
tr: Kendi gövdesine çarpmak oyunu bitirmeli.

```js
food = { x: 0, y: 19 }
snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }]
dir = { x: 0, y: -1 }
nextDir = { x: -1, y: 0 }
update()
assert.isTrue(gameOver)
assert.lengthOf(snake, 5)
```

After game over the snake should stop moving.
tr: Oyun bittikten sonra yılan durmalı.

```js
food = { x: 0, y: 19 }
$.run(4)
const frozen = JSON.stringify(snake)
$.run(1)
assert.strictEqual(JSON.stringify(snake), frozen)
```

"Game Over" should be drawn when the game ends, and not before.
tr: "Game Over" oyun bitince çizilmeli, öncesinde değil.

```js
food = { x: 0, y: 19 }
$.run(1)
assert.notInclude($.texts(), 'Game Over')
$.run(3)
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
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y)
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

  if (gameOver) {
    ctx.fillStyle = 'white'
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
