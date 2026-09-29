---
title: Is the bird level with a pipe?
title_tr: Kuş borunun hizasında mı?
skills: [game.collision]
---

# --goal--

Collision, part one. We treat the bird as the square box around its circle and ask: does it overlap the pipe
horizontally? For now, being level with a pipe ends the game, even in the opening.

# --goal-tr--

Borulara çarpma zamanı. Soruyu ikiye bölüyoruz; ilki: **kuş borunun hizasında mı?** (yatayda üst üste biniyorlar mı?)

Daire ile dikdörtgeni tam hesaplamak zor; oyunlar genelde bir hile kullanır: kuşu, dairesini içine alan **kare kutu**
gibi düşünürüz. Kutunun sol kenarı `bird.x - bird.r`, sağ kenarı `bird.x + bird.r`.

Bu adımda sadece ilk soruyu soruyoruz. Sonuç biraz haksız olacak (aşağıdaki soruya bak); bir sonraki adımda düzelteceğiz.

# --code--

```js
function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  return overlapsX
}

  if (hitGround || hitSky || pipes.some(hitsPipe)) state = 'over'
```

# --meaning--

- The ranges overlap when the bird's right edge is past the pipe's left edge **and** the bird's left edge is before
  the pipe's right edge. `&&` means "and".
- `return overlapsX` gives the answer back to the caller.
- `pipes.some(hitsPipe)` is true if **any** pipe is hit.

# --meaning-tr--

- `function hitsPipe(pipe)` → bir boru alır (parametre) ve "kuş buna çarpıyor mu?" sorusuna cevap verir.
- `bird.x + bird.r > pipe.x` → kuşun sağ kenarı borunun sol kenarını **geçti mi**? `>` büyüktür.
- `&&` → "**ve**": iki taraf da doğru olmalı.
- `bird.x - bird.r < pipe.x + PIPE_WIDTH` → kuşun sol kenarı borunun sağ kenarına **gelmedi mi**? `<` küçüktür.
- İkisi birlikte doğruysa kuş borunun hizasında: `overlapsX` (yatayda biniyor).
- `return overlapsX` → cevabı fonksiyonun **dönüş değeri** olarak geri ver.
- `pipes.some(hitsPipe)` → `some` "**herhangi biri** tutuyor mu?": boruları tek tek `hitsPipe`'a verir; en az biri için
  cevap doğruysa sonuç doğru. `hitsPipe` burada parantezsiz: onu `some` her boru için kendisi çağırır.

# --task--

1. Under `addPipe`, leave an empty line and write `hitsPipe`.
2. In `update`, add `|| pipes.some(hitsPipe)` to the game-over condition.

# --task-tr--

1. `addPipe` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak ve `hitsPipe`'ı yaz.
2. `update` içindeki `if (hitGround || hitSky) state = 'over'` satırında `hitSky`'dan sonra ` || pipes.some(hitsPipe)` ekle.
3. **Çalıştır** ve oyna.

# --predict--

You fly exactly through the middle of the first opening. What happens?
- [ ] You pass, like in the real game
- [x] Game over: for now, being level with a pipe is enough to crash
  We only asked "is it level?", not yet "is it inside the opening?".
- [ ] Nothing, pipes cannot be hit yet

# --predict-tr--

İlk açıklığın tam ortasından geçiyorsun. Ne olur?
- [ ] Geçersin, gerçek oyundaki gibi
- [x] Oyun biter: şimdilik borunun hizasına gelmek çarpmak için yetiyor
  Yalnız "hizasında mı?" diye sorduk; "açıklığın içinde mi?" diye henüz sormadık.
- [ ] Hiçbir şey, borulara henüz çarpılamıyor

# --tests--

A pipe that is not level with the bird should not hit it.
tr: Kuşun hizasında olmayan boru ona çarpmamalı.

```js
bird = { x: 100, y: 300, vy: 0, r: 14 }
assert.isFalse(hitsPipe({ x: 300, gapY: 0 }))
assert.isFalse(hitsPipe({ x: 115, gapY: 0 }), 'the pipe starts right after the bird')
assert.isFalse(hitsPipe({ x: 20, gapY: 0 }), 'the pipe ends right before the bird')
```

A pipe level with the bird should hit it.
tr: Kuşun hizasındaki boru ona çarpmalı.

```js
bird = { x: 100, y: 300, vy: 0, r: 14 }
assert.isTrue(hitsPipe({ x: 90, gapY: 400 }))
```

Flying into a pipe should end the game.
tr: Bir boruya uçmak oyunu bitirmeli.

```js
state = 'playing'
pipes = [{ x: 90, gapY: 400 }]
update()
assert.strictEqual(state, 'over')
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

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  return overlapsX
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
