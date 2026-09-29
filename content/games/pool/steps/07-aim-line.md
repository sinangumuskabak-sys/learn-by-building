---
title: An aim line
title_tr: Nişan çizgisi
skills: [game.canvas]
---

# --goal--

A shot goes in a direction, an **angle** `aim` in radians. A thin line from the cue ball shows it. Trigonometry turns the
angle into x and y: `Math.cos(aim)` is how far right, `Math.sin(aim)` how far down, for each unit along the line.

# --goal-tr--

Vuruş bir **yöne** gider. Yönü tek bir sayıyla, bir **açıyla** tutacağız: `aim` (nişan). Açılar **radyan** ile ölçülür:
tam tur `Math.PI * 2` (≈ 6.28), yarım tur `Math.PI`. 0 **sağı** gösterir; `Math.PI / 2` ise **aşağıyı** (canvas'ta y
aşağı büyüdüğü için).

Açıyı ekrana çevirmek için trigonometri kullanacağız, ama yalnız iki fonksiyonu: bir birim ilerlerken `Math.cos(aim)` ne
kadar **sağa**, `Math.sin(aim)` ne kadar **aşağı** gidildiğini söyler. İsteka topundan bu yönde ince bir çizgi çizeceğiz.

# --code--

```js
let aim // angle of the shot, in radians

  aim = 0

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cue.x, cue.y)
  ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
  ctx.stroke()
```

# --meaning--

- `aim` starts at 0 (right) in `reset`.
- `moveTo` puts the pen on the cue ball, `lineTo` draws to a point 400 pixels along the aim, `stroke` paints the line.
- `cos(0)` is 1 and `sin(0)` is 0: the end is 400 to the right. At `Math.PI / 2`, `cos` is 0 and `sin` is 1: 400 down.

# --meaning-tr--

- `let aim` → vuruşun açısı (radyan). `reset` içinde `aim = 0` → sağa bakarak başla.
- `ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'` → yüzde 60 görünür beyaz çizgi; `lineWidth = 1` → 1 piksel.
- `ctx.beginPath()` → yeni bir şekil. `ctx.moveTo(cue.x, cue.y)` → kalemi topun ortasına koy (çizmeden).
- `ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)` → oradan, `aim` yönünde 400 piksel ötedeki
  noktaya bir çizgi. `aim = 0` iken `cos` 1, `sin` 0: 400 sağa. `aim = Math.PI / 2` iken `cos` 0, `sin` 1: 400 aşağı.
- `ctx.stroke()` → yolu çizgi olarak boya.

# --task--

1. Under `let cue` write `let aim ...`; in `reset`, under `rack()`, write `aim = 0`.
2. In `draw`, under the felt's `fillRect`, leave an empty line and write the six line-drawing lines.

# --task-tr--

1. `let cue` satırının altına yorumuyla birlikte `let aim ...` yaz.
2. `reset` içinde `rack()` satırının altına `aim = 0` yaz.
3. `draw` içinde çuhayı çizen `fillRect` satırının altına bir boş satır bırak ve çizgiyi çizen altı satırı yaz.
4. **Çalıştır**: beyaz toptan sağa, üçgene doğru ince bir çizgi görmelisin.

# --try--

Set `aim = Math.PI` in `reset` and run: the line points left. Try `-Math.PI / 4` too. Put 0 back.

# --try-tr--

`reset` içinde `aim = Math.PI` yap ve çalıştır: çizgi sola döner. `-Math.PI / 4`'ü de dene (sağ üst). Sonra 0'a geri al.

# --tests--

The aim line should go 400 pixels from the cue ball along `aim`.
tr: Nişan çizgisi isteka topundan `aim` yönünde 400 piksel gitmeli.

```js
assert.strictEqual(aim, 0)
$.tick(1)
const ends = () => $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends(), '530,160')
aim = Math.PI / 2
$.tick(1)
assert.include(ends(), '130,560', 'pointing down')
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
let aim // angle of the shot, in radians

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
  aim = 0
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cue.x, cue.y)
  ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
  ctx.stroke()

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
