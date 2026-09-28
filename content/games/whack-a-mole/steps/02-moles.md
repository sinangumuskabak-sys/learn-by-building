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

**Bu adımda:** köstebekler çıkmaya başlayacak. Sağda deliklerin ortasında kahverengi köstebekler (daha küçük daireler)
belirecek, yaklaşık bir saniye kalıp kendiliğinden kaybolacak; her 0,7 saniyede bir yenisi çıkacak.

**Oyun döngüsü.** Artık resim kendiliğinden değişiyor, bu yüzden ekranı saniyede ~60 kez yeniden çizmemiz gerekir:

```js
function loop(time) {
  now = time
  update()   // durumu ilerlet
  draw()     // çiz
  requestAnimationFrame(loop)
}
```

`requestAnimationFrame(loop)` tarayıcıya "bir sonraki karede `loop`'u çağır" der. Tarayıcı çağırırken `loop`'a o anki
zamanı **milisaniye** (ms, saniyenin binde biri) olarak verir: `time` bir **parametredir**, yani fonksiyona verilen
değer. Onu her karede bir kez `now` değişkenine yazarız ki o karedeki her şey aynı zamana baksın.

**"Ne zamana kadar?" diye saklamak.** Her köstebek yaklaşık bir saniye yukarıda kalmalı. Her delik için kare kare geri
sayım yapmak yerine daha düzgün bir yol var: köstebeğin **ne zamana kadar** yukarıda olduğunu saklamak.

```js
hole.upUntil = now + 1000       // önümüzdeki 1000 ms boyunca yukarıda
const up = now < hole.upUntil   // şu an yukarıda mı?
```

Köstebek saklanırken hiçbir şey yapmamız gerekmez: `now`, `upUntil`'i geçince soru kendiliğinden "hayır" olur. `<`
"küçük mü?" demektir, cevabı `true` (doğru) ya da `false` (yanlış) olur. Bu tür zaman damgaları, süreli her şey için
(güçlendirme, dokunulmazlık, bekleme süresi) çok kullanışlıdır.

**Sıradaki köstebek.** Aynı fikir: `nextPop` "sıradaki köstebek ne zaman çıkacak?" `now >= nextPop` (`>=` "büyük ya da
eşit") olunca:

- `holes.filter((hole) => !isUp(hole))` → yukarıda köstebeği **olmayan** delikleri yeni bir listeye süzer. `filter`
  her eleman için oklu küçük fonksiyonu (`=>`) çalıştırır ve `true` diyenleri tutar. `!` "değil" demektir.
- `if (empty.length > 0)` → boş delik varsa (`length` listedeki eleman sayısı). `if` bir **koşuldur**: doğruysa `{ }`
  içini çalıştırır.
- `empty[Math.floor(Math.random() * empty.length)]` → rastgele bir boş delik. `Math.random()` 0 ile 1 arasında
  rastgele bir ondalık sayı verir; liste boyuyla çarpıp `Math.floor` ile aşağı yuvarlayınca rastgele bir sıra çıkar.
- `nextPop = now + 700` → bir sonraki 700 ms sonra.

**`return`.** `function isUp(hole) { return now < hole.upUntil }` → `return` sonucu geri verir; `isUp(delik)` diye
sorunca `true` ya da `false` alırsın.

# --task--

1. Give every hole `upUntil: 0`, and add `let now = 0` and `let nextPop = 0`.
2. Write `function isUp(hole)` that returns `now < hole.upUntil`.
3. Write `update()`: when `now >= nextPop`, pick a random hole among those that are not up, set its `upUntil` to
   `now + 1000`, and set `nextPop = now + 700`.
4. Write `loop(time)` that sets `now = time`, calls `update()` and `draw()`, and requests the next frame. Start it.
5. In `draw()`, draw a `'#92400e'` circle of radius `32` in every hole that has a mole up.

# --task-tr--

1. `holes.push(...)` satırında nesnenin sonuna `upUntil: 0` alanını ekle:

   ```js
       holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
   ```

2. Delik döngülerini kapatan iki `}`'nin altına bir satır boşluk bırakıp şunları ekle:

   ```js
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
   ```

3. `draw()` içindeki delik döngüsünü şöyle değiştir (`ctx.fillStyle = '#3f2d1d'` satırı döngünün içine taşınıyor,
   çünkü köstebek rengi onu her turda değiştiriyor):

   ```js
     for (const hole of holes) {
       ctx.fillStyle = '#3f2d1d'                    // ← taşındı
       ctx.beginPath()
       ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
       ctx.fill()
       if (isUp(hole)) {                            // ← yeni
         ctx.fillStyle = '#92400e'                  // ← yeni
         ctx.beginPath()                            // ← yeni
         ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2) // ← yeni
         ctx.fill()                                 // ← yeni
       }                                            // ← yeni
     }
   ```

4. En alttaki `draw()` satırını sil ve yerine oyun döngüsünü yaz:

   ```js
   function loop(time) {
     now = time
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

5. **Çalıştır**'a bas. Deliklerde köstebekler çıkıp kaybolmalı, aynı anda birkaç tane görebilirsin. Alttaki
   kontrollerin hepsi yeşil olmalı. Hiç köstebek çıkmıyorsa en alttaki `requestAnimationFrame(loop)` satırını kontrol et.

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
