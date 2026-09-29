---
title: A flap
title_tr: Kanat çırpış
skills: [game.physics]
---

# --goal--

A flap does not push the bird up by some pixels: it **sets** its velocity to a fixed upward speed, `-8`. Gravity does
the rest.

# --goal-tr--

Kuş kanat çırpınca ne olur? Birkaç piksel yukarı ışınlanmaz; **hızı** bir anda yukarı doğru olur. Sonrasını yerçekimi
halleder: hız her karede 0,5 artar (`-8, -7.5, -7, ...`), kuş hızla yükselir, yavaşlar, tepede bir an durur ve yine
düşer.

Bu adımda çırpış fonksiyonunu yazıyoruz; tuşlara bir sonraki adımda bağlayacağız.

# --code--

```js
const FLAP = -8 // the bird's speed right after a flap (negative = up)

function flap() {
  bird.vy = FLAP
}
```

# --meaning--

- `FLAP` is negative because y grows downwards: going up means y gets smaller.
- `bird.vy = FLAP` **sets** the speed. With `+=` a flap while falling fast would barely help, and two flaps would
  launch the bird into space. Setting it makes every flap feel the same.

# --meaning-tr--

- `const FLAP = -8` → çırpıştan hemen sonraki hız. Neden **eksi**? Canvas'ta y aşağı doğru büyür; yukarı gitmek için
  y **küçülmeli**, yani hız eksi olmalı.
- `function flap() {` → kanat çırpma tarifi.
- `bird.vy = FLAP` → tek `=` "içine koy": hızın eski değeri ne olursa olsun artık `-8` olur.
- Neden `+=` değil? Çırpış hıza `-8` **ekleseydi**, hızla düşerken çırpmak pek işe yaramazdı, art arda iki çırpış ise
  kuşu uzaya fırlatırdı. **Ayarlamak** her çırpışı aynı hissettirir; oyunu adil yapan bu.

# --task--

1. Under the `GRAVITY` line, write the `FLAP` line.
2. Under the `bird` line, leave an empty line and write `flap`. Press **Run**.

# --task-tr--

1. `GRAVITY` satırının hemen altına `FLAP` satırını yaz.
2. `let bird = ...` satırının altına bir boş satır bırakıp `flap` fonksiyonunu yaz (`function update`'in üstünde).
3. **Çalıştır**: kuş yine düşer; henüz kimse `flap`'i çağırmıyor.

# --hint--

Use `=` in `flap`, not `+=`: a flap sets the speed.

# --hint-tr--

`flap` içinde `+=` değil `=` kullan: çırpış hızı **ayarlar**.

# --tests--

`flap()` should set the bird's velocity to `FLAP` (-8), even while falling fast.
tr: `flap()` kuşun hızını, hızla düşerken bile `FLAP` (-8) yapmalı.

```js
assert.strictEqual(FLAP, -8)
bird.vy = 12
flap()
assert.strictEqual(bird.vy, -8)
```

After a flap the bird should rise, then fall again.
tr: Kanat çırptıktan sonra kuş yükselmeli, sonra yeniden düşmeli.

```js
$.tick(5)
const before = bird.y
flap()
$.tick(8)
assert.isBelow(bird.y, before, 'the bird should be higher after flapping')
$.tick(30)
assert.isAbove(bird.vy, 0, 'gravity should win again')
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

function flap() {
  bird.vy = FLAP
}

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
