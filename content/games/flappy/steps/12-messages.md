---
title: Tell the player
title_tr: Oyuncuya söyle
skills: [game.canvas, game.state]
---

# --goal--

Each phase gets its message: `Press Space to start` while waiting, `Game Over` when it is over. White text, centered.

# --goal-tr--

Oyuncu ne yapacağını bilmeli. Her aşamanın kendi yazısı olacak: beklerken `Press Space to start` (başlamak için
Boşluk'a bas), oyun bitince kocaman `Game Over` (oyun bitti).

Canvas'a yazı yazmak da çizim gibidir: önce rengi ve yazı tipini seçersin, sonra yazıyı bir noktaya koyarsın.

# --code--

```js
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
```

# --meaning--

- `textAlign = 'center'` makes the given x the middle of the text; `canvas.width / 2` is the middle of the screen.
- `ctx.font` sets size and style; `fillText(text, x, y)` writes it.
- `if (...) { ... }` with braces runs several lines only when the condition holds.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → yazılar beyaz.
- `ctx.textAlign = 'center'` → verilen x, yazının **ortası** olsun.
- `if (state === 'ready') { ... }` → **süslü parantezli `if`**: koşul doğruysa içindeki bütün satırlar çalışır.
- `ctx.font = '22px sans-serif'` → 22 piksel boyunda, sade bir yazı tipi. `bold` kalın demek.
- `ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)` → yazıyı (x, y) noktasına yaz.
  `/` bölme: `canvas.width / 2` yatayda tam orta (200). `canvas.height / 2 + 80` ortanın 80 piksel altı; kuşun üstüne
  binmesin diye.
- Sondaki `}` yeni değil: `draw` fonksiyonunun kapanışı. Yeni satırlar onun **üstüne** gelir.

# --task--

In `draw`, under `ctx.fill()`, leave an empty line and write the new lines, above the function's last `}`.

# --task-tr--

1. `draw` içinde kuşu boyayan `ctx.fill()` satırının altına bir boş satır bırak.
2. Yeni satırları fonksiyonun son `}` işaretinin **üstüne** yaz.
3. **Çalıştır**: `Press Space to start` görünmeli. Oyna ve kaybet: `Game Over` çıkmalı.

# --hint--

The texts must match exactly: `Press Space to start` and `Game Over`, with the same capitals.

# --hint-tr--

Yazılar birebir aynı olmalı: `Press Space to start` ve `Game Over`, büyük harfleri de aynı.

# --tests--

`Press Space to start` should show while waiting.
tr: Beklerken `Press Space to start` görünmeli.

```js
$.tick()
assert.include($.texts(), 'Press Space to start')
```

The message should go away once the game starts.
tr: Oyun başlayınca yazı kaybolmalı.

```js
$.press(' ')
$.tick()
assert.notInclude($.texts(), 'Press Space to start')
```

`Game Over` should show when the game is over.
tr: Oyun bitince `Game Over` görünmeli.

```js
flap()
$.run(3)
assert.include($.texts(), 'Game Over')
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

let bird = { x: 100, y: 300, vy: 0, r: 14 }
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
