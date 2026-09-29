---
title: A pipe as data
title_tr: Veri olarak boru
skills: [prog.arrays, game.state]
---

# --goal--

A pipe pair is one small object: its `x`, and `gapY`, where the opening starts. The screen will hold several pipes,
so they live in an array, `pipes`. For now it holds one test pipe.

# --goal-tr--

Sırada borular var. Bir **boru çifti** (üstte bir boru, altta bir boru, arada açıklık) için iki bilgi yeter:

- `x` → soldan uzaklığı,
- `gapY` → açıklığın başladığı yükseklik.

Ekranda aynı anda birkaç boru olacak. Birden çok şeyi sırayla tutmak için **dizi** (array) kullanırız: numaralı bir
liste gibi. Şimdilik listede tek bir **deneme borusu** var; ekranda henüz görünmeyecek.

# --code--

```js
const PIPE_WIDTH = 60
const GAP = 160

let pipes = [{ x: 250, gapY: 200 }]
```

# --meaning--

- `PIPE_WIDTH` is how wide a pipe is, `GAP` how tall the opening is.
- `[ ... ]` is an array; this one holds one pipe object. `pipes[0]` is the first item (counting starts at 0).

# --meaning-tr--

- `const PIPE_WIDTH = 60` → borunun eni: 60 piksel.
- `const GAP = 160` → açıklığın boyu: 160 piksel. Kuş (28 piksel) rahat sığar ama dikkat ister.
- `let pipes = [ ... ]` → köşeli parantez bir **dizi** açar. İçinde virgülle ayrılmış elemanlar olur; burada tek eleman
  var: `{ x: 250, gapY: 200 }` nesnesi.
- Elemanlara sıra numarasıyla ulaşılır ve sayma **0'dan** başlar: `pipes[0]` ilk boru. `pipes.length` listede kaç
  eleman olduğunu söyler (şimdi 1).

# --task--

1. Under the `FLAP` line, write `PIPE_WIDTH` and `GAP`.
2. Under the `bird` line, write `pipes`. Press **Run**.

# --task-tr--

1. `FLAP` satırının hemen altına `PIPE_WIDTH` ve `GAP` satırlarını yaz.
2. `let bird = ...` satırının hemen altına `pipes` satırını yaz.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

The array has square brackets outside and the object curly braces inside: `[{ ... }]`.

# --hint-tr--

Dizi dışta köşeli parantez, nesne içte süslü parantez: `[{ ... }]`.

# --tests--

The pipe sizes should be 60 and 160.
tr: Boru ölçüleri 60 ve 160 olmalı.

```js
assert.deepEqual([PIPE_WIDTH, GAP], [60, 160])
```

`pipes` should hold one test pipe at x 250 with its gap at 200.
tr: `pipes` x'i 250, açıklığı 200'de olan bir deneme borusu tutmalı.

```js
assert.deepEqual(pipes, [{ x: 250, gapY: 200 }])
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

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
