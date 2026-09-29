---
title: One missile a second
title_tr: Saniyede bir füze
skills: [game.loop]
---

# --goal--

The attack comes in a **wave** of 20 missiles. A countdown in `update` launches one, waits 60 frames (about a second),
launches the next.

# --goal-tr--

Saldırı bir **dalga** hâlinde gelir: 20 füze. Hepsi aynı anda değil, **arka arkaya**: bir füze, bir saniye bekle, bir
füze daha...

Bunun için bir **geri sayım** kullanacağız. Döngü saniyede ~60 kez çalışır; her çalışma bir **kare**dir. `launchIn`
bir sonraki fırlatmaya kaç kare kaldığını, `toLaunch` dalgada kaç füze kaldığını tutar. Füzeler bu adımda listede
birikecek ama henüz ne hareket edecek ne görünecek.

# --code--

```js
let toLaunch // enemy missiles still to come in this wave
let launchIn

  toLaunch = 20
  launchIn = 30

function update() {
  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = 60
    }
  }
}

function loop() {
  update()
```

# --meaning--

- `reset` sets 20 missiles to launch, the first one after 30 frames.
- Each frame `update` counts `launchIn` down; at 0 it launches a missile, counts it off and waits 60 frames again.
- The loop now calls `update()` before `draw()`.

# --meaning-tr--

- `toLaunch = 20` → bu dalgada 20 füze gelecek. `launchIn = 30` → ilki 30 kare (yarım saniye) sonra.
- `function update() {` → oyunun **güncelleme** işi. Döngü her karede önce onu, sonra `draw`'u çağıracak.
- `if (toLaunch > 0)` → fırlatılacak füze kaldıysa...
- `launchIn -= 1` → geri sayımı bir azalt (`-=` "üstünden çıkar").
- `if (launchIn <= 0)` → sayım bittiyse: `launch()` ile bir füze fırlat, `toLaunch -= 1` ile bir tane düş,
  `launchIn = 60` ile sayımı yeniden kur (60 kare ≈ 1 saniye).

# --task--

1. Under `let incoming ...` write `let toLaunch` (with its comment) and `let launchIn`.
2. In `reset`, under `incoming = []`, write the two lines.
3. Write `update` just above `function draw() {`, with an empty line between.
4. In `loop`, call `update()` above `draw()`.

# --task-tr--

1. `let incoming ...` satırının altına `let toLaunch` (yorumuyla) ve `let launchIn` satırlarını yaz.
2. `reset` içinde `incoming = []` satırının altına iki satırı yaz.
3. `function draw() {` satırının **üstüne** `update` fonksiyonunu yaz; aralarında bir boş satır kalsın.
4. `loop` içinde `draw()` satırının üstüne `update()` yaz.
5. **Çalıştır**: ekranda henüz fark yok; kontroller yeşil olmalı.

# --predict--

You press Run and wait. What do you see?
- [ ] Missiles falling from the sky
- [x] Nothing new
  The missiles are in the `incoming` list, but nothing moves or draws them yet.
- [ ] Twenty missiles at once at the top

# --predict-tr--

Çalıştır'a basıp bekliyorsun. Ne görürsün?
- [ ] Gökten düşen füzeler
- [x] Yeni bir şey yok
  Füzeler `incoming` listesinde birikiyor ama onları henüz kimse hareket ettirmiyor ya da çizmiyor.
- [ ] Üstte aynı anda yirmi füze

# --tests--

Missiles should be launched 30 frames after the start, then 60 frames apart.
tr: Füzeler başlangıçtan 30 kare sonra, sonra 60 kare arayla fırlatılmalı.

```js
$.tick(29)
assert.lengthOf(incoming, 0)
$.tick(1)
assert.lengthOf(incoming, 1)
$.tick(59)
assert.lengthOf(incoming, 1)
$.tick(1)
assert.lengthOf(incoming, 2)
assert.strictEqual(toLaunch, 18)
```

No more missiles should come once the wave is used up.
tr: Dalga bitince başka füze gelmemeli.

```js
toLaunch = 1
$.tick(30)
assert.lengthOf(incoming, 1)
$.tick(200)
assert.lengthOf(incoming, 1)
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
let toLaunch // enemy missiles still to come in this wave
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  toLaunch = 20
  launchIn = 30
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
}

// Move a point `speed` pixels towards its target; true when it has arrived.
function stepTowards(m, speed) {
  const dx = m.tx - m.x
  const dy = m.ty - m.y
  const distance = Math.hypot(dx, dy)
  if (distance <= speed) {
    m.x = m.tx
    m.y = m.ty
    return true
  }
  m.x += (dx / distance) * speed
  m.y += (dy / distance) * speed
  return false
}

function update() {
  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = 60
    }
  }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  for (const c of cities) {
    ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
    ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
