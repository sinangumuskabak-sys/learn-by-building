---
title: Whack!
title_tr: Vur!
skills: [game.input, game.collision]
---

# --explanation--

Is the click on a hole? The holes are circles, and a point is inside a circle when its **distance from the center** is
at most the radius. By Pythagoras, the distance is `√(dx² + dy²)`. Comparing squares gives the same answer without
the square root:

```js
const dx = x - hole.x
const dy = y - hole.y
dx * dx + dy * dy <= HOLE_R * HOLE_R   // inside (or on the edge of) the circle
```

A square hit area would also work, but it would count clicks in the empty corners around each hole. Match the hit area
to the shape the player sees.

When a click lands on a hole with a mole up: add a point and hide the mole **immediately**, by setting `upUntil` to
`0`. Clicking an empty hole does nothing. Use `pointerdown` rather than `click`: it fires the moment the button goes
down, which feels more responsive in a reaction game, and it works for touch too.

# --explanation-tr--

**Bu adımda:** köstebeklere vurabileceksin. Yukarıdaki bir köstebeğe tıklayınca hemen kaybolur ve sol üstteki
`Score:` 1 artar. Boş bir deliğe tıklamak hiçbir şey yapmaz.

**Tıklama bir deliğin üstünde mi?** Delikler daire. Bir nokta, dairenin **merkezine uzaklığı** yarıçaptan büyük
değilse dairenin içindedir. Uzaklık, Pisagor'la `√(dx² + dy²)`'dir (`dx` yatay fark, `dy` dikey fark). Karekök almak
yerine iki tarafın karesini karşılaştırırız, cevap aynı çıkar:

```js
const dx = x - hole.x
const dy = y - hole.y
dx * dx + dy * dy <= HOLE_R * HOLE_R   // dairenin içinde (ya da tam kenarında)
```

`<=` "küçük ya da eşit" demektir. Kare bir alan da işe yarardı ama deliğin çevresindeki boş köşelere yapılan
tıklamaları da sayardı. Tıklama alanı, oyuncunun gördüğü şekle uymalı.

**`find` ile aramak.** `holes.find((hole) => { ... })` delikleri sırayla gezer ve ok fonksiyonu `true` döndüren
**ilk** deliği verir; hiçbiri tutmazsa `undefined` ("hiçbir şey") verir. Ok fonksiyonunun gövdesi birkaç satırsa
`{ }` içine yazılır ve sonuç `return` ile verilir.

**Olay (event) dinlemek.** Tıklama gibi kullanıcı hareketlerine **olay** denir. "Şu olunca şunu yap" deriz:

```js
canvas.addEventListener('pointerdown', (event) => {
  // canvas'a basıldığı anda burası çalışır
})
```

`'click'` yerine `'pointerdown'` kullanırız: tuş **basıldığı anda** gelir (bırakılmayı beklemez), refleks oyununda
daha çabuk hissettirir; parmakla dokunmada da çalışır. `event.clientX` ve `event.clientY` farenin ekrandaki
konumudur. Canvas ekranda farklı boyda gösterilebildiği için bu konumu canvas piksellerine çeviririz:
`canvas.getBoundingClientRect()` canvas'ın ekrandaki yerini ve boyunu verir; önce sol/üst kenarı çıkarır, sonra
ölçekle çarparız. Bu iki satırı her canvas oyununda aynen kullanırsın.

**Vuruş.** `if (hole && isUp(hole))` → "delik bulunduysa **ve** (`&&`) içinde köstebek varsa". O zaman
`score += 1` (skoru 1 artır; `score = score + 1`'in kısası) ve `hole.upUntil = 0` (köstebeği hemen indir; 0 her zaman
geçmişte kaldığı için `isUp` artık `false` der).

**Skoru yazmak.** `ctx.font` yazı tipini, `ctx.textAlign = 'left'` hizalamayı ayarlar; `ctx.fillText(yazı, x, y)`
yazıyı çizer. `'Score: ' + score` yazı ile sayıyı birleştirir: `'Score: 3'`.

# --task--

1. Add `let score = 0`.
2. Write `function holeAt(x, y)` that returns the hole whose circle contains the canvas point `(x, y)`, or
   `undefined`.
3. On `pointerdown` on the canvas: convert to canvas pixels (position and scale), find the hole, and if a mole is up
   in it, add a point and set its `upUntil` to `0`.
4. Draw `Score: 3` (the real number) in the top strip: white, `'bold 20px sans-serif'`, left-aligned at `(12, 28)`.

# --task-tr--

1. `let nextPop = 0` satırının hemen altına ekle:

   ```js
   let score = 0
   ```

2. `isUp` fonksiyonunun kapanış `}`'sinden sonra, `function update()`'ten önce bir satır boşluk bırakıp şunları ekle:

   ```js
   function holeAt(x, y) {
     return holes.find((hole) => {
       const dx = x - hole.x
       const dy = y - hole.y
       return dx * dx + dy * dy <= HOLE_R * HOLE_R
     })
   }

   canvas.addEventListener('pointerdown', (event) => {
     // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
     const rect = canvas.getBoundingClientRect()
     const x = (event.clientX - rect.left) * (canvas.width / rect.width)
     const y = (event.clientY - rect.top) * (canvas.height / rect.height)
     const hole = holeAt(x, y)
     if (hole && isUp(hole)) {
       score += 1
       hole.upUntil = 0
     }
   })
   ```

3. `draw()` fonksiyonunun sonunda, delik döngüsünü kapatan `}`'den sonra ve fonksiyonun kapanış `}`'sinden önce bir
   satır boşluk bırakıp skoru çiz:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 20px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Score: ' + score, 12, 28)
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla: çıkan köstebeklere tıkla. Vurduğun köstebek hemen kaybolmalı ve
   sol üstteki `Score:` artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kenar kontrolü kırmızıysa `<=`'yi (`<` değil)
   kontrol et.

# --tests--

`holeAt()` should use the circle, not the cell.
tr: `holeAt()` hücreyi değil daireyi kullanmalı.

```js
assert.strictEqual(holeAt(60, 100), holes[0])
assert.strictEqual(holeAt(60 + 40, 100), holes[0], 'on the edge')
assert.strictEqual(holeAt(60 + 28, 100 + 28), holes[0], 'inside, diagonally')
assert.isUndefined(holeAt(60 + 30, 100 + 30), 'the corner of the cell is outside the circle')
assert.isUndefined(holeAt(180, 20), 'the top strip')
assert.strictEqual(holeAt(300, 340), holes[8])
```

Hitting a mole should score and hide it at once.
tr: Bir köstebeğe vurmak puan kazandırmalı ve onu hemen saklamalı.

```js
$.tick()
const hole = holes.find(isUp)
$.pointerDown(hole.x + 10, hole.y - 10)
assert.strictEqual(score, 1)
assert.isFalse(isUp(hole))
$.pointerDown(hole.x, hole.y)
assert.strictEqual(score, 1, 'hitting an empty hole does nothing')
```

The score should be shown.
tr: Skor gösterilmeli.

```js
score = 7
$.tick()
assert.include($.texts(), 'Score: 7')
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
let score = 0

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

canvas.addEventListener('pointerdown', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
  }
})

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
