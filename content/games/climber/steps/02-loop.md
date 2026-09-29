---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

The picture will change every moment, so the drawing goes into `draw` and a loop runs it about 60 times a second.

# --goal-tr--

Resim her an değişecek. Çizim satırlarını `draw` (çiz) fonksiyonuna alıyoruz ve bir **döngü** onu saniyede ~60 kez
çalıştırıyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` paints the whole picture, background first, which wipes the old one.
- `requestAnimationFrame(loop)` asks the browser to run `loop` again before the next screen refresh.

# --meaning-tr--

- `function draw()` → bütün resmi çizer; önce arka plan eski resmi siler.
- `function loop()` → çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste. Kendini yeniden istediği için
  durmaz.
- En alttaki satır döngüyü başlatır.

# --task--

Wrap the four drawing lines in `draw`, then write `loop` and start it.

# --task-tr--

1. Dört çizim satırını `function draw() { ... }` içine al (iki boşluk içeri).
2. Altına `loop` fonksiyonunu ve en alta `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**.

# --tests--

The loop should keep drawing the player where `player` says.
tr: Döngü zıplayanı `player`'ın söylediği yere çizmeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
player.x = 100
$.tick()
assert.deepEqual($.rects('#f59e0b'), [{ x: 100, y: 460, w: 40, h: 40, color: '#f59e0b' }])
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let player = { x: 180, y: 460, w: 40, h: 40 }

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
