---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop, prog.functions]
---

# --goal--

The picture is drawn only once. A game redraws it about 60 times a second, so we put the drawing in a `draw` function
and call it from a game loop.

# --goal-tr--

Şu an resim **bir kez** çiziliyor ve öyle kalıyor. Raket kıpırdasa bile ekran bunu göstermez. Oyunlar resmi
saniyede yaklaşık **60 kez** yeniden çizer; bir çizgi filmin kareleri gibi.

Çizim satırlarını `draw` (çiz) adlı bir **fonksiyon**a koyacağız ve onu bir **oyun döngüsünden** sürekli
çağıracağız. Ekran yine aynı görünecek, ama artık her karede yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` holds the four drawing lines. Painting the background first wipes the old picture.
- `loop` draws, then asks the browser to run `loop` again before the next screen refresh.
- The last line starts the loop. `loop` is passed without `()`: "run it when it is time", not "run it now".

# --meaning-tr--

- `function draw() { ... }` → dört çizim satırını **draw** adı altında toplar. Tanımlamak çalıştırmak değildir;
  tarif yazılır, pişirilmez.
- Gövdenin ilk iki satırı arka planı boyar: bu her karede **eski resmi siler**. Raket kayınca arkasında iz kalmaz.
- `function loop() {` → döngünün **bir turu**: önce `draw()` ile çiz, sonra...
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenileyişinden önce `loop`'u yine çalıştır" der.
  `loop` kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Burada `loop` parantezsiz yazılır: "şimdi
  çalıştır" değil, "sırası gelince sen çalıştır" diyoruz.

# --task--

Wrap the four drawing lines in `function draw() { ... }` (indent them by two spaces), then write `loop` and the line
that starts it under it.

# --task-tr--

1. Dört çizim satırının **üstüne** `function draw() {` yaz, satırları iki boşluk içeri al, altlarına `}` koy.
2. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp en alta `requestAnimationFrame(loop)`
   satırını yaz.
3. **Çalıştır**: ekran aynı görünmeli, kontroller yeşil olmalı.

# --predict--

What will you see after Run?
- [x] The same picture as before
  The loop draws exactly the same thing, just many times a second.
- [ ] The paddle slides to the right
- [ ] The screen flickers

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [x] Öncekinin aynısı
  Döngü tam olarak aynı resmi çiziyor, yalnız saniyede onlarca kez.
- [ ] Raket sağa kayar
- [ ] Ekran titrer

# --hint--

If the screen stays empty, check that the last line is `requestAnimationFrame(loop)` without `()` after `loop`.

# --hint-tr--

Ekran boş kalıyorsa en alttaki satırın `requestAnimationFrame(loop)` olduğundan emin ol; `loop`'tan sonra `()` yok.

# --tests--

`draw()` should draw the paddle wherever `paddle.x` is.
tr: `draw()` raketi `paddle.x` neredeyse oraya çizmeli.

```js
paddle.x = 60
draw()
assert.deepEqual($.rects('#e2e8f0'), [{ x: 60, y: 370, w: 80, h: 12, color: '#e2e8f0' }])
```

The loop should redraw every frame and keep itself going.
tr: Döngü her karede yeniden çizmeli ve kendini sürdürmeli.

```js
paddle.x = 120
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
assert.strictEqual($.rects('#e2e8f0')[0].x, 120)
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370

let paddle = { x: 200 }

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
