---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop runs again and again: update, draw, and ask the browser to run it again before the next screen refresh
(`requestAnimationFrame`, about 60 times a second).

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: güncelle → çiz → tekrar → güncelle → çiz... Çizgi filmin kareleri gibi, her turda
resim biraz değişir ve hareket görünür. Her resme **kare** (frame) denir.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz.

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
- `loop` has no parentheses there: we hand over the function, the browser calls it later.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `update()` → durumu değiştir (kuş 2 piksel iner).
- `draw()` → yeni durumu çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon kendi
  devamını istiyor; böylece döngü hiç bitmez.
- Dikkat: burada `loop` **parantezsiz**. `loop()` "şimdi çalıştır" olurdu; `loop` ise "bu tarifi al, sırası gelince
  sen çalıştır" demek.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Replace the `draw()` call at the bottom with the `loop` function and `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `draw()` satırını **sil**.
2. Yerine `loop` fonksiyonunu ve altına, bir boş satırdan sonra, `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır** ve kuşu izle.

# --predict--

What will the bird do?
- [ ] Stay still
- [x] Slide down at a steady speed and leave the screen
  60 frames a second × 2 pixels = 120 pixels a second, always the same speed.
- [ ] Fall faster and faster

# --predict-tr--

Kuş ne yapacak?
- [ ] Yerinde duracak
- [x] Hep aynı hızla aşağı kayıp ekrandan çıkacak
  Saniyede 60 kare × 2 piksel = saniyede 120 piksel; hız hiç değişmiyor.
- [ ] Gittikçe hızlanarak düşecek

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

Each frame should move the bird and draw it.
tr: Her kare kuşu hareket ettirmeli ve çizmeli.

```js
$.tick(10)
assert.strictEqual(bird.y, 320)
assert.strictEqual($.arcs()[0].y, 320)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let bird = { x: 100, y: 300, r: 14 }

function update() {
  bird.y += 2
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
