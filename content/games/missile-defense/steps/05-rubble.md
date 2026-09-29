---
title: Rubble
title_tr: Enkaz
skills: [game.canvas]
---

# --goal--

Now the drawing reads the city objects: a standing city is a tall blue block, a destroyed one flat grey rubble.

# --goal-tr--

Çizim artık şehir kartlarına baksın. Ayaktaki şehir yine uzun mavi bir blok; yıkılmış şehir ise yere yapışmış, **basık
gri bir enkaz** olsun. Aynı döngü ikisini de çizecek; yalnız renk ve boy `alive`'a göre seçilecek.

# --code--

```js
for (const c of cities) {
  ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
  ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
}
```

# --meaning--

- The loop now walks the `cities` objects; `c.x` is the city's middle.
- `a ? b : c` is a short "if": blue when alive, dark grey otherwise.
- The height is 14 when alive and 4 when not; `GROUND - height` keeps both standing on the ground.

# --meaning-tr--

- `for (const c of cities)` → artık sayıları değil **şehir kartlarını** geziyoruz; `c.x` şehrin ortası.
- `c.alive ? '#38bdf8' : '#44403c'` → kısa bir "eğer": "soru `?` evetse şu `:` değilse bu". Ayaktaysa mavi, değilse
  koyu gri.
- `c.alive ? 14 : 4` → boy: ayaktaysa 14, yıkıksa 4 piksel.
- `GROUND - (c.alive ? 14 : 4)` → bloğun üstü; iki durumda da blok **zeminde** durur.

# --task--

In `draw`, replace the city part (the `fillStyle` line and the `for` loop) with the new loop.

# --task-tr--

`draw` içinde şehirleri çizen kısmı (`ctx.fillStyle = '#38bdf8'` satırı ve altındaki `for` döngüsü) sil; yerine yeni
döngüyü yaz. **Çalıştır**: ekran aynı görünmeli (henüz hiçbir şehir yıkılmadı).

# --try--

Temporarily write `cities[1].alive = false` under `reset()` at the bottom: the second city is rubble. Delete it again.

# --try-tr--

En alttaki `reset()` satırının altına geçici olarak `cities[1].alive = false` yaz: ikinci şehir enkaz olur. Sonra o satırı sil.

# --tests--

Living cities should be drawn as blocks.
tr: Yaşayan şehirler blok olarak çizilmeli.

```js
$.tick()
const alive = $.rects('#38bdf8')
assert.lengthOf(alive, 6)
assert.deepEqual([alive[0].x, alive[0].y, alive[0].w, alive[0].h], [34, 356, 32, 14])
```

A lost city should be drawn as rubble.
tr: Kaybedilen bir şehir enkaz olarak çizilmeli.

```js
cities[0].alive = false
$.tick()
assert.lengthOf($.rects('#38bdf8'), 5)
assert.deepEqual($.rects('#44403c').map((r) => [r.x, r.y, r.w, r.h]), [[34, 366, 32, 4]])
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

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
