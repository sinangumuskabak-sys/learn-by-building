---
title: Six cities to protect
title_tr: Korunacak altı şehir
skills: [game.canvas, prog.arrays]
---

# --goal--

Every game needs something to lose. Here it is six cities standing on the ground under a night sky.

# --goal-tr--

Her oyunda kaybedilecek bir şey olmalı. Bu oyunda o şey, yerde duran **altı şehir**. Füzeler gökten düşecek, sen de
onları durduracaksın.

İlk adımda sahneyi çiziyoruz: gece mavisi bir gökyüzü, kahverengi bir zemin ve zeminin üstünde altı mavi blok.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const CITY_XS = [50, 110, 170, 310, 370, 430]

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#854d0e'
ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

ctx.fillStyle = '#38bdf8'
for (const x of CITY_XS) {
  ctx.fillRect(x - 16, GROUND - 14, 32, 14)
}
```

# --meaning--

- `canvas` and `ctx` are the canvas and its 2D drawing context.
- `GROUND` is the y where the ground starts; `CITY_XS` lists the middle x of each city.
- The sky covers everything; the ground goes from `GROUND` down to the bottom (30 pixels).
- `for (const x of CITY_XS)` draws one 32×14 block per city, centered on its x and standing on the ground.

# --meaning-tr--

- `canvas`, `ctx` → sayfadaki canvas ve onun **2D çizim kalemi**. Bütün çizimler `ctx.` ile başlar.
- `const GROUND = 370` → zeminin başladığı yükseklik. Canvas'ta `y` **aşağı** doğru büyür; 370 alta yakın.
- `const CITY_XS = [...]` → altı şehrin **orta** noktalarının `x`'leri, bir **liste** (dizi) içinde.
- İlk iki satır gökyüzünü (bütün alan), sonraki iki satır zemini boyar: `GROUND`'dan başlayıp
  `canvas.height - GROUND` (400 − 370 = 30) piksel boyunda.
- `for (const x of CITY_XS) { ... }` → **döngü**: listedeki her sayı için, sırayla, ona `x` de ve içini çalıştır.
  Altı sayı = altı şehir.
- `ctx.fillRect(x - 16, GROUND - 14, 32, 14)` → 32 piksel eninde, 14 piksel boyunda bir blok. `x - 16` onu `x`'e
  **ortalar** (yarım en sola), `GROUND - 14` onu zeminin **üstüne** oturtur.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz; boş satırları da aynen bırak. **Çalıştır**'a bas: koyu gökyüzü,
kahverengi zemin ve altı mavi şehir görmelisin.

# --hint--

Draw the cities **after** the sky and the ground, or the sky paints over them.

# --hint-tr--

Şehirleri gökyüzü ve zeminden **sonra** çiz; yoksa gökyüzü onların üstünü boyar.

# --tests--

The sky and the ground should be drawn.
tr: Gökyüzü ve zemin çizilmeli.

```js
assert.lengthOf($.rects('#020617').filter((r) => r.w === 480 && r.h === 400), 1)
assert.deepEqual($.rects('#854d0e').map((r) => [r.x, r.y, r.w, r.h]), [[0, 370, 480, 30]])
```

Six cities should stand on the ground, centered on `CITY_XS`.
tr: Altı şehir zeminde, `CITY_XS`'e ortalanmış durmalı.

```js
const blocks = $.rects('#38bdf8')
assert.lengthOf(blocks, 6)
assert.deepEqual(blocks.map((r) => r.x + 16), [50, 110, 170, 310, 370, 430])
assert.deepEqual([blocks[0].y, blocks[0].w, blocks[0].h], [356, 32, 14])
```

# --seed--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const CITY_XS = [50, 110, 170, 310, 370, 430]

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#854d0e'
ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

ctx.fillStyle = '#38bdf8'
for (const x of CITY_XS) {
  ctx.fillRect(x - 16, GROUND - 14, 32, 14)
}
```
