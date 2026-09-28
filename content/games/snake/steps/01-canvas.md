---
title: Get a canvas to draw on
title_tr: Çizim yapacağın canvas'ı al
skills: [game.canvas]
---

# --explanation--

Almost every 2D browser game draws on a `<canvas>`: a rectangle of pixels that you paint with JavaScript. The page
already contains one:

```html
<canvas id="game" width="400" height="400"></canvas>
```

To draw on it you need two things:

1. **The element**, found by its id: `document.getElementById('game')`.
2. **Its 2D drawing context**, `canvas.getContext('2d')`. The context is your paintbrush: it has methods like
   `fillRect`, `fillText` and `arc`, and settings like `fillStyle` (the current color).

Drawing is two moves: pick a color, then paint a shape.

```js
ctx.fillStyle = 'orange'      // pick a color
ctx.fillRect(10, 20, 50, 30)  // x, y, width, height
```

Coordinates start at the **top-left** corner: `x` grows to the right, `y` grows **downwards**.

# --explanation-tr--

**Bu adımda:** oyun alanını koyu renge boyayacağız. Sağdaki siyah kare, senin kodunla boyanmış olacak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan satırlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 400×400 piksellik boş bir resim alanı var. Adı `canvas`, kimliği (id) `game`:

```html
<canvas id="game" width="400" height="400"></canvas>
```

Oyundaki her şeyi (yılanı, yemi, skoru) bu alanın üstüne **boyayarak** göstereceğiz. Tıpkı bir kâğıda resim
yapmak gibi: önce kâğıdı bulursun, sonra eline fırçayı alırsın.

**1. Kâğıdı bul.** Sayfadan `game` kimlikli elemanı isteriz ve ona bir ad veririz:

```js
const canvas = document.getElementById('game')
```

Bunu parça parça okuyalım:

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile adlandırılan şeye **sabit** denir:
  bir kutuya etiket yapıştırmak gibidir, sonra hep o etiketle çağırırsın.
- `document` → sayfanın kendisi.
- `.getElementById('game')` → "kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut" demektir.
  Tırnak içindeki `'game'` bir **yazıdır** (metin).

**2. Fırçayı al.** Canvas'a doğrudan çizilmez; önce onun çizim aracını (bağlam, **context**) alırız:

```js
const ctx = canvas.getContext('2d')
```

`ctx` artık senin fırçan. Onunla iki şey yaparsın: **renk seçmek** ve **şekil boyamak**.

```js
ctx.fillStyle = 'orange'      // fırçaya turuncu boya sür
ctx.fillRect(10, 20, 50, 30)  // bir dikdörtgen boya: x, y, genişlik, yükseklik
```

**Konum nasıl verilir?** Canvas'ın **sol üst köşesi** `(0, 0)` noktasıdır. `x` sağa gittikçe, `y` ise
**aşağı** indikçe büyür (okuldaki grafiğin tersine). Yukarıdaki örnek: soldan 10, yukarıdan 20 piksel içeride,
50 piksel eninde ve 30 piksel boyunda turuncu bir dikdörtgen.

**Renkler** `'orange'`, `'lime'` gibi İngilizce adlarla ya da `'#111'` gibi kodlarla yazılır. `'#111'`
neredeyse siyah bir gri demektir.

# --task--

1. Store the canvas element in a constant named `canvas`.
2. Store its 2D context in a constant named `ctx`.
3. Paint the whole board dark: set `ctx.fillStyle` to `'#111'` and fill a rectangle from `(0, 0)` that is
   `canvas.width` wide and `canvas.height` tall.

Press **Run** to see the result on the right.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   ```

2. Bir alt satıra fırçayı alan satırı yaz:

   ```js
   const ctx = canvas.getContext('2d')
   ```

3. Bir satır boşluk bırak, sonra tahtanın tamamını koyu renge boyayan iki satırı ekle:

   ```js
   ctx.fillStyle = '#111'
   ctx.fillRect(0, 0, canvas.width, canvas.height)
   ```

   `canvas.width` ve `canvas.height` canvas'ın eni ve boyudur (400 ve 400). Yani `(0, 0)` köşesinden başlayıp
   bütün alanı kaplayan bir dikdörtgen boyuyoruz.

4. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağdaki oyun alanı koyu griye dönmeli ve alttaki kontrollerin
   hepsi yeşil olmalı. Kırmızı bir kontrol kalırsa yazdığını yukarıdakilerle harf harf karşılaştır: büyük/küçük
   harf, nokta ve tırnaklar önemlidir.

# --tests--

`canvas` should be the `#game` canvas element.
tr: `canvas`, `#game` canvas elemanı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
```

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

The whole 400×400 board should be filled with `#111`.
tr: 400×400 tahtanın tamamı `#111` ile doldurulmalı.

```js
const full = $.rects('#111').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 400)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #111')
```

# --seed--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
