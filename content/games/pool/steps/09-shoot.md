---
title: A shot is a velocity
title_tr: Vuruş bir hızdır
skills: [game.physics]
---

# --goal--

A shot gives the cue ball a **velocity**: a speed, `power`, in the direction `aim`. The same `cos` and `sin` split it into
the two parts the position needs, `vx` and `vy`. Space shoots.

# --goal-tr--

Vuruş, isteka topuna bir **hız** verir: bir büyüklük (`power`, güç) ve bir yön (`aim`). Topun yeri x ve y ile tutulduğu
için hızı da iki parçaya ayırmalıyız: `vx` (karede ne kadar sağa) ve `vy` (ne kadar aşağı). Bunu nişan çizgisindeki
**aynı** `cos` ve `sin` yapar; yalnız 400 yerine `power` ile çarparız.

**Boşluk** vursun.

# --code--

```js
let power

  power = 8

function shoot() {
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
}

  else if (event.key === ' ') shoot()
```

# --meaning--

- `power` is 8 at the start: 8 pixels per frame.
- `vx` and `vy` are the parts of the speed along x and y. At `aim = 0` the shot is `vx = 8, vy = 0`.

# --meaning-tr--

- `let power` → vuruşun gücü; `reset` içinde `power = 8`: karede 8 piksel.
- `cue.vx = Math.cos(aim) * power` → hızın **yatay** parçası. `aim = 0` → `cos` 1 → `vx = 8`.
- `cue.vy = Math.sin(aim) * power` → **dikey** parçası. `aim = 0` → `sin` 0 → `vy = 0`: dümdüz sağa.
- 45 derecede (`Math.PI / 4`) ikisi de ≈ 5.66: çapraz giderken hız iki eksene paylaşılır; toplam yine 8.
- `else if (event.key === ' ') shoot()` → Boşluk vurur.

# --task--

1. Under `let aim ...` write `let power`; in `reset`, under `aim = 0`, write `power = 8`.
2. Under `reset`, leave an empty line and write `shoot`.
3. In the key listener, add the Space line above `else return`.

# --task-tr--

1. `let aim ...` satırının altına `let power` yaz.
2. `reset` içinde `aim = 0` satırının altına `power = 8` yaz.
3. `reset` fonksiyonunun altına bir boş satır bırak ve `shoot` fonksiyonunu yaz.
4. Tuş dinleyicisinde `else return` satırının **üstüne** Boşluk satırını yaz. **Çalıştır** ve Boşluk'a bas.

# --predict--

You press Space. What does the cue ball do?
- [ ] It rolls to the right
- [x] Nothing
  It has a velocity now, but nothing adds the velocity to its position yet.
- [ ] It jumps to the end of the aim line

# --predict-tr--

Boşluk'a bastın. İsteka topu ne yapar?
- [ ] Sağa yuvarlanır
- [x] Hiçbir şey
  Artık bir hızı var, ama hızı yerine ekleyen henüz kimse yok.
- [ ] Nişan çizgisinin ucuna zıplar

# --tests--

Space should give the cue ball a velocity along the aim.
tr: Boşluk isteka topuna nişan yönünde bir hız vermeli.

```js
assert.strictEqual(power, 8)
$.press(' ')
assert.deepEqual([cue.vx, cue.vy], [8, 0])
aim = Math.PI / 2
power = 5
shoot()
assert.closeTo(cue.vx, 0, 1e-9)
assert.closeTo(cue.vy, 5, 1e-9)
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
let power

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
  power = 8
}

function shoot() {
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

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
