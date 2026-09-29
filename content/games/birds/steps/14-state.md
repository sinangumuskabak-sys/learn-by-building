---
title: Aiming or flying
title_tr: Nişan mı, uçuş mu
skills: [game.state]
---

# --goal--

Pressing Space twice launches two birds. The game needs to know what it is doing: a `state` of `'aiming'` or
`'flying'`. You can only launch while aiming.

# --goal-tr--

Boşluk'a iki kez basınca iki kuş çıkıyor. Oyunun **şu an ne yaptığını** bilmesi gerek: nişan mı alıyoruz, kuş mu
uçuyor? Bunu bir **durum** (state) değişkeninde tutacağız: `'aiming'` (nişan) ya da `'flying'` (uçuş).

Kural basit: yalnız nişan alırken fırlatılabilir; fırlatınca durum uçuşa geçer.

# --code--

```js
let state // 'aiming' or 'flying'

  state = 'aiming'

function launch() {
  if (state !== 'aiming') return
  ...
  bodies.push(bird)
  state = 'flying'
}
```

# --meaning--

- `state` holds one of two words.
- `if (state !== 'aiming') return` leaves `launch` at once unless we are aiming. `!==` means "is not equal to".
- After the launch the state becomes `'flying'`, so a second Space does nothing.

# --meaning-tr--

- `let state` → oyunun durumu: iki kelimeden biri. `reset` onu `'aiming'` ile başlatır.
- `if (state !== 'aiming') return` → `!==` "eşit **değil** mi?" diye sorar. Nişan almıyorsak `return` ile
  fonksiyondan hemen çık: fırlatma olmaz.
- `state = 'flying'` → kuş listeye girince durum uçuş olur. Artık Boşluk'a basmak bir şey yapmaz.

# --task--

1. Under `let aim` write `let state`.
2. In `reset`, under `aim = ...`, write `state = 'aiming'`.
3. In `launch`, write the `if` as the first line and `state = 'flying'` under `bodies.push(bird)`.

# --task-tr--

1. `let aim` satırının altına `let state` yaz.
2. `reset` içinde `aim = ...` satırının altına `state = 'aiming'` yaz.
3. `launch` içinde **ilk satır** olarak `if (state !== 'aiming') return` yaz.
4. `launch` içinde `bodies.push(bird)` satırının altına `state = 'flying'` yaz.
5. **Çalıştır**: Boşluk'a art arda bas; yalnız tek kuş çıkmalı.

# --predict--

After one bird has landed, can you launch another one?
- [ ] Yes, whenever you press Space
- [x] No: the state stays `'flying'` forever
  Nothing sets it back to `'aiming'` yet. We will fix that soon.

# --predict-tr--

Kuş yere indikten sonra yenisini fırlatabilecek misin?
- [ ] Evet, Boşluk'a her bastığında
- [x] Hayır: durum sonsuza kadar `'flying'` kalır
  Onu `'aiming'`'e geri çeviren bir kod henüz yok. Az sonra düzelteceğiz.

# --tests--

The game should start aiming, and a launch should switch to flying.
tr: Oyun nişanla başlamalı; fırlatma uçuşa geçirmeli.

```js
assert.strictEqual(state, 'aiming')
$.press(' ')
assert.strictEqual(state, 'flying')
```

Only one bird at a time.
tr: Aynı anda yalnız bir kuş.

```js
$.press(' ')
$.tick(5)
$.press(' ')
assert.lengthOf(bodies, 1, 'one bird at a time')
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
let state // 'aiming' or 'flying'

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
  state = 'aiming'
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming') return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
  state = 'flying'
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
    b.y += b.vy
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
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
