---
title: Random hills
title_tr: Rastgele tepeler
skills: [prog.arrays]
---

# --goal--

The moon's surface is a list of heights, one every 40 pixels. Random heights make hills. First we only make the list.

# --goal-tr--

Ay'ın yüzeyini bir **yükseklik listesi** olarak tutacağız: her 40 pikselde bir nokta, her noktanın bir `y`'si.
Noktaları düz çizgilerle birleştirince tepeler çıkacak. Yükseklikler **rastgele** olacak; her oyunda başka bir arazi.

Bu adımda yalnız listeyi yapıyoruz; ekranda henüz bir şey görünmeyecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...

function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
}

makeGround()
```

# --meaning--

- `STEP` is the distance between two ground points.
- 480 / 40 + 1 = 13 points: one at x = 0, 40, 80, ... 480.
- `Array.from({ length: points }, () => ...)` makes a list of that length, filling each place with what the arrow
  function returns: a random height from 210 to 330.

# --meaning-tr--

- `canvas`, `ctx` → sayfadaki canvas ve onun **2D çizim kalemi**.
- `const STEP = 40` → iki zemin noktası arasındaki yatay mesafe.
- `let ground` → yükseklik listesi. Yorum ne tuttuğunu söylüyor: `x` = 0, 40, 80... noktalarındaki zeminin `y`'si.
- `const points = canvas.width / STEP + 1` → 480 / 40 = 12 aralık, uçlarıyla birlikte **13 nokta**.
- `Array.from({ length: points }, () => ...)` → `points` uzunluğunda **yeni bir liste** yapar; her yerine oktaki
  küçük fonksiyonun verdiğini koyar.
- `210 + Math.random() * 120` → `Math.random()` 0 ile 1 arasında rastgele bir sayı; 120 ile çarpıp 210 ekleyince
  **210 ile 330** arası bir yükseklik. (Canvas'ta `y` aşağı doğru büyür: bunlar alanın alt yarısı.)
- En alttaki `makeGround()` → fonksiyonu bir kez çalıştırır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz; boş satırları da aynen bırak. **Çalıştır**'a bas: ekran boş kalır,
ama alttaki kontroller yeşil olmalı.

# --hint--

`Array.from` takes two things: `{ length: points }` and a function `() => 210 + Math.random() * 120`.

# --hint-tr--

`Array.from` iki şey alır: `{ length: points }` ve bir fonksiyon: `() => 210 + Math.random() * 120`.

# --tests--

`ground` should have 13 heights.
tr: `ground` 13 yükseklik içermeli.

```js
assert.strictEqual(STEP, 40)
assert.lengthOf(ground, 13)
```

The heights should be random, from 210 to 330.
tr: Yükseklikler 210 ile 330 arasında rastgele olmalı.

```js
assert.isTrue(ground.every((y) => y >= 210 && y <= 330))
assert.isAbove(new Set(ground).size, 10)
```

# --seed--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...

function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
}

makeGround()
```
