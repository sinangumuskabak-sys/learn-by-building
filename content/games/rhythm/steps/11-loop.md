---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop runs again and again: update, draw, and ask the browser to run it again before the next screen refresh
(`requestAnimationFrame`, about 60 times a second). The song starts.

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: güncelle → çiz → tekrar... Bir çizgi filmin kareleri gibi, her turda resim biraz
değişir ve hareket görünür.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz. Şarkı başlıyor!

# --code--

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` runs one turn: move the clock, then draw.
- `requestAnimationFrame(loop)` inside it books the next turn, so it keeps going.
- The last line starts the loop. It replaces the old single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `update()` → saati bir kare ilerlet. `draw()` → yeni durumu çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon kendi
  devamını istiyor; böylece döngü hiç bitmez.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

At the bottom, write `loop` above `reset()` and replace `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `reset()` satırının **üstüne** `loop` fonksiyonunu yaz ve altında bir boş satır bırak.
2. En alttaki `draw()` satırını sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır** ve izle: notalar yağmur gibi yağmalı.

# --predict--

When does the first note reach its hit line?
- [ ] Right away
- [x] After 2 seconds
  It is `LEAD` = 120 frames away, and the loop runs 60 frames a second.
- [ ] Never, it stops at the top

# --predict-tr--

İlk nota vuruş çizgisine ne zaman ulaşır?
- [ ] Hemen
- [x] 2 saniye sonra
  `LEAD` = 120 kare uzakta ve döngü saniyede 60 kare dönüyor.
- [ ] Hiç, tepede durur

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --try--

Set `SPEED` to `8` and run: the notes come twice as fast, yet each still reaches the line at the same moment. Put `4` back.

# --try-tr--

`SPEED`'i `8` yap ve çalıştır: notalar iki kat hızlı gelir ama her biri çizgiye yine aynı anda ulaşır. Sonra `4`'e geri al.

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
assert.strictEqual(frame, 3)
```

After `LEAD` frames the first note should be on the hit line.
tr: `LEAD` kare sonra ilk nota vuruş çizgisinin üstünde olmalı.

```js
$.tick(LEAD)
assert.strictEqual(frame, LEAD)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10, w: LANE_W - 16, h: 20, color: COLORS[0] })
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2
const HIT_Y = 480 // where a note should be when you press
const SPEED = 4 // pixels a note falls per frame
const STEP = 15 // frames between rows of the chart (an eighth note at 120 beats a minute)
const LEAD = 120 // frames before the first row reaches the line
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']
// The song, one row per eighth note: a 1 is a note in that lane.
const CHART = [
  '1000', '0000', '0100', '0000', '0010', '0000', '0001', '0000',
  '1000', '0100', '0010', '0001', '1001', '0000', '0110', '0000',
  '1000', '0010', '0100', '0001', '1000', '0010', '0100', '0001',
  '1100', '0000', '0011', '0000', '1100', '0000', '0011', '0000',
  '1000', '0100', '0010', '0001', '0010', '0100', '1000', '0000',
  '1010', '0101', '1010', '0101', '1001', '0110', '1001', '0000',
]

let notes // { lane, time, hit }
let frame

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function update() {
  frame += 1
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
    ctx.fillStyle = COLORS[lane]
    ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
  }
  for (const n of notes) {
    if (n.hit) continue
    const y = noteY(n)
    if (y < -20 || y > canvas.height + 20) continue
    ctx.fillStyle = COLORS[n.lane]
    ctx.fillRect(LEFT + n.lane * LANE_W + 8, y - 10, LANE_W - 16, 20)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
