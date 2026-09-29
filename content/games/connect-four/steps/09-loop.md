---
title: Draw every frame
title_tr: Her karede çiz
skills: [game.loop]
---

# --goal--

`draw()` runs only once, so a change to the board would never show. A game loop draws again about 60 times a second:
`requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh, and `loop` asks again.

# --goal-tr--

`draw()` şu an **bir kez** çalışıyor; tahta sonradan değişirse ekrana hiç yansımaz. Oyunlar bu yüzden bir **döngüyle**
çalışır: resmi saniyede yaklaşık **60 kez** baştan çizerler; çizgi filmin kareleri gibi.

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir dahaki yenilemenden önce `loop`'u çalıştır" der. `loop` da her
seferinde kendi devamını ister; döngü hiç durmaz.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws one frame and books the next one.
- At the bottom, `requestAnimationFrame(loop)` replaces the single `draw()` and starts it all.

# --meaning-tr--

- `function loop()` → döngünün **bir turu**: çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste.
- En alttaki `draw()` gidiyor; yerine döngüyü **başlatan** `requestAnimationFrame(loop)` geliyor.

# --task--

1. Above `reset()` at the bottom write `loop`, followed by an empty line.
2. Replace the last line, `draw()`, with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `reset()` satırının **üstüne** `loop` fonksiyonunu yaz; altında bir boş satır kalsın.
2. En son satırdaki `draw()`'ı sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**: ekran aynı görünür, ama artık her karede yeniden çiziliyor.

# --tests--

A change on the board should show in the next frame.
tr: Tahtadaki bir değişiklik bir sonraki karede görünmeli.

```js
board[5][3] = 1
$.tick(1)
assert.deepEqual($.arcs().filter((a) => a.color === '#ef4444').map((a) => [a.x, a.y]), [[224, 448]])
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
