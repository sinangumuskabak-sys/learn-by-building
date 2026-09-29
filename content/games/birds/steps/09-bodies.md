---
title: Bodies
title_tr: Gövdeler
skills: [prog.arrays, game.state]
---

# --goal--

Everything that will move in this game (the bird, the blocks, the pigs) is a **body**: a box with a kind, a position,
a size and a velocity. They all live in one array, `bodies`, and `draw` paints each one.

# --goal-tr--

Bu oyunda hareket eden her şey (uçan kuş, tahta bloklar, domuzlar) bir **gövde** (body) olacak: türü, konumu, boyu ve
hızı olan bir kutu. Hepsini tek bir **dizide** (listede) tutacağız: `bodies`. Böylece hepsini aynı kodla hareket
ettirip aynı kodla çizebileceğiz.

Bu adımda gövdeyi yapan küçük bir yardımcı yazıyoruz ve `draw`'a listedeki her gövdeyi çizdiriyoruz. Liste şimdilik
boş, o yüzden ekran değişmeyecek.

# --code--

```js
let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

  bodies = []
  bird = null

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- `body(...)` returns a new object; `{ kind, x }` is short for `{ kind: kind, x: x }`. `vx` and `vy` (the velocity)
  start at 0.
- `bird` will point to the bird while it flies, `null` meaning "none".
- `for (const b of bodies)` repeats for each body. `MATERIALS[b.kind]` looks up the material by a name held in a
  variable; the circle's center is the middle of the box, `x + w / 2`.

# --meaning-tr--

- `let bodies` → bütün gövdelerin listesi. Yorum, bir gövdenin içinde ne olduğunu söylüyor: tür (`kind`), sol üst
  köşe (`x`, `y`), en ve boy (`w`, `h`), hız (`vx` yatay, `vy` dikey).
- `let bird` → uçmakta olan kuş; uçan kuş yoksa `null` ("hiçbir şey").
- `const body = (kind, x, y, w, h) => ({ ... })` → kısa bir fonksiyon (ok fonksiyonu): verilen bilgilerle **yeni bir
  gövde nesnesi** yapıp geri verir. Süslü parantez normal parantez içinde, çünkü geri verilen şey bir nesne.
  `{ kind, x }` yazmak `{ kind: kind, x: x }` demenin kısa yolu. Hız başta 0.
- `reset()` içinde `bodies = []` → boş liste ile başla; `bird = null` → uçan kuş yok.
- `for (const b of bodies) {` → listedeki **her gövde için**, sırayla, ona `b` de ve içini yap.
- `MATERIALS[b.kind]` → gövdenin türüne göre malzemesi. Ad (`'bird'`) bir değişkenden geldiği için nokta yerine
  **köşeli parantez** kullanılır.
- `ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, ...)` → kutunun **ortasına**, enin yarısı kadar yarıçaplı bir daire.

# --task--

1. Above `let aim` write `let bodies` and `let bird`; under `let aim` leave an empty line and write the `body` helper.
2. At the top of `reset`, write `bodies = []` and `bird = null`.
3. At the end of `draw`, after an empty line, write the `for` loop.

# --task-tr--

1. `let aim` satırının **üstüne** `let bodies` ve `let bird` satırlarını yaz.
2. `let aim` satırının altında bir boş satır bırak ve `const body = ...` satırını yaz.
3. `reset` fonksiyonunun **en üstüne** (`aim = ...` satırının üstüne) `bodies = []` ve `bird = null` yaz.
4. `draw` fonksiyonunun **en sonuna**, kuşun `ctx.fill()` satırından sonra bir boş satır bırakıp `for` döngüsünü yaz.
5. **Çalıştır**: ekran aynı kalmalı, kontroller yeşil olmalı.

# --try--

Add `bodies.push(body('bird', 300, 150, 40, 40))` at the end of `reset` and run: a big red ball floats in the sky. Remove it.

# --try-tr--

`reset`'in sonuna `bodies.push(body('bird', 300, 150, 40, 40))` ekle ve çalıştır: gökyüzünde büyük kırmızı bir top belirir. Sonra sil.

# --tests--

`body(...)` should make a box that is not moving.
tr: `body(...)` duran bir kutu yapmalı.

```js
assert.deepEqual(body('bird', 1, 2, 3, 4), { kind: 'bird', x: 1, y: 2, w: 3, h: 4, vx: 0, vy: 0 })
```

`reset()` should start with no bodies and no bird in flight.
tr: `reset()` gövdesiz ve uçan kuşsuz başlamalı.

```js
bodies = [1]
bird = 1
reset()
assert.deepEqual(bodies, [])
assert.isNull(bird)
```

Every body should be drawn as a circle in its material's color.
tr: Her gövde, malzemesinin renginde bir daire olarak çizilmeli.

```js
bodies.push(body('bird', 200, 100, 20, 20))
$.tick()
assert.deepInclude($.arcs(), { x: 210, y: 110, r: 10, color: '#dc2626' })
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
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
