---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

The picture must follow every key, so we redraw it all the time: a loop that draws and asks the browser to run it
again before the next screen refresh.

# --goal-tr--

Birazdan harf yazacağız ve her harf hemen görünmeli. En kolayı: resmi **sürekli** yeniden çizmek.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Fonksiyon kendini her seferinde yeniden istediği için döngü hiç durmaz. Buna **oyun
döngüsü** denir.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws once, then books itself for the next frame.
- The last line starts the loop. It replaces the old single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır".
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Replace the `draw()` call at the bottom with the `loop` function and `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `draw()` satırını **sil**.
2. Yerine `loop` fonksiyonunu ve altına, bir boş satırdan sonra, `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**. Ekran aynı görünür.

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
assert.lengthOf($.screen().filter((c) => c.op === 'strokeRect'), 30)
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
