---
title: One hop per press
title_tr: Her basışta bir zıplama
skills: [game.input]
---

# --explanation--

Unlike a car in a racing game, the frog does not glide while a key is held: every press is **exactly one hop** of one
tile. That makes movement precise, which the game needs, because the road punishes a single tile of error.

There is a catch. When you hold a key down, the browser sends `keydown` again and again (auto-repeat), and each of
those events has `event.repeat === true`. Ignoring repeats keeps the rule "one press, one hop":

```js
if (!event.repeat) hop(...direction)
```

`hop` clamps the frog to the board with `Math.min` and `Math.max`, so it can never leave the screen.

On a phone there are no arrow keys. A **swipe** is measured from `pointerdown` to `pointerup`: the longer axis decides
the direction. A very short movement is a **tap**, and a tap hops forward, which is the move a player makes most often.

# --explanation-tr--

Bir yarış oyunundaki araba gibi değil, kurbağa bir tuş basılı tutulurken kaymaz: her basış bir döşemelik **tam olarak
bir zıplamadır**. Bu, hareketi hassas yapar; oyunun buna ihtiyacı var, çünkü yol tek bir döşemelik hatayı cezalandırır.

Bir incelik var. Bir tuşu basılı tuttuğunda tarayıcı `keydown`'u tekrar tekrar gönderir (otomatik tekrar) ve bu
olayların her birinde `event.repeat === true` olur. Tekrarları yok saymak "bir basış, bir zıplama" kuralını korur:

```js
if (!event.repeat) hop(...direction)
```

`hop` kurbağayı `Math.min` ve `Math.max` ile tahtanın içinde tutar; böylece asla ekrandan çıkamaz.

Telefonda ok tuşları yok. Bir **kaydırma** `pointerdown`'dan `pointerup`'a kadar ölçülür: uzun olan eksen yönü belirler.
Çok kısa bir hareket bir **dokunuştur** ve dokunuş ileri zıplatır; oyuncunun en sık yaptığı hamle budur.

# --task--

1. Write `hop(dx, dy)` that moves the frog by `dx` columns and `dy` rows, keeping `x` between `0` and `COLS - 1` and `y`
   between `0` and `START_ROW`.
2. On `keydown`, look the arrow key up in a `DIRECTIONS` object of `[dx, dy]` pairs. For an arrow key, call
   `event.preventDefault()`, and hop only if `event.repeat` is false.
3. Remember where a `pointerdown` on the canvas started. On `pointerup`: a movement shorter than 20 pixels on both axes
   hops up; otherwise hop one tile along the longer axis (`Math.sign` gives the direction).

# --task-tr--

1. Kurbağayı `dx` sütun ve `dy` satır hareket ettiren `hop(dx, dy)` yaz; `x`'i `0` ile `COLS - 1`, `y`'yi `0` ile
   `START_ROW` arasında tut.
2. `keydown`'da ok tuşunu `[dx, dy]` çiftlerinden oluşan bir `DIRECTIONS` nesnesinde ara. Bir ok tuşu için
   `event.preventDefault()` çağır ve yalnızca `event.repeat` false ise zıpla.
3. Canvas'ta bir `pointerdown`'ın nerede başladığını hatırla. `pointerup`'ta: iki eksende de 20 pikselden kısa bir
   hareket yukarı zıplatır; değilse uzun eksen boyunca bir döşeme zıpla (`Math.sign` yönü verir).

# --tests--

Each arrow key should hop one tile that way.
tr: Her ok tuşu o yöne bir döşeme zıplatmalı.

```js
$.press('ArrowUp')
assert.deepEqual(frog, { x: 5, y: 11 })
$.press('ArrowLeft')
$.press('ArrowUp')
$.press('ArrowRight')
$.press('ArrowRight')
$.press('ArrowDown')
assert.deepEqual(frog, { x: 6, y: 11 })
```

Holding a key down should not keep hopping.
tr: Bir tuşu basılı tutmak zıplamaya devam ettirmemeli.

```js
$.press('ArrowUp')
$.press('ArrowUp', { repeat: true })
$.press('ArrowUp', { repeat: true })
assert.deepEqual(frog, { x: 5, y: 11 })
```

The frog should stay on the board.
tr: Kurbağa tahtada kalmalı.

```js
for (let i = 0; i < 20; i++) $.press('ArrowLeft')
$.press('ArrowDown')
assert.deepEqual(frog, { x: 0, y: 12 })
for (let i = 0; i < 20; i++) $.press('ArrowRight')
for (let i = 0; i < 20; i++) $.press('ArrowUp')
assert.deepEqual(frog, { x: 11, y: 0 })
```

A tap should hop forward and a swipe should hop that way.
tr: Dokunuş ileri, kaydırma da o yöne zıplatmalı.

```js
$.pointerDown(200, 300)
$.pointerUp(205, 296)
assert.deepEqual(frog, { x: 5, y: 11 }, 'a tap hops up')
$.pointerDown(200, 300)
$.pointerUp(260, 310)
assert.deepEqual(frog, { x: 6, y: 11 }, 'a swipe to the right')
$.pointerDown(200, 300)
$.pointerUp(190, 360)
assert.deepEqual(frog, { x: 6, y: 12 }, 'a swipe down')
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

let frog = { x: 5, y: START_ROW }

function hop(dx, dy) {
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
})

// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
