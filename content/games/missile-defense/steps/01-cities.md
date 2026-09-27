---
title: Six cities to protect
title_tr: Korunacak altı şehir
skills: [game.canvas, prog.arrays]
---

# --explanation--

Every game needs something to lose. Here it is six cities on the ground, with your missile base in the middle.

Each city is a small object, `{ x, alive }`, built from a list of x positions with `map`:

```js
cities = CITY_XS.map((x) => ({ x, alive: true }))
```

(The extra parentheses around `{ x, alive: true }` matter: without them JavaScript would read the `{` as the start of a
function body, not an object.)

A city is drawn as a block when it is alive and as flat rubble when it is not, so the same loop draws both.

# --explanation-tr--

Her oyunun kaybedilecek bir şeye ihtiyacı vardır. Burada bu, yerdeki altı şehir ve ortada senin füze üssün.

Her şehir küçük bir nesnedir, `{ x, alive }`; bir x konumları listesinden `map` ile kurulur:

```js
cities = CITY_XS.map((x) => ({ x, alive: true }))
```

(`{ x, alive: true }`'nin etrafındaki fazladan parantezler önemlidir: onlar olmadan JavaScript `{`'yi bir nesnenin değil, bir
fonksiyon gövdesinin başı sanardı.)

Bir şehir hayattayken bir blok, değilken yassı bir enkaz olarak çizilir; böylece aynı döngü ikisini de çizer.

# --task--

1. Add `GROUND = 370`, `BASE = { x: 240, y: GROUND - 14 }` and `CITY_XS = [50, 110, 170, 310, 370, 430]`.
2. `reset()` makes `cities` from `CITY_XS`, all alive.
3. Draw every frame: a `'#020617'` sky, `'#854d0e'` ground from `GROUND` down, each city as a 32-wide block centered on its
   `x`: 14 high in `'#38bdf8'` if alive, 4 high in `'#44403c'` if not (both standing on the ground), and the base as a
   `'#a3e635'` block 24 wide and 14 high at `BASE`.

# --task-tr--

1. `GROUND = 370`, `BASE = { x: 240, y: GROUND - 14 }` ve `CITY_XS = [50, 110, 170, 310, 370, 430]` ekle.
2. `reset()`, `CITY_XS`'ten hepsi hayatta olan `cities`'i yapar.
3. Her karede çiz: `'#020617'` bir gökyüzü, `GROUND`'dan aşağı `'#854d0e'` zemin, her şehri `x`'inde ortalı 32 genişliğinde bir
   blok olarak: hayattaysa `'#38bdf8'` ile 14 yüksekliğinde, değilse `'#44403c'` ile 4 yüksekliğinde (ikisi de zeminde duran) ve
   üssü `BASE`'te 24 genişliğinde, 14 yüksekliğinde `'#a3e635'` bir blok olarak.

# --tests--

There should be six living cities.
tr: Altı yaşayan şehir olmalı.

```js
assert.deepEqual(cities.map((c) => c.x), [50, 110, 170, 310, 370, 430])
assert.isTrue(cities.every((c) => c.alive))
```

Cities, ground and base should be drawn, and a lost city as rubble.
tr: Şehirler, zemin ve üs çizilmeli; kaybedilen bir şehir enkaz olarak.

```js
$.tick(1)
const alive = $.rects('#38bdf8')
assert.lengthOf(alive, 6)
assert.deepEqual([alive[0].x, alive[0].y, alive[0].w, alive[0].h], [34, 356, 32, 14])
assert.deepEqual($.rects('#a3e635').map((r) => [r.x, r.y, r.w, r.h]), [[228, 356, 24, 14]])
assert.deepEqual($.rects('#854d0e').map((r) => [r.y, r.h]), [[370, 30]])
cities[0].alive = false
$.tick(1)
assert.lengthOf($.rects('#38bdf8'), 5)
assert.deepEqual($.rects('#44403c').map((r) => [r.x, r.y, r.h]), [[34, 366, 4]])
```

# --seed--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
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
