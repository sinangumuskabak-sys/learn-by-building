---
title: Draw the hills
title_tr: Tepeleri çiz
skills: [game.canvas]
---

# --goal--

The ground is drawn as one filled shape: start at the bottom left, go through every point, finish at the bottom right.

# --goal-tr--

Listeyi tepelere çevirelim. Zemini **tek bir dolu şekil** olarak çizeceğiz: kalemi sol alt köşeye koy, sırayla bütün
noktalardan geçerek çiz, sağ alt köşede bitir ve içini boya. Bir çocuk resmindeki dağ silueti gibi.

# --code--

```js
function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
}

makeGround()
draw()
```

# --meaning--

- The first two lines paint a dark sky.
- `beginPath` starts a shape, `moveTo` puts the pen at the bottom left, `lineTo` draws to a point.
- `forEach((y, i) => ...)` runs once per height, with `i` its index: point `i` is at x = `i * STEP`.
- The last `lineTo` goes to the bottom right; `fill()` closes the shape and paints it grey.

# --meaning-tr--

- İlk iki satır gökyüzünü koyu laciverte boyar.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.moveTo(0, canvas.height)` → kalemi kaldırıp **sol alt köşeye** koy.
- `ground.forEach((y, i) => ctx.lineTo(i * STEP, y))` → `forEach` listedeki her eleman için küçük fonksiyonu
  çalıştırır; `y` elemanın kendisi, `i` sıra numarası. `i`. nokta `x = i * STEP`'te: her noktaya bir çizgi.
- `ctx.lineTo(canvas.width, canvas.height)` → son olarak **sağ alt köşeye**.
- `ctx.fill()` → şekli kapatıp içini gri boyar.
- En altta `draw()` → resmi bir kez çizer.

# --task--

Write `draw` above the `makeGround()` call, with an empty line after it, and write `draw()` under `makeGround()`.

# --task-tr--

1. En alttaki `makeGround()` satırının **üstüne** `draw` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `makeGround()` satırının altına `draw()` yaz.
3. **Çalıştır**: gri tepeler görmelisin. Birkaç kez çalıştır: her seferinde başka tepeler.

# --try--

Change `120` in `makeGround` to `10`: almost flat ground. Try `140` too. Put 120 back.

# --try-tr--

`makeGround` içindeki `120`'yi `10` yap: neredeyse düz bir zemin. `140`'ı da dene. Sonra 120'ye geri al.

# --tests--

The sky should be painted.
tr: Gökyüzü boyanmalı.

```js
assert.lengthOf($.rects('#020617').filter((r) => r.w === 480 && r.h === 360), 1)
```

The ground should be one filled shape through every point.
tr: Zemin, her noktadan geçen tek bir dolu şekil olmalı.

```js
const calls = $.screen()
const lines = calls.filter((c) => c.op === 'lineTo')
assert.lengthOf(lines, 14, 'one line to every point, then to the bottom right')
assert.deepEqual(lines[3].args, [120, ground[3]])
assert.isTrue(calls.some((c) => c.op === 'fill' && c.fill === '#475569'))
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...

function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
}

makeGround()
draw()
```
