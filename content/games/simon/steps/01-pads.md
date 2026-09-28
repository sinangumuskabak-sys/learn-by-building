---
title: Four pads
title_tr: Dört tuş
skills: [game.canvas, prog.arrays]
---

# --explanation--

Simon has four colored pads that light up. Each pad needs two colors, a dim one for "off" and a bright one for "lit", so
keep them together in one list of objects:

```js
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },   // green
  ...
]
```

The pads fill the four quarters of the board. Pad `i` is in column `i % 2` and row `Math.floor(i / 2)`: the same
"position in a grid from one number" trick as in the 15 puzzle, here with a 2 by 2 grid.

One variable, `lit`, says which pad is lit (`-1` for none). Drawing each pad simply picks `pad.lit` or `pad.dim` depending
on it. Whatever lights a pad later, the computer showing the sequence or the player pressing, only has to change `lit`.

# --explanation-tr--

**Bu adımda:** Simon'un dört renkli tuşunu çizeceğiz. Çalıştırınca sağda, üstte biraz boşluk bırakılmış, 2×2
dizilmiş dört koyu renkli kare göreceksin: yeşil, kırmızı, sarı ve mavi.

**Kod nerede, nasıl çalışır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not. **Çalıştır** düğmesine basınca kod çalışır, sonucu sağ üstteki
**Oyun** alanında görürsün; sağ alttaki **Kontroller** kodunun istenen şeyi yapıp yapmadığını söyler.

**Canvas ve fırça.** Sayfada 400×440 piksellik boş bir resim alanı (`canvas`, tuval) var. Oyundaki her şeyi onun
üstüne boyarız. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // kimliği "game" olan canvas'ı bul
const ctx = canvas.getContext('2d')              // onun 2D çizim aracını (fırçayı) al
```

`const ad = ...` bir şeye **ad verir** (sabit): bir kutuya etiket yapıştırmak gibi. Nokta (`.`) "bunun içindeki
şu komut" demektir. Tırnak içindeki `'game'` bir **yazıdır**; sayılar ise tırnaksız yazılır.

Fırçayla iki hamle yaparsın: renk seç, dikdörtgen boya.

```js
ctx.fillStyle = '#0f172a'        // renk (koyu lacivert)
ctx.fillRect(10, 20, 50, 30)     // x, y, genişlik, yükseklik
```

Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür. Renkler `'#4ade80'` gibi kodlarla
yazılır; kodları ezberlemen gerekmez, verileni aynen yaz.

**Her tuşun iki rengi var.** Sönükken koyu (`dim`), yanarken parlak (`lit`). İkisini bir **nesnede** tutarız,
dört tuşu da bir **dizide**:

```js
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },   // yeşil
  { dim: '#7f1d1d', lit: '#f87171' },   // kırmızı
  ...
]
```

- Süslü parantez `{ }` bir **nesne**dir: `ad: değer` çiftlerinden oluşan bir paket. `pad.lit` "bu tuşun parlak
  rengi" demektir.
- Köşeli parantez `[ ]` bir **dizi**dir: sıralı bir liste. Elemanlar **0'dan** numaralanır: `PADS[0]` yeşil,
  `PADS[3]` mavi.

**Tuşlar nereye?** Tahtanın dört çeyreğine. `HALF` tahtanın yarısı: `canvas.width / 2` = 200 (`/` bölme). Tuş
`i`'nin sütunu `i % 2`, satırı `Math.floor(i / 2)`:

```
tuş:  0 1      sütun = i % 2              (%: bölümden kalan; 3 % 2 = 1)
      2 3      satır = Math.floor(i / 2)  (aşağı yuvarla; 3 / 2 = 1.5 → 1)
```

Üstte skor yazısı için 40 piksel boşluk bırakırız (`TOP`). Her kare çeyreğinin her kenarından 6 piksel içeride
başlar, bu yüzden eni `HALF - 12`'dir. Tuşlar arasında ince bir boşluk kalır.

**Hangi tuş yanıyor?** Tek bir değişken söyler: `let lit = -1`. `let` de ad verir ama değeri sonradan
**değişebilir** (değişken). `-1` "hiçbiri" demek, çünkü `-1` numaralı tuş yok. Çizerken her tuş için bakarız:

```js
ctx.fillStyle = i === lit ? pad.lit : pad.dim
```

`===` "eşit mi?" diye sorar. `? :` kısa bir seçimdir: "bu tuş yanan tuş mu? Evetse parlak renk, değilse koyu
renk." Tuşu ileride kim yakarsa yaksın (bilgisayar ya da oyuncu), sadece `lit`'i değiştirmesi yetecek.

**Fonksiyon ve her tuş için çizmek.** `function draw() { ... }` birkaç satıra `draw` adını verir (tarif yazmak
gibi); `draw()` yazınca çalışır. İçinde `PADS.forEach((pad, i) => { ... })` "dizideki her tuş için şunu yap"
demektir: `pad` o tuşun nesnesi, `i` sıra numarası. `=>` küçük bir fonksiyon yazmanın kısa yoludur.

**Oyun döngüsü.** Tuşlar ileride yanıp sönecek, bu yüzden ekranı saniyede yaklaşık 60 kez yeniden çizeriz.
`requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki boyamandan önce `loop`'u çağır" der. `loop` da işini
bitirince kendini yeniden ister; böylece döngü hiç durmaz.

# --task--

1. Add `TOP = 40`, `HALF = canvas.width / 2` and the `PADS` list from the solution, and `let lit = -1`.
2. Every frame fill `'#0f172a'` and draw each pad as a square filling its quarter below `TOP`, 6 pixels in from each side
   (`HALF - 12` wide), in its lit color if it is the lit pad and its dim color otherwise.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan satırları
   yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve ölçüleri, tuş renklerini ve yanan tuş değişkenini ekle:

   ```js
   const TOP = 40 // room for the score
   const HALF = canvas.width / 2
   // Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
   const PADS = [
     { dim: '#14532d', lit: '#4ade80' },
     { dim: '#7f1d1d', lit: '#f87171' },
     { dim: '#713f12', lit: '#facc15' },
     { dim: '#1e3a8a', lit: '#60a5fa' },
   ]

   let lit = -1 // the pad lit right now, or -1
   ```

   Renk kodlarını dikkatle kopyala; kontroller bu renklere bakıyor.

3. Bir satır boşluk bırak ve çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     PADS.forEach((pad, i) => {
       const x = (i % 2) * HALF
       const y = TOP + Math.floor(i / 2) * HALF
       ctx.fillStyle = i === lit ? pad.lit : pad.dim
       ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
     })
   }
   ```

   Önce bütün tahtayı koyu boyar, sonra her tuşu kendi çeyreğine çizer.

4. Bir satır boşluk bırak ve oyun döngüsünü yazıp başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda dört koyu renkli kare görmelisin ve alttaki kontrollerin
   hepsi yeşil olmalı. Bir kare yanlış renkteyse `PADS` listesindeki renk kodlarını ve sırasını kontrol et.
   Merak edersen `let lit = -1` satırında `-1`'i `0` yapıp çalıştır: yeşil tuş parlar. Sonra geri `-1` yap.

# --tests--

The four pads should fill the four quarters.
tr: Dört tuş dört çeyreği doldurmalı.

```js
$.tick(1)
const pads = $.rects().filter((r) => r.w === 188)
assert.deepEqual(pads.map((r) => [r.x, r.y, r.color]), [
  [6, 46, '#14532d'],
  [206, 46, '#7f1d1d'],
  [6, 246, '#713f12'],
  [206, 246, '#1e3a8a'],
])
```

The lit pad should be drawn bright.
tr: Yanan tuş parlak çizilmeli.

```js
lit = 3
$.tick(1)
assert.lengthOf($.rects('#60a5fa'), 1)
assert.lengthOf($.rects('#1e3a8a'), 0)
assert.lengthOf($.rects('#14532d'), 1)
```

# --seed--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

let lit = -1 // the pad lit right now, or -1

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
