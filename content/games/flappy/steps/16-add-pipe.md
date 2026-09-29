---
title: A new pipe at a random height
title_tr: Rastgele yükseklikte yeni boru
skills: [prog.arrays]
---

# --goal--

The test pipe goes away; the list starts empty. `addPipe` pushes a new pipe at the right edge, with its opening at a
random height that never touches the top or the bottom.

# --goal-tr--

Deneme borusunun işi bitti: liste artık **boş** başlıyor. Yeni boruları `addPipe` (boru ekle) fonksiyonu üretecek:
her yeni boru sağ kenarda doğacak ve açıklığı **rastgele** bir yükseklikte olacak. Hep aynı yerde açıklık olsaydı oyun
çok kolay olurdu.

Bu adımda fonksiyonu yazıyoruz; onu düzenli aralıklarla çağırmak bir sonraki adımda.

# --code--

```js
let pipes = []

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY })
}
```

# --meaning--

- `[]` is an empty array; `pipes.push(...)` adds an item to its end.
- `Math.random()` is a random number from 0 up to 1. Times 320 (600 - 160 - 120) it is 0 to 320; plus 60 it is 60 to
  380, so the opening always keeps a 60 pixel margin from the edges.
- `{ x: canvas.width, gapY }` is short for `{ x: canvas.width, gapY: gapY }`.

# --meaning-tr--

- `let pipes = []` → `[]` **boş bir dizi**. Oyun borusuz başlar.
- `Math.random()` → her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir kesirli sayı: 0.73 gibi.
- `canvas.height - GAP - 120` → 600 − 160 − 120 = **320**. Rastgele sayı 320 ile çarpılınca 0–320 arası olur;
  `60 +` ile **60–380** arası. Böylece açıklık hiçbir zaman üst ya da alt kenara yapışmaz (60 piksel pay kalır).
- `pipes.push({ ... })` → `push` bir elemanı dizinin **sonuna ekler**.
- `{ x: canvas.width, gapY }` → yeni boru sağ kenarda (x = 400) doğar, yani ekranın hemen dışında. `gapY` tek başına
  bir kısaltma: `gapY: gapY` yazmakla aynı ("`gapY` alanına `gapY` sabitinin değerini koy").

# --task--

1. Change `pipes` to start as an empty array `[]`.
2. Under the `pointerdown` line, leave an empty line and write `addPipe`. Press **Run**.

# --task-tr--

1. `let pipes = [...]` satırını `let pipes = []` yap (deneme borusunu sil).
2. `canvas.addEventListener('pointerdown', flap)` satırının altına bir boş satır bırak ve `addPipe` fonksiyonunu yaz.
3. **Çalıştır**.

# --predict--

You press Run. What happens to the green pipe?
- [ ] A new pipe appears on the right
- [x] It is gone: the list is empty and nobody calls `addPipe` yet
- [ ] It stays where it was

# --predict-tr--

Çalıştır'a bastın. Yeşil boruya ne olur?
- [ ] Sağda yeni bir boru belirir
- [x] Kaybolur: liste boş ve `addPipe`'ı henüz kimse çağırmıyor
- [ ] Olduğu yerde kalır

# --try--

Write `addPipe()` above the last line and run a few times: a pipe at a different height each time. Delete it.

# --try-tr--

En alttaki satırın üstüne `addPipe()` yazıp birkaç kez çalıştır: her seferinde başka yükseklikte bir boru. Sonra sil.

# --tests--

`pipes` should start empty.
tr: `pipes` boş başlamalı.

```js
assert.deepEqual(pipes, [])
```

`addPipe()` should add a pipe at the right edge with its gap inside the margins.
tr: `addPipe()` sağ kenara, açıklığı paylar içinde kalan bir boru eklemeli.

```js
for (let i = 0; i < 40; i++) addPipe()
assert.lengthOf(pipes, 40)
for (const pipe of pipes) {
  assert.strictEqual(pipe.x, 400)
  assert.isAtLeast(pipe.gapY, 60)
  assert.isAtMost(pipe.gapY, 380)
}
assert.isAbove(new Set(pipes.map((p) => p.gapY)).size, 1, 'gapY should be random')
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
let pipes = []
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
