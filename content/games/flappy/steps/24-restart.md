---
title: Try again
title_tr: Tekrar dene
skills: [game.state, game.input]
---

# --goal--

A game you cannot restart without reloading the page is a game people stop playing. After game over, a flap calls
`reset` and goes back to `'ready'`. The Game Over screen says so.

# --goal-tr--

Sayfayı yenilemeden baştan başlatılamayan bir oyunu insanlar bırakır. Durum makinesinin döngüsünü kapatıyoruz: oyun
bittiyse bir çırpış her şeyi `reset` ile sıfırlar ve `'ready'` aşamasına döner.

`Game Over` yazısının altına da küçük bir ipucu ekliyoruz: `Press Space to try again` (tekrar denemek için Boşluk'a bas).

# --code--

```js
function flap() {
  if (state === 'over') {
    reset()
    return
  }

    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 34)
```

# --meaning--

- After game over, a flap resets the game; `return` stops this flap from launching the bird at once. The next flap
  starts the game.
- Two lines in `draw`'s `'over'` block write the hint under `Game Over`.

# --meaning-tr--

- `if (state === 'over') {` → oyun bittiyse...
  - `reset()` → ...her şeyi baştan kur (durum `'ready'` olur).
  - `return` → ...ve çık. Bu çırpış kuşu hemen uçurmaz; oyuncu hazırlanır, bir sonraki çırpış oyunu başlatır.
- Eskiden bu satır tek başına `if (state === 'over') return` idi; şimdi süslü parantezle iki iş yapıyor.
- `draw` içinde, `if (state === 'over') {` bloğunda `Game Over` satırının altına iki satır: 18 piksel yazıyla ipucu,
  ortanın 34 piksel altında.

# --task--

1. In `flap`, change `if (state === 'over') return` into the block with `reset()` and `return`.
2. In `draw`, inside the `'over'` block, under the `Game Over` line, add the two new lines.

# --task-tr--

1. `flap` içindeki `if (state === 'over') return` satırını dört satırlık bloğa çevir: `reset()` ve `return` içeride.
2. `draw` içinde, `if (state === 'over') {` bloğunda `Game Over` yazan satırın **altına** iki yeni satırı yaz.
3. **Çalıştır**, oyna, kaybet ve Boşluk'a bas: kuş başa dönmeli.

# --predict--

After game over you press Space once. What happens?
- [ ] The bird jumps and the game goes on at once
- [x] Everything resets and waits: `Press Space to start` is back
  `reset()` sets the state to `'ready'`, and `return` stops this flap.
- [ ] Nothing

# --predict-tr--

Oyun bittikten sonra bir kez Boşluk'a basıyorsun. Ne olur?
- [ ] Kuş zıplar ve oyun hemen devam eder
- [x] Her şey sıfırlanır ve bekler: `Press Space to start` geri gelir
  `reset()` durumu `'ready'` yapar, `return` de bu çırpışı durdurur.
- [ ] Hiçbir şey

# --tests--

Flapping after game over should start over.
tr: Oyun bittikten sonra kanat çırpmak baştan başlatmalı.

```js
flap()
$.run(3)
assert.strictEqual(state, 'over')
$.press(' ')
assert.strictEqual(state, 'ready')
assert.strictEqual(bird.y, 300)
$.press(' ')
assert.strictEqual(state, 'playing')
```

The Game Over screen should say how to try again.
tr: Oyun sonu ekranı nasıl tekrar deneneceğini söylemeli.

```js
state = 'over'
draw()
assert.include($.texts(), 'Press Space to try again')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)
const PIPE_WIDTH = 60
const GAP = 160
const PIPE_SPEED = 2
const PIPE_EVERY = 90 // frames between new pipes

let bird
let pipes
let frame
let score
let state // 'ready', 'playing' or 'over'

function reset() {
  bird = { x: 100, y: 300, vy: 0, r: 14 }
  pipes = []
  frame = 0
  score = 0
  state = 'ready'
}

function flap() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY, passed: false })
}

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
  return overlapsX && !insideGap
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
  }
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky || pipes.some(hitsPipe)) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'green'
  for (const pipe of pipes) {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
    ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
  }

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(String(score), canvas.width / 2, 70)
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 34)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
