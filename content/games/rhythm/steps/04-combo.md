---
title: Combo and multiplier
title_tr: Kombo ve çarpan
skills: [game.state]
---

# --explanation--

Rhythm games reward **streaks**. The combo counts hits in a row and goes back to zero on a miss. Every ten in a row raise the score
**multiplier** by one, up to four:

```js
const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))
```

`Math.floor(combo / 10)` is how many full tens the combo has; `Math.min` caps it. A perfect is worth 300 and a good 100, both times
the multiplier at that moment.

That changes how the game feels: late in a long streak every note matters four times as much, and a single miss costs the
multiplier as well as the note. Tension comes from one small formula.

# --explanation-tr--

**Bu adımda:** puan ve **kombo** ekleyeceğiz. Sol üstte `Score 1200` gibi bir puan, sağ üstte `Combo 4  x1` gibi art
arda vuruş sayısı ve puan çarpanı göreceksin. Iskalayınca kombo sıfırlanacak.

**Seri ödülü.** Ritim oyunları art arda başarıyı ödüllendirir. **Kombo** (`combo`), hiç ıskalamadan üst üste kaç vuruş
yaptığını sayar; bir ıskada sıfıra döner. Kombodaki her on vuruş puan **çarpanını** bir artırır, en fazla dörde kadar:

```js
const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))
```

Parça parça:

- `() => ...` → parametresi olmayan tek satırlık bir fonksiyon (ok fonksiyonu); `=>`'dan sonraki değeri geri verir.
  `multiplier()` diye çağrılır.
- `combo / 10` → komboyu 10'a böl: 27 → 2.7.
- `Math.floor(...)` → küsuratı at: 2.7 → 2. Yani komboda kaç tam onluk var.
- `1 + ...` → çarpan 1'den başlar: 0–9 kombo ×1, 10–19 ×2, 20–29 ×3...
- `Math.min(4, ...)` → iki sayıdan küçüğü: çarpan asla 4'ü geçmez.

**Puan.** Perfect 300, Good 100 değerindedir; ikisi de o anki çarpanla çarpılır. Önce kombo artar, sonra puan
hesaplanır; yani onuncu vuruş zaten ×2 sayılır.

Bu küçük formül oyunun hissini değiştirir: uzun bir serinin sonunda her nota dört kat önemlidir ve tek bir ıska hem
notayı hem çarpanı kaybettirir. Heyecan bir satırdan doğar.

**Sağa yaslı yazı.** `ctx.textAlign = 'right'` verilen `x`'in yazının **sağ ucu** olmasını sağlar; böylece kombo yazısı
ne kadar uzarsa uzasın sağ kenardan 12 piksel içeride biter.

# --task--

1. Add `score` and `combo` (`0` in `reset()`) and `multiplier()`.
2. A hit adds 1 to `combo` and scores 300 (perfect) or 100 (good) times `multiplier()`, worked out after the combo grows. A miss
   sets `combo = 0`.
3. Draw `Score 1200` at `(12, 24)` and `Combo 4  x1` right-aligned at `(canvas.width - 12, 24)`.

# --task-tr--

1. `let frame` satırının altına iki değişken ekle:

   ```js
   let score
   let combo
   ```

2. `reset()` içinde, `frame = 0` satırının altına ikisini sıfırla:

   ```js
     frame = 0
     score = 0                 // ← yeni
     combo = 0                 // ← yeni
   ```

3. `const noteY = ...` satırından sonra bir boş satır bırak ve (`function judge`'ın **üstüne**) çarpanı yaz:

   ```js
   const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))
   ```

4. `press()`'in sonunda komboyu artır ve puanı ekle:

   ```js
     closest.hit = true
     combo += 1                                   // ← yeni
     if (off <= PERFECT) {
       judged.perfect += 1
       score += 300 * multiplier()                // ← yeni
       judge('Perfect', '#fde047')
     } else {
       judged.good += 1
       score += 100 * multiplier()                // ← yeni
       judge('Good', '#86efac')
     }
   }
   ```

5. `update()` içinde ıskayı sayan bloğa komboyu sıfırlayan satırı ekle:

   ```js
       if (!n.hit && frame - n.time > GOOD) {
         n.hit = true
         judged.miss += 1
         combo = 0                                // ← yeni
         judge('Miss', '#f87171')
       }
   ```

6. `draw()`'un son satırını (`ctx.fillText(judged.perfect + ' perfect  ' ...)`) sil ve yerine üç satır yaz:

   ```js
     ctx.fillText('Score ' + score, 12, 24)                                          // ← değişti
     ctx.textAlign = 'right'                                                         // ← yeni
     ctx.fillText('Combo ' + combo + '  x' + multiplier(), canvas.width - 12, 24)    // ← yeni
   }
   ```

   `'  x'`'in başında **iki** boşluk var: `Combo 4  x1`.

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Vurdukça puan ve kombo artmalı; bir notayı kaçırınca kombo 0'a
   inmeli. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Perfect and good should score 300 and 100, growing the combo.
tr: Kusursuz ve iyi, komboyu büyüterek 300 ve 100 puan getirmeli.

```js
$.tick(LEAD)
$.press('d')
assert.strictEqual(score, 300)
assert.strictEqual(combo, 1)
const second = notes.find((n) => n.lane === 1)
$.tick(second.time - frame + 6)
$.press('f')
assert.strictEqual(score, 400)
assert.strictEqual(combo, 2)
```

Every ten in a row should raise the multiplier, up to four.
tr: Art arda her on, çarpanı dörde kadar yükseltmeli.

```js
combo = 9
assert.strictEqual(multiplier(), 1)
combo = 10
assert.strictEqual(multiplier(), 2, 'every ten in a row raises it')
combo = 25
assert.strictEqual(multiplier(), 3)
combo = 99
assert.strictEqual(multiplier(), 4, 'up to four')
combo = 10
$.tick(LEAD)
$.press('d')
assert.strictEqual(score, 600, 'perfect at x2')
```

A miss should break the combo.
tr: Bir ıska komboyu bozmalı.

```js
combo = 5
$.tick(LEAD + GOOD + 1)
assert.strictEqual(combo, 0, 'a miss breaks the combo')
$.tick(1)
assert.include($.texts(), 'Combo 0  x1')
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
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))

function judge(text, color) {
  feedback = { text, color, time: 30 }
}

// A key press hits the closest note in its lane, if it is close enough in time.
function press(lane) {
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

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
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
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
