---
title: The clock decides where
title_tr: Yeri saat belirler
skills: [game.state]
---

# --goal--

The game counts frames in `frame`. A note's height is worked out from how far away its time is: on the line exactly
at its time, and `SPEED` pixels higher for every frame still to go.

# --goal-tr--

Bu, her ritim oyununun ana fikri: **saat gerçektir, resim ondan hesaplanır.**

Oyun sadece zamanı sayar: `frame` (kaçıncı karedeyiz). Bir notanın ekrandaki yüksekliği ise **zamanından
hesaplanır**. Zamanı geldiğinde nota tam çizgidedir; gelmesine kalan her kare için `SPEED` (4) piksel daha
yukarıdadır. Notaları adım adım kaydırmadığımız için müzikten hiç kaymazlar.

# --code--

```js
const SPEED = 4 // pixels a note falls per frame

let frame

  frame = 0
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED
```

# --meaning--

- `frame` counts frames; `reset` sets it to 0.
- `note.time - frame` is how many frames are left. Times `SPEED` it is the distance above the line.
- `noteY` is a one-line arrow function: it returns the value after `=>`.

# --meaning-tr--

- `const SPEED = 4` → bir nota her karede 4 piksel düşer.
- `let frame` → şu anki kare. `reset` içindeki `frame = 0` → oyun 0. kareden başlar.
- `const noteY = (note) => ...` → kısa bir fonksiyon: bir nota alır, `=>`'nin sağındaki hesabı **geri verir**.
- `note.time - frame` → notanın zamanına **kaç kare kaldı**. İlk nota için başta 120 − 0 = 120.
- `* SPEED` → kalan kare başına 4 piksel: 120 × 4 = 480 piksel yukarıda.
- `HIT_Y - ...` → çizgiden o kadar yukarı: 480 − 480 = **0**. Yani ilk nota başta ekranın tam tepesinde.
- Zamanı gelince `note.time - frame` = 0 olur ve `noteY` tam `HIT_Y`: nota çizginin üstünde.

# --task--

1. Under `HIT_Y` write `SPEED`.
2. Under `let notes` write `let frame`.
3. At the end of `reset`, write `frame = 0`.
4. Under `reset`, after an empty line, write the comment and `noteY`.

# --task-tr--

1. `const HIT_Y = ...` satırının altına `SPEED` satırını yaz (`STEP` ve `LEAD` onun altında kalır).
2. `let notes ...` satırının altına `let frame` yaz.
3. `reset`'in sonunda, `})` satırının altına `frame = 0` yaz.
4. `reset` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak; yorumu ve `noteY` satırını yaz.
5. **Çalıştır**: ekran değişmez; kontroller yeşil olmalı.

# --tests--

`frame` should start at 0.
tr: `frame` 0'dan başlamalı.

```js
assert.strictEqual(frame, 0)
```

A note should be on the line exactly at its time, and 4 pixels higher for each frame still to go.
tr: Bir nota tam zamanında çizginin üstünde olmalı; kalan her kare için 4 piksel daha yukarıda.

```js
const first = notes[0]
assert.strictEqual(noteY(first), HIT_Y - LEAD * SPEED, 'far above the line at the start')
frame = LEAD - 10
assert.strictEqual(noteY(first), HIT_Y - 40)
frame = LEAD
assert.strictEqual(noteY(first), HIT_Y, 'on the line exactly at its time')
frame = LEAD + 5
assert.strictEqual(noteY(first), HIT_Y + 20, 'below the line when it is late')
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
}

reset()
draw()
```
