---
title: Remove the pipes you passed
title_tr: Geçilen boruları sil
skills: [prog.arrays]
---

# --goal--

A pipe that has left the screen on the left is useless, but it stays in the array forever. We keep only the pipes
whose right edge is still on screen.

# --goal-tr--

Sol kenardan çıkan boru artık görünmüyor, ama listede **sonsuza kadar** kalıyor. Oynadıkça liste büyür, oyun gereksiz
işlerle yavaşlar. Bu gerçek bir hatadır; adı **bellek sızıntısı** (memory leak).

Çözüm: her karede, yalnız hâlâ ekranda olan boruları **tut**. Masayı toplamak gibi: işi biten tabakları kaldır.

# --code--

```js
pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)
```

# --meaning--

- `filter` makes a new array with only the items that pass the test.
- `pipe.x + PIPE_WIDTH` is the pipe's right edge; while it is above 0, part of the pipe is still visible.
- Without braces, the arrow function returns the answer of the comparison.

# --meaning-tr--

- `pipes.filter(test)` → testi geçen elemanlardan **yeni bir liste** yapar. `pipes =` ile eski listenin yerine koyarız.
- `(pipe) => pipe.x + PIPE_WIDTH > 0` → her boru için sorulan soru. Ok (`=>`) işaretinden sonra süslü parantez yoksa,
  sağdaki sorunun cevabı (doğru/yanlış) doğrudan geri verilir.
- `pipe.x + PIPE_WIDTH` → borunun **sağ kenarı**. 0'dan büyükse borunun bir kısmı hâlâ ekranda: tut. Değilse at.

# --task--

In `update`, under the pipe loop's closing `}`, write the `filter` line.

# --task-tr--

`update` içinde boruları kaydıran döngünün kapanan `}` işaretinin **altına** `filter` satırını yaz. **Çalıştır**: oyun aynı görünür, ama artık liste büyümüyor.

# --tests--

Pipes should be removed once they leave the screen.
tr: Borular ekrandan çıkınca silinmeli.

```js
state = 'playing'
pipes = [{ x: 200, gapY: 200 }, { x: -59, gapY: 200 }]
update()
assert.lengthOf(pipes, 1)
assert.strictEqual(pipes[0].x, 198)
```

A pipe still partly on screen should stay.
tr: Hâlâ kısmen ekranda olan boru kalmalı.

```js
state = 'playing'
pipes = [{ x: -50, gapY: 200 }]
update()
assert.lengthOf(pipes, 1)
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

let bird = { x: 100, y: 300, vy: 0, r: 14 }
let pipes = []
let frame = 0
let state = 'ready' // 'ready', 'playing' or 'over'

function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY })
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
  }
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
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
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
