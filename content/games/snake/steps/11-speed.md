---
title: Speed up as you grow
title_tr: Büyüdükçe hızlan
skills: [game.loop]
---

# --explanation--

The game works, but it is the same difficulty from the first second to the last. Good games get harder as the player
gets better. Here the easiest lever is speed: every piece of food makes the snake a little faster.

Because the loop already measures **time** between moves, the only change is that the delay stops being a constant.
`SPEED` becomes `speed`, a `let` that starts at `150` and shrinks after each meal.

Always put a limit on this kind of number. Without one, after enough food the delay drops to `0` and the snake moves
every frame, which is unplayable. `Math.max(60, value)` means "`value`, but never below 60".

```js
speed = Math.max(60, speed - 8)
```

This small idea, a difficulty value that changes with progress and has a floor or a ceiling, is how most arcade
games stay fun.

# --explanation-tr--

**Bu adımda:** yılan her yem yediğinde biraz hızlanacak. Oynarken yılan uzadıkça daha hızlı gittiğini
hissedeceksin. Bu, Yılan oyununun son adımı.

**Neden?** Oyun çalışıyor ama ilk saniyeden son saniyeye kadar aynı zorlukta. İyi oyunlar, oyuncu ustalaştıkça
zorlaşır. Burada en kolay ayar hız: her yem yılanı biraz hızlandırır.

4. adımda döngüyü **zamana** göre kurmuştuk: iki hareket arasında `SPEED` milisaniye bekliyoruz. O hâlde tek
yapmamız gereken, bu bekleme süresini sabit olmaktan çıkarmak. `const SPEED` yerine değişebilen bir `let speed`
kullanırız; `150` ile başlar ve her yemekten sonra küçülür. Bekleme **kısaldıkça** yılan **hızlanır**.

Yeni oyun yine yavaş başlasın diye `speed = 150` satırı `reset()`'in içine gider (10. adımda "her başlangıç
değeri `reset()`'te" demiştik).

**Her zaman bir sınır koy.** Sınır olmazsa yeterince yemden sonra bekleme `0`'a iner, yılan her karede hareket
eder ve oyun oynanamaz olur. `Math.max(a, b)` iki sayıdan **büyük** olanı verir. Bunu bir taban olarak
kullanırız:

```js
speed = Math.max(60, speed - 8)
```

"`speed`'i 8 azalt, ama 60'ın altına asla inme." `speed` 150 ise sonuç 142 olur. `speed` 64 ise `64 - 8 = 56`
çıkar, ama `Math.max(60, 56)` 60'ı seçer.

Bu küçük fikir (ilerledikçe değişen, bir tabanı ya da tavanı olan bir zorluk değeri) çoğu atari oyununu eğlenceli
tutan şeydir.

# --task--

1. Replace `const SPEED = 150` with `let speed`, and set `speed = 150` inside `reset()`.
2. Use `speed` instead of `SPEED` in `loop()`.
3. When the snake eats, lower the speed by 8 but never below 60: `speed = Math.max(60, speed - 8)`.

Play a few rounds. That is your finished Snake!

# --task-tr--

1. Dosyanın başındaki `const SPEED = 150 // milliseconds between moves` satırını sil. Onun yerine `let gameOver`
   satırının hemen altına şunu yaz:

   ```js
   let speed // milliseconds between moves
   ```

2. `reset()` fonksiyonunda `gameOver = false` satırının altına başlangıç hızını ekle:

   ```js
     score = 0
     gameOver = false
     speed = 150 // ← yeni
     placeFood()
   }
   ```

3. `update()` fonksiyonunda, yem yenince hızı düşür. `score += 1` satırının hemen altına ekle:

   ```js
     if (head.x === food.x && head.y === food.y) {
       score += 1
       speed = Math.max(60, speed - 8) // ← yeni
       placeFood()
     } else {
   ```

4. `loop()` fonksiyonunda büyük harfli `SPEED` yerine küçük harfli `speed` yaz:

   ```js
   function loop(time) {
     if (!gameOver && time - last >= speed) { // ← değişti
   ```

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Birkaç yem ye: yılan her seferinde biraz hızlanmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. Hata alırsan kodda hâlâ büyük harfli `SPEED` kalmış olabilir; JavaScript büyük
   ve küçük harfi farklı ad sayar.

Tebrikler, Yılan oyunun bitti!

# --tests--

`speed` should start at 150 and be reset to 150 by `reset()`.
tr: `speed` 150'den başlamalı ve `reset()` onu 150'ye döndürmeli.

```js
assert.strictEqual(speed, 150)
speed = 70
reset()
assert.strictEqual(speed, 150)
```

Eating should make the snake 8 ms faster.
tr: Yem yemek yılanı 8 ms hızlandırmalı.

```js
food = { x: 6, y: 5 }
update()
assert.strictEqual(speed, 142)
```

The speed should never go below 60.
tr: Hız asla 60'ın altına inmemeli.

```js
speed = 64
food = { x: 6, y: 5 }
update()
assert.strictEqual(speed, 60)
food = { x: 7, y: 5 }
update()
assert.strictEqual(speed, 60)
```

The loop should use the current speed.
tr: Döngü o anki hızı kullanmalı.

```js
food = { x: 0, y: 19 }
speed = 60
snake = [{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
dir = nextDir = { x: 1, y: 0 }
$.run(1)
assert.isAtLeast(snake[0].x, 14, 'at 60 ms per move the snake should make about 15 moves a second')
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
let snake
let dir
let nextDir
let food
let score
let gameOver
let speed // milliseconds between moves
let best = Number(localStorage.getItem('snake-best')) || 0
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
  speed = 150
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
  if (gameOver && (event.key === ' ' || event.key === 'Enter')) {
    reset()
    return
  }
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
    if (score > best) {
      best = score
      localStorage.setItem('snake-best', best)
    }
    return
  }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score += 1
    speed = Math.max(60, speed - 8)
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
  ctx.fillText('Best: ' + best, 8, 40)

  if (gameOver) {
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop(time) {
  if (!gameOver && time - last >= speed) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
