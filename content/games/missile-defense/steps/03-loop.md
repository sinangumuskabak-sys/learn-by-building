---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop, prog.functions]
---

# --goal--

Missiles will move, so the picture must be redrawn about 60 times a second. The drawing goes in `draw`, and a game loop
calls it.

# --goal-tr--

Birazdan füzeler hareket edecek; resmin saniyede yaklaşık **60 kez** yeniden çizilmesi gerekiyor. Çizim satırlarını
`draw` (çiz) adlı bir **fonksiyon**a koyuyoruz ve onu bir **oyun döngüsünden** sürekli çağırıyoruz.

Ekran aynı görünecek; ama artık her karede baştan çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  ctx.fillStyle = '#38bdf8'
  for (const x of CITY_XS) {
    ctx.fillRect(x - 16, GROUND - 14, 32, 14)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` holds all the drawing lines; painting the sky first wipes the previous picture.
- `loop` draws, then asks the browser to run `loop` again before the next screen refresh.
- The last line starts the loop; `loop` has no `()` there: "run it when it is time".

# --meaning-tr--

- `function draw() { ... }` → bütün çizim satırlarını **draw** adı altında toplar. Satırlar senin zaten yazdığın
  satırlar; yalnız iki boşluk içeri girip `{ }` arasına alınıyorlar.
- Gökyüzünü boyamak her karede **eski resmi siler**; füzeler ilerleyince arkalarında eski kopyalar kalmaz.
- `function loop() { draw(); requestAnimationFrame(loop) }` → döngünün bir turu: çiz, sonra tarayıcıya "ekranı bir
  sonraki yenileyişinden önce `loop`'u yine çalıştır" de. Kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. `loop` parantezsiz: "şimdi çalıştır" değil,
  "sırası gelince sen çalıştır".

# --task--

Wrap all the drawing lines in `function draw() { ... }` (indent them by two spaces), then write `loop` and the line that
starts it below.

# --task-tr--

1. Gökyüzünü boyayan ilk `ctx.fillStyle = '#020617'` satırının **üstüne** `function draw() {` yaz.
2. Üssü çizen son satıra kadar bütün çizim satırlarını iki boşluk içeri al ve altlarına `}` koy.
3. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp `requestAnimationFrame(loop)` satırını yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen is empty, check the last line: `requestAnimationFrame(loop)`, with no `()` after `loop`.

# --hint-tr--

Ekran boşsa son satıra bak: `requestAnimationFrame(loop)`; `loop`'tan sonra `()` yok.

# --tests--

`draw()` should draw the scene.
tr: `draw()` sahneyi çizmeli.

```js
draw()
assert.lengthOf($.rects('#38bdf8'), 6)
assert.lengthOf($.rects('#a3e635'), 1)
```

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  ctx.fillStyle = '#38bdf8'
  for (const x of CITY_XS) {
    ctx.fillRect(x - 16, GROUND - 14, 32, 14)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
