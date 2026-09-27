---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics, game.loop]
---

# --explanation--

Things in games move with two numbers:

- **position**: where it is (`bird.y`)
- **velocity**: how much the position changes every frame (`bird.vy`, "velocity along y")

Gravity does not move the bird directly. It changes the **velocity**, a little every frame. That is what
*acceleration* means:

```js
bird.vy += GRAVITY   // falling gets faster and faster
bird.y += bird.vy    // then move by the current speed
```

With `GRAVITY = 0.5` the bird moves 0.5 px in the first frame, 1 px in the second, 1.5 px in the third... It starts
slowly and speeds up, which is exactly what a real fall looks like. Two lines, and it already feels physical.

This runs inside a game loop: `update()` changes the state, `draw()` shows it, `requestAnimationFrame` repeats about 60
times a second. (In this game we update once per frame. The last step makes that robust on fast screens.)

# --explanation-tr--

Oyunlarda şeyler iki sayıyla hareket eder:

- **konum**: nerede olduğu (`bird.y`)
- **hız**: konumun her karede ne kadar değiştiği (`bird.vy`, "y yönündeki hız")

Yerçekimi kuşu doğrudan hareket ettirmez. **Hızı** değiştirir, her karede biraz. *İvme* tam olarak budur:

```js
bird.vy += GRAVITY   // düşüş gittikçe hızlanır
bird.y += bird.vy    // sonra o anki hız kadar ilerle
```

`GRAVITY = 0.5` ile kuş ilk karede 0,5 px, ikincide 1 px, üçüncüde 1,5 px ilerler... Yavaş başlar ve hızlanır; gerçek
bir düşüş de tam böyle görünür. İki satır, ve şimdiden fiziksel hissettiriyor.

Bu bir oyun döngüsünün içinde çalışır: `update()` durumu değiştirir, `draw()` gösterir, `requestAnimationFrame`
saniyede yaklaşık 60 kez tekrarlar. (Bu oyunda her karede bir güncelleme yapıyoruz. Son adım bunu hızlı ekranlarda
sağlam hâle getirecek.)

# --task--

1. Add `const GRAVITY = 0.5` and give the bird a velocity: `vy: 0` in the `bird` object.
2. Write `function update()` that adds `GRAVITY` to `bird.vy`, then adds `bird.vy` to `bird.y`.
3. Write `function loop()` that calls `update()`, then `draw()`, then `requestAnimationFrame(loop)`.
4. Start it with `requestAnimationFrame(loop)` instead of calling `draw()` once.

Run it and watch the bird fall off the screen.

# --task-tr--

1. `const GRAVITY = 0.5` ekle ve kuşa bir hız ver: `bird` nesnesine `vy: 0`.
2. `bird.vy`'ye `GRAVITY` ekleyen, sonra `bird.y`'ye `bird.vy` ekleyen `function update()` yaz.
3. `update()`, sonra `draw()`, sonra `requestAnimationFrame(loop)` çağıran `function loop()` yaz.
4. `draw()`'u bir kez çağırmak yerine `requestAnimationFrame(loop)` ile başlat.

Çalıştır ve kuşun ekrandan düşüşünü izle.

# --tests--

`GRAVITY` should be 0.5 and the bird should start still.
tr: `GRAVITY` 0.5 olmalı ve kuş hareketsiz başlamalı.

```js
assert.strictEqual(GRAVITY, 0.5)
assert.strictEqual(bird.vy, 0)
```

`update()` should speed the fall up, then move the bird.
tr: `update()` önce düşüşü hızlandırmalı, sonra kuşu hareket ettirmeli.

```js
update()
assert.strictEqual(bird.vy, 0.5)
assert.strictEqual(bird.y, 300.5)
update()
assert.strictEqual(bird.vy, 1)
assert.strictEqual(bird.y, 301.5)
```

The loop should update and redraw every frame.
tr: Döngü her karede güncellemeli ve yeniden çizmeli.

```js
$.tick(10)
assert.closeTo(bird.vy, 5, 0.001)
assert.closeTo(bird.y, 327.5, 0.001)
assert.closeTo($.arcs()[0].y, bird.y, 0.001)
assert.strictEqual($.pendingFrames, 1)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
