---
title: The cue ball
title_tr: İsteka topu
skills: [prog.arrays, prog.functions]
---

# --goal--

Every ball is the same kind of object: a position, a velocity (zero for now), a color, a number, and whether it is the cue
ball. `ball(...)` builds one. All balls will live in one array, `balls`, so the physics can treat them alike; `cue` is a
second name for the white one.

# --goal-tr--

Masadaki **her top** aynı türden bir nesne: yeri (`x`, `y`), hızı (`vx`, `vy`; şimdilik 0), rengi, numarası ve beyaz
**isteka topu** olup olmadığı. Bu nesneyi kuran küçük bir fonksiyon yazacağız: `ball`.

Bütün toplar tek bir dizide, `balls`'ta duracak; böylece fizik hepsine aynı şekilde davranabilir. Beyaz topa ayrıca
kolay ulaşmak için ona ikinci bir ad veriyoruz: `cue`. Bu adımda masaya yalnız isteka topunu koyuyoruz; ekranda henüz
görünmeyecek.

# --code--

```js
const R = 9 // ball radius
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
}

function reset() {
  rack()
}

reset()
```

# --meaning--

- `R` is the ball radius; `CUE_START` is the cue ball's spot.
- `ball` is an arrow function that returns a new object. The object is in parentheses so the braces are not read as a
  function body. `{ x, y }` is short for `{ x: x, y: y }`; `cue: number === 0` is true only for number 0.
- `rack` puts the white ball on its spot and starts the `balls` array with it. `reset` sets up a new game and runs once at
  the start.

# --meaning-tr--

- `const R = 9` → topun **yarıçapı**. `CUE_START` → isteka topunun başlangıç noktası.
- `let balls` → bütün topların dizisi; yorum her topta hangi bilgilerin olacağını söylüyor. `let cue` → beyaz top.
- `const ball = (x, y, color, number) => ({ ... })` → yeni bir top nesnesi **geri veren** ok fonksiyonu. Nesnenin
  etrafındaki `( )` şart: onlarsız JavaScript `{`'i fonksiyon gövdesi sanar.
  - `{ x, y, ... color, number }` → `x: x`, `y: y` yazmanın kısası: değişkenin adı anahtarın adı olur.
  - `vx: 0, vy: 0` → hız: yatay ve dikey (piksel/kare). Top duruyor.
  - `cue: number === 0` → karşılaştırmanın sonucu (`true`/`false`) doğrudan değer olur: yalnız 0 numara isteka topudur.
- `rack()` → beyaz topu yerine koy, `balls` dizisini onunla başlat. (Birazdan diğer topları da dizecek.)
- `reset()` → yeni bir oyun kurar; en alttaki `reset()` onu başta bir kez çalıştırır.

# --task--

1. Under `const BOTTOM = 280` write the new lines, from `R` down to `reset`.
2. Write `reset()` just above the last line, `requestAnimationFrame(loop)`. Press **Run**.

# --task-tr--

1. `const BOTTOM = 280` satırının altına `R`'den `reset` fonksiyonuna kadar yeni satırları yaz (boş satırlar kodda
   görüldüğü gibi).
2. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `reset()` yaz.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

What will you see after Run?
- [ ] A white ball on the table
- [x] The same table as before
  The cue ball exists in `balls`, but `draw` does not draw balls yet.
- [ ] An error

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] Masada beyaz bir top
- [x] Öncekiyle aynı masa
  İsteka topu `balls`'ta var ama `draw` henüz top çizmiyor.
- [ ] Bir hata

# --tests--

The cue ball should be at its spot, still, and the only ball so far.
tr: İsteka topu yerinde, duruyor ve şimdilik tek top olmalı.

```js
assert.deepEqual([cue.x, cue.y, cue.vx, cue.vy, cue.number, cue.color], [130, 160, 0, 0, 0, '#f8fafc'])
assert.isTrue(cue.cue)
assert.deepEqual(balls, [cue])
```

`ball` should build a still ball; only number 0 is the cue ball.
tr: `ball` duran bir top kurmalı; yalnız 0 numara isteka topu.

```js
assert.deepEqual(ball(50, 60, 'red', 5), { x: 50, y: 60, vx: 0, vy: 0, color: 'red', number: 5, cue: false })
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
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
}

function reset() {
  rack()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
