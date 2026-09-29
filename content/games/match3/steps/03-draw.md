---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop, prog.functions]
---

# --goal--

Gems will flash and fall, so the picture must be redrawn about 60 times a second. The drawing goes into `draw`, and
`loop` calls it before every screen refresh.

# --goal-tr--

Mücevherler ileride yanıp sönecek ve düşecek; resmin **saniyede yaklaşık 60 kez** yeniden çizilmesi gerekecek. Bu
yüzden bütün çizimi bir fonksiyona koyuyoruz: `draw` (çiz). Bir de **oyun döngüsü**: `loop` her turda `draw()`'u
çağırır ve tarayıcıdan bir sonraki turu ister. Ekran aynı görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` paints the background first, which wipes the previous picture, then the grid.
- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh; `loop` asks again at
  its end, so it keeps running. The last line starts it.

# --meaning-tr--

- `function draw() {` → bütün çizim bu fonksiyonun içinde. İlk iş arka planı boyamak: bu, **eski resmi siler**.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden önce `loop`'u çalıştır" der.
- `function loop() {` → döngünün bir turu: çiz, sonra bir sonraki turu iste. Kendi devamını istediği için hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır.

# --task--

1. Wrap all the drawing lines in `function draw() { ... }`, indented by two spaces.
2. Under it write `loop` and the line that starts it.

# --task-tr--

1. Boyama satırlarının **üstüne** `function draw() {` yaz; altındaki bütün satırları (iki döngü dahil) iki boşluk
   içeri al ve en sona kapanan `}` yaz.
2. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**: ızgara aynı görünmeli.

# --hint--

`requestAnimationFrame(loop)` appears twice: inside `loop`, and once more at the very bottom, outside every function.

# --hint-tr--

`requestAnimationFrame(loop)` iki kez geçer: `loop`'un içinde ve bir kez de en altta, bütün fonksiyonların dışında.

# --tests--

The loop should redraw the grid every frame.
tr: Döngü ızgarayı her karede yeniden çizmeli.

```js
assert.isFunction(draw)
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
assert.lengthOf($.rects().filter((r) => r.w === 48), 64)
assert.isAtLeast($.calls.filter((c) => c.op === 'fillRect' && c.fill === '#1e1b4b').length, 3, 'painted again every frame')
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
