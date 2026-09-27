---
title: The table and the rack
title_tr: Masa ve üçgen
skills: [game.canvas, prog.loops]
---

# --explanation--

A pool table is a green rectangle (the felt) inside a brown frame (the rails), with a white **cue ball** and the numbered
balls packed in a triangle, the **rack**.

Every ball is the same kind of object: a position, a velocity (zero for now), a color, a number, and whether it is the cue
ball. Keeping them all in one array, `balls`, means the physics later can treat them all alike; `cue` is just a second name
for the white one.

The triangle comes from two loops. Row 0 has 1 ball, row 1 has 2, row 3 has 4: row `row` has `row + 1` balls. Inside a row,
balls are one diameter apart (`2R`), centered on the table's middle line with `(i - row / 2)`. Rows are a little **less**
than a diameter apart: in a packed triangle the centres form equilateral triangles, and the height of one is
`2R × 0.87` (that is `2R × √3 / 2`). A tiny extra `0.5` keeps the balls from touching exactly, so nothing collides before the
break.

# --explanation-tr--

Bir bilardo masası, kahverengi bir çerçevenin (bantlar) içinde yeşil bir dikdörtgendir (çuha); üzerinde beyaz bir **isteka
topu** ve bir üçgene dizilmiş numaralı toplar, yani **üçgen dizilim** vardır.

Her top aynı türde bir nesnedir: bir konum, bir hız (şimdilik sıfır), bir renk, bir numara ve isteka topu olup olmadığı.
Hepsini tek bir dizide, `balls`'ta tutmak, sonraki fiziğin hepsine aynı biçimde davranabileceği anlamına gelir; `cue` yalnızca
beyaz topun ikinci bir adıdır.

Üçgen iki döngüden gelir. 0. satırda 1 top, 1. satırda 2, 3. satırda 4 top vardır: `row` satırında `row + 1` top. Bir satırın
içinde toplar bir çap (`2R`) aralıklıdır ve `(i - row / 2)` ile masanın orta çizgisine ortalanır. Satırlar bir çaptan biraz
**daha az** aralıklıdır: sıkı bir üçgende merkezler eşkenar üçgenler oluşturur ve birinin yüksekliği `2R × 0.87`'dir (yani
`2R × √3 / 2`). Küçük bir ek `0.5`, topların tam olarak değmesini önler; böylece açılış vuruşundan önce hiçbir şey çarpışmaz.

# --task--

1. Add the table edges `LEFT = 20`, `TOP = 40`, `RIGHT = 460`, `BOTTOM = 280`, the radius `R = 9`, the ten `COLORS` and
   `CUE_START = { x: 130, y: 160 }`.
2. Write `ball(x, y, color, number)`, returning `{ x, y, vx: 0, vy: 0, color, number, cue: number === 0 }`.
3. Write `rack()`: the cue ball (`'#f8fafc'`, number 0) at `CUE_START`, then 4 rows of 1 to 4 balls numbered 1 to 10, at
   `x = 330 + row * (R * 2 * 0.87 + 0.5)` and `y = 160 + (i - row / 2) * (R * 2 + 0.5)`. `reset()` racks.
4. Each frame: fill `'#0f172a'`, the rails `'#78350f'` 12 pixels around the table, the felt `'#15803d'`, and each ball as a
   circle of radius `R`, with its number in white (`'bold 9px sans-serif'`, centered, `y + 3`) except on the cue ball.

# --task-tr--

1. Masa kenarlarını `LEFT = 20`, `TOP = 40`, `RIGHT = 460`, `BOTTOM = 280`, yarıçap `R = 9`'u, on `COLORS`'ı ve
   `CUE_START = { x: 130, y: 160 }`'ı ekle.
2. `{ x, y, vx: 0, vy: 0, color, number, cue: number === 0 }` döndüren `ball(x, y, color, number)`'ı yaz.
3. `rack()` yaz: `CUE_START`'ta isteka topu (`'#f8fafc'`, 0 numara), sonra `x = 330 + row * (R * 2 * 0.87 + 0.5)` ve
   `y = 160 + (i - row / 2) * (R * 2 + 0.5)`'te 1'den 10'a numaralı, 1'den 4'e toplu 4 satır. `reset()` dizer.
4. Her karede: `'#0f172a'` doldur, masanın çevresinde 12 piksel `'#78350f'` bantlar, `'#15803d'` çuha ve her topu `R`
   yarıçaplı bir daire olarak; isteka topu dışında numarası beyazla (`'bold 9px sans-serif'`, ortalı, `y + 3`).

# --tests--

There should be the cue ball and ten numbered balls, with ball 1 at the front of the triangle.
tr: İsteka topu ve on numaralı top olmalı; 1 numara üçgenin önünde.

```js
assert.lengthOf(balls, 11)
assert.strictEqual(balls[0], cue)
assert.deepEqual([cue.x, cue.y, cue.number], [130, 160, 0])
assert.isTrue(cue.cue)
assert.deepEqual(balls.slice(1).map((b) => b.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
assert.deepEqual([balls[1].x, balls[1].y], [330, 160], 'ball 1 is at the front of the triangle')
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

The felt, the balls and their numbers should be drawn.
tr: Çuha, toplar ve numaraları çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#15803d'), { x: 20, y: 40, w: 440, h: 240, color: '#15803d' })
assert.deepInclude($.arcs(), { x: 130, y: 160, r: 9, color: '#f8fafc' })
assert.deepInclude($.arcs(), { x: 330, y: 160, r: 9, color: '#facc15' })
for (let n = 1; n <= 10; n++) assert.include($.texts(), String(n))
```

# --seed--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
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
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
