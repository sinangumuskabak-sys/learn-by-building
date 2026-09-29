---
title: The runner
title_tr: Koşucu
skills: [game.state]
---

# --goal--

The runner is a box standing on the ground. Its position and size live in an object, so they can change later.

# --goal-tr--

Koşucumuz zeminde duran bir **kutu**. Yeri ve boyu bir **nesnede** duruyor ki ileride zıplayıp eğilince
değişebilsin.

# --code--

```js
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H }

ctx.fillStyle = '#334155'
ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
```

# --meaning--

- `STAND_H` is the runner's height when standing.
- `y` is the top of the box: `GROUND - STAND_H` puts its feet exactly on the ground.
- The box is drawn from the object's values.

# --meaning-tr--

- `const STAND_H = 44` → ayaktayken koşucunun boyu.
- `let runner = { x, y, w, h }` → nesne: sol kenar (`x`), üst kenar (`y`), genişlik (`w`), yükseklik (`h`).
- `y: GROUND - STAND_H` → kutunun **üstü** zeminden 44 piksel yukarıda; böylece **ayakları** tam zemine basar.
- `ctx.fillRect(runner.x, runner.y, runner.w, runner.h)` → kutuyu nesnedeki değerlerle çiz. Değerler değişince çizim de
  değişecek.

# --task--

1. Under `GROUND`, write `STAND_H` and, after an empty line, `runner`.
2. At the very end, after an empty line, draw the runner.

# --task-tr--

1. `const GROUND = ...` satırının altına `STAND_H` satırını, bir boş satırdan sonra `runner` nesnesini yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra koşucuyu çizen iki satırı yaz.
3. **Çalıştır**: zeminin solunda koyu bir kutu görmelisin.

# --tests--

The runner should stand on the ground.
tr: Koşucu zeminde durmalı.

```js
assert.deepEqual(runner, { x: 50, y: 136, w: 40, h: 44 })
assert.deepEqual($.rects('#334155'), [{ x: 50, y: 136, w: 40, h: 44, color: '#334155' }])
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H }

ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#475569'
ctx.fillRect(0, GROUND, canvas.width, 2)

ctx.fillStyle = '#334155'
ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
```
