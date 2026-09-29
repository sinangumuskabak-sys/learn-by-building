---
title: Show the keys
title_tr: Tuşları göster
skills: [game.canvas]
---

# --goal--

A new player should see which key goes with which lane: we write D, F, J and K under the hit lines.

# --goal-tr--

Oyunu ilk kez açan biri hangi tuşun hangi şeride gittiğini bilemez. Her şeridin altına, vuruş çizgisinin biraz
aşağısına kendi harfini yazacağız: **D F J K**.

Canvas'a yazı da tıpkı kare gibi çizilir: önce kalemi ayarla (renk, hiza, yazı tipi), sonra yaz.

# --code--

```js
ctx.fillStyle = 'white'
ctx.textAlign = 'center'
ctx.font = 'bold 14px sans-serif'
;['D', 'F', 'J', 'K'].forEach((k, lane) => ctx.fillText(k, LEFT + lane * LANE_W + LANE_W / 2, HIT_Y + 40))
```

# --meaning--

- `textAlign = 'center'` centres the text on `x`; `font` picks bold 14-pixel letters.
- `forEach` runs once for each letter: `k` is the letter and `lane` its position.
- `fillText(text, x, y)` paints it in the middle of the lane, 40 pixels under the hit line.
- The line starts with `;` because it starts with `[`: without it JavaScript would glue it to the line above.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → yazı beyaz.
- `ctx.textAlign = 'center'` → yazıyı verdiğin `x`'e **ortalar**.
- `ctx.font = 'bold 14px sans-serif'` → kalın, 14 piksel boyunda, düz bir yazı tipi.
- `['D', 'F', 'J', 'K'].forEach((k, lane) => ...)` → dört harflik bir dizi; `forEach` her harf için bir kez çalışır:
  `k` harf, `lane` sırası (0...3).
- `ctx.fillText(k, LEFT + lane * LANE_W + LANE_W / 2, HIT_Y + 40)` → harfi, şeridin **ortasına**
  (`LANE_W / 2` = 35 piksel içeri), çizginin 40 piksel altına yazar.
- Baştaki `;` neden var? Satır `[` ile başlıyor. Üstteki satırın sonunda noktalı virgül olmadığı için JavaScript bu
  satırı öncekinin **devamı** sanardı (`...'bold 14px sans-serif'[...]`). Başa konan `;` "yeni bir cümle başlıyor"
  der.

# --task--

In `draw`, under the notes loop, leave an empty line and write the four lines (before the function's last `}`).

# --task-tr--

`draw` içinde, nota döngüsünün kapanan `}`'sinin altında bir boş satır bırak ve dört satırı yaz; fonksiyonun son
`}`'si altta kalsın. **Çalıştır**: her şeridin altında harfi görünmeli.

# --hint--

If you get an error on the `[` line, check the `;` at its start.

# --hint-tr--

`[` ile başlayan satırda hata alırsan, satırın başındaki `;`'e bak.

# --tests--

D, F, J and K should be written in the middle of each lane, 40 pixels under the hit line.
tr: D, F, J ve K her şeridin ortasına, vuruş çizgisinin 40 piksel altına yazılmalı.

```js
$.tick(1)
const labels = $.screen().filter((c) => c.op === 'fillText').map((c) => c.args)
assert.deepEqual(labels, [['D', 95, 520], ['F', 165, 520], ['J', 235, 520], ['K', 305, 520]])
assert.strictEqual($.ctx.textAlign, 'center')
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
const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }
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
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  lit = [0, 0, 0, 0]
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function press(lane) {
  lit[lane] = 8
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  frame += 1
}

document.addEventListener('keydown', (event) => {
  const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
  if (lane === undefined) return
  event.preventDefault()
  press(lane)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = lit[lane] > 0 ? '#334155' : '#1e293b'
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

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = 'bold 14px sans-serif'
  ;['D', 'F', 'J', 'K'].forEach((k, lane) => ctx.fillText(k, LEFT + lane * LANE_W + LANE_W / 2, HIT_Y + 40))
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
