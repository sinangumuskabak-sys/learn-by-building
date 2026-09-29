---
title: Draw the pipes
title_tr: Boruları çiz
skills: [game.canvas, prog.loops]
---

# --goal--

Each pipe object becomes two green rectangles: the top one from `y = 0` down to `gapY`, the bottom one from
`gapY + GAP` down to the ground. A `for ... of` loop draws every pipe in the array.

# --goal-tr--

Şimdi deneme borusunu görünür yapıyoruz. Bir boru nesnesinden **iki yeşil dikdörtgen** çıkar:

```
üst boru:  y = 0'dan           gapY'ye kadar
alt boru:  y = gapY + GAP'ten  zemine kadar
```

Listede kaç boru varsa hepsini çizmek için bir **döngü** kullanacağız: "listedeki her boru için şunu yap".

# --code--

```js
ctx.fillStyle = 'green'
for (const pipe of pipes) {
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
  ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
}
```

# --meaning--

- `for (const pipe of pipes)` repeats its body once for each item, calling the current one `pipe`.
- The top rectangle is `gapY` tall; the bottom one starts at `gapY + GAP` and fills the rest of the height.
- The pipes are drawn after the sky and before the bird, so the bird flies in front of them.

# --meaning-tr--

- `for (const pipe of pipes) {` → **döngü**: "`pipes` listesindeki her eleman için, sırayla, bir kez yap". Her turda o
  anki boruya `pipe` denir.
- `ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)` → **üst boru**: borunun x'inden, en tepeden (0) başlar; eni
  `PIPE_WIDTH`, boyu `gapY` (açıklığa kadar).
- `ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)` → **alt boru**: açıklığın
  bittiği yerden başlar. Boyu, canvas'ın boyundan açıklığın bittiği yer çıkınca kalan kısım: 600 − 200 − 160 = 240.
- Borular gökyüzünden **sonra**, kuştan **önce** çizilir: önce çizilen arkada kalır, kuş boruların önünde uçar.

# --task--

In `draw`, under the sky's `fillRect`, leave an empty line and write the pipe lines (before the gold bird lines).

# --task-tr--

1. `draw` içinde gökyüzünü boyayan `ctx.fillRect(0, 0, ...)` satırının altına bir boş satır bırak.
2. Boru satırlarını yaz. Kuşu çizen `ctx.fillStyle = 'gold'` satırı altta kalsın.
3. **Çalıştır**: kuşun sağında, arasında açıklık olan yeşil bir boru çifti görmelisin.

# --try--

Change the test pipe's `gapY` to `50`, then `400`, and run. Put `200` back.

# --try-tr--

Deneme borusunun `gapY`'sini `50`, sonra `400` yap ve çalıştır. Sonra `200`'e geri al.

# --tests--

Each pipe should be drawn as a top and a bottom green rectangle.
tr: Her boru üstte ve altta birer yeşil dikdörtgen olarak çizilmeli.

```js
pipes = [{ x: 200, gapY: 150 }]
draw()
assert.sameDeepMembers($.rects('green'), [
  { x: 200, y: 0, w: 60, h: 150, color: 'green' },
  { x: 200, y: 310, w: 60, h: 290, color: 'green' },
])
```

Every pipe in the array should be drawn, behind the bird.
tr: Dizideki her boru kuşun arkasında çizilmeli.

```js
pipes = [{ x: 150, gapY: 100 }, { x: 300, gapY: 250 }]
draw()
assert.lengthOf($.rects('green'), 4)
const ops = $.screen().map((c) => c.op + ':' + c.fill)
assert.isBelow(ops.lastIndexOf('fillRect:green'), ops.indexOf('arc:gold'))
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
