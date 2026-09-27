---
title: No U-turns
title_tr: Geri dönüş yok
skills: [game.input, game.state]
---

# --explanation--

Try it: while moving right, press Left. The head turns straight back into its own neck. In real Snake that move is
simply ignored. The obvious fix is "ignore a key that points opposite to `dir`":

```js
if (turn.x === -dir.x && turn.y === -dir.y) return
```

But there is a sneaky bug hiding here. The snake only moves every 150 ms, and a fast player can press **two** keys
inside one of those gaps. Moving right, press Up and then Left quickly:

1. Up is not opposite to right → `dir` becomes up.
2. Left is not opposite to *up* → `dir` becomes left.
3. The next move goes left: straight into the neck again!

The snake never actually moved up. The check compared against a direction that was only *planned*. The fix is to
keep two variables:

- `dir`: the direction of the **last real move**.
- `nextDir`: the direction the player asked for. Keys set this, checked against `dir`.

`update()` copies `nextDir` into `dir` right before moving. This "remember the request, apply it on the next tick"
pattern shows up everywhere in games (and in UI code too).

# --explanation-tr--

Dene: sağa giderken Sol'a bas. Baş dönüp kendi boynunun içine giriyor. Gerçek Yılan oyununda bu hamle görmezden
gelinir. Akla gelen ilk çözüm "`dir`'in tam tersini gösteren tuşu görmezden gel":

```js
if (turn.x === -dir.x && turn.y === -dir.y) return
```

Ama burada sinsi bir hata saklanıyor. Yılan yalnızca 150 ms'de bir hareket ediyor ve hızlı bir oyuncu bu aralıkta
**iki** tuşa basabilir. Sağa giderken hızlıca önce Yukarı, sonra Sol'a bas:

1. Yukarı, sağın tersi değil → `dir` yukarı olur.
2. Sol, *yukarının* tersi değil → `dir` sol olur.
3. Bir sonraki hareket sola: yine boynun içine!

Yılan aslında hiç yukarı gitmedi. Kontrol, yalnızca *planlanmış* bir yönle karşılaştırma yaptı. Çözüm iki değişken
tutmak:

- `dir`: **son gerçek hareketin** yönü.
- `nextDir`: oyuncunun istediği yön. Tuşlar bunu ayarlar ve `dir`'e göre kontrol edilir.

`update()` hareket etmeden hemen önce `nextDir`'i `dir`'e kopyalar. "İsteği hatırla, bir sonraki adımda uygula"
kalıbı oyunlarda (ve arayüz kodunda da) her yerde karşına çıkar.

# --task--

1. Add `let nextDir = dir`.
2. Rewrite the key handler: turn the key into a direction (`turn`), ignore it if it is opposite to `dir`
   (`turn.x === -dir.x && turn.y === -dir.y`), otherwise set `nextDir = turn`. Keys should no longer change `dir`
   directly.
3. At the start of `update()`, set `dir = nextDir`.

Tip: a lookup object keeps the handler short:

```js
const turns = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ... }
const turn = turns[event.key]
if (!turn) return
```

# --task-tr--

1. `let nextDir = dir` ekle.
2. Tuş işleyicisini yeniden yaz: tuşu bir yöne çevir (`turn`); `dir`'in tersiyse
   (`turn.x === -dir.x && turn.y === -dir.y`) görmezden gel, değilse `nextDir = turn` yap. Tuşlar artık `dir`'i
   doğrudan değiştirmemeli.
3. `update()`'in başında `dir = nextDir` yap.

İpucu: bir arama nesnesi işleyiciyi kısa tutar:

```js
const turns = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ... }
const turn = turns[event.key]
if (!turn) return
```

# --tests--

Pressing Left while moving right should be ignored.
tr: Sağa giderken Sol'a basmak görmezden gelinmeli.

```js
$.press('ArrowLeft')
$.run(0.5)
assert.isAbove(snake[0].x, 5)
assert.strictEqual(snake[0].y, 5)
```

Keys should set `nextDir`, and `dir` should change only when the snake moves.
tr: Tuşlar `nextDir`'i ayarlamalı; `dir` yalnızca yılan hareket edince değişmeli.

```js
$.press('ArrowUp')
assert.deepEqual(nextDir, { x: 0, y: -1 })
assert.deepEqual(dir, { x: 1, y: 0 })
update()
assert.deepEqual(dir, { x: 0, y: -1 })
```

Quickly pressing Up then Left while moving right should move the snake up, not into its neck.
tr: Sağa giderken hızlıca Yukarı sonra Sol'a basmak yılanı boynuna değil yukarı götürmeli.

```js
food = { x: 0, y: 19 }
$.press('ArrowUp')
$.press('ArrowLeft')
update()
assert.deepEqual(snake[0], { x: 5, y: 4 })
assert.deepEqual(snake[1], { x: 5, y: 5 })
```

Normal turns should still work.
tr: Normal dönüşler hâlâ çalışmalı.

```js
$.press('ArrowDown')
$.run(0.5)
assert.isAbove(snake[0].y, 5)
$.press('ArrowLeft')
$.run(0.5)
assert.isBelow(snake[0].x, 5)
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
