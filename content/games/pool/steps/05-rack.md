---
title: The rack
title_tr: Üçgen
skills: [prog.loops, prog.arrays]
---

# --goal--

Ten numbered balls packed in a triangle, the **rack**: row 0 has 1 ball, row 1 has 2, up to 4 in the back row. Two loops
place them, each with its own color and number.

# --goal-tr--

Şimdi numaralı toplar: on top, sıkıca bir **üçgene** dizilmiş. Ön sırada 1 top, sonra 2, 3 ve arkada 4. Yani `row`.
sırada `row + 1` top var. Her topun kendi rengi ve numarası olacak.

Konumları iki döngüyle hesaplayacağız. Biraz geometri var ama korkma; aşağıda satır satır açıklıyoruz.

# --code--

```js
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}
```

# --meaning--

- `row` goes 0 to 3; in each row `i` goes 0 to `row`: 1 + 2 + 3 + 4 = 10 balls. `n` counts them for color and number.
- Inside a row balls are one diameter apart (`2R`), centered on the middle line with `i - row / 2`.
- Rows are a little **less** than a diameter apart: in a packed triangle the centres form equilateral triangles, whose height
  is `2R × 0.87` (`√3 / 2`). The extra `0.5` keeps the balls from exactly touching.

# --meaning-tr--

- `COLORS` → on topun renkleri, sırayla.
- `let n = 0` → kaçıncı topu dizdiğimizi sayar: rengi `COLORS[n]`, numarası `n + 1`.
- `for (let row = 0; row < 4; row++)` → dört sıra. İçteki `for (let i = 0; i <= row; i++)` → o sırada `row + 1` top.
  Toplam 1 + 2 + 3 + 4 = 10.
- `const y = 160 + (i - row / 2) * (R * 2 + 0.5)` → sıradaki toplar birer **çap** (`2R` = 18) arayla dizilir.
  `i - row / 2` onları masanın orta çizgisine (y = 160) **ortalar**: 2 toplu sırada −0.5 ve 0.5, 3 toplu sırada −1, 0, 1.
- `const x = 330 + row * (R * 2 * 0.87 + 0.5)` → sıralar arası bir çaptan biraz **az**: sıkı dizilmiş üçgende üç topun
  merkezi eşkenar üçgen yapar; onun yüksekliği `2R × 0.87` (yani `2R × √3 / 2`). Toplar iç içe geçer gibi yerleşir.
- `+ 0.5` → minik bir boşluk: toplar tam değmesin ki ilk vuruştan önce hiçbir şey çarpışmasın.
- `balls.push(ball(x, y, COLORS[n], n + 1))` → topu kur ve diziye ekle; `n += 1` → sıradaki top.

# --task--

1. Under the `R` line write `COLORS`.
2. Put the comment above `function rack() {`.
3. In `rack`, under `balls = [cue]`, write the counter and the two loops. Press **Run**.

# --task-tr--

1. `const R = 9 ...` satırının altına `COLORS` satırını yaz (kopyalayabilirsin).
2. `function rack() {` satırının üstüne yorum satırını ekle.
3. `rack` içinde `balls = [cue]` satırının altına sayacı ve iki döngüyü yaz.
4. **Çalıştır**: sağda renkli toplardan bir üçgen görmelisin.

# --try--

Remove the `* 0.87` and run: the rows spread out and gaps appear. Put it back.

# --try-tr--

`* 0.87`'yi sil ve çalıştır: sıralar açılır, aralarında boşluk kalır. Sonra geri koy.

# --tests--

There should be the cue ball and ten numbered balls, with ball 1 at the front of the triangle.
tr: İsteka topu ve on numaralı top olmalı; 1 numara üçgenin önünde.

```js
assert.lengthOf(balls, 11)
assert.strictEqual(balls[0], cue)
assert.deepEqual(balls.slice(1).map((b) => b.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
assert.deepEqual([balls[1].x, balls[1].y, balls[1].color], [330, 160, '#facc15'], 'ball 1 is at the front of the triangle')
for (const b of balls.slice(2)) assert.isAbove(b.x, 330)
```

No two balls should overlap, and the back row should be straight.
tr: Hiçbir iki top üst üste binmemeli ve arka sıra düz olmalı.

```js
for (let i = 0; i < balls.length; i++) {
  for (let j = i + 1; j < balls.length; j++) {
    assert.isAtLeast(Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y), R * 2, 'balls must not overlap')
  }
}
const back = balls.filter((b) => b.number >= 7)
assert.lengthOf(new Set(back.map((b) => Math.round(b.x))), 1, 'the back row is one column')
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
