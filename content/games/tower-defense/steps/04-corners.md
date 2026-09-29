---
title: The road as corners
title_tr: Köşelerden yol
skills: [prog.arrays]
---

# --goal--

Enemies will walk along a winding road. Listing every road tile by hand would be long and easy to get wrong; we list
only the **corners**, as `[column, row]`, and let the code fill in the straight lines between them later.

# --goal-tr--

Düşmanlar kıvrılan bir **yol** boyunca yürüyecek. Yolun her karesini tek tek yazmak uzun sürer ve hata yapmak kolay.
Onun yerine yalnız **köşeleri** yazıyoruz; aradaki düz çizgileri bir sonraki adımda kod dolduracak.

Her köşe `[sütun, satır]` biçiminde iki sayı. Yol ekranın **solunun dışından** (`-1`. sütun) başlar ve **sağının
dışında** (`12`. sütun) biter: düşmanlar soldan girip sağdan çıkar. Ekranda henüz fark olmayacak.

# --code--

```js
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]
```

# --meaning--

- `PATH` is an array of arrays; each corner is `[column, row]`.
- From one corner to the next, only one number changes: the road runs straight across or straight down or up.

# --meaning-tr--

- `const PATH = [ ... ]` → **dizilerden oluşan bir dizi**: her eleman bir köşe, `[sütun, satır]`.
- `[-1, 1]` → 1. satırda, haritanın hemen solunda. `[3, 1]` → aynı satırda 3. sütun: yol sağa gidiyor.
  `[3, 6]` → aynı sütunda 6. satır: aşağı dönüyor. Ve böyle devam.
- Art arda iki köşede sayılardan yalnız **biri** değişir: yol hep dümdüz yatay ya da dikey gider.

# --task--

Under the `TOP` line write the comment and `PATH`.

# --task-tr--

1. `const TOP = ...` satırının altına yorumu ve `PATH`'i yaz (her köşe ayrı satırda).
2. **Çalıştır**: ekranda fark yok; kontroller yeşil olmalı.

# --tests--

`PATH` should list the eight corners of the road.
tr: `PATH` yolun sekiz köşesini listelemeli.

```js
assert.deepEqual(PATH, [[-1, 1], [3, 1], [3, 6], [7, 6], [7, 2], [10, 2], [10, 7], [12, 7]])
```

From corner to corner, the road should go straight.
tr: Köşeden köşeye yol dümdüz gitmeli.

```js
for (let i = 1; i < PATH.length; i++) {
  const [ax, ay] = PATH[i - 1]
  const [bx, by] = PATH[i]
  assert.isTrue(ax === bx || ay === by, 'corner ' + i + ' is straight across or down from the one before')
}
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
