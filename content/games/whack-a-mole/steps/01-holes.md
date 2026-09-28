---
title: Nine holes
title_tr: Dokuz delik
skills: [game.canvas, prog.loops, prog.arrays]
---

# --explanation--

The field has 9 holes in a 3×3 grid. This time you do not just draw them: you **store** them, because later every hole
needs its own state (is a mole up in it?). So build an array of hole objects once, with nested loops, and let
`draw()` loop over that array.

Each hole is described by its **center**, since it is drawn and hit-tested as a circle:

```js
{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }
```

`+ CELL / 2` moves from a cell's corner to its middle. The canvas is 360 wide, so three 120-pixel cells fill it
exactly, and a 40-pixel strip on top (`TOP`) is kept for the score and timer.

A circle is a path: `beginPath()`, `arc(x, y, r, 0, Math.PI * 2)`, `fill()`, one per hole.

# --explanation-tr--

**Bu adımda:** köstebek oyununun tarlasını çizeceğiz. Sağda yeşil bir çimenin üstünde 3 satır, 3 sütun halinde 9
koyu kahverengi delik (daire) göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 360×400 piksellik bir çizim alanı (**canvas**, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (**context**, bağlam) alırız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı al
```

`const ad = ...` bir şeye ad verir; bu ada **sabit** (constant) denir. Nokta (`.`) "bunun içindeki şu komut"
demektir, tırnak içindeki `'game'` bir **yazıdır** (metin). Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa,
`y` **aşağı** doğru büyür. `ctx.fillStyle = 'renk'` rengi seçer, `ctx.fillRect(x, y, en, boy)` dikdörtgen boyar.

**Delikleri saklamak.** Bu sefer delikleri sadece çizmeyeceğiz, bir listede **saklayacağız**; çünkü ileride her
deliğin kendi durumu olacak (içinden köstebek çıktı mı?).

- **Dizi** (array) sıralı bir listedir: `const holes = []` boş bir liste. `holes.push(şey)` listenin sonuna ekler.
  `holes[0]` ilk eleman (sayma 0'dan başlar).
- **Nesne** (object) birkaç bilgiyi adlarıyla bir arada tutar: `{ x: 60, y: 100 }`. İçindeki bilgi nokta ile okunur:
  `hole.x`.

**Döngüyle 9 delik.** `for (let row = 0; row < SIZE; row++) { ... }` bir **döngüdür**: `row` adında bir **değişken**
(`let`, değeri değişebilen kutu) 0'dan başlar, `SIZE`'dan (3) küçük olduğu sürece `{ }` içindeki kod tekrarlanır,
her tur sonunda `row++` ile 1 artar. İçine sütunlar (`col`) için ikinci bir döngü koyarız: 3 × 3 = 9 tur.

Her deliği **merkeziyle** tanımlarız, çünkü daire olarak çizilecek:

```js
{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }
```

`*` çarpma, `/` bölme. `CELL = 120` bir hücrenin boyu; `+ CELL / 2` hücrenin köşesinden ortasına geçirir. Canvas 360
geniş, üç 120'lik hücre tam sığar. Üstte skor ve süre için 40 piksellik bir şerit (`TOP`) bırakırız.

**Daire çizmek.** Daire bir **yoldur** (path): yolu başlat, yayı çiz, içini doldur.

```js
ctx.beginPath()
ctx.arc(x, y, yarıçap, 0, Math.PI * 2)  // merkez, yarıçap, tam tur
ctx.fill()
```

`Math.PI * 2` tam bir çember demektir (360 derece).

**Fonksiyon.** `function draw() { ... }` içindeki kodlara `draw` adını verir. Yazmak onu çalıştırmaz; en altta
`draw()` diye **çağırınca** çalışır. `for (const hole of holes)` ise listedeki her delik için bir kez döner; o turda
deliğin adı `hole`'dur.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const SIZE = 3`, `const CELL = 120`,
   `const TOP = 40`, `const HOLE_R = 40`.
2. Build `const holes = []` with nested loops (rows outside, columns inside), pushing
   `{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }` for each hole.
3. Write `draw()`: fill the canvas with `'#65a30d'`, then draw every hole as a `'#3f2d1d'` circle of radius `HOLE_R`.
   Call `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve ölçüleri ekle:

   ```js
   const SIZE = 3 // holes per row and per column
   const CELL = 120
   const TOP = 40 // room for the score and timer
   const HOLE_R = 40
   ```

3. Bir satır boşluk bırak ve delik listesini döngüyle doldur:

   ```js
   const holes = []
   for (let row = 0; row < SIZE; row++) {
     for (let col = 0; col < SIZE; col++) {
       holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
     }
   }
   ```

4. Bir satır boşluk bırak ve çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#65a30d'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#3f2d1d'
     for (const hole of holes) {
       ctx.beginPath()
       ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
       ctx.fill()
     }
   }
   ```

5. En alta, fonksiyonu çağıran satırı ekle:

   ```js
   draw()
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda yeşil zeminde 3×3 dizilmiş 9 koyu delik görmelisin ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri ve büyük/küçük harfleri harf harf karşılaştır.

# --tests--

There should be 9 holes, row by row, centered in their cells.
tr: Hücrelerinin ortasında, satır satır 9 delik olmalı.

```js
assert.deepEqual([SIZE, CELL, TOP, HOLE_R], [3, 120, 40, 40])
assert.lengthOf(holes, 9)
assert.include(holes[0], { x: 60, y: 100 })
assert.include(holes[1], { x: 180, y: 100 })
assert.include(holes[3], { x: 60, y: 220 })
assert.include(holes[8], { x: 300, y: 340 })
```

Every hole should be drawn as a dark circle.
tr: Her delik koyu bir daire olarak çizilmeli.

```js
const circles = $.arcs().filter((a) => a.color === '#3f2d1d')
assert.sameDeepMembers(circles, holes.map((h) => ({ x: h.x, y: h.y, r: 40, color: '#3f2d1d' })))
assert.isTrue($.rects('#65a30d').some((r) => r.w === 360 && r.h === 400))
```

# --seed--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
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
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#3f2d1d'
  for (const hole of holes) {
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
```
