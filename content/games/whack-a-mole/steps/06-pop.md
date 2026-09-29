---
title: Moles pop up
title_tr: Köstebekler çıkıyor
skills: [game.state, game.loop]
---

# --goal--

Every 700 ms a mole pops up in a random empty hole and stays up for one second.

# --goal-tr--

Her **700 milisaniyede** bir, rastgele **boş** bir delikten bir köstebek çıksın ve **bir saniye** dışarıda kalsın.
Sıradaki köstebeğin ne zaman çıkacağını `nextPop`'ta tutuyoruz. Bu işi yapan `update` (güncelle) fonksiyonunu döngü
her turda çağıracak.

# --code--

```js
let nextPop = 0 // when the next mole pops up

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

  update()
```

# --meaning--

- When it is time (`now >= nextPop`), pick among the holes without a mole.
- A random index into that list picks one; its mole stays up until one second from now.
- The next pop is 700 ms later.

# --meaning-tr--

- `if (now >= nextPop)` → yeni köstebek zamanı geldi mi?
- `holes.filter((hole) => !isUp(hole))` → köstebeği **olmayan** delikler. `!` "değil" demek.
- `Math.floor(Math.random() * empty.length)` → 0 ile listenin uzunluğu arasında rastgele bir **sıra numarası**.
- `hole.upUntil = now + 1000` → köstebek şu andan itibaren 1000 ms dışarıda.
- `nextPop = now + 700` → sıradaki 700 ms sonra.
- `update()` döngüde `draw()`'dan önce: önce durum değişir, sonra çizilir.

# --task--

1. Under `let now`, write `let nextPop = 0`.
2. Above `function draw() {`, write `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `let now ...` satırının altına `let nextPop = 0 ...` yaz.
2. `function draw() {` satırının üstüne `update` fonksiyonunu yaz (arada bir boş satır kalsın).
3. `loop` içinde `draw()` satırının üstüne `update()` yaz.
4. **Çalıştır**: köstebekler çıkıp saklanmalı.

# --predict--

How many moles can be up at the same time?
- [ ] Always exactly one
- [x] Sometimes two
  One stays up for 1000 ms, but a new one comes every 700 ms, so for a moment two overlap.
- [ ] All nine

# --predict-tr--

Aynı anda kaç köstebek dışarıda olabilir?
- [ ] Her zaman tam bir tane
- [x] Bazen iki
  Biri 1000 ms kalıyor ama 700 ms'de bir yenisi geliyor; bir süre ikisi birlikte görünür.
- [ ] Dokuzu da

# --tests--

A mole should pop up right away, and a new one every 700 ms.
tr: Hemen bir köstebek çıkmalı, sonra her 700 ms'de bir yenisi.

```js
$.tick()
assert.strictEqual(holes.filter(isUp).length, 1)
$.run(0.6)
assert.strictEqual(holes.filter(isUp).length, 1)
$.run(0.2)
assert.strictEqual(holes.filter(isUp).length, 2)
```

Each mole should hide by itself after one second.
tr: Her köstebek bir saniye sonra kendiliğinden saklanmalı.

```js
$.tick()
const first = holes.find(isUp)
$.run(0.95)
assert.isTrue(isUp(first))
$.run(0.1)
assert.isFalse(isUp(first))
```

New moles should only pop up in empty holes.
tr: Yeni köstebekler yalnız boş deliklerden çıkmalı.

```js
for (const hole of holes) hole.upUntil = 1e9
holes[4].upUntil = 0
now = 5000
nextPop = 0
update()
assert.isTrue(isUp(holes[4]))
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
