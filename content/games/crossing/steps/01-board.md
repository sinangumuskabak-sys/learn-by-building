---
title: A board made of rows
title_tr: Satırlardan bir tahta
skills: [game.canvas]
---

# --explanation--

The whole game is a stack of horizontal **rows**, each one tile high. The frog starts on the grass at the bottom and
has to reach the far bank at the top:

```
row 0        far bank (the homes come later)
rows 1-5     river
row 6        safe strip
rows 7-11    road
row 12       start
```

So instead of drawing a picture, the board is drawn by **looping over the rows** and asking a small function which
color each row is. Keeping "what kind of row is this?" in one function means the rest of the game can ask the same
question later.

The frog lives in **tile coordinates**: `{ x: 5, y: 12 }` means column 5, row 12. Only `draw()` turns tiles into
pixels (`x * TILE`), and a band of `TOP` pixels at the top is kept free for the score. Working in tiles keeps the game
logic simple: one hop is always exactly 1.

# --explanation-tr--

**Bu adımda:** oyun tahtasını ve kurbağayı çizeceğiz. Sağda üstten alta renkli yatay şeritler göreceksin: en üstte
koyu yeşil karşı kıyı, beş mavi nehir şeridi, açık yeşil bir güvenli şerit, beş gri yol şeridi ve en altta açık yeşil
başlangıç çimeni. Başlangıç çimeninin ortasında da yeşil kare bir kurbağa olacak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan satırlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 560 piksel boyunda boş bir resim alanı var:
`<canvas id="game" width="480" height="560"></canvas>`. Oyundaki her şeyi bunun üstüne boyayacağız. Önce kâğıdı
buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun 2D çizim aracını (bağlam, context) al
```

- `const canvas =` → "bundan sonra buna `canvas` diyeceğim". `const` ile verilen ada **sabit** denir: bir kutuya
  etiket yapıştırmak gibi.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindekiler (`'game'`, `'2d'`) **yazıdır** (metin).

`ctx` senin fırçan. Önce renk seçer, sonra dikdörtgen boyarsın:

```js
ctx.fillStyle = '#1e3a8a'       // rengi seç (# ile başlayan bir renk kodu)
ctx.fillRect(10, 20, 50, 30)    // dikdörtgen boya: x, y, genişlik, yükseklik
```

Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa, `y` **aşağı** doğru büyür.

**Tahta satırlardan oluşur.** Bütün oyun, her biri bir **döşeme** (tile, 40 piksel) yüksekliğinde yatay şeritlerden
oluşan bir yığın. Satırları yukarıdan numaralarız:

```
satır 0       karşı kıyı (evler sonra gelecek)
satır 1-5     nehir
satır 6       güvenli şerit
satır 7-11    yol
satır 12      başlangıç
```

Resim çizmek yerine **satırları tek tek dolaşıp** her birinin rengini küçük bir fonksiyona sorarız.

**Fonksiyon: adı olan bir tarif.** Birkaç satırı bir ad altında toplarız:

```js
function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  ...
}
```

- `function rowColor(row)` → `rowColor` (satır rengi) adında bir tarif **tanımla**. `row`, tarif çağrılırken
  verilecek sayının adıdır (**parametre**).
- `if (koşul) komut` → "**eğer** koşul doğruysa komutu yap".
- `===` "eşit mi?", `<=` "küçük veya eşit mi?", `||` "**veya**" demektir.
- `return değer` → "bu değeri cevap olarak ver ve fonksiyondan çık". İlk tutan `return`'de fonksiyon biter; bu
  yüzden `row <= 5` satırına sadece 0 olmayan satırlar gelir, yani 1-5 nehirdir. Hiçbir `if` tutmazsa en alttaki
  `return` çalışır: yol.
- Tarifi çalıştırmak (**çağırmak**) için adını ve parantezi yazarsın: `rowColor(3)` → `'#1e3a8a'`.

"Bu satır ne tür?" sorusunu tek bir fonksiyonda tutmak, oyunun geri kalanının ileride aynı soruyu sorabilmesini
sağlar.

**Döngü: aynı işi tekrar tekrar yapmak.**

```js
for (let row = 0; row <= START_ROW; row++) {
  // bu kısım row = 0, 1, 2, ... 12 için birer kez çalışır
}
```

Parantezin içinde üç parça var: `let row = 0` (sayaç 0'dan başlasın; `let` değiştirilebilen bir ad verir),
`row <= START_ROW` (12'ye kadar devam et), `row++` (her turdan sonra bir artır).

**Döşeme koordinatları.** Kurbağanın yerini piksel olarak değil **döşeme** olarak tutarız:

```js
let frog = { x: 5, y: START_ROW }
```

`{ ... }` bir **nesnedir**: etiketli bilgilerden oluşan bir kart. `frog.x` "kurbağanın x'i", yani 5. sütun; `frog.y`
12. satır. Döşemeleri piksele sadece `draw()` çevirir (`x * TILE`; `*` çarpma demek). En üstte skor için `TOP` (40)
piksellik bir şerit boş bırakılır, bu yüzden bir satırın yukarıdan uzaklığı `TOP + row * TILE`'dır. Döşemelerle
çalışmak oyun mantığını basit tutar: bir zıplama her zaman tam 1'dir.

**Oyun döngüsü.** Ekranı saniyede yaklaşık 60 kez yeniden çizeriz:

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}
```

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenileyişinde `loop`'u çalıştır" der; `loop` en sonunda
kendini yeniden sıraya koyar. Burada `loop` parantezsiz yazılır: "şimdi çalıştır" değil, "sırası gelince sen
çalıştır" diyoruz.

# --task--

1. Add `TILE = 40`, `COLS = 12`, `TOP = 40` and `START_ROW = 12`, and `let frog = { x: 5, y: START_ROW }`.
2. Write `rowColor(row)`: `'#166534'` for row 0, `'#1e3a8a'` for the river (1-5), `'#4d7c0f'` for row 6 and the start
   row, and `'#1f2937'` for the road.
3. Write `draw()`: fill the canvas with `'#0f172a'`, then fill every row from 0 to `START_ROW` with its color
   (`TOP + row * TILE` from the top). Draw the frog as a `'#22c55e'` square, 6 pixels smaller than its tile on each side.
4. Draw every frame with a `requestAnimationFrame` loop.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan satırları
   yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve tahtanın ölçülerini ekle:

   ```js
   const TILE = 40
   const COLS = 12
   const TOP = 40 // room for the score and the lives
   const START_ROW = 12
   // Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.
   ```

   `TILE` bir döşemenin boyu, `COLS` sütun sayısı (12 × 40 = 480), `TOP` üstteki boş şerit, `START_ROW` başlangıç
   satırı. Son satır sadece bir not.

3. Bir boş satır bırak ve kurbağayı ekle:

   ```js
   let frog = { x: 5, y: START_ROW }
   ```

4. Bir boş satır bırak ve satır rengini veren fonksiyonu yaz:

   ```js
   function rowColor(row) {
     if (row === 0) return '#166534'
     if (row <= 5) return '#1e3a8a'
     if (row === 6 || row === START_ROW) return '#4d7c0f'
     return '#1f2937'
   }
   ```

5. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let row = 0; row <= START_ROW; row++) {
       ctx.fillStyle = rowColor(row)
       ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
     }

     ctx.fillStyle = '#22c55e'
     ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
   }
   ```

   Önce her yeri koyu renge boyar, sonra 13 satırı kendi renginde, tam genişlikte çizer. Kurbağa, döşemesinden her
   kenarda 6 piksel küçük bir karedir: 6 piksel içeriden başlar, eni ve boyu `40 - 12 = 28`.

6. Altına döngüyü ve onu başlatan satırı ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda renkli şeritler ve en alttaki çimenin ortasında yeşil bir kare
   görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa renk kodlarını harf harf kontrol et ve
   döngüde `<=` yazdığından emin ol (`<` yazarsan son satır çizilmez).

# --tests--

Each row should have the color of its kind.
tr: Her satır kendi türünün renginde olmalı.

```js
assert.strictEqual(rowColor(0), '#166534')
assert.strictEqual(rowColor(3), '#1e3a8a')
assert.strictEqual(rowColor(6), '#4d7c0f')
assert.strictEqual(rowColor(9), '#1f2937')
assert.strictEqual(rowColor(12), '#4d7c0f')
```

The board should be drawn as 13 full-width rows under the top band.
tr: Tahta, tepe şeridinin altında tam genişlikte 13 satır olarak çizilmeli.

```js
$.tick(1)
const rows = $.rects().filter((r) => r.w === 480 && r.h === 40)
assert.lengthOf(rows, 13)
assert.deepEqual(rows.map((r) => r.y), [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520])
assert.lengthOf($.rects('#1e3a8a'), 5, 'five river rows')
assert.lengthOf($.rects('#1f2937'), 5, 'five road rows')
```

The frog should be drawn on the start row.
tr: Kurbağa başlangıç satırında çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#22c55e'), [{ x: 206, y: 526, w: 28, h: 28, color: '#22c55e' }])
```

The board should be redrawn every frame.
tr: Tahta her karede yeniden çizilmeli.

```js
$.tick(1)
frog = { x: 0, y: 6 }
$.tick(1)
assert.deepEqual($.rects('#22c55e'), [{ x: 6, y: 286, w: 28, h: 28, color: '#22c55e' }])
```

# --seed--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

let frog = { x: 5, y: START_ROW }

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
