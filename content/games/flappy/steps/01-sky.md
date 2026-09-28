---
title: Paint the sky
title_tr: Gökyüzünü boya
skills: [game.canvas]
---

# --explanation--

This game is tall: the page has a `<canvas id="game" width="400" height="600">`. As in every canvas game, you start by
grabbing the canvas and its 2D **context**, the object you draw with.

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

Then you paint the background: choose a color with `fillStyle`, then fill a rectangle as big as the canvas. Using
`canvas.width` and `canvas.height` instead of `400` and `600` keeps the code correct if the size ever changes.

Colors can be names (`'gold'`), or hex codes like `'#70c5ce'`: two hex digits each for red, green and blue.

# --explanation-tr--

**Bu adımda:** oyunun arka planını, yani gökyüzünü açık maviye boyayacağız. Çalıştırınca sağdaki uzun alan
baştan aşağı gök mavisi olacak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan satırlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada boş bir resim alanı var. Bu oyun için alan **uzun**: 400 piksel eninde, 600 piksel
boyunda. Adı `canvas`, kimliği (id) `game`:

```html
<canvas id="game" width="400" height="600"></canvas>
```

Oyundaki her şeyi (kuşu, boruları, skoru) bu alanın üstüne **boyayarak** göstereceğiz. Tıpkı bir kâğıda resim
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

**Neden `400` ve `600` yazmıyoruz?** Canvas'ın enini `canvas.width`, boyunu `canvas.height` ile sorabilirsin. Sayıyı
elle yazmak yerine bunları kullanırsan, canvas'ın boyu bir gün değişse bile kodun doğru kalır.

**Renkler** `'gold'` (altın sarısı) gibi İngilizce adlarla ya da `'#70c5ce'` gibi kodlarla yazılır. `#`'ten
sonraki altı karakter ikişer ikişer kırmızı, yeşil ve mavinin ne kadar olduğunu söyler (`70`, `c5`, `ce`). Bu
kodları ezberlemen gerekmez; `'#70c5ce'` bizim gök mavimiz.

# --task--

1. Store the canvas in `canvas` and its 2D context in `ctx`.
2. Fill the whole canvas with the sky color `'#70c5ce'`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   ```

2. Bir alt satıra fırçayı alan satırı yaz:

   ```js
   const ctx = canvas.getContext('2d')
   ```

3. Bir satır boşluk bırak, sonra bütün alanı gök mavisine boyayan iki satırı ekle:

   ```js
   ctx.fillStyle = '#70c5ce'
   ctx.fillRect(0, 0, canvas.width, canvas.height)
   ```

   `(0, 0)` köşesinden başlayıp canvas'ın eni (400) ve boyu (600) kadar, yani bütün alanı kaplayan bir dikdörtgen
   boyuyoruz.

4. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağdaki oyun alanı baştan aşağı açık maviye dönmeli ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı bir kontrol kalırsa yazdığını yukarıdakilerle harf harf karşılaştır:
   büyük/küçük harf, nokta ve tırnaklar önemlidir.

# --tests--

`canvas` and `ctx` should be the game canvas and its 2D context.
tr: `canvas` ve `ctx`, oyun canvas'ı ve onun 2D bağlamı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

The whole 400×600 canvas should be filled with `#70c5ce`.
tr: 400×600 canvas'ın tamamı `#70c5ce` ile doldurulmalı.

```js
const sky = $.rects('#70c5ce').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 600)
assert.lengthOf(sky, 1)
```

# --seed--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#70c5ce'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
