---
title: Draw the court
title_tr: Sahayı çiz
skills: [game.canvas, prog.loops]
---

# --explanation--

Pong's court is a black rectangle with a dashed line down the middle. The dashed line is a good first use of a **loop**
in drawing: instead of writing 14 `fillRect` calls by hand, let a `for` loop place a short dash every 30 pixels.

```js
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)   // 4 wide, 15 tall, centered on the middle
}
```

Read it as: start at `y = 0`; while `y` is still on the canvas, draw a dash; then move `y` down by 30. A 15 pixel
dash plus a 15 pixel gap repeats all the way down.

Why `canvas.width / 2 - 2`? A rectangle is drawn from its **top-left corner**. To center a 4 pixel wide dash on the
middle line, start it half its width (2 px) to the left.

# --explanation-tr--

**Bu adımda:** Pong sahasını çizeceğiz. Sağda siyah bir alan ve ortasından yukarıdan aşağıya inen beyaz, kesikli
bir çizgi göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan satırlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 600 piksel eninde, 400 piksel boyunda boş bir resim alanı var. Adı `canvas`,
kimliği (id) `game`:

```html
<canvas id="game" width="600" height="400"></canvas>
```

Oyundaki her şeyi (raketleri, topu, skoru) bu alanın üstüne **boyayarak** göstereceğiz. Kâğıda resim yapmak gibi:
önce kâğıdı bulursun, sonra fırçayı alırsın.

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

Bunu parça parça okuyalım:

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile adlandırılan şeye **sabit** denir:
  bir kutuya etiket yapıştırmak gibidir, sonra hep o etiketle çağırırsın.
- `document.getElementById('game')` → "sayfada (`document`) kimliği `game` olanı bul". Nokta (`.`) "bunun
  içindeki şu komut" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `canvas.getContext('2d')` → canvas'ın çizim aracını (bağlam, **context**) al. `ctx` artık senin fırçan.

Fırçayla iki şey yaparsın: **renk seçmek** ve **dikdörtgen boyamak**:

```js
ctx.fillStyle = 'white'       // fırçaya beyaz boya sür
ctx.fillRect(10, 20, 50, 30)  // dikdörtgen boya: x, y, genişlik, yükseklik
```

**Konum:** canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Bir
dikdörtgen her zaman **sol üst köşesinden** başlayarak çizilir.

**Döngü (loop) nedir?** Orta çizgi 14 kısa parçadan oluşuyor. 14 kez neredeyse aynı satırı yazmak yerine
bilgisayara "bunu tekrar et" deriz. Buna **döngü** denir:

```js
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}
```

Parça parça:

- `let y = 0` → `y` adında bir **değişken** aç, değeri 0 olsun. `let`, `const` gibidir ama değeri sonradan
  değişebilir (bir sayaç gibi).
- `y < canvas.height` → "`y`, canvas'ın boyundan (400) küçük olduğu sürece devam et". `<` "küçüktür" demektir.
- `y += 30` → her turun sonunda `y`'ye 30 ekle (`y = y + 30`'un kısa yazılışı).
- `{ ... }` → süslü parantezlerin içi, her turda tekrarlanacak işlerdir.

Yani `y` sırayla 0, 30, 60, ... 390 olur ve her seferinde bir çizgi parçası boyanır: 15 piksel çizgi, 15 piksel
boşluk, en alta kadar.

**Neden `canvas.width / 2 - 2`?** `/` bölme demektir: `600 / 2 = 300`, sahanın tam ortası. Parça 4 piksel geniş ve
dikdörtgen sol üst köşesinden çizildiği için, ortalamak üzere onu genişliğinin yarısı (2) kadar sola alırız: 298.

# --task--

1. Store the canvas in `canvas` and its 2D context in `ctx`.
2. Fill the whole canvas with `'black'`.
3. In `'white'`, draw the center line: a dash `4` wide and `15` tall at `x = canvas.width / 2 - 2`, every `30` pixels
   from `y = 0` to the bottom.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve kâğıdı ve fırçayı alan iki
   satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve bütün sahayı siyaha boya:

   ```js
   ctx.fillStyle = 'black'
   ctx.fillRect(0, 0, canvas.width, canvas.height)
   ```

   `canvas.width` ve `canvas.height` canvas'ın eni (600) ve boyudur (400).

3. Bir satır boşluk daha bırak, rengi beyaza çevir ve orta çizgiyi çizen döngüyü yaz:

   ```js
   ctx.fillStyle = 'white'
   for (let y = 0; y < canvas.height; y += 30) {
     ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
   }
   ```

   Döngünün içindeki satırı iki boşlukla içeri kaydırmak zorunlu değil ama okumayı kolaylaştırır.

4. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda siyah saha ve ortasında beyaz kesikli çizgi görmelisin; alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `for` satırındaki noktalı virgülleri (`;`) ve süslü parantezleri
   kontrol et.

# --tests--

The whole 600×400 court should be black.
tr: 600×400 sahanın tamamı siyah olmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.isTrue($.rects('black').some((r) => r.x === 0 && r.y === 0 && r.w === 600 && r.h === 400))
```

The center line should be 14 white dashes, one every 30 pixels.
tr: Orta çizgi, her 30 pikselde bir olmak üzere 14 beyaz çizgiden oluşmalı.

```js
const dashes = $.rects('white')
assert.lengthOf(dashes, 14)
dashes.forEach((dash, i) => assert.deepEqual(dash, { x: 298, y: i * 30, w: 4, h: 15, color: 'white' }))
```

# --seed--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'white'
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}
```
