---
title: Draw the grid
title_tr: Izgarayı çiz
skills: [game.canvas, prog.loops]
---

# --explanation--

The board is 300×300 pixels: three columns and three rows of 100 pixel cells. The grid is only four lines: two
vertical, two horizontal, each sitting on a cell border at `100` and `200`.

A thin rectangle is the easiest line to draw. To center a 4 pixel line on `x = 100`, start it 2 pixels earlier:

```js
ctx.fillRect(100 - 2, 0, 4, canvas.height)   // vertical line at x = 100
```

Both vertical lines follow the same pattern, `i * CELL` for `i = 1` and `i = 2`, and so do the horizontal ones. That
repetition is a hint to use a loop instead of copy-pasting four nearly identical lines.

# --explanation-tr--

**Bu adımda:** XOX (tic-tac-toe) oyununun tahtasını çizeceğiz. Çalıştırınca sağda koyu lacivert bir kare ve onu
dokuz eşit kutuya bölen dört gri çizgi göreceksin.

Daha önce hiç kod yazmadıysan sorun değil: her şeyi baştan anlatacağız. Acele etme, her parçayı oku.

**Ekranda ne var?** Solda **kod paneli** var; içinde `game.js` adlı dosya açık. Kodu buraya yazarsın. Sağ üstte
**Oyun** alanı, kodunun ne yaptığını gösterir. Sağ altta **Kontroller** var: yazdığın kodun istenen şeyi yapıp
yapmadığını kontrol eden maddeler. Hepsi yeşil olunca adım tamamdır. Takılırsan **Çözümü göster** düğmesi
doğru kodu gösterir, **Bu adımı baştan başla** ise kodu adımın başındaki hâline döndürür. Telefonda bu alanlar
**Görev**, **Kod** ve **Oyun** sekmeleridir.

**Kod nedir?** `game.js` dosyası, bilgisayara verdiğin talimatların listesidir. Bilgisayar onları **yukarıdan
aşağıya, satır satır** okur ve sırayla yapar. Kodu yazdıktan sonra **Çalıştır** düğmesine basınca (ya da
`Ctrl + Enter`) bilgisayar talimatları uygular. `//` ile başlayan satırlar **yorumdur**: bilgisayar onları atlar,
sadece insanlar için not. Kod panelindeki ilk üç satır böyle yorumlardır.

**Canvas (tuval) nedir?** Sayfada 300×300 piksellik boş bir resim alanı var. (Piksel, ekrandaki en küçük
noktadır.) Adı `canvas`, kimliği (id) `game`:

```html
<canvas id="game" width="300" height="300"></canvas>
```

Oyundaki her şeyi (tahtayı, X'leri, O'ları) bu alanın üstüne **boyayarak** göstereceğiz. Kâğıda resim yapmak
gibi: önce kâğıdı bulursun, sonra eline fırçayı alırsın.

**1. Kâğıdı bul.**

```js
const canvas = document.getElementById('game')
```

Bunu parça parça okuyalım:

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir. Bir
  kutuya etiket yapıştırmak gibi: sonra hep o etiketle çağırırsın. `=` işareti "sağdakini soldaki ada ver"
  demektir.
- `document` → sayfanın kendisi.
- `.getElementById('game')` → "kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut" demektir.
  Parantez `( )` komuta bilgi verir. Tırnak içindeki `'game'` bir **yazıdır** (metin); tırnaksız yazılsaydı
  bilgisayar onu bir ad sanardı.

**2. Fırçayı al.** Canvas'a doğrudan çizilmez; önce onun çizim aracını (bağlam, **context**) alırız:

```js
const ctx = canvas.getContext('2d')
```

`ctx` artık senin fırçan. Onunla iki şey yaparsın: **renk seçmek** ve **dikdörtgen boyamak**.

```js
ctx.fillStyle = 'orange'      // fırçaya turuncu boya sür
ctx.fillRect(10, 20, 50, 30)  // bir dikdörtgen boya: x, y, genişlik, yükseklik
```

**Konum nasıl verilir?** Canvas'ın **sol üst köşesi** `(0, 0)` noktasıdır. `x` sağa gittikçe, `y` ise **aşağı**
indikçe büyür (okuldaki grafiğin tersine). Yukarıdaki örnek: soldan 10, yukarıdan 20 piksel içeride, 50 piksel
eninde ve 30 piksel boyunda bir dikdörtgen. `canvas.width` ve `canvas.height` canvas'ın eni ve boyudur (300).

**Renkler** `'orange'` gibi İngilizce adlarla ya da `'#1e1e2e'` gibi kodlarla yazılır. `#`'tan sonraki harf ve
rakamlar rengin kırmızı, yeşil ve mavi miktarını söyler; `'#1e1e2e'` koyu bir lacivert, `'#585b70'` bir gridir.
Kodları ezberlemen gerekmez, verileni aynen yaz.

**Sayıya ad vermek.** Tahta 3×3 hücre ve her hücre 100 piksel. Bu sayıya bir ad veririz: `const CELL = 100`.
Sayılar tırnaksız yazılır. Artık `CELL` yazdığın her yerde bilgisayar `100` anlar.

**Çizgileri çizmek.** Izgara sadece dört çizgidir: ikisi dikey, ikisi yatay; hepsi hücre sınırlarında, `100` ve
`200` pikselde. Çizgi çizmenin en kolay yolu **ince bir dikdörtgendir**. 4 piksel kalınlığındaki bir çizginin
tam `x = 100`'ün üstünde ortalanması için 2 piksel önce başlarız:

```js
ctx.fillRect(100 - 2, 0, 4, canvas.height)   // x = 100'de dikey çizgi
```

`-` çıkarma, `*` çarpma demektir. İki dikey çizgi aynı kalıbı izler: `1 * CELL` ve `2 * CELL`. Yatay çizgiler de
öyle. Neredeyse aynı dört satırı kopyalamak yerine **döngü (loop)** kullanırız: "şunu birkaç kez tekrarla".

```js
for (let i = 1; i < 3; i++) {
  // buradaki satırlar önce i = 1, sonra i = 2 için çalışır
}
```

Bunu parça parça okuyalım:

- `for ( ... ) { ... }` → "süslü parantezin içini tekrarla". `{` ile `}` arasındaki satırlar tekrarlanan kısımdır;
  okunaklı olsun diye iki boşlukla içeri yazılır.
- `let i = 1` → `i` adında bir sayaç, 1'den başlar. `let` de `const` gibi ad verir, ama değeri sonradan
  değişebilir. Buna **değişken** denir.
- `i < 3` → "`i` 3'ten küçük olduğu sürece devam et". `<` küçüktür demektir.
- `i++` → her turdan sonra `i`'yi 1 artır.

Yani döngü iki tur döner: `i = 1` ve `i = 2`. Her turda bir dikey, bir yatay çizgi çizer: toplam dört çizgi.

# --task--

1. Store the canvas in `canvas`, its 2D context in `ctx`, and add `const CELL = 100`.
2. Fill the whole canvas with `'#1e1e2e'`.
3. In `'#585b70'`, draw the four grid lines, 4 pixels thick and centered on `CELL` and `2 * CELL`: for `i` from 1 to
   2, a vertical rectangle `(i * CELL - 2, 0, 4, canvas.height)` and a horizontal one
   `(0, i * CELL - 2, canvas.width, 4)`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve kâğıdı ve fırçayı alan iki
   satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve hücre boyunu yaz:

   ```js
   const CELL = 100
   ```

3. Bir satır boşluk bırak, sonra bütün tahtayı koyu lacivert boyayan iki satırı ekle:

   ```js
   ctx.fillStyle = '#1e1e2e'
   ctx.fillRect(0, 0, canvas.width, canvas.height)
   ```

   `(0, 0)` köşesinden başlayıp bütün alanı kaplayan bir dikdörtgen boyuyoruz.

4. Bir satır boşluk bırak, sonra rengi griye çevir ve dört çizgiyi çizen döngüyü yaz:

   ```js
   ctx.fillStyle = '#585b70'
   for (let i = 1; i < 3; i++) {
     ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
     ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
   }
   ```

   Döngünün içindeki ilk satır dikey çizgiyi (4 piksel en, tahta boyu), ikincisi yatay çizgiyi (tahta eni, 4
   piksel boy) çizer.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda koyu bir kare ve onu 9 kutuya bölen gri çizgiler görmelisin.
   Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı bir kontrol kalırsa yazdığını yukarıdakilerle harf harf
   karşılaştır: büyük/küçük harf, nokta, virgül, tırnak ve parantezler önemlidir.

# --tests--

The board background should fill the 300×300 canvas.
tr: Tahta arka planı 300×300 canvas'ı doldurmalı.

```js
assert.strictEqual(CELL, 100)
assert.isTrue($.rects('#1e1e2e').some((r) => r.x === 0 && r.y === 0 && r.w === 300 && r.h === 300))
```

There should be four grid lines on the cell borders.
tr: Hücre sınırlarında dört ızgara çizgisi olmalı.

```js
assert.sameDeepMembers($.rects('#585b70'), [
  { x: 98, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 198, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 0, y: 98, w: 300, h: 4, color: '#585b70' },
  { x: 0, y: 198, w: 300, h: 4, color: '#585b70' },
])
```

# --seed--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
  ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
}
```
