---
title: A clock and a loop
title_tr: Saat ve döngü
skills: [game.loop]
---

# --goal--

Moles come and go with time, so the game needs a clock. A loop redraws about 60 times a second, and the browser tells
it the time in milliseconds; we keep it in `now`.

# --goal-tr--

Köstebekler **zamanla** çıkıp saklanacak; oyunun bir **saate** ihtiyacı var. Saniyede ~60 kez çalışan bir **döngü**
kuruyoruz. Tarayıcı döngüye her seferinde **şu anki zamanı** (milisaniye) veriyor; onu `now` (şimdi) değişkeninde
tutacağız.

# --code--

```js
let now = 0 // time of the current frame, in ms

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh, passing the time.
- `loop` saves the time, draws, and asks again, so it never stops.
- The call at the bottom starts it (it replaces the single `draw()`).

# --meaning-tr--

- `let now = 0` → şimdiki zaman, milisaniye (1 saniye = 1000 ms).
- `function loop(time)` → döngünün bir turu. `time` → tarayıcının verdiği zaman.
- `now = time` → zamanı sakla; oyunun her yeri buna bakacak.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce `loop`'u yine çalıştır". Kendini yeniden istediği
  için döngü hiç durmaz.
- En alttaki çağrı döngüyü **başlatır**; eski tek seferlik `draw()`'ın yerini alır.

# --task--

1. Under the holes loop, write `let now = 0`.
2. Replace the `draw()` call at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

1. Delik döngüsünün altına bir boş satır bırakıp `let now = 0 ...` yaz.
2. En alttaki `draw()` satırını sil; yerine `loop` fonksiyonunu ve altına `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**: ekran aynı görünür ama artık saniyede 60 kez çiziliyor.

# --tests--

The loop should keep running and keep the time in `now`.
tr: Döngü sürmeli ve zamanı `now`'da tutmalı.

```js
$.run(1)
assert.strictEqual($.pendingFrames, 1)
assert.isAbove(now, 900)
assert.isBelow(now, 1100)
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
  }
}

let now = 0 // time of the current frame, in ms

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
