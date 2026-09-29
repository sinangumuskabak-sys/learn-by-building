---
title: The shooter
title_tr: Atıcı
skills: [game.state]
---

# --goal--

The shooter sits at the bottom. It shows the **loaded** bubble, and a smaller one beside it shows the **next**. Knowing the
next color lets a player plan two moves ahead.

# --goal-tr--

Atıcı en altta duruyor. Üstünde atılacak **yüklü** balon, yanında daha küçük olarak **sıradaki** balon görünecek.
Sıradaki rengi bilmek, oyuncunun iki hamle sonrasını planlamasını sağlar.

Renkleri `pickColor` (renk seç) fonksiyonu seçecek; şimdilik rastgele.

# --code--

```js
const SHOOTER = { x: 200, y: 490 }

let loaded // color of the bubble in the shooter
let next // color of the one after

function pickColor() {
  return Math.floor(Math.random() * COLORS.length)
}

  loaded = pickColor()
  next = pickColor()

  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
```

# --meaning--

- `SHOOTER` is where shots start.
- `loaded` and `next` are color numbers, picked at the end of `reset`.
- The next bubble is drawn smaller (radius 12), to the right of the shooter.

# --meaning-tr--

- `const SHOOTER = { x: 200, y: 490 }` → atıcının yeri: altta, ortada.
- `let loaded`, `let next` → yüklü ve sıradaki balonun **renk numaraları**.
- `pickColor()` → 0–4 arasında rastgele bir renk verir. (Oyunun sonunda onu daha akıllı yapacağız.)
- `reset`'in sonunda iki renk seçilir.
- `drawBubble(SHOOTER.x, SHOOTER.y, loaded)` → yüklü balon atıcıda.
- `drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)` → sıradaki, 60 piksel sağda ve biraz aşağıda, yarıçapı 12:
  varsayılan değeri burada değiştiriyoruz.

# --task--

1. Under `COLORS` write `SHOOTER`; under `let grid ...` write `let loaded` and `let next`.
2. Above `function reset() {` write `pickColor`; at the end of `reset` pick the two colors.
3. In `draw`, after the grid loops, leave an empty line and draw the two bubbles.

# --task-tr--

1. `COLORS` satırının altına `SHOOTER` yaz.
2. `let grid ...` satırının altına yorumlarıyla `let loaded` ve `let next` yaz.
3. `function reset() {` satırının **üstüne** `pickColor` fonksiyonunu yaz; aralarında bir boş satır kalsın.
4. `reset`'in sonunda (son `}`'den önce) iki `pickColor()` satırını yaz.
5. `draw` içinde ızgara döngülerinden sonra bir boş satır bırak ve iki balonu çiz. **Çalıştır**.

# --tests--

The loaded bubble and the next one should be drawn at the shooter.
tr: Yüklü balon ve sıradaki atıcıda çizilmeli.

```js
assert.include([0, 1, 2, 3, 4], loaded)
assert.include([0, 1, 2, 3, 4], next)
$.tick(1)
assert.deepInclude($.arcs(), { x: 200, y: 490, r: 19, color: COLORS[loaded] })
assert.deepInclude($.arcs(), { x: 260, y: 500, r: 11, color: COLORS[next] })
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }

let grid // grid[r][c]: a color index, or -1 for an empty cell
let loaded // color of the bubble in the shooter
let next // color of the one after

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function pickColor() {
  return Math.floor(Math.random() * COLORS.length)
}

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  loaded = pickColor()
  next = pickColor()
}

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
