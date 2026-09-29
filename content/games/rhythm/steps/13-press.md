---
title: Keys for the lanes
title_tr: Şeritlere tuşlar
skills: [game.input]
---

# --goal--

The keys D, F, J and K (where your fingers rest) or the four arrows press the lanes. A table turns a key into a lane,
and `press(lane)` lights that lane up.

# --goal-tr--

Şimdi oyuncu işin içine giriyor. Dört şerit için dört tuş: **D, F, J, K** (klavyede parmaklarının zaten durduğu
yer) ya da dört **ok tuşu**. Bir tuşa basınca o şerit yanacak.

Hangi tuşun hangi şeride gittiğini küçük bir **tablo** tutacak; bir sözlük gibi: tuşu ararsın, karşısında şerit
numarası yazar. İşi yapan ise tek bir fonksiyon olacak: `press(lane)`, "şu şeride basıldı".

# --code--

```js
const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }

function press(lane) {
  lit[lane] = 8
}

document.addEventListener('keydown', (event) => {
  const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
  if (lane === undefined) return
  event.preventDefault()
  press(lane)
})
```

# --meaning--

- `KEYS` is an object used as a table: `KEYS['j']` is 2. A key that is not in it gives `undefined`.
- `press(lane)` sets that lane's countdown to 8 frames.
- `addEventListener('keydown', ...)` runs the arrow function each time a key goes down; `event.key` is its name.
- `a ?? b` uses `b` when `a` is missing: the key as it is, or else in lower case (so a capital D works too).
- `preventDefault()` stops the arrow keys from scrolling the page.

# --meaning-tr--

- `const KEYS = { d: 0, f: 1, ... }` → bir **nesne** (object): `anahtar: değer` çiftlerinden oluşan küçük bir
  sözlük. `KEYS['j']` → 2, `KEYS['ArrowUp']` → 2. Tabloda olmayan bir tuş sorulursa sonuç `undefined`
  ("tanımsız", yani **yok**) olur.
- `function press(lane) {` → `lane` **parametre**: çağırırken verdiğin şerit numarası. `press(1)` dersen içeride
  `lane` 1 olur.
- `lit[lane] = 8` → o şeridin geri sayımını 8 yap: şerit 8 kare yanar.
- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** içini çalıştır".
  Buna **olay dinlemek** denir: kapı zili gibi, çalınca ne yapılacağını önceden söylersin. `event` basılan tuşun
  bilgilerini taşır; `event.key` tuşun adı (`'d'`, `'ArrowUp'`).
- `KEYS[event.key] ?? KEYS[event.key.toLowerCase()]` → `a ?? b`: "`a` yoksa `b`'yi kullan". Önce tuşun kendisine
  bakarız; Caps Lock açıkken `'D'` gelir ve tabloda yoktur, o zaman `.toLowerCase()` ile küçük harfe çevirip yeniden
  ararız.
- `if (lane === undefined) return` → bu tuş bizi ilgilendirmiyorsa **burada dur**. `return` fonksiyondan hemen çıkar.
- `event.preventDefault()` → tarayıcının o tuşla kendi yaptığı işi engeller: ok tuşları sayfayı kaydırmasın.
- `press(lane)` → kararı `press` verir.

# --task--

1. Under `LEAD` write `KEYS`.
2. Above `function update() {` write `press`, with an empty line after it.
3. Above `function draw() {` write the `keydown` listener, with an empty line after it.

# --task-tr--

1. `const LEAD = ...` satırının altına `KEYS` satırını yaz.
2. `function update() {` satırının **üstüne** `press` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `function draw() {` satırının **üstüne** (yani `update`'in altına) `keydown` dinleyicisini yaz; altında bir boş
   satır kalsın.
4. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin) ve D, F, J, K'ye bas: şeritler bir an parlamalı.

# --hint--

Key names are case-sensitive: `ArrowUp` with a capital `A` and `U`, and `'keydown'` all lowercase.

# --hint-tr--

Tuş adlarında büyük/küçük harf önemli: `ArrowUp` büyük `A` ve büyük `U` ile; `'keydown'` tamamen küçük harf.

# --tests--

D, F, J and K should light up lanes 0 to 3.
tr: D, F, J ve K 0'dan 3'e kadar şeritleri yakmalı.

```js
$.press('f')
assert.deepEqual(lit, [0, 8, 0, 0])
$.tick(1)
assert.deepEqual($.rects('#334155').map((r) => r.x), [LEFT + 70 + 2])
$.press('d')
$.press('j')
$.press('k')
assert.deepEqual(lit, [8, 7, 8, 8])
```

The arrow keys and capital letters should work too, and other keys should do nothing.
tr: Ok tuşları ve büyük harfler de çalışmalı; başka tuşlar hiçbir şey yapmamalı.

```js
$.press('ArrowUp')
assert.strictEqual(lit[2], 8)
$.press('K')
assert.strictEqual(lit[3], 8)
$.press('a')
$.press(' ')
assert.deepEqual(lit, [0, 0, 8, 8])
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
