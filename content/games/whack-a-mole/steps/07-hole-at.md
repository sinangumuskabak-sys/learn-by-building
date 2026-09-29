---
title: Which hole was clicked?
title_tr: Hangi deliğe tıklandı?
skills: [game.collision]
---

# --goal--

A click gives a point on the canvas. `holeAt` finds the hole whose circle contains that point, using the distance to
the hole's middle (Pythagoras).

# --goal-tr--

Tıklama bize tuval üzerinde bir **nokta** verir. O nokta hangi deliğin **dairesinin içinde**? Bir noktanın daire içinde
olması için dairenin merkezine uzaklığı yarıçaptan küçük olmalı. Uzaklığı **Pisagor** ile buluruz: yatay farkın karesi
artı dikey farkın karesi.

# --code--

```js
function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}
```

# --meaning--

- `find` returns the first hole for which the function returns true, or `undefined` if none does.
- `dx` and `dy` are how far the point is from the hole's middle, sideways and up/down.
- Comparing `dx² + dy²` with `R²` avoids a square root.

# --meaning-tr--

- `holes.find((hole) => { ... })` → listede, içteki fonksiyon `true` verdiği **ilk** deliği bulur; hiçbiri değilse
  `undefined`.
- `const dx = x - hole.x` → noktanın deliğin ortasından **yatay** uzaklığı; `dy` **dikey** uzaklığı.
- `dx * dx + dy * dy <= HOLE_R * HOLE_R` → Pisagor: uzaklığın **karesi** yarıçapın karesinden küçük ya da eşitse nokta
  dairenin içinde. İki tarafın karesini karşılaştırmak karekök hesaplamaktan daha kolay ve aynı sonucu verir.

# --task--

Above `update`, write `holeAt`.

# --task-tr--

`function update() {` satırının üstüne `holeAt` fonksiyonunu yaz (arada bir boş satır kalsın). **Çalıştır**.

# --predict--

A click at 30 pixels right and 30 pixels down from a hole's middle (radius 40). Is it inside?
- [ ] Yes, both 30s are smaller than 40
- [x] No: the real distance is about 42
  √(30² + 30²) ≈ 42.4, more than 40. A circle is not a square.

# --predict-tr--

Bir deliğin ortasından 30 piksel sağa ve 30 piksel aşağıya tıklanıyor (yarıçap 40). İçeride mi?
- [ ] Evet, iki 30 da 40'tan küçük
- [x] Hayır: gerçek uzaklık yaklaşık 42
  √(30² + 30²) ≈ 42,4; 40'tan büyük. Daire kare değildir.

# --tests--

A point inside a hole's circle should find that hole.
tr: Bir deliğin dairesi içindeki nokta o deliği bulmalı.

```js
assert.strictEqual(holeAt(60, 100), holes[0])
assert.strictEqual(holeAt(180 + 30, 220 - 20), holes[4])
```

A point outside every circle should find nothing, even near a hole's square corner.
tr: Hiçbir dairenin içinde olmayan nokta, bir deliğin karesinin köşesinde bile olsa bir şey bulmamalı.

```js
assert.isUndefined(holeAt(60 + 41, 100))
assert.isUndefined(holeAt(60 + 30, 100 + 30))
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
let nextPop = 0 // when the next mole pops up

function isUp(hole) {
  return now < hole.upUntil
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

function update() {
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + 1000
    }
    nextPop = now + 700
  }
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
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
