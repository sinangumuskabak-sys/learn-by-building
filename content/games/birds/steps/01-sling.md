---
title: The sling
title_tr: Sapan
skills: [game.canvas]
---

# --goal--

We are building a slingshot game: pull a bird back, let go, knock down towers. Everything is drawn on the page's
`<canvas>`. The first thing we draw is the sling's wooden post.

# --goal-tr--

Angry Birds tarzı bir oyun yapıyoruz: kuşu sapanda geri çek, bırak, kuleleri devir. Oyundaki her şey sayfadaki
**canvas** (tuval) üzerine çizilir: 560 piksel eninde, 320 piksel boyunda bir resim alanı.

İlk çizimimiz **sapanın tahta direği**. Önce canvas'ı ve çizim kalemini alacağız, sonra zeminin ve sapanın yerini iki
sabite yazıp direği boyayacağız.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched

ctx.fillStyle = '#78350f'
ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
```

# --meaning--

- `getElementById('game')` finds the canvas; `getContext('2d')` gives `ctx`, the object with all the drawing commands.
- `GROUND` is the `y` where the ground starts. `SLING` is an object: the top of the sling, `SLING.x` and `SLING.y`.
- On a canvas `(0, 0)` is the top-left corner and `y` grows **downwards**.
- `fillRect(x, y, width, height)` paints a rectangle in the `fillStyle` color: 8 pixels wide, centered on `SLING.x`,
  from the top of the sling down to the ground.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği (id) `game` olan öğeyi, yani canvas'ı bulur.
- `canvas.getContext('2d')` → canvas'ın **2B çizim kalemini** verir. Adı `ctx`; bütün çizim komutları `ctx.` ile başlar.
- `const GROUND = 290` → zeminin başladığı yükseklik. Canvas'ta **(0, 0) sol üst köşedir**; `x` sağa, `y` **aşağı**
  doğru büyür. Yani 290, yukarıdan 290 piksel aşağısı: alttan 30 piksel.
- `const SLING = { x: 90, y: 220 }` → bir **nesne** (object): iki bilgiyi tek pakette tutar. İçindekine nokta ile
  ulaşılır: `SLING.x` 90, `SLING.y` 220. Bu nokta sapanın tepesi; kuş fırlatılmadan önce burada durur.
- `ctx.fillStyle = '#78350f'` → kalemin rengini koyu kahverengi yapar.
- `ctx.fillRect(x, y, en, boy)` → içi dolu bir dikdörtgen çizer:
  - `SLING.x - 4` → direk 8 piksel enli; 4 sola kaydırınca tam `SLING.x`'in ortasına oturur.
  - `SLING.y` → sapanın tepesinden başlar.
  - `GROUND - SLING.y` → boyu: tepeden zemine kadar, 290 − 220 = 70 piksel.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz ve **Çalıştır**'a bas. Beyaz alanın solunda
ince, kahverengi bir direk görmelisin.

# --hint--

`SLING.x - 4` centers the 8-pixel post; `GROUND - SLING.y` is its height (70).

# --hint-tr--

`SLING.x - 4` 8 piksellik direği ortalar; `GROUND - SLING.y` onun boyudur (70). `getElementById` içindeki büyük harflere dikkat.

# --try--

Change `8` to `30` and run: the post gets fat. Put `8` back.

# --try-tr--

`8`'i `30` yap ve çalıştır: direk kalınlaşır. Sonra `8`'e geri al.

# --tests--

The sling post should be drawn: 8 wide, centered on `SLING.x`, from `SLING.y` down to `GROUND`.
tr: Sapan direği çizilmeli: 8 piksel enli, `SLING.x`'e ortalı, `SLING.y`'den `GROUND`'a kadar.

```js
assert.strictEqual(GROUND, 290)
assert.deepEqual(SLING, { x: 90, y: 220 })
assert.deepInclude($.rects('#78350f'), { x: 86, y: 220, w: 8, h: 70, color: '#78350f' })
```

# --seed--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
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

ctx.fillStyle = '#78350f'
ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
```
