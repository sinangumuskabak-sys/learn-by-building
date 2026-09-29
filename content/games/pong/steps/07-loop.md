---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop runs again and again: draw, then ask the browser to run it again before the next screen refresh
(`requestAnimationFrame`, about 60 times a second). Soon it will also move things.

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: çiz → tekrar → çiz... Çizgi filmin kareleri gibi, her turda resim biraz değişir ve
hareket görünür. Her resme **kare** (frame) denir.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz. Şimdilik ekran aynı; birazdan
raketleri ve topu oynatacağız.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws, then books the next turn with `requestAnimationFrame(loop)`.
- The last line starts the loop. It replaces the single `draw()` call.
- `loop` has no parentheses there: we hand over the function, the browser calls it later.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır".
- Dikkat: burada `loop` **parantezsiz**. `loop()` "şimdi çalıştır" olurdu; `loop` ise "bu tarifi al, sırası gelince sen
  çalıştır" demek.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Replace the `draw()` call at the bottom with the `loop` function and `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `draw()` satırını **sil**.
2. Yerine `loop` fonksiyonunu ve altına, bir boş satırdan sonra, `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**: ekran aynı görünür; kontroller döngünün döndüğüne bakacak.

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

A change to a paddle should show on the next frame.
tr: Raketteki bir değişiklik bir sonraki karede görünmeli.

```js
left.y = 40
$.tick(1)
assert.isTrue($.rects('white').some((r) => r.x === 20 && r.y === 40 && r.h === 80))
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
