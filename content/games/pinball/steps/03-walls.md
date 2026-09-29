---
title: A list of walls
title_tr: Duvar listesi
skills: [prog.arrays, game.canvas]
---

# --goal--

The whole table is made of straight pieces: a curved top of short slanted lines, the launch lane on the right, two
slopes down to the flippers. We keep them all in one list, `WALLS`, and draw every one with the same four lines.

# --goal-tr--

Bütün masa düz parçalardan yapılıyor: kavisli tepe aslında birkaç **kısa eğik çizgi**, sağdaki fırlatma kanalı
iki uzun çizgi ve bir taban, altta da paletlere inen iki **eğim**.

Her duvarı ayrı ayrı yazmak yerine hepsini **tek bir listede** tutacağız: `WALLS`. Her duvar dört sayıdır:
`[x1, y1, x2, y2]`, yani "şu noktadan şu noktaya". Sonra bir **döngü** listedeki her duvarı aynı dört satırla
çizecek. Masayı değiştirmek istersen yalnız listeyi değiştirirsin; ileride top da bu listeye çarpacak.

# --code--

```js
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

for (const [x1, y1, x2, y2] of WALLS) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}
```

# --meaning--

- `WALLS` is an array of arrays: each inner `[x1, y1, x2, y2]` is one wall, from `(x1, y1)` to `(x2, y2)`.
- `for (const [x1, y1, x2, y2] of WALLS)` takes each wall in turn and unpacks its four numbers into four names.
- The body is the same drawing as before, with names instead of fixed numbers.

# --meaning-tr--

- `const WALLS = [ ... ]` → bir **dizi** (liste). İçindeki her eleman da dört sayılık küçük bir dizi: bir duvar.
  Yani **dizilerden oluşan bir dizi**. İlki `[20, 470, 20, 120]`, az önce çizdiğin sol duvar.
- Satır sonlarındaki `// the launch lane` gibi yazılar yorum: hangi satırın ne olduğunu anlatır.
- `for (const [x1, y1, x2, y2] of WALLS) {` → "`WALLS`'taki **her** duvar için süslü parantez içini yap".
  - `of WALLS` → elemanları sırayla, tek tek alır.
  - `[x1, y1, x2, y2]` → aldığı dört sayılık diziyi **açar**: ilk sayıya `x1`, ikincisine `y1`... adını verir.
    Buna **dizi açma** (destructuring) denir.
- İçerideki dört satır önceki adımdakilerin aynısı; yalnız sabit sayılar yerine `x1, y1, x2, y2` var. Döngü 11 kez
  döner, 11 duvar çizilir.

# --task--

1. Under `const ctx = ...` leave an empty line and write the comment and the `WALLS` list.
2. At the bottom, replace the four lines from `ctx.beginPath()` to `ctx.stroke()` with the `for` loop.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırak; yorum satırını ve `WALLS` listesini yaz. Sayıları
   dikkatle yaz: her virgül ve köşeli parantez önemli.
2. En alttaki dört satırı (`ctx.beginPath()`'ten `ctx.stroke()`'a kadar) sil; yerine `for` döngüsünü yaz. Üstteki
   `strokeStyle`, `lineWidth`, `lineCap` satırları aynı kalır.
3. **Çalıştır**: masanın bütün duvarlarını görmelisin.

# --hint--

If you see only some walls, compare your `WALLS` numbers with the code: a missing comma or bracket moves or hides a wall.

# --hint-tr--

Duvarların bir kısmı görünmüyorsa `WALLS` sayılarını koddakiyle karşılaştır: eksik bir virgül ya da köşeli parantez bir duvarı kaydırır ya da gizler.

# --try--

Add a wall of your own to the list, for example `[150, 300, 250, 300]`, and run. Then remove it.

# --try-tr--

Listeye kendi duvarını ekle, örneğin `[150, 300, 250, 300]`, ve çalıştır. Sonra geri sil.

# --tests--

`WALLS` should be a list of walls, four numbers each.
tr: `WALLS`, her biri dört sayıdan oluşan bir duvar listesi olmalı.

```js
assert.lengthOf(WALLS, 11)
for (const w of WALLS) assert.lengthOf(w, 4)
assert.deepEqual(WALLS[0], [20, 470, 20, 120], 'the left wall first')
assert.deepInclude(WALLS, [360, 590, 390, 590], 'the floor of the launch lane')
```

Every wall should be drawn as one line.
tr: Her duvar bir çizgi olarak çizilmeli.

```js
assert.lengthOf($.screen().filter((c) => c.op === 'stroke'), WALLS.length, 'one stroke per wall')
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
for (const [, , x2, y2] of WALLS) assert.include(ends, x2 + ',' + y2)
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

ctx.fillStyle = '#0c0a09'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.strokeStyle = '#a8a29e'
ctx.lineWidth = 4
ctx.lineCap = 'round'
for (const [x1, y1, x2, y2] of WALLS) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}
```
