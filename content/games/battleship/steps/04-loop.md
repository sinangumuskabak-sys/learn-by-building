---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

Shots will change the picture. We put the drawing in `draw` and redraw it about 60 times a second with a game loop.

# --goal-tr--

Birazdan atışlar resmi değiştirecek: isabetler, ıskalar... Resmin her an güncel olması için çizimi `draw` (çiz) adlı bir
fonksiyona koyup bir **oyun döngüsüyle** saniyede yaklaşık 60 kez yeniden çiziyoruz. Ekran yine aynı görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` holds all the drawing lines; the background wipes the previous picture each time.
- `loop` draws, then asks the browser to run `loop` again before the next screen refresh.
- The last line starts the loop (`loop` without `()`: "run it when it is time").

# --meaning-tr--

- `function draw() { ... }` → bütün çizim satırlarını bir araya toplar; satırlar iki boşluk içeri girer. Arka plan
  her seferinde **eski resmi siler**.
- `function loop() { ... }` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile tarayıcıya "ekranı bir
  sonraki yenileyişinden önce `loop`'u yine çalıştır" de. Kendi devamını istediği için hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır. `loop` parantezsiz: "sırası gelince sen çalıştır".

# --task--

Wrap the drawing lines at the bottom in `function draw() { ... }`, then write `loop` and the line that starts it.

# --task-tr--

1. `drawSea` fonksiyonunun altındaki bütün çizim satırlarının **üstüne** `function draw() {` yaz, satırları iki boşluk
   içeri al ve altlarına `}` koy.
2. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**: ekran aynı görünmeli.

# --tests--

`draw()` should draw both seas.
tr: `draw()` iki denizi de çizmeli.

```js
draw()
assert.lengthOf($.rects('#1e3a8a'), 200)
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
