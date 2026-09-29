---
title: The world moves, not the bird
title_tr: Kuş değil dünya kayar
skills: [game.loop, prog.loops]
---

# --goal--

The bird never really flies forward: the **world** slides backwards past it. Every frame of play, each pipe moves
`PIPE_SPEED` pixels to the left.

# --goal-tr--

İşin sırrı: kuş aslında **hiç ileri gitmiyor**. Hep aynı x'te duruyor; **dünya** onun yanından geriye kayıyor. Trende
pencereden bakınca ağaçların geriye kaçması gibi. Yandan görünen oyunların çoğu böyle çalışır.

Her karede her boru `PIPE_SPEED` piksel sola kayacak. Bu satırlar `update`'in içinde, yani yalnız oyun sürerken çalışır.

# --code--

```js
const PIPE_SPEED = 2

  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
  }
```

# --meaning--

- `pipe.x -= PIPE_SPEED` subtracts 2 from each pipe's `x`: it moves left.
- Changing `pipe.x` changes the object inside the array, so `draw` shows it in its new place.

# --meaning-tr--

- `const PIPE_SPEED = 2` → borular her karede 2 piksel kayar: saniyede 120 piksel.
- `for (const pipe of pipes) {` → önceki adımdaki döngü, bu sefer `update`'in içinde.
- `pipe.x -= PIPE_SPEED` → `-=` "üstünden çıkar" (`+=`'nin tersi): x küçülür, boru **sola** gider.
- `pipe` listedeki nesnenin kendisi; onu değiştirmek listedeki boruyu değiştirir. `draw` de bir sonraki karede boruyu
  yeni yerine çizer.

# --task--

1. Under `GAP`, write `const PIPE_SPEED = 2`.
2. In `update`, under `bird.y += bird.vy`, leave an empty line and write the loop.

# --task-tr--

1. `const GAP = 160` satırının altına `PIPE_SPEED` satırını yaz.
2. `update` içinde `bird.y += bird.vy` satırının altına bir boş satır bırak ve döngüyü yaz. `const hitGround` satırı
   onun altında kalsın.
3. **Çalıştır**, oyuna tıkla: boru sola kaymalı ve ekrandan çıkmalı. (Kuş borunun içinden geçebilir; çarpmayı sonra
   ekleyeceğiz.)

# --predict--

You wait without flapping. What do the pipes do?
- [x] Nothing: they only move inside `update`, which returns while the state is `'ready'`
- [ ] They slide left anyway
- [ ] They slide right

# --predict-tr--

Çırpmadan bekliyorsun. Borular ne yapar?
- [x] Hiçbir şey: yalnız `update` içinde kayıyorlar, `update` de durum `'ready'` iken hemen çıkıyor
- [ ] Yine de sola kayarlar
- [ ] Sağa kayarlar

# --tests--

While playing, pipes should move left by `PIPE_SPEED`.
tr: Oyun sürerken borular `PIPE_SPEED` kadar sola kaymalı.

```js
assert.strictEqual(PIPE_SPEED, 2)
state = 'playing'
pipes = [{ x: 200, gapY: 200 }, { x: 300, gapY: 100 }]
update()
assert.deepEqual(pipes.map((p) => p.x), [198, 298])
```

Pipes should wait while the game is not playing.
tr: Oyun sürmüyorken borular beklemeli.

```js
$.tick(30)
assert.strictEqual(pipes[0].x, 250)
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

let bird = { x: 100, y: 300, vy: 0, r: 14 }
let pipes = [{ x: 250, gapY: 200 }]
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

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
  }

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
