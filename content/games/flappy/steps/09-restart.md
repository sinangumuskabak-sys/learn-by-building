---
title: Try again, beat your best
title_tr: Tekrar dene, rekorunu kır
skills: [game.state, prog.functions]
---

# --explanation--

A game you cannot restart without reloading the page is a game people stop playing. Time to close the state machine's
loop: from `'over'`, a flap goes back to `'ready'` with a fresh world.

"A fresh world" means every piece of state back to its starting value. Collect those in **one** `reset()` function and
call it both at startup and on restart. If the first game and the tenth start from different code, sooner or later
they will start differently, and that bug is very hard to spot.

The best score goes in `localStorage`, which survives reloads. Update it at the one place a game ends. Giving that
place a name, `endGame()`, means there is exactly one spot where "the game just ended" logic lives. When you later add
a sound or a medal, you add it there.

# --explanation-tr--

Sayfayı yenilemeden yeniden başlatılamayan bir oyunu insanlar oynamayı bırakır. Durum makinesinin döngüsünü kapatma
zamanı: `'over'` durumundayken kanat çırpmak, temiz bir dünyayla `'ready'`'ye geri döner.

"Temiz bir dünya", durumun her parçasının başlangıç değerine dönmesi demek. Bunları **tek** bir `reset()`
fonksiyonunda topla ve hem açılışta hem yeniden başlatmada onu çağır. İlk oyun ile onuncu oyun farklı kodlardan
başlarsa, er ya da geç farklı başlarlar ve bu hatayı fark etmek çok zordur.

En iyi skor, sayfa yenilense de kalan `localStorage`'a gider. Onu, oyunun bittiği tek yerde güncelle. O yere bir ad
vermek, `endGame()`, "oyun az önce bitti" mantığının tam olarak tek bir yerde yaşaması demek. İleride bir ses ya da
madalya eklediğinde oraya eklersin.

# --task--

1. Keep `let bird`, `let pipes`, `let frame`, `let score` and `let state` at the top without values, and write
   `function reset()` that sets them to their starting values (bird at `{ x: 100, y: 300, vy: 0, r: 14 }`, no pipes,
   `frame` and `score` `0`, state `'ready'`). Call `reset()` before starting the loop.
2. Add `let best = Number(localStorage.getItem('flappy-best')) || 0`.
3. Write `function endGame()` that sets the state to `'over'` and, when `score > best`, updates `best` and saves it
   with `localStorage.setItem('flappy-best', best)`. Use it in `update()` instead of setting the state directly.
4. In `flap()`, when the state is `'over'`, call `reset()` instead of doing nothing.
5. Draw `Best: 3` (with the real number) under the score, in 16px text.

# --task-tr--

1. `let bird`, `let pipes`, `let frame`, `let score` ve `let state` tanımlarını en üstte değersiz bırak ve onları
   başlangıç değerlerine ayarlayan `function reset()` yaz (kuş `{ x: 100, y: 300, vy: 0, r: 14 }`, boru yok, `frame`
   ve `score` `0`, durum `'ready'`). Döngüyü başlatmadan önce `reset()` çağır.
2. `let best = Number(localStorage.getItem('flappy-best')) || 0` ekle.
3. Durumu `'over'` yapan ve `score > best` olduğunda `best`'i güncelleyip `localStorage.setItem('flappy-best', best)`
   ile kaydeden `function endGame()` yaz. `update()` içinde durumu doğrudan ayarlamak yerine onu kullan.
4. `flap()` içinde durum `'over'` ise hiçbir şey yapmamak yerine `reset()` çağır.
5. Skorun altına 16px yazıyla `Best: 3` (gerçek sayıyla) çiz.

# --tests--

`reset()` should restore a fresh game.
tr: `reset()` yepyeni bir oyun getirmeli.

```js
bird = { x: 1, y: 2, vy: 3, r: 4 }
pipes = [{ x: 10, gapY: 100, passed: true }]
frame = 55
score = 9
state = 'over'
reset()
assert.deepEqual(bird, { x: 100, y: 300, vy: 0, r: 14 })
assert.deepEqual(pipes, [])
assert.strictEqual(frame, 0)
assert.strictEqual(score, 0)
assert.strictEqual(state, 'ready')
```

A new best score should be saved when the game ends.
tr: Oyun bittiğinde yeni en iyi skor kaydedilmeli.

```js
state = 'playing'
score = 3
bird.y = 590
update()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 3)
assert.strictEqual(localStorage.getItem('flappy-best'), '3')
draw()
assert.include($.texts(), 'Best: 3')
```

A lower score should not replace the best.
tr: Daha düşük bir skor en iyi skorun yerini almamalı.

```js
best = 10
score = 4
endGame()
assert.strictEqual(best, 10)
assert.strictEqual(state, 'over')
```

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
let best = Number(localStorage.getItem('flappy-best')) || 0

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

function endGame() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('flappy-best', best)
  }
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
  if (hitGround || hitSky || pipes.some(hitsPipe)) endGame()
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
  ctx.font = '16px sans-serif'
  ctx.fillText('Best: ' + best, canvas.width / 2, 95)
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
