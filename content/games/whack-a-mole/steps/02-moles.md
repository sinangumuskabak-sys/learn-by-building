---
title: Moles that pop up and hide
title_tr: Çıkıp saklanan köstebekler
skills: [game.state, game.loop]
---

# --explanation--

Each mole should be up for about a second, then hide by itself. You could count frames for every hole, but there is a
neater way: store **until when** the mole is up.

```js
hole.upUntil = now + 1000       // up for the next 1000 ms
const up = now < hole.upUntil   // is it up right now?
```

Nothing has to happen when a mole hides: once `now` passes `upUntil`, the check simply becomes false. A single
timestamp replaces a countdown you would otherwise have to decrease every frame. Timestamps ("until when?",
"since when?") are one of the handiest tools for anything that lasts a while: power-ups, invincibility,
cooldowns, animations.

`now` comes from the game loop: `requestAnimationFrame` passes your function the current time in milliseconds.
Store it in a variable once per frame, so everything in that frame agrees on the same time.

New moles appear on a similar schedule: when `now` reaches `nextPop`, raise a mole in a random **empty** hole and set
the next pop 700 ms later.

# --explanation-tr--

Her köstebek yaklaşık bir saniye yukarıda kalmalı, sonra kendi kendine saklanmalı. Her delik için kare sayabilirsin ama
daha şık bir yol var: köstebeğin **ne zamana kadar** yukarıda olduğunu sakla.

```js
hole.upUntil = now + 1000       // sonraki 1000 ms boyunca yukarıda
const up = now < hole.upUntil   // şu an yukarıda mı?
```

Köstebek saklanırken hiçbir şeyin olması gerekmez: `now` `upUntil`'i geçince kontrol kendiliğinden yanlış olur. Tek bir
zaman damgası, yoksa her karede azaltman gerekecek bir geri sayımın yerini alır. Zaman damgaları ("ne zamana kadar?",
"ne zamandan beri?") bir süre devam eden her şey için en kullanışlı araçlardan biridir: güçlendirmeler, dokunulmazlık,
bekleme süreleri, animasyonlar.

`now` oyun döngüsünden gelir: `requestAnimationFrame` fonksiyonuna o anki zamanı milisaniye olarak verir. Onu her
karede bir kez bir değişkene yaz; böylece o karedeki her şey aynı zamanda anlaşır.

Yeni köstebekler benzer bir takvimle çıkar: `now` `nextPop`'a ulaşınca rastgele **boş** bir delikten bir köstebek
çıkar ve bir sonrakini 700 ms sonraya ayarla.

# --task--

1. Give every hole `upUntil: 0`, and add `let now = 0` and `let nextPop = 0`.
2. Write `function isUp(hole)` that returns `now < hole.upUntil`.
3. Write `update()`: when `now >= nextPop`, pick a random hole among those that are not up, set its `upUntil` to
   `now + 1000`, and set `nextPop = now + 700`.
4. Write `loop(time)` that sets `now = time`, calls `update()` and `draw()`, and requests the next frame. Start it.
5. In `draw()`, draw a `'#92400e'` circle of radius `32` in every hole that has a mole up.

# --task-tr--

1. Her deliğe `upUntil: 0` ver; `let now = 0` ve `let nextPop = 0` ekle.
2. `now < hole.upUntil` döndüren `function isUp(hole)` yaz.
3. `update()` yaz: `now >= nextPop` olunca, yukarıda olmayan delikler arasından rastgele birini seç, `upUntil`'ini
   `now + 1000` yap ve `nextPop = now + 700` ayarla.
4. `now = time` yapan, `update()` ve `draw()` çağıran ve sonraki kareyi isteyen `loop(time)` yaz. Başlat.
5. `draw()` içinde köstebeği yukarıda olan her deliğe `32` yarıçaplı `'#92400e'` bir daire çiz.

# --tests--

`isUp()` should compare the current time with `upUntil`.
tr: `isUp()` o anki zamanı `upUntil` ile karşılaştırmalı.

```js
assert.isTrue(holes.every((h) => h.upUntil === 0))
now = 500
assert.isFalse(isUp({ upUntil: 500 }))
assert.isTrue(isUp({ upUntil: 501 }))
```

A mole should pop up right away, and a new one every 700 ms.
tr: Bir köstebek hemen çıkmalı, her 700 ms'de bir de yenisi.

```js
$.tick()
assert.strictEqual(holes.filter(isUp).length, 1)
$.run(0.6)
assert.strictEqual(holes.filter(isUp).length, 1)
$.run(0.2)
assert.strictEqual(holes.filter(isUp).length, 2)
```

Each mole should hide by itself after one second.
tr: Her köstebek bir saniye sonra kendi kendine saklanmalı.

```js
$.tick()
const first = holes.find(isUp)
$.run(0.95)
assert.isTrue(isUp(first))
$.run(0.1)
assert.isFalse(isUp(first))
```

New moles should only pop up in empty holes, and moles should be drawn.
tr: Yeni köstebekler yalnızca boş deliklerden çıkmalı ve köstebekler çizilmeli.

```js
for (const hole of holes) hole.upUntil = 1e9
holes[4].upUntil = 0
now = 5000
nextPop = 0
update()
assert.isTrue(isUp(holes[4]))
draw()
assert.lengthOf($.arcs().filter((a) => a.color === '#92400e' && a.r === 32), 9)
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
