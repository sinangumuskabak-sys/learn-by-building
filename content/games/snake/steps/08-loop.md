---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop runs again and again: update, draw, and ask the browser to run it again before the next screen
refresh (`requestAnimationFrame`, about 60 times a second).

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: güncelle → çiz → tekrar → güncelle → çiz... Bir çizgi filmin kareleri gibi,
her turda resim biraz değişir ve hareket görünür.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce
bu fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz.

# --code--

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `loop` runs one turn: move, then draw.
- `requestAnimationFrame(loop)` inside it books the next turn, so it keeps going.
- The last line starts the loop. It replaces the old single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `update()` → durumu değiştir (baş bir hücre sağa).
- `draw()` → yeni durumu çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon
  kendi devamını istiyor; böylece döngü hiç bitmez.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini
  alır (artık çizimi döngü yapıyor).

# --task--

Replace the `draw()` call at the bottom with the `loop` function and `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `draw()` satırını **sil**.
2. Yerine `loop` fonksiyonunu ve altına, bir boş satırdan sonra, `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır** ve kareyi izle.

# --predict--

What will the square do?
- [ ] Walk slowly to the right
- [x] Shoot off to the right in a blink
  The loop runs about 60 times a second and moves one cell each time: 60 cells a second.
- [ ] Stay still

# --predict-tr--

Kare ne yapacak?
- [ ] Yavaş yavaş sağa yürüyecek
- [x] Göz açıp kapayıncaya kadar sağa fırlayıp kaybolacak
  Döngü saniyede ~60 kez çalışıyor ve her seferinde bir hücre ilerliyor: saniyede 60 hücre!
- [ ] Yerinde duracak

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

Each frame should move the head and draw it.
tr: Her kare başı taşımalı ve çizmeli.

```js
$.tick(3)
assert.isAbove(head.x, 5)
assert.deepEqual($.rects('lime'), [{ x: head.x * 20, y: 100, w: 20, h: 20, color: 'lime' }])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
let head = { x: 5, y: 5 }

function update() {
  head.x += 1
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
