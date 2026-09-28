---
title: Perfect, good and miss
title_tr: Kusursuz, iyi ve ıska
skills: [game.state]
---

# --explanation--

"Hit" is not enough: players want to know **how well** they hit. So the window is split in two:

- within `PERFECT = 4` frames (about a fifteenth of a second): **Perfect**;
- within `GOOD = 9` frames: **Good**.

And a note that slips past without being hit is a **Miss**. Each frame, any note more than `GOOD` frames in the past that has not
been hit is marked as missed. Note the comparison: at exactly `GOOD` frames late it could still be hit, so it is only a miss one
frame after that.

The three counts, `judged.perfect`, `judged.good` and `judged.miss`, are the whole story of a performance; the score, the combo and
the final grade in the next steps are all worked out from them and the timing.

# --explanation-tr--

**Bu adımda:** vuruşları puanlayacağız. Tam zamanında basarsan sarı "Perfect", biraz kaçırırsan yeşil "Good" çıkacak;
hiç basmadığın ve geçip giden notalar için kırmızı "Miss" yazacak. Sol üstteki sayaç `2 perfect  1 good  0 missed`
gibi üçünü birden gösterecek.

**"Vurdun" yetmez.** Oyuncu **ne kadar iyi** vurduğunu bilmek ister. Bu yüzden 2. adımdaki tek pencereyi ikiye
böleriz:

- `PERFECT = 4` kare içinde (saniyenin yaklaşık on beşte biri): **Perfect** (kusursuz);
- `GOOD = 9` kare içinde: **Good** (iyi).

`WINDOW` artık gerekmez; onun yerini `GOOD` alır. `<=` "küçük veya eşit" demektir:

```js
if (off <= PERFECT) {
  // kusursuz say
} else {
  // iyi say
}
```

`if (...) { ... } else { ... }` → koşul doğruysa ilk blok, değilse `else` ("yoksa") bloğu çalışır. Buraya ancak
`off > GOOD` olmadığı için geldik, yani `else` 5 ile 9 kare arasını kapsar.

**Üç sayaç tek nesnede.** `hits` yerine üç sayıyı bir **nesnede** tutarız:
`judged = { perfect: 0, good: 0, miss: 0 }`. İçlerinden biri `judged.good += 1` ile artırılır. Bu üç sayı bir
performansın bütün hikâyesidir; sonraki adımlardaki kombo ve not bunlardan hesaplanacak.

**Iska (Miss).** Vurulmadan geçip giden nota bir ıskadır. Her karede `update()` bütün notalara bakar: vurulmamış
(`!n.hit`, `!` "değil") **ve** (`&&`) zamanı `GOOD` kareden fazla geçmişse ıska sayılır. `frame - n.time` notanın kaç
kare geç kaldığıdır. Dikkat: tam `GOOD` kare geçteyken hâlâ vurulabilir (`>` "büyüktür", eşit değil), o yüzden ıska
bundan bir kare sonra olur. Iskalanan notayı `hit = true` yaparız ki bir daha sayılmasın ve çizilmesin.

**Yazıyı parçalardan kurmak.** `judged.perfect + ' perfect  ' + ...` sayılarla yazıları `+` ile uç uca ekler. Kelimeler
arasında **iki** boşluk var: `'2 perfect  1 good  0 missed'`.

# --task--

1. Replace `WINDOW` with `PERFECT = 4` and `GOOD = 9`, and `hits` with `judged = { perfect: 0, good: 0, miss: 0 }`.
2. In `press`, a note within `PERFECT` counts as perfect (`judge('Perfect', '#fde047')`), within `GOOD` as good
   (`judge('Good', '#86efac')`); beyond `GOOD` nothing happens.
3. In `update()`, mark every note not hit and more than `GOOD` frames late as hit, count a miss, and `judge('Miss', '#f87171')`.
4. Draw `2 perfect  1 good  0 missed` at `(12, 24)`.

# --task-tr--

1. `const WINDOW = 9 ...` satırını sil ve yerine iki sabit yaz:

   ```js
   const PERFECT = 4 // frames either side of the exact moment
   const GOOD = 9
   ```

2. `let hits` satırını değiştir:

   ```js
   let judged // counts: { perfect, good, miss }          // ← değişti
   ```

3. `reset()` içindeki `hits = 0` satırını değiştir:

   ```js
     judged = { perfect: 0, good: 0, miss: 0 }            // ← değişti
   ```

4. `press()` fonksiyonunun sonunu değiştir. `if (off > WINDOW)` satırındaki `WINDOW`'u `GOOD` yap; `hits += 1` ve
   `judge('Hit', ...)` satırlarını sil, yerlerine `if`/`else` yaz. Fonksiyonun sonu şöyle olmalı:

   ```js
     const off = Math.abs(closest.time - frame)
     if (off > GOOD) return // too early: nothing happens, and the note is still there   // ← değişti
     closest.hit = true
     if (off <= PERFECT) {                                 // ← yeni
       judged.perfect += 1                                 // ← yeni
       judge('Perfect', '#fde047')                         // ← yeni
     } else {                                              // ← yeni
       judged.good += 1                                    // ← yeni
       judge('Good', '#86efac')                            // ← yeni
     }                                                     // ← yeni
   }
   ```

5. `update()` içinde, `frame += 1` satırının altına ıskaları bulan kodu ekle:

   ```js
   function update() {
     lit = lit.map((n) => Math.max(0, n - 1))
     if (feedback && --feedback.time === 0) feedback = null
     frame += 1
     // A note that has gone past the window without being hit is a miss.
     for (const n of notes) {                              // ← yeni
       if (!n.hit && frame - n.time > GOOD) {              // ← yeni
         n.hit = true                                      // ← yeni
         judged.miss += 1                                  // ← yeni
         judge('Miss', '#f87171')                          // ← yeni
       }                                                   // ← yeni
     }                                                     // ← yeni
   }
   ```

6. `draw()`'un son satırındaki `ctx.fillText('Hits ' + hits, 12, 24)` satırını değiştir:

   ```js
     ctx.fillText(judged.perfect + ' perfect  ' + judged.good + ' good  ' + judged.miss + ' missed', 12, 24)   // ← değişti
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Tam zamanında basınca "Perfect", biraz geç basınca "Good",
   hiç basmayınca "Miss" görmelisin; sol üstteki sayılar artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa kodda `hits` ya da `WINDOW` kalıp kalmadığına bak.

# --tests--

On time should be perfect, six frames late only good.
tr: Zamanında kusursuz, altı kare geç yalnızca iyi olmalı.

```js
$.tick(LEAD)
$.press('d')
assert.strictEqual(judged.perfect, 1)
const second = notes.find((n) => n.lane === 1)
$.tick(second.time - frame + 6)
$.press('f')
assert.strictEqual(judged.good, 1, 'six frames late is only good')
$.tick(1)
assert.include($.texts(), 'Good')
```

Just outside the perfect window should be good, and notes that go by should be missed.
tr: Kusursuz pencerenin hemen dışı iyi olmalı ve geçip giden notalar ıskalanmalı.

```js
$.tick(LEAD + PERFECT + 1)
$.press('d')
assert.strictEqual(judged.good, 1, 'just outside perfect')
$.tick(40)
assert.isAbove(judged.miss, 0, 'notes that go by are missed')
$.tick(1)
assert.include($.texts(), 'Miss')
```

A note should only be missed once it is past the good window.
tr: Bir nota ancak iyi penceresini geçtiğinde ıskalanmalı.

```js
$.tick(LEAD + GOOD)
assert.strictEqual(judged.miss, 0, 'still inside the window')
$.tick(1)
assert.strictEqual(judged.miss, 1)
$.tick(1)
assert.include($.texts(), '0 perfect  0 good  1 missed')
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
let judged // counts: { perfect, good, miss }
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  judged = { perfect: 0, good: 0, miss: 0 }
  feedback = null
  lit = [0, 0, 0, 0]
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

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
  if (off <= PERFECT) {
    judged.perfect += 1
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
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
  ctx.fillText(judged.perfect + ' perfect  ' + judged.good + ' good  ' + judged.miss + ' missed', 12, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
