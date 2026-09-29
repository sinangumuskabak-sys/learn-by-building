---
title: Hit the closest note
title_tr: En yakın notaya vur
skills: [prog.loops]
---

# --goal--

Which note does a press hit? The closest one in that lane that is not hit yet. We search the list and keep the best
candidate so far in `closest`.

# --goal-tr--

Bir tuşa basınca **hangi notaya** vurulur? O şeritteki, henüz vurulmamış, zamanı **şimdiye en yakın** notaya.

Bunu bulmak için listeyi baştan sona gezeceğiz ve "şimdiye kadarki en yakın" notayı bir değişkende tutacağız. Bir
sınıftaki en uzun öğrenciyi bulmak gibi: herkese tek tek bakarsın, daha uzununu görünce aklındakini değiştirirsin.

# --code--

```js
function press(lane) {
  lit[lane] = 8
  let closest = null
  for (const n of notes) {
    if (n.hit || n.lane !== lane) continue
    if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
  }
  if (!closest) return
  closest.hit = true
}
```

# --meaning--

- `closest` starts as `null`, "nothing yet".
- Notes already hit or in another lane are skipped (`!==` means "not equal").
- `Math.abs` drops the sign: how far a note's time is from now, early or late.
- A note becomes the new candidate if there is none yet, or if it is closer than the current one.
- If a lane has no notes left, `return`; otherwise the closest note is hit.

# --meaning-tr--

- `let closest = null` → aday. `null` "**henüz hiçbir şey**" demek.
- `for (const n of notes)` → her notaya sırayla bak.
- `if (n.hit || n.lane !== lane) continue` → vurulmuşsa **ya da** (`||`) başka şeritteyse (`!==` "eşit **değil**")
  atla.
- `Math.abs(n.time - frame)` → `Math.abs` sayının işaretini atar: `Math.abs(-3)` → 3. Notanın zamanı şimdiden kaç
  kare uzakta; erken ya da geç fark etmez.
- `if (!closest || ... < ...) closest = n` → `!` "**değil**": "henüz aday yoksa **ya da** bu nota adaydan daha
  yakınsa, yeni aday bu".
- `if (!closest) return` → o şeritte vurulacak nota kalmadıysa dur.
- `closest.hit = true` → en yakın notayı "vuruldu" diye işaretle. `draw` vurulmuş notaları çizmediği için ekrandan
  kaybolur.

# --task--

In `press`, under `lit[lane] = 8`, write the new lines.

# --task-tr--

`press` içinde `lit[lane] = 8` satırının altına yeni satırları yaz; fonksiyonun son `}`'si altta kalsın.
**Çalıştır**, oyuna tıkla ve notalar gelirken D, F, J, K'ye bas.

# --predict--

Press D at the very start, while the first note is still far away. What happens?
- [x] The note disappears anyway
  There is no rule about time yet: any press hits the closest note, however far. We fix that next.
- [ ] Nothing, it is too early
- [ ] All red notes disappear

# --predict-tr--

Oyunun en başında, ilk nota daha çok uzaktayken D'ye bas. Ne olur?
- [x] Nota yine de kaybolur
  Henüz zamanla ilgili bir kural yok: her basış, ne kadar uzakta olursa olsun en yakın notaya vurur. Bunu bir
  sonraki adımda düzelteceğiz.
- [ ] Hiçbir şey, çok erken
- [ ] Bütün kırmızı notalar kaybolur

# --tests--

A press should hit the closest note in its lane.
tr: Bir basış, kendi şeridindeki en yakın notaya vurmalı.

```js
$.tick(LEAD)
$.press('d')
assert.isTrue(notes[0].hit, 'the first note, right on time')
const lane2 = notes.find((n) => n.lane === 2)
$.tick(lane2.time - frame)
$.press('j')
assert.isTrue(lane2.hit)
assert.strictEqual(notes.filter((n) => n.hit).length, 2, 'only one note per press')
```

A hit note should not be hit again: the next press takes the next note.
tr: Vurulmuş nota bir daha vurulmamalı: sonraki basış sıradaki notayı almalı.

```js
$.tick(LEAD)
$.press('d')
$.press('d')
const lane0 = notes.filter((n) => n.lane === 0)
assert.isTrue(lane0[0].hit)
assert.isTrue(lane0[1].hit)
assert.isFalse(lane0[2].hit)
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
  let closest = null
  for (const n of notes) {
    if (n.hit || n.lane !== lane) continue
    if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
  }
  if (!closest) return
  closest.hit = true
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
