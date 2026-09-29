---
title: A mole in a hole
title_tr: Delikte bir köstebek
skills: [game.state]
---

# --goal--

Each hole remembers until when its mole stays up: `upUntil`, a time. The mole is up while `now` has not reached it.
A mole is drawn as a lighter brown circle inside its hole.

# --goal-tr--

Her delik, köstebeğinin **ne zamana kadar** dışarıda kalacağını hatırlasın: `upUntil` (…e kadar yukarıda). Bu bir
**zaman**: `now` o zamana ulaşmadıysa köstebek dışarıda, ulaştıysa saklanmış. Böylece köstebeğin saklanmasını ayrıca
kodlamaya gerek kalmaz: zaman geçince kendiliğinden saklanır.

Köstebeği deliğin içinde daha açık kahverengi bir daire olarak çiziyoruz.

# --code--

```js
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })

function isUp(hole) {
  return now < hole.upUntil
}

    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
```

# --meaning--

- `upUntil: 0` means no mole: time is always past 0.
- `isUp` answers true while the current time is before `upUntil`.
- An up mole is drawn with radius 32, inside the hole of radius 40.

# --meaning-tr--

- `upUntil: 0` → başta köstebek yok: zaman hep 0'ı geçmiş durumda.
- `function isUp(hole)` → "bu delikte köstebek dışarıda mı?" `return now < hole.upUntil` → şimdiki zaman `upUntil`'den
  küçükse `true`.
- `if (isUp(hole)) { ... }` → dışarıdaysa deliğin içine 32 yarıçaplı açık kahverengi bir daire çiz.

# --task--

1. Add `upUntil: 0` to the object in `holes.push`.
2. Under `let now`, write `isUp`.
3. In `draw`, inside the holes loop, write the mole block under `ctx.fill()`.

# --task-tr--

1. `holes.push({ ... })` içindeki nesneye `, upUntil: 0` ekle.
2. `let now ...` satırının altına bir boş satır bırakıp `isUp` fonksiyonunu yaz.
3. `draw` içindeki delik döngüsünde `ctx.fill()` satırının altına köstebek bloğunu yaz.
4. **Çalıştır**. (Henüz köstebek çıkmıyor; sonraki adımda.)

# --try--

Set `upUntil: 3000` for every hole and run: all nine moles show for 3 seconds, then hide by themselves. Put 0 back.

# --try-tr--

Her deliğe `upUntil: 3000` ver ve çalıştır: dokuz köstebek 3 saniye görünür, sonra kendiliğinden saklanır. Sonra 0'a geri al.

# --tests--

`isUp` should compare the current time with `upUntil`.
tr: `isUp` şimdiki zamanı `upUntil` ile karşılaştırmalı.

```js
assert.isTrue(holes.every((h) => h.upUntil === 0))
now = 500
assert.isFalse(isUp({ upUntil: 500 }))
assert.isTrue(isUp({ upUntil: 501 }))
```

A hole whose mole is up should show the mole.
tr: Köstebeği dışarıda olan delik köstebeği göstermeli.

```js
holes[4].upUntil = 1e9
$.tick()
const moles = $.arcs().filter((a) => a.color === '#92400e' && a.r === 32)
assert.lengthOf(moles, 1)
assert.deepEqual([moles[0].x, moles[0].y], [180, 220])
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms

function isUp(hole) {
  return now < hole.upUntil
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
