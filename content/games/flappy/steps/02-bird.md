---
title: Draw the bird
title_tr: Kuşu çiz
skills: [game.canvas, game.state]
---

# --explanation--

The bird is a circle. Canvas has no `fillCircle`; circles are **paths**. You describe a shape, then fill it:

```js
ctx.beginPath()                          // start a new shape
ctx.arc(x, y, radius, 0, Math.PI * 2)    // a full circle around (x, y)
ctx.fill()                               // paint it with fillStyle
```

The angles are in **radians**: a full turn is `2π` (`Math.PI * 2`), not 360. Forgetting `beginPath()` is a classic bug:
the new circle is added to the previous shape and they get filled together.

Keep the bird as **state**, an object with its position and size, and draw it from that object inside a `draw()`
function. Nothing moves yet, but the structure is ready for it.

# --explanation-tr--

**Bu adımda:** gökyüzünün üstüne kuşumuzu, sarı bir daire olarak çizeceğiz. Çalıştırınca mavi alanın sol tarafında,
ortaya yakın bir yerde altın sarısı küçük bir top göreceksin.

**Kuşun bilgilerini bir yerde tutalım: nesne (object).** Kuşun nerede olduğunu ve ne kadar büyük olduğunu
bilmemiz gerekiyor. Bu üç bilgiyi tek bir pakette toplarız:

```js
let bird = { x: 100, y: 300, r: 14 }
```

Bunu parça parça okuyalım:

- `let bird =` → "buna `bird` (kuş) diyeceğim". `let` de `const` gibi bir ad verir, ama farkı şu: `let` ile
  adlandırılan şeyin (buna **değişken** denir) içindeki değer sonradan **değiştirilebilir**. Kuş hareket edeceği
  için `let` kullanıyoruz.
- `{ ... }` → süslü parantezler bir **nesne** oluşturur: etiketli bilgilerden oluşan bir kart gibi.
- `x: 100` → "`x` adlı alanın değeri 100". Alanlar virgülle ayrılır. Burada `x` soldan uzaklık, `y` yukarıdan
  uzaklık, `r` ise dairenin **yarıçapı** (merkezden kenara uzaklık).

Nesnenin bir alanına nokta ile ulaşırsın: `bird.x` "kuşun x'i" demektir, değeri 100'dür.

**Daire nasıl çizilir?** Canvas'ta hazır bir "daire boya" komutu yok. Daireyi önce **tarif eder**, sonra
**boyarız**. Buna **yol** (path) denir:

```js
ctx.beginPath()                          // yeni bir şekle başla
ctx.arc(x, y, yarıçap, 0, Math.PI * 2)   // (x, y) etrafında tam bir daire tarif et
ctx.fill()                               // o şekli fillStyle rengiyle boya
```

`arc` bir yay çizer; son iki sayı yayın nereden başlayıp nerede bittiğini söyleyen açılardır. Açılar derece değil
**radyan** ile verilir: tam tur 360 değil `2π`'dir. `Math.PI` hazır π sayısıdır (3,14...), `*` çarpma işaretidir;
yani `0`'dan `Math.PI * 2`'ye kadar demek "tam bir tur" demektir.

`beginPath()`'i unutmak sık yapılan bir hatadır: yeni daire bir önceki şekle eklenir ve ikisi birlikte boyanır.

**Fonksiyon (function) nedir?** Birkaç komutu bir ad altında toplamaktır, bir yemek tarifi gibi. Tarifi yazmak
yemeği pişirmez; tarifi **uygulamak** gerekir:

```js
function draw() {
  // buradaki satırlar tarifin adımları
}

draw()   // tarifi uygula: içindeki satırları şimdi çalıştır
```

- `function draw()` → "`draw` (çiz) adında bir tarif tanımlıyorum". Buna fonksiyonu **tanımlamak** denir.
- `{` ile `}` arası → tarifin adımları. İçerideki satırları iki boşluk içeriden yazarız ki okunsun.
- `draw()` → adın sonundaki `()` "şimdi çalıştır" demektir. Buna fonksiyonu **çağırmak** denir.

Gökyüzünü ve kuşu `draw()`'un içine koyuyoruz, çünkü ileride kuş hareket edince her şeyi tekrar tekrar çizmemiz
gerekecek; o zaman sadece `draw()` demek yetecek. Önce gökyüzü, sonra kuş: sonra boyanan üstte görünür.

# --task--

1. Add `let bird = { x: 100, y: 300, r: 14 }` (`r` is the radius).
2. Write `function draw()` that paints the sky, then the bird as a `'gold'` circle at `bird.x`, `bird.y` with radius
   `bird.r`.
3. Call `draw()` (replacing the loose sky-painting lines).

# --task-tr--

1. `const ctx = canvas.getContext('2d')` satırının altına bir boş satır bırak ve kuşu ekle:

   ```js
   let bird = { x: 100, y: 300, r: 14 }
   ```

2. Şimdi 1. adımda yazdığın iki gökyüzü satırını (`ctx.fillStyle = '#70c5ce'` ve `ctx.fillRect(...)`) bir
   `draw()` fonksiyonunun içine al ve altına kuşu çizen satırları ekle. Yani `let bird ...` satırının altındaki
   her şeyi silip yerine şunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#70c5ce'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'gold'                            // ← yeni
     ctx.beginPath()                                   // ← yeni
     ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)   // ← yeni
     ctx.fill()                                        // ← yeni
   }
   ```

   `// ← yeni` yazan yorumları yazman gerekmez, sadece hangi satırların yeni olduğunu gösteriyor.

3. Fonksiyonun kapanış `}`'inden sonra bir boş satır bırak ve en alta fonksiyonu çağıran satırı yaz:

   ```js
   draw()
   ```

   Bu olmazsa tarif yazılmış ama hiç uygulanmamış olur ve ekranda hiçbir şey çıkmaz.

4. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Mavi gökyüzünün solunda sarı bir daire görmelisin ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa: gökyüzü satırlarının hem fonksiyonun içinde hem dışında
   kalmadığından ve `ctx.fill()` satırını unutmadığından emin ol.

# --tests--

`bird` should start at (100, 300) with radius 14.
tr: `bird` (100, 300) noktasında ve yarıçapı 14 olarak başlamalı.

```js
assert.include(bird, { x: 100, y: 300, r: 14 })
```

The bird should be drawn as a gold circle.
tr: Kuş altın renkli bir daire olarak çizilmeli.

```js
assert.deepEqual($.arcs(), [{ x: 100, y: 300, r: 14, color: 'gold' }])
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === 'gold'), 'call ctx.fill() after ctx.arc()')
```

`draw()` should draw the bird wherever it is, on a fresh sky.
tr: `draw()` kuşu nerede olursa orada, temiz bir gökyüzü üzerine çizmeli.

```js
bird.y = 120
draw()
assert.deepEqual($.arcs(), [{ x: 100, y: 120, r: 14, color: 'gold' }])
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let bird = { x: 100, y: 300, r: 14 }

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

draw()
```
