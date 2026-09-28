---
title: A ship that points somewhere
title_tr: Bir yöne bakan gemi
skills: [game.canvas, game.physics]
---

# --explanation--

So far every game moved in four directions. The ship here can face **any** angle, so you need the one bit of
trigonometry that game programmers use every day:

> A direction at angle `a` (in radians) is the vector `(Math.cos(a), Math.sin(a))`.

Angle `0` points right: `(1, 0)`. Because `y` grows downwards on a canvas, `Math.PI / 2` points **down** and
`-Math.PI / 2` points **up**. A full turn is `2π`.

To find a point at distance `r` from the center in direction `a`, scale the direction vector:

```js
x = ship.x + Math.cos(a) * r
y = ship.y + Math.sin(a) * r
```

The ship is a triangle with three such points: the nose at `angle`, and two back corners at `angle + 2.5` and
`angle - 2.5` (about 143° either side). Draw it as a **path** of lines and `stroke()` it instead of filling it, for the
glowing-vector look of the 1979 arcade original.

# --explanation-tr--

**Bu adımda:** siyah bir uzayın ortasına, yukarı bakan beyaz çizgili bir üçgen gemi çizeceğiz. Çalıştırınca sağda
siyah bir alan ve ortasında küçük bir üçgen göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 600 piksel eninde, 450 piksel boyunda boş bir resim alanı var. Adı `canvas`,
kimliği (id) `game`. Oyundaki her şeyi bu alanın üstüne **boyayarak** göstereceğiz: önce kâğıdı bulursun, sonra
eline fırçayı alırsın.

```js
const canvas = document.getElementById('game')   // kâğıdı bul
const ctx = canvas.getContext('2d')              // fırçayı al
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir kutuya
  etiket yapıştırmak gibi, sonra hep o adla çağırırsın ve içi değişmez.
- `document.getElementById('game')` → "sayfada kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` çizim aracıdır (bağlam, **context**). `ctx.fillStyle = 'white'` fırçanın rengini seçer,
  `ctx.fillRect(x, y, en, boy)` bir dikdörtgen boyar.

**Konum:** canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Ortası
`(300, 225)`'tir. Renkler `'white'` gibi adlarla ya da `'#000000'` (siyah) gibi kodlarla yazılır.

**`let` ve nesne.** `let ship` de bir ad koyar ama `const`'tan farkı, içine sonra **başka bir şey konabilmesidir**.
Gemiyi birkaç bilgiyle birlikte tek bir **nesne** (object) içinde tutarız:

```js
ship = { x: 300, y: 225, angle: 0 }
```

Süslü parantez `{ }` bir nesne kurar; içinde `ad: değer` çiftleri virgülle ayrılır. Bu bilgilere `ship.x`,
`ship.angle` diye nokta ile ulaşırsın. `vx` ve `vy` geminin sağa ve aşağı **hızı** olacak (şimdilik 0).

**Fonksiyon (function)** bir talimat paketine ad vermektir. Tarif yazmak gibi: yazmak onu pişirmez, sadece hazırlar.

```js
function resetShip() {
  // buradaki satırlar paketin içi
}
resetShip()   // şimdi çalıştır (çağır)
```

`function ad() { ... }` paketi **tanımlar**, `ad()` ise onu **çağırır**, yani içindekileri yaptırır.

**Açılar ve yön.** Gemi her yöne bakabilmeli. Yönü bir **açı** ile tutarız; JavaScript açıyı derece değil **radyan**
ile ölçer. `Math.PI` (π, yaklaşık 3,14) yarım turdur, tam tur `2 * Math.PI`'dir.

- Açı `0` → sağa bakar.
- `Math.PI / 2` → **aşağı** bakar (çünkü `y` aşağı doğru büyür).
- `-Math.PI / 2` → **yukarı** bakar. Eksi işareti "ters yöne" demek.

Bir açıdan yön bulmak için iki hazır hesap var: `Math.cos(a)` o yönün sağa ne kadar gittiğini, `Math.sin(a)` aşağı ne
kadar gittiğini verir (her biri -1 ile 1 arasında). Merkezden `a` yönünde `r` piksel ötedeki nokta:

```js
x = ship.x + Math.cos(a) * r
y = ship.y + Math.sin(a) * r
```

`*` çarpma, `+` toplama demektir. Yani "merkezden başla, o yöne `r` adım at".

**Gemi üçgeni** üç böyle noktadır: burun `angle` yönünde, iki arka köşe `angle + 2.5` ve `angle - 2.5` yönünde (iki
yana yaklaşık 143°). Hepsi merkezden `SHIP_R` (14) piksel uzakta.

**Çizgiyle çizmek.** 1979'daki orijinal oyun gibi içi boş, parlayan çizgiler istiyoruz. Bunun için bir **yol** (path)
çizeriz, kalemi kâğıttan kaldırmadan:

- `ctx.beginPath()` → yeni bir çizime başla.
- `ctx.moveTo(x, y)` → kalemi o noktaya götür (çizmeden).
- `ctx.lineTo(x, y)` → oraya kadar çizgi çek.
- `ctx.closePath()` → başladığın noktaya geri dönerek şekli kapat.
- `ctx.stroke()` → çizgileri boya. `strokeStyle` çizgi rengi, `lineWidth` çizgi kalınlığıdır.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const SHIP_R = 14`.
2. Add `let ship` and `function resetShip()` that puts the ship in the center of the canvas, facing up
   (`angle: -Math.PI / 2`), with `vx: 0, vy: 0`.
3. Write `drawShip()`: compute the nose at `angle` and the back corners at `angle + 2.5` and `angle - 2.5`, all at
   distance `SHIP_R`; then `beginPath()`, `moveTo` the nose, `lineTo` the two corners, `closePath()` and `stroke()`.
4. `draw()`: black background, `strokeStyle = 'white'`, `lineWidth = 2`, then the ship. Call `resetShip()` and
   `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boş bırak ve geminin boyunu yaz:

   ```js
   const SHIP_R = 14 // the ship's size: distance from its center to its nose
   ```

3. Bir satır boş bırak, gemiyi tutacak adı ve gemiyi ortaya koyan fonksiyonu yaz:

   ```js
   let ship

   function resetShip() {
     ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
   }
   ```

   `canvas.width / 2` canvas'ın eninin yarısı (300), `canvas.height / 2` boyunun yarısı (225). `/` bölme demektir.
   Açı `-Math.PI / 2` olduğu için gemi yukarı bakar.

4. Altına gemiyi çizen fonksiyonu yaz. Önce üç köşeyi hesaplar, sonra çizgileri çeker:

   ```js
   function drawShip() {
     const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
     const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
     const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
     ctx.beginPath()
     ctx.moveTo(tip.x, tip.y)
     ctx.lineTo(left.x, left.y)
     ctx.lineTo(right.x, right.y)
     ctx.closePath()
     ctx.stroke()
   }
   ```

   `tip` burun, `left` ve `right` arka köşeler. Her biri `x` ve `y` taşıyan küçük bir nesne.

5. Altına bütün ekranı çizen fonksiyonu yaz: önce siyah arka plan, sonra beyaz 2 piksel çizgi ayarı, sonra gemi:

   ```js
   function draw() {
     ctx.fillStyle = '#000000'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.strokeStyle = 'white'
     ctx.lineWidth = 2

     drawShip()
   }
   ```

6. En alta, bir satır boşluk bırakıp iki fonksiyonu çağır. Şimdiye kadar yazdıkların sadece tarifti; bu iki satır
   onları çalıştırır:

   ```js
   resetShip()
   draw()
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda siyah alanın ortasında yukarı bakan beyaz bir üçgen görmelisin
   ve alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata: büyük/küçük harf (`SHIP_R`, `Math.PI`) ya
   da eksik bir parantez. Yazdığını yukarıdakilerle harf harf karşılaştır.

# --tests--

The ship should start in the middle, facing up.
tr: Gemi ortada, yukarı bakarak başlamalı.

```js
assert.include(ship, { x: 300, y: 225, vx: 0, vy: 0 })
assert.closeTo(ship.angle, -Math.PI / 2, 1e-9)
```

The nose should be drawn 14 pixels in the direction the ship faces.
tr: Burun, geminin baktığı yönde 14 piksel ötede çizilmeli.

```js
const start = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(start.args[0], 300, 0.001)
assert.closeTo(start.args[1], 211, 0.001)
assert.lengthOf($.screen().filter((c) => c.op === 'lineTo'), 2)
assert.isTrue($.screen().some((c) => c.op === 'stroke' && c.stroke === 'white'))
```

Turning the ship should turn its nose.
tr: Gemiyi döndürmek burnunu da döndürmeli.

```js
ship.angle = 0
draw()
const nose = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(nose.args[0], 314, 0.001)
assert.closeTo(nose.args[1], 225, 0.001)
ship.angle = Math.PI / 2
draw()
const down = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(down.args[1], 239, 0.001, 'PI / 2 points down, because y grows downwards')
```

# --seed--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose

let ship

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
  const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2

  drawShip()
}

resetShip()
draw()
```
