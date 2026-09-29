---
title: Fill in the road
title_tr: Yolu doldur
skills: [prog.arrays, prog.loops]
---

# --goal--

`findRoad` walks from each corner to the next, one tile at a time, and puts every tile it passes into a `Set` of keys
like `'3,4'`. `Math.sign` gives exactly the step to take, so one loop works for all four directions.

# --goal-tr--

Şimdi köşelerin arasını dolduruyoruz. `findRoad` (yolu bul) her köşeden bir sonrakine **kare kare yürür** ve geçtiği
her kareyi bir listeye koyar.

İki köşe arasında bir sayı sabit kalır, öbürü hedefe doğru birer birer ilerler. Hangi yöne? `Math.sign(tx - x)` tam
atılacak adımı verir: `1`, `-1` ya da `0`. Böylece aynı döngü dört yön için de çalışır.

Yol karelerini bir **`Set`** (küme) içinde `'3,4'` gibi anahtarlarla tutuyoruz; ileride "bu kare yol mu?" sorusu tek
bir `has` olacak.

# --code--

```js
let road // keys of the tiles the road covers

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- A `Set` holds each value at most once; `add` puts one in, `has` asks if it is there.
- `key(3, 4)` is the string `'3,4'`: strings can be found again in a `Set`, arrays cannot.
- For each pair of corners, `let [x, y]` starts at the first; `while (true)` repeats until `break`, when the second is
  reached. `Math.sign(tx - x)` is `1`, `-1` or `0`: one step towards the target, or none.

# --meaning-tr--

- `let road` → yol karelerinin anahtarları.
- `const key = (col, row) => col + ',' + row` → kareyi yazıya çevirir: `key(3, 4)` → `'3,4'`. Kümede bir dizi (`[3, 4]`)
  tekrar bulunamazdı (her dizi ayrı bir nesne); yazı bulunur.
- `road = new Set()` → boş bir **küme**. Kümede her değer en fazla bir kez bulunur; `add` ekler, `has` "var mı?" diye
  sorar. Köşeler iki parçada da geçse bir kez sayılır.
- `for (let i = 1; i < PATH.length; i++)` → her köşe çifti: `PATH[i - 1]`'den `PATH[i]`'ye.
- `let [x, y] = PATH[i - 1]` → yürüyüşe ilk köşeden başla (`let`, çünkü değişecek). `const [tx, ty] = PATH[i]` → hedef.
- `while (true) {` → `break` gelene kadar tekrar eden döngü:
  - `road.add(key(x, y))` → bulunduğun kareyi ekle.
  - `if (x === tx && y === ty) break` → hedefe vardıysan dur.
  - `x += Math.sign(tx - x)` → `Math.sign` sayının **işaretini** verir: artıysa 1, eksiyse −1, sıfırsa 0. Hedef
    sağdaysa bir sağa, soldaysa bir sola, aynı sütundaysa hiç. `y` için de aynısı.
- `function reset() { findRoad() }` → oyunu kuran fonksiyon; en alttaki `reset()` onu bir kez çağırır.

# --task--

1. Under `PATH`, after an empty line, write `let road`, `key`, `findRoad` and `reset`.
2. At the end, write `reset()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `PATH`'in kapanan `]` satırının altında bir boş satır bırak; `let road`, `key`, yorum, `findRoad` ve `reset`'i yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**: ekranda henüz fark yok; yolu bir sonraki adımda çizeceğiz.

# --hint--

If the page freezes, the `while (true)` never reaches `break`: check `x === tx && y === ty` and the two `Math.sign` lines.

# --hint-tr--

Sayfa donuyorsa `while (true)` hiç `break`'e ulaşmıyor demektir: `x === tx && y === ty` koşulunu ve iki `Math.sign` satırını kontrol et.

# --tests--

`key` should turn a tile into a string.
tr: `key` bir kareyi yazıya çevirmeli.

```js
assert.strictEqual(key(3, 4), '3,4')
```

The road should fill in the straight lines between the corners.
tr: Yol köşeler arasındaki düz çizgileri doldurmalı.

```js
for (const k of ['-1,1', '0,1', '3,1', '3,4', '5,6', '7,3', '9,2', '10,5', '11,7', '12,7']) {
  assert.isTrue(road.has(k), k + ' should be road')
}
assert.isFalse(road.has('4,4'))
assert.isFalse(road.has('0,0'))
assert.strictEqual(road.size, 28, '26 tiles on the map plus one off each edge')
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

let road // keys of the tiles the road covers

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
}

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

reset()
requestAnimationFrame(loop)
```
