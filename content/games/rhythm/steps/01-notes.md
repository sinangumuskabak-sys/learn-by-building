---
title: Notes on a timeline
title_tr: Bir zaman çizelgesinde notalar
skills: [prog.arrays, game.loop]
---

# --explanation--

In a rhythm game notes slide down four lanes towards a line, and you press the lane's key the moment a note reaches it.

The song is written as a **chart**: one string per row, one character per lane, `'1'` for a note. Each row is an eighth note,
`STEP = 15` frames apart, which is 120 beats a minute at 60 frames a second. Writing music as text makes it easy to read and to
change, and turning it into notes is two loops: every `'1'` becomes `{ lane, time }`, where `time` is the frame at which the note
must be hit.

The screen follows from the time, not the other way round. The game only counts `frame`; a note's position is worked out from
how far away its time is:

```js
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED
```

At its time the note is exactly on the line, and `SPEED` pixels higher for every frame still to go. Nothing is moved step by step,
so a note can never drift away from the beat. That is the core idea of every rhythm game: **the clock is the truth, and the
picture is computed from it**.

`LEAD` frames of silence before the first note give the player time to get ready.

# --explanation-tr--

Bir ritim oyununda notalar dört şeritte bir çizgiye doğru kayar ve bir nota çizgiye ulaştığı an o şeridin tuşuna basarsın.

Şarkı bir **nota çizelgesi** olarak yazılır: satır başına bir metin, şerit başına bir karakter, nota için `'1'`. Her satır, `STEP = 15`
kare aralıklı bir sekizlik notadır; saniyede 60 karede bu dakikada 120 vuruş eder. Müziği metin olarak yazmak onu okumayı ve
değiştirmeyi kolaylaştırır; notalara çevirmek iki döngüdür: her `'1'`, `time`'ı notaya vurulması gereken kare olan bir
`{ lane, time }` olur.

Ekran zamandan çıkar, tersi değil. Oyun yalnızca `frame`'i sayar; bir notanın konumu, zamanının ne kadar uzakta olduğundan
hesaplanır:

```js
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED
```

Zamanında nota tam çizgidedir ve kalan her kare için `SPEED` piksel daha yukarıdadır. Hiçbir şey adım adım hareket ettirilmez; bu
yüzden bir nota asla vuruştan kayamaz. Her ritim oyununun temel fikri budur: **saat gerçektir ve resim ondan hesaplanır**.

İlk notadan önceki `LEAD` karelik sessizlik oyuncuya hazırlanma zamanı verir.

# --task--

1. Add `LANES = 4`, `LANE_W = 70`, `LEFT` (the lanes centered), `HIT_Y = 480`, `SPEED = 4`, `STEP = 15`, `LEAD = 120`, the four lane
   `COLORS` and the `CHART` from the solution.
2. In `reset()`, build `notes`: for row `i` and lane `lane` with a `'1'`, `{ lane, time: LEAD + i * STEP, hit: false }`; and
   `frame = 0`. `update()` counts `frame` up.
3. Write `noteY(note)` as above.
4. Draw each lane (`'#1e293b'`, 2 pixels in from its sides), a hit bar across it (`COLORS[lane]`, 8 high, centered on `HIT_Y`, 6 in
   from the sides), and every note not yet hit that is on screen as a 20 high block in its lane's color, 8 in from the sides,
   centered on `noteY`.

# --task-tr--

1. `LANES = 4`, `LANE_W = 70`, `LEFT` (şeritler ortalı), `HIT_Y = 480`, `SPEED = 4`, `STEP = 15`, `LEAD = 120`, dört şerit `COLORS`'ını
   ve çözümdeki `CHART`'ı ekle.
2. `reset()`'te `notes`'u kur: `'1'` olan her `i` satırı ve `lane` şeridi için `{ lane, time: LEAD + i * STEP, hit: false }`; ve
   `frame = 0`. `update()` `frame`'i artırır.
3. `noteY(note)`'yi yukarıdaki gibi yaz.
4. Her şeridi (`'#1e293b'`, kenarlarından 2 piksel içeride), üstünde bir vuruş çubuğunu (`COLORS[lane]`, 8 yüksekliğinde, `HIT_Y`'ye
   ortalı, kenarlardan 6 içeride) ve ekranda olan henüz vurulmamış her notayı şeridinin renginde, kenarlardan 8 içeride, `noteY`'ye
   ortalı 20 yüksekliğinde bir blok olarak çiz.

# --tests--

Every 1 in the chart should become a note at its row's time, chords included.
tr: Çizelgedeki her 1, akorlar dahil, satırının zamanında bir nota olmalı.

```js
const ones = CHART.join('').split('').filter((c) => c === '1').length
assert.lengthOf(notes, ones, 'one note for every 1 in the chart')
assert.deepInclude(notes, { lane: 0, time: LEAD, hit: false }, 'the first row')
assert.deepInclude(notes, { lane: 3, time: LEAD + 12 * STEP, hit: false }, 'row 12 has a note in lane 3')
assert.deepInclude(notes, { lane: 0, time: LEAD + 12 * STEP, hit: false }, 'and one in lane 0 at the same time')
```

A note should be on the line exactly at its time.
tr: Bir nota tam zamanında çizginin üstünde olmalı.

```js
const first = notes[0]
assert.strictEqual(noteY(first), HIT_Y - LEAD * SPEED, 'far above the line at the start')
$.tick(LEAD)
assert.strictEqual(frame, LEAD)
assert.strictEqual(noteY(first), HIT_Y, 'on the line exactly at its time')
```

The hit bars and the falling notes should be drawn in place.
tr: Vuruş çubukları ve düşen notalar yerlerinde çizilmeli.

```js
$.tick(1)
for (let lane = 0; lane < 4; lane++) {
  assert.deepInclude($.rects(COLORS[lane]), { x: LEFT + lane * LANE_W + 6, y: HIT_Y - 4, w: LANE_W - 12, h: 8, color: COLORS[lane] }, 'the hit line')
}
$.tick(LEAD - 1 - 10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10 * SPEED - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'the first note, 10 frames away')
```

# --seed--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
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
