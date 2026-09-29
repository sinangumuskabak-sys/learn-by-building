---
title: Launch!
title_tr: Fırlat!
skills: [game.physics, game.input]
---

# --goal--

Space launches the bird: a body of 20 by 20 on the sling, with a velocity along the aim that grows with the pull.

# --goal-tr--

**Boşluk** tuşu kuşu fırlatacak. Fırlatmak demek: sapanın tepesine 20 × 20'lik bir kuş gövdesi koymak ve ona bir
**hız** vermek.

Hızın yönü nişanın yönü, büyüklüğü çekişle orantılı. 6. adımda kuşu geri çizmek için `cos`/`sin`'i **çıkarmıştık**;
şimdi ileri fırlatmak için onları **çarparak kullanıyoruz**. `LAUNCH = 0.2`: her piksellik çekiş 0.2 hız verir;
50 piksel çekersen hız 10 olur (karede 10 piksel).

# --code--

```js
const LAUNCH = 0.2 // speed per pixel of pull

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
}

  else if (event.key === ' ') launch()
```

# --meaning--

- `launchVelocity()` returns `{ vx, vy }`: the aim's direction (`cos`, `sin`) times the pull times `LAUNCH`.
- `const { vx, vy } = ...` takes the two fields out into two names.
- The bird's box starts centered on the sling (`SLING.x - BIRD` is its left edge), gets the velocity and joins
  `bodies`, so the loop in `draw` paints it.
- `' '` is the name of the Space key.

# --meaning-tr--

- `const LAUNCH = 0.2` → çekişi hıza çeviren katsayı.
- `const launchVelocity = () => ({ vx: ..., vy: ... })` → fırlatma hızını hesaplayan kısa fonksiyon:
  - `Math.cos(aim.angle) * aim.pull * LAUNCH` → **yatay hız** `vx`: nişan yönünün yatay payı × çekiş × 0.2.
  - `Math.sin(aim.angle) * aim.pull * LAUNCH` → **dikey hız** `vy`. Açı eksi olduğu için eksi çıkar: kuş **yukarı** gider.
- `function launch() {` → fırlatma:
  - `const { vx, vy } = launchVelocity()` → dönen nesnenin iki alanını iki ayrı ada çıkarır.
  - `bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)` → 20 × 20'lik kuş kutusu; sol üst
    köşesi `SLING.x - 10`, yani kutunun ortası tam sapanın tepesi.
  - `bird.vx = vx` ve `bird.vy = vy` → hızını verir.
  - `bodies.push(bird)` → gövdeler listesinin **sonuna ekler**; artık `draw` onu da çizer.
- `else if (event.key === ' ') launch()` → `' '` (tırnak içinde bir boşluk) Boşluk tuşunun adıdır.

# --task--

1. Under `MAX_PULL` write the `LAUNCH` line.
2. Above the `keydown` listener write `launchVelocity` and `launch`.
3. In the listener, above `else return`, add the Space line.

# --task-tr--

1. `const MAX_PULL = 70` satırının altına `LAUNCH` satırını yaz.
2. `document.addEventListener('keydown', ...)` satırının **üstüne** yorumu, `launchVelocity`'yi ve `launch`
   fonksiyonunu yaz (sonra bir boş satır).
3. Dinleyicinin içinde `else return` satırının **üstüne** Boşluk satırını yaz.
4. **Çalıştır**, oyuna tıkla ve Boşluk'a bas.

# --predict--

What happens when you press Space?
- [ ] The bird flies away
- [x] A second bird appears on top of the sling and stays there
  It has a velocity, but nothing uses the velocity to move it yet.
- [ ] Nothing

# --predict-tr--

Boşluk'a basınca ne olacak?
- [ ] Kuş uçup gider
- [x] Sapanın tepesinde ikinci bir kuş belirir ve orada kalır
  Hızı var, ama o hızla onu hareket ettiren bir kod henüz yok.
- [ ] Hiçbir şey

# --hint--

The Space key's name is one space in quotes: `' '`. Empty quotes (`''`) will not match.

# --hint-tr--

Boşluk tuşunun adı tırnak içinde tek bir boşluk: `' '`. Boş tırnak (`''`) olmaz.

# --tests--

`launchVelocity()` should point along the aim, 0.2 per pixel of pull.
tr: `launchVelocity()` nişan yönünde olmalı; çekişin her pikseli 0.2.

```js
aim = { angle: -0.5, pull: 40 }
const v = launchVelocity()
assert.closeTo(v.vx, Math.cos(-0.5) * 8, 1e-9)
assert.closeTo(v.vy, Math.sin(-0.5) * 8, 1e-9)
```

Space should put a 20 by 20 bird on the sling, with the launch velocity.
tr: Boşluk, sapana fırlatma hızıyla 20 × 20'lik bir kuş koymalı.

```js
aim = { angle: -0.5, pull: 40 }
$.press(' ')
assert.lengthOf(bodies, 1)
assert.strictEqual(bird, bodies[0])
assert.deepInclude(bird, { kind: 'bird', x: 80, y: 210, w: 20, h: 20 })
assert.closeTo(bird.vx, Math.cos(-0.5) * 40 * LAUNCH, 1e-9)
assert.closeTo(bird.vy, Math.sin(-0.5) * 40 * LAUNCH, 1e-9)
$.tick()
assert.deepInclude($.arcs(), { x: 90, y: 220, r: 10, color: '#dc2626' })
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
