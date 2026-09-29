---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics]
---

# --goal--

Gravity pulls every body down: each frame it adds a little to `vy`. The sideways speed never changes, the fall keeps
speeding up, and together they draw a curve: a **parabola**.

# --goal-tr--

Gerçek dünyada atılan her şey sonunda aşağı döner: **yerçekimi**. Onu tek satırla ekleyebiliriz: her karede her
gövdenin dikey hızına (`vy`) biraz ekle.

Başta `vy` eksi (kuş yukarı gidiyor); her kare 0.25 eklenince önce yavaşlar, sıfırı geçer, sonra kuş gittikçe hızlanarak
düşer. Yatay hız hiç değişmez. İkisi birlikte atılan her şeyin ünlü eğrisini çizer: **parabol**.

# --code--

```js
const GRAVITY = 0.25

  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
```

# --meaning--

- `GRAVITY` is added to `vy` every frame, before the body moves.
- Going up, `vy` is negative and shrinks towards 0; then it grows and the body falls faster and faster.

# --meaning-tr--

- `const GRAVITY = 0.25` → yerçekiminin gücü: her karede dikey hıza eklenen miktar.
- `b.vy += GRAVITY` → dikey hıza 0.25 ekle. Yukarı giden kuşun `vy`'si eksidir (örneğin −4); her kare 0.25 artarak
  −3.75, −3.5... olur, sıfırı geçer ve artıya döner: kuş tepe noktasına varıp düşmeye başlar.
- Bu satır ilerleme satırlarından **önce**: önce hız değişir, sonra kuş yeni hızıyla ilerler.
- `vx`'e dokunan yok: yana doğru hız sabit.

# --task--

1. Under `const GROUND = 290` write `const GRAVITY = 0.25`.
2. In `step`, write `b.vy += GRAVITY` as the first line inside the `for` loop.

# --task-tr--

1. `const GROUND = 290` satırının altına `const GRAVITY = 0.25` yaz.
2. `step` içinde, `for` döngüsünün **ilk satırı** olarak (`b.x += b.vx` satırının üstüne) `b.vy += GRAVITY` yaz.
3. **Çalıştır** ve Boşluk'a bas: kuş kavis çizmeli... ama yere gelince ne oluyor?

# --predict--

What happens when the bird reaches the ground?
- [ ] It stops on the grass
- [ ] It bounces
- [x] It falls straight through the ground and off the screen
  Nothing knows about the ground yet: the next step fixes that.

# --predict-tr--

Kuş zemine gelince ne olacak?
- [ ] Çimenin üstünde durur
- [ ] Zıplar
- [x] Zeminin içinden geçip ekrandan düşer
  Henüz hiçbir kod zemini bilmiyor; bir sonraki adım bunu düzeltecek.

# --try--

Set `GRAVITY` to `0.05` and launch: a moon shot. Put `0.25` back.

# --try-tr--

`GRAVITY`'yi `0.05` yap ve fırlat: Ay'da atış gibi. Sonra `0.25`'e geri al.

# --tests--

Gravity should add 0.25 to `vy` every frame.
tr: Yerçekimi her karede `vy`'ye 0.25 eklemeli.

```js
assert.strictEqual(GRAVITY, 0.25)
launch()
const vy = bird.vy
const vx = bird.vx
$.tick()
assert.closeTo(bird.vy, vy + 0.25, 1e-9)
$.tick(3)
assert.closeTo(bird.vy, vy + 1, 1e-9)
assert.closeTo(bird.vx, vx, 1e-9, 'the sideways speed does not change')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const GRAVITY = 0.25
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const LAUNCH = 0.2 // speed per pixel of pull
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null
let aim // { angle, pull }

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
    b.y += b.vy
  }
}

function update() {
  step()
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') launch()
  else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
  const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
  ctx.strokeStyle = '#451a03'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(SLING.x, SLING.y)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
  ctx.fill()

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
    ctx.fill()
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
