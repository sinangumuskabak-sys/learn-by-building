---
title: From text to notes
title_tr: Yazıdan notalara
skills: [prog.arrays, prog.loops]
---

# --goal--

The game needs notes, not text. Every `1` in the chart becomes a note object `{ lane, time, hit }`, where `time` is
the frame at which it must be hit.

# --goal-tr--

Oyunun işine yarayan yazı değil, **notalar**. Çizelgedeki her `1`'i bir notaya çevireceğiz. Her nota üç bilgi taşır:

- hangi **şeritte** (`lane`),
- **ne zaman** vurulmalı (`time`),
- **vuruldu mu** (`hit`).

Zamanı "kare" (frame) olarak sayacağız. Ekran saniyede 60 kez yenilenir; her yenilenme bir **kare**. Satırlar 15
karede bir gelir (saniyenin dörtte biri: dakikada 120 vuruşluk bir şarkıda sekizlik nota). İlk notadan önce oyuncuya
2 saniye (120 kare) hazırlanma payı veririz.

# --code--

```js
const STEP = 15 // frames between rows of the chart (an eighth note at 120 beats a minute)
const LEAD = 120 // frames before the first row reaches the line

let notes // { lane, time, hit }

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
}

reset()
draw()
```

# --meaning--

- `CHART.forEach((row, i) => ...)` runs once for each row: `row` is its text, `i` its number.
- The `for` loop looks at the row's four characters; each `'1'` pushes a note onto `notes`.
- A note of row `i` must be hit at frame `LEAD + i * STEP`. `{ lane, ... }` is short for `{ lane: lane, ... }`.
- `reset()` builds the notes once, before the first `draw()`.

# --meaning-tr--

- `const STEP = 15` → iki satır arası 15 kare. `const LEAD = 120` → ilk notadan önce 120 kare (2 saniye) bekleme.
- `let notes` → notaların listesi. `let`, değeri sonradan verilebilen bir ad açar; içini `reset` dolduracak.
- `function reset() {` → oyunu baştan kuran fonksiyon.
- `notes = []` → boş bir liste.
- `CHART.forEach((row, i) => { ... })` → `forEach`, listenin **her elemanı için** içini çalıştırır. `row` o satırın
  yazısı (`'1001'`), `i` sıra numarası (0, 1, 2...). `(row, i) => { }` adı olmayan kısa bir fonksiyondur.
- `for (let lane = 0; lane < LANES; lane++)` → satırın dört harfine sırayla bakar.
- `if (row[lane] === '1')` → o harf `'1'` ise. `===` "tam olarak eşit mi?" diye sorar.
- `notes.push({ ... })` → listenin **sonuna** yeni bir nota ekler. Süslü parantez bir **nesne** (object): birbirine
  ait bilgiler `ad: değer` çiftleriyle tek pakette. `lane` tek başına, `lane: lane`'in kısaltması.
- `time: LEAD + i * STEP` → 0. satır 120. karede, 1. satır 135. karede, 2. satır 150. karede...
- `hit: false` → henüz vurulmadı. `false` "hayır", `true` "evet" demek.
- En altta `reset()` → çizmeden önce notaları hazırla.

# --task--

1. Under `HIT_Y`, write `STEP` and `LEAD`.
2. Under `CHART`, after an empty line, write `let notes` and `reset`.
3. At the bottom, write `reset()` above `draw()`.

# --task-tr--

1. `const HIT_Y = ...` satırının altına `STEP` ve `LEAD` satırlarını yaz.
2. `CHART` listesinin kapanan `]` satırının altında bir boş satır bırak; `let notes` satırını, bir boş satır daha ve
   `reset` fonksiyonunu yaz.
3. En alttaki `draw()` satırının **üstüne** `reset()` yaz.
4. **Çalıştır**: ekran değişmez, ama notalar artık hafızada hazır.

# --predict--

How many notes does row `'1001'` make?
- [ ] One
- [x] Two, at the same time
  Two `1`s: lane 0 and lane 3 get a note with the same `time`: a chord.
- [ ] Four

# --predict-tr--

`'1001'` satırı kaç nota yapar?
- [ ] Bir
- [x] İki, aynı anda
  İki tane `1` var: 0. ve 3. şerit aynı `time` ile birer nota alır. Buna akor denir.
- [ ] Dört

# --hint--

The long line is one `if` with the `push` after it. Count the brackets: `notes.push({ ... })` closes with `})`.

# --hint-tr--

Uzun satır, arkasında `push` olan tek bir `if`. Parantezleri say: `notes.push({ ... })` en sonda `})` ile kapanır.

# --tests--

Every 1 in the chart should become a note at its row's time, chords included.
tr: Çizelgedeki her 1, akorlar dahil, satırının zamanında bir nota olmalı.

```js
assert.lengthOf(notes, 49, 'one note for every 1 in the chart')
assert.deepEqual(notes[0], { lane: 0, time: 120, hit: false }, 'the first row')
assert.deepInclude(notes, { lane: 1, time: 150, hit: false }, 'row 2 has a note in lane 1')
assert.deepInclude(notes, { lane: 3, time: LEAD + 12 * STEP, hit: false }, 'row 12 has a note in lane 3')
assert.deepInclude(notes, { lane: 0, time: LEAD + 12 * STEP, hit: false }, 'and one in lane 0 at the same time')
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

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
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
}

reset()
draw()
```
