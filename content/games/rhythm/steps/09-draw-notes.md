---
title: Draw the notes
title_tr: Notaları çiz
skills: [prog.loops, game.canvas]
---

# --goal--

`draw` now paints every note that is not hit yet and is on the screen: a 20-pixel block in its lane's color, centred
on `noteY`.

# --goal-tr--

Şimdi notaları görünür yapıyoruz. `draw`, listedeki her notaya bakacak: vurulmamışsa ve ekranın içindeyse onu kendi
şeridinin renginde küçük bir **blok** olarak çizecek.

Ekranın çok yukarısında (henüz gelmemiş) ya da çok aşağısında (geçip gitmiş) olan notaları çizmeyiz; boşuna emek.

# --code--

```js
for (const n of notes) {
  if (n.hit) continue
  const y = noteY(n)
  if (y < -20 || y > canvas.height + 20) continue
  ctx.fillStyle = COLORS[n.lane]
  ctx.fillRect(LEFT + n.lane * LANE_W + 8, y - 10, LANE_W - 16, 20)
}
```

# --meaning--

- `for (const n of notes)` repeats its body for every note, calling it `n`.
- `continue` skips to the next note: hit notes and notes off the screen are not drawn.
- `||` means "or". The block is 20 pixels tall, centred on `y`, 8 pixels in from the lane's sides.

# --meaning-tr--

- `for (const n of notes) {` → "listedeki **her nota için**, ona `n` de ve içini yap". 49 nota, 49 tur.
- `if (n.hit) continue` → nota vurulduysa `continue`: "bu turu atla, sıradakine geç".
- `const y = noteY(n)` → notanın şu anki yüksekliği.
- `if (y < -20 || y > canvas.height + 20) continue` → `||` "**ya da**": ekranın üstünden yukarıda **ya da** altından
  aşağıdaysa çizme.
- `ctx.fillStyle = COLORS[n.lane]` → notanın şeridinin rengi.
- `ctx.fillRect(LEFT + n.lane * LANE_W + 8, y - 10, LANE_W - 16, 20)` → şeridin içinde, yanlardan 8 piksel içeride,
  20 piksel boyunda bir blok. `y - 10`'dan başladığı için ortası tam `y`'de.

# --task--

In `draw`, under the lanes loop, write the notes loop (before the function's last `}`).

# --task-tr--

`draw` içinde, şerit döngüsünün kapanan `}`'sinin altına ve fonksiyonun son `}`'sinden önce nota döngüsünü yaz.
**Çalıştır**: ekranın en tepesinde, ilk şeritte yarısı görünen kırmızı bir nota olmalı.

# --predict--

What will you see after Run?
- [ ] All 49 notes on the screen
- [x] Only the first note, half of it at the very top
  At frame 0 the first note is at `y = 0`; the others are still above the screen.
- [ ] Notes falling down

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] 49 notanın hepsini
- [x] Yalnız ilk notayı, yarısı en tepede
  0. karede ilk nota `y = 0`'da; diğerleri henüz ekranın üstünde.
- [ ] Aşağı düşen notalar

# --tests--

Each note should be drawn in its lane's color, centred on its height.
tr: Her nota kendi şeridinin renginde, yüksekliğine ortalanmış çizilmeli.

```js
frame = LEAD - 10
draw()
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 40 - 10, w: LANE_W - 16, h: 20, color: COLORS[0] })
const second = notes.find((n) => n.lane === 1)
assert.deepInclude($.rects(COLORS[1]), { x: LEFT + 70 + 8, y: noteY(second) - 10, w: 54, h: 20, color: COLORS[1] })
```

Notes that were hit, or are far off the screen, should not be drawn.
tr: Vurulmuş ya da ekranın çok dışındaki notalar çizilmemeli.

```js
frame = LEAD
notes[0].hit = true
draw()
assert.notDeepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'a hit note is not drawn')
frame = 0
draw()
const drawn = $.rects().filter((r) => r.h === 20)
assert.lengthOf(drawn, 0, 'at frame 0 the only note on screen was the first one, and it is hit')
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

reset()
draw()
```
