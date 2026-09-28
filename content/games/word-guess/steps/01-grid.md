---
title: Six rows of five
title_tr: Beşerli altı satır
skills: [game.canvas]
---

# --explanation--

The whole game happens on a grid of 6 rows (one for each try) and 5 columns (one for each letter). Everything about its
layout comes from a few numbers: the tile `SIZE`, the `GAP` between tiles, and where the grid starts.

To center the grid, work out how wide it is and split what is left over:

```js
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2   // 5 tiles, 4 gaps between them
```

Then tile `i` of row `row` is at `LEFT + i * (SIZE + GAP)` across and `TOP + row * (SIZE + GAP)` down. Change `SIZE` and
the whole grid rearranges itself, which is why layouts are written as formulas instead of fixed positions.

Empty tiles are just outlines: `strokeRect` draws the border of a rectangle without filling it.

# --explanation-tr--

**Bu adımda:** kelime tahmin oyununun tahtasını çizeceğiz. Sağda koyu bir zeminde 6 satır, 5 sütunluk boş kutucuklar
(sadece çerçeveleri) göreceksin. Her satır bir tahmin, her kutu bir harf.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 360×560 piksellik bir çizim alanı (**canvas**, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (**context**, bağlam) alırız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı al
```

`const ad = ...` bir şeye ad verir; bu ada **sabit** (constant) denir. Nokta (`.`) "bunun içindeki şu komut"
demektir, tırnak içindeki `'game'` bir **yazıdır** (metin). Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa,
`y` **aşağı** doğru büyür.

**Doldurmak ve çerçevelemek.** `ctx.fillStyle = 'renk'` ve `ctx.fillRect(x, y, en, boy)` içi dolu bir dikdörtgen
boyar. `ctx.strokeRect(...)` ise aynı dikdörtgenin sadece **kenarını** çizer; kenar rengi `ctx.strokeStyle`, kalınlığı
`ctx.lineWidth` ile seçilir. Boş kutucuklar böyle çizilir.

**Ortalamak için formül.** Kutu boyu `SIZE = 56`, aradaki boşluk `GAP = 6`. Beş kutu ve aralarındaki dört boşluğun
toplam genişliğini canvas'ın eninden çıkarıp ikiye bölersek soldan ne kadar boşluk bırakacağımızı buluruz:

```js
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2   // (360 - 280 - 24) / 2 = 28
```

`*` çarpma, `/` bölme demektir. Sonra `row`. satırın `i`. kutusu şurada durur:
`x = LEFT + i * (SIZE + GAP)`, `y = TOP + row * (SIZE + GAP)`. `SIZE`'ı değiştirirsen bütün ızgara kendini yeniden
düzenler; bu yüzden yerleri sabit sayılarla değil formülle yazarız.

**Fonksiyon ve döngü.**

- `function draw() { ... }` → süslü parantezler arasındaki kodlara `draw` adını verir (**fonksiyon**). Yazmak onu
  çalıştırmaz; `draw()` diye **çağırınca** çalışır.
- `for (let row = 0; row < TRIES; row++) { ... }` → **döngü**: `row` 0'dan başlar, `TRIES`'tan (6) küçük olduğu
  sürece gövdeyi tekrarlar, her tur sonunda `row++` ile 1 artar. `let` ile açılan kutunun (**değişken**) değeri
  değişebilir. İçine ikinci bir döngü koyunca her satırın 5 kutusunu gezeriz: 6 × 5 = 30 kutu.

**Oyun döngüsü.** Oyunlarda ekranı saniyede ~60 kez yeniden çizeriz, böylece her değişiklik hemen görünür:

```js
function loop() {
  draw()
  requestAnimationFrame(loop)  // "bir sonraki karede loop'u yine çağır"
}
requestAnimationFrame(loop)    // döngüyü başlat
```

# --task--

1. Add `TRIES = 6`, `SIZE = 56`, `GAP = 6`, `TOP = 12` and `LEFT` as above.
2. Every frame fill the canvas with `'#18181b'` and draw an outline for each of the 30 tiles with `strokeRect`, 1 pixel
   inside the tile (`x + 1, y + 1, SIZE - 2, SIZE - 2`), in `'#3f3f46'` with a `lineWidth` of 2.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve ölçüleri ekle (`LEFT`, `SIZE` ile `GAP`'i kullandığı için onlardan sonra gelmeli):

   ```js
   const TRIES = 6
   const SIZE = 56 // one letter tile
   const GAP = 6
   const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
   const TOP = 12
   ```

3. Bir satır boşluk bırak ve çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#18181b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let row = 0; row < TRIES; row++) {
       for (let i = 0; i < 5; i++) {
         const x = LEFT + i * (SIZE + GAP)
         const y = TOP + row * (SIZE + GAP)
         ctx.strokeStyle = '#3f3f46'
         ctx.lineWidth = 2
         ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
       }
     }
   }
   ```

   Çerçeveyi kutunun 1 piksel içine çiziyoruz (`x + 1`, `SIZE - 2`), böylece kalın kenar komşu kutuya taşmaz.

4. Altına oyun döngüsünü yaz ve başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda 6 satır × 5 sütun gri çerçeveli boş kutu görmelisin ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri ve büyük/küçük harfleri harf harf karşılaştır.

# --tests--

The grid should be centered.
tr: Izgara ortalanmış olmalı.

```js
assert.strictEqual(LEFT, 28)
```

Every tile should be drawn as an outline.
tr: Her döşeme bir çerçeve olarak çizilmeli.

```js
$.tick(1)
const boxes = $.screen().filter((c) => c.op === 'strokeRect').map((c) => c.args)
assert.lengthOf(boxes, 30)
assert.deepEqual(boxes[0], [29, 13, 54, 54])
assert.deepEqual(boxes[4], [29 + 4 * 62, 13, 54, 54])
assert.deepEqual(boxes[29], [29 + 4 * 62, 13 + 5 * 62, 54, 54])
```

# --seed--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
