---
title: A bird in the sling
title_tr: Sapanda bir kuş
skills: [game.canvas]
---

# --goal--

The bird is a red circle of radius `BIRD` sitting on top of the sling. Its color comes from a `MATERIALS` table,
which will later also hold wood, stone and pigs.

# --goal-tr--

Sıra kuşta: sapanın tepesine oturan **kırmızı bir daire**. Yarıçapı `BIRD` (10 piksel) olacak.

Kuşun rengini `MATERIALS` (malzemeler) adlı bir tabloya yazıyoruz. Şimdilik içinde yalnız kuş var; ileride tahta,
taş ve domuzlar da buraya gelecek. Her şeyin rengi ve ağırlığı tek bir yerde durursa oyunu ayarlamak kolaylaşır.

# --code--

```js
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(SLING.x, SLING.y, BIRD, 0, Math.PI * 2)
  ctx.fill()
```

# --meaning--

- `MATERIALS` is an object that holds objects: `MATERIALS.bird.color` is the bird's red. `density` will make heavy
  things heavy later.
- A circle is a **path**: `beginPath()` starts a new shape, `arc(x, y, radius, start, end)` traces the circle from
  angle `0` to `Math.PI * 2` (a full turn), and `fill()` paints its inside.

# --meaning-tr--

- `const BIRD = 10` → kuşun **yarıçapı**. Çapı 20: kuş aslında 20 × 20'lik bir kutuya sığar (yorum bunu söylüyor).
- `const MATERIALS = { bird: { ... } }` → **nesnenin içinde nesne**. `MATERIALS.bird` kuşun malzemesi,
  `MATERIALS.bird.color` onun rengi (`'#dc2626'`, kırmızı). `density` (yoğunluk) şimdilik kullanılmıyor; ileride
  ağır şeylerin ağır olmasını o sağlayacak.
- `ctx.fillStyle = MATERIALS.bird.color` → kalemi kuşun rengine boyar.
- Daire bir **yol** (path) olarak çizilir:
  - `ctx.beginPath()` → yeni bir şekle başla (eski şekille karışmasın).
  - `ctx.arc(x, y, yarıçap, başlangıç, bitiş)` → `(x, y)` merkezli bir çember çizer. `0`'dan `Math.PI * 2`'ye
    kadar, yani **tam tur**.
  - `ctx.fill()` → şeklin içini boyar.

# --task--

1. Under the `SLING` line write `BIRD` and `MATERIALS`.
2. In `draw`, under the sling post's `fillRect`, write the four circle lines.

# --task-tr--

1. `const SLING = ...` satırının hemen altına `BIRD` ve `MATERIALS`'ı yaz.
2. `draw` içinde, direği çizen `ctx.fillRect(SLING.x - 4, ...)` satırının **altına** daireyi çizen dört satırı yaz.
3. **Çalıştır**: direğin tepesinde kırmızı bir kuş görmelisin.

# --hint--

Without `ctx.beginPath()` and `ctx.fill()` the circle is not painted. Check the order: fillStyle, beginPath, arc, fill.

# --hint-tr--

`ctx.beginPath()` ve `ctx.fill()` olmadan daire boyanmaz. Sırayı kontrol et: fillStyle, beginPath, arc, fill.

# --try--

Change `Math.PI * 2` to `Math.PI`: you get half a circle. Put it back.

# --try-tr--

`Math.PI * 2` yerine `Math.PI` yaz: yarım daire çıkar. Sonra geri al.

# --tests--

A red circle of radius 10 should sit on top of the sling.
tr: Sapanın tepesinde yarıçapı 10 olan kırmızı bir daire olmalı.

```js
$.tick()
assert.strictEqual(MATERIALS.bird.color, '#dc2626')
assert.deepInclude($.arcs(), { x: 90, y: 220, r: 10, color: '#dc2626' })
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(SLING.x, SLING.y, BIRD, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
