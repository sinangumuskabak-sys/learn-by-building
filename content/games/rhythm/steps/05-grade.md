---
title: The grade
title_tr: Not
skills: [prog.functions, game.state]
---

# --explanation--

When the last note has gone by, the song is over and the player gets a **grade**.

The grade comes from **accuracy**: a perfect counts fully, a good half, a miss nothing, divided by the number of notes:

```js
Math.round((100 * (judged.perfect + judged.good * 0.5)) / total)
```

Then a chain of thresholds turns the percentage into a letter: 95 or more is S, 85 an A, 70 a B, 50 a C, and below that a D. Tuning
those numbers is game design: a computer player pressing within 5 frames of every note, a good human, earns an S; one wandering by
up to 10 frames gets a C.

Accuracy is different from score: a short perfect run and a long shaky one can end with the same points, but not the same grade.
The best score is saved, and Space plays again.

# --explanation-tr--

Son nota da geçip gittiğinde şarkı biter ve oyuncu bir **not** alır.

Not **doğruluktan** gelir: kusursuz tam, iyi yarım, ıska hiç sayılır ve nota sayısına bölünür:

```js
Math.round((100 * (judged.perfect + judged.good * 0.5)) / total)
```

Sonra bir eşikler zinciri yüzdeyi bir harfe çevirir: 95 ya da üstü S, 85 A, 70 B, 50 C ve altı D. O sayıları ayarlamak oyun
tasarımıdır: her notaya 5 kare içinde basan bir bilgisayar oyuncusu, yani iyi bir insan, S alır; 10 kareye kadar sapan biri C alır.

Doğruluk puandan farklıdır: kısa, kusursuz bir seri ile uzun, titrek bir seri aynı puanla bitebilir ama aynı notla bitmez. En iyi puan
kaydedilir ve Boşluk yeniden oynatır.

# --task--

1. Add `state` (`'playing'` in `reset()`) and `best` in `localStorage` under `'rhythm-best'`. `press` and the clock only work while
   playing.
2. When `frame` passes `LEAD + CHART.length * STEP + 60`, set `'done'` and save a better score.
3. Write `accuracy()` (100 when nothing was judged yet) and `grade()` with the thresholds above.
4. Space or Enter after the song calls `reset()`. At the end, draw a `'rgba(15, 23, 42, 0.9)'` panel at `(40, 170)`,
   `canvas.width - 80` by 170, with the grade (`'bold 48px sans-serif'`, `y = 228`), `96% accurate, best 40300`,
   `45 perfect, 4 good, 0 missed` and `Space to play again` (`'16px sans-serif'`, at `y = 262`, `288` and `318`), centered.

# --task-tr--

1. `state` (`reset()`'te `'playing'`) ve `localStorage`'da `'rhythm-best'` adıyla `best` ekle. `press` ve saat yalnızca oynarken çalışır.
2. `frame`, `LEAD + CHART.length * STEP + 60`'ı geçince `'done'` yap ve daha iyi bir puanı kaydet.
3. `accuracy()` (henüz hiçbir şey değerlendirilmediyse 100) ve yukarıdaki eşiklerle `grade()` yaz.
4. Şarkıdan sonra Boşluk ya da Enter `reset()`'i çağırır. Sonda `(40, 170)`'te `canvas.width - 80`'e 170 `'rgba(15, 23, 42, 0.9)'` bir panel
   ile notu (`'bold 48px sans-serif'`, `y = 228`), `96% accurate, best 40300`, `45 perfect, 4 good, 0 missed` ve `Space to play again`
   (`'16px sans-serif'`, `y = 262`, `288` ve `318`'de) yazılarını ortalı çiz.

# --tests--

The song should end after the last note, and nothing can be hit after that.
tr: Şarkı son notadan sonra bitmeli ve ondan sonra hiçbir şey vurulamamalı.

```js
const end = LEAD + CHART.length * STEP + 60
$.tick(end)
assert.strictEqual(state, 'playing')
$.tick(1)
assert.strictEqual(state, 'done', 'the song is over')
$.press('d')
assert.strictEqual(judged.perfect, 0, 'no more notes to hit')
$.tick(1)
assert.include($.texts(), 'D')
assert.include($.texts(), '0% accurate, best 0')
```

The grade should follow the accuracy.
tr: Not doğruluğu izlemeli.

```js
judged = { perfect: 10, good: 0, miss: 0 }
assert.strictEqual(accuracy(), 100)
assert.strictEqual(grade(), 'S')
judged = { perfect: 6, good: 4, miss: 0 }
assert.strictEqual(accuracy(), 80)
assert.strictEqual(grade(), 'B')
judged = { perfect: 9, good: 0, miss: 1 }
assert.strictEqual(grade(), 'A')
judged = { perfect: 2, good: 2, miss: 6 }
assert.strictEqual(grade(), 'D')
```

Hitting every note on time should earn an S and save the best score, and Space should play again.
tr: Her notaya zamanında vurmak S kazandırmalı ve en iyi puanı kaydetmeli; Boşluk yeniden oynatmalı.

```js
for (const n of notes) {
  $.tick(n.time - frame)
  press(n.lane)
}
while (state === 'playing') $.tick(1)
assert.strictEqual(grade(), 'S')
assert.strictEqual(best, score)
assert.strictEqual(localStorage.getItem('rhythm-best'), String(score))
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(score, 0)
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
const PERFECT = 4 // frames either side of the exact moment
const GOOD = 9
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
let score
let combo
let judged // counts: { perfect, good, miss }
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press
let state // 'playing' or 'done'
let best = Number(localStorage.getItem('rhythm-best')) || 0

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  score = 0
  combo = 0
  judged = { perfect: 0, good: 0, miss: 0 }
  feedback = null
  lit = [0, 0, 0, 0]
  state = 'playing'
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))

function judge(text, color) {
  feedback = { text, color, time: 30 }
}

// A key press hits the closest note in its lane, if it is close enough in time.
function press(lane) {
  if (state !== 'playing') return
  lit[lane] = 8
  let closest = null
  for (const n of notes) {
    if (n.hit || n.lane !== lane) continue
    if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
  }
  if (!closest) return
  const off = Math.abs(closest.time - frame)
  if (off > GOOD) return // too early: nothing happens, and the note is still there
  closest.hit = true
  combo += 1
  if (off <= PERFECT) {
    judged.perfect += 1
    score += 300 * multiplier()
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
    score += 100 * multiplier()
    judge('Good', '#86efac')
  }
}

const accuracy = () => {
  const total = judged.perfect + judged.good + judged.miss
  return total === 0 ? 100 : Math.round((100 * (judged.perfect + judged.good * 0.5)) / total)
}

function grade() {
  const a = accuracy()
  return a >= 95 ? 'S' : a >= 85 ? 'A' : a >= 70 ? 'B' : a >= 50 ? 'C' : 'D'
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
  if (state !== 'playing') return
  frame += 1
  // A note that has gone past the window without being hit is a miss.
  for (const n of notes) {
    if (!n.hit && frame - n.time > GOOD) {
      n.hit = true
      judged.miss += 1
      combo = 0
      judge('Miss', '#f87171')
    }
  }
  if (frame > LEAD + CHART.length * STEP + 60) {
    state = 'done'
    if (score > best) {
      best = score
      localStorage.setItem('rhythm-best', best)
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
  if (state === 'done' && (event.key === ' ' || event.key === 'Enter')) return reset()
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
  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 12, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Combo ' + combo + '  x' + multiplier(), canvas.width - 12, 24)
  if (state === 'done') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.fillRect(40, 170, canvas.width - 80, 170)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText(grade(), canvas.width / 2, 228)
    ctx.font = '16px sans-serif'
    ctx.fillText(accuracy() + '% accurate, best ' + best, canvas.width / 2, 262)
    ctx.fillText(judged.perfect + ' perfect, ' + judged.good + ' good, ' + judged.miss + ' missed', canvas.width / 2, 288)
    ctx.fillText('Space to play again', canvas.width / 2, 318)
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
