---
title: Hills and a landing pad
title_tr: Tepeler ve bir iniş pisti
skills: [prog.arrays, game.canvas]
---

# --explanation--

The moon's surface is a list of heights, one every 40 pixels, joined by straight lines. Random heights make hills; one
flat stretch where several points share the same height is the **landing pad**.

```js
ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
```

Later the game needs the height of the ground at **any** `x`, not only at the points. Between two points the ground is a
straight line, so find the two points around `x` and blend between them by how far `x` is along:

```js
const t = (x - i * STEP) / STEP          // 0 at point i, 1 at point i + 1
return ground[i] + (ground[i + 1] - ground[i]) * t
```

This is **linear interpolation**, one of the most used formulas in games: it is also how you fade colors, move things
smoothly from A to B and animate numbers.

The ground is drawn as one filled shape: start at the bottom left, go through every point, finish at the bottom right.

# --explanation-tr--

**Bu adımda:** Ay yüzeyini çizeceğiz. Sağda lacivert bir gökyüzü, altında gri, inişli çıkışlı tepeler ve tepelerin
arasında düz, yeşil bir iniş pisti göreceksin. Her **Çalıştır**'da tepeler rastgele yeniden oluşur.

Bu ilk adım uzun, çünkü birçok temel şeyi birlikte öğreneceğiz. Acele etme; kodu parça parça yazacaksın.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×360 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Önce onu bulur,
sonra çizim aracını (bağlam, **context**) alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun fırçasını al
```

`const ad = ...` bir şeye ad (etiket) verir; buna **sabit** denir. Nokta (`.`) "bunun içindeki" demektir. Tırnak
içindekiler **yazıdır** (metin). `ctx.fillStyle = '#020617'` fırçanın rengini seçer (`#` ile başlayan renk kodu),
`ctx.fillRect(x, y, en, boy)` bir dikdörtgen boyar. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y`
**aşağı** doğru büyür. Yani büyük `y` daha alçak demektir.

**Değişken: `let`.** `let ground` "adı `ground` olan bir kutu aç" demek. `const`'tan farkı, içindekini sonra
değiştirebilmendir. `=` olmadan yazılırsa kutu şimdilik boştur.

**Dizi (array): bir liste.** Zemin, her 40 pikselde bir yükseklikten oluşan bir listedir:
`[250, 300, 280, ...]`. Listenin elemanlarına sıra numarasıyla ulaşılır ve sayma **0'dan başlar**: `ground[0]` ilk,
`ground[1]` ikinci eleman. `ground.length` listenin eleman sayısıdır. 480 / 40 = 12 aralık, yani 13 nokta vardır.

```js
ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
```

Bu satır "`points` tane elemanlı bir liste yap; her elemanı `() => ...` ile hesapla" der. `() => ...` adı
olmayan küçük bir fonksiyondur (ok fonksiyonu). `Math.random()` 0 ile 1 arasında rastgele bir sayı verir; 120 ile
çarpıp 210 ekleyince 210 ile 330 arasında rastgele bir yükseklik olur.

**Fonksiyon.** `function makeGround() { ... }` bir iş listesine ad verip saklar (tarif yazmak gibi). Tarif
yazılınca hemen çalışmaz; `makeGround()` diye **çağırınca** çalışır. `return` bir fonksiyonun sonucunu geri verir.

**Pist.** Rastgele bir yerde yan yana 3 noktaya aynı yüksekliği veririz; aradaki 2 aralık (80 piksel) düz olur:

- `Math.floor(sayı)` → sayının küsuratını atar: `Math.floor(3.7)` → 3. Böylece rastgele bir **tam** sıra numarası
  elde ederiz. `1 + ...` ilk noktayı atlar ki pist kenara yapışmasın.
- `for (let i = start; i <= start + width; i++) ground[i] = y` → bir **döngü**: `i`'yi `start`'tan başlat, `start + 2`
  olana kadar (`<=` "küçük veya eşit") her turda bir artır (`i++`) ve o noktanın yüksekliğini `y` yap.
- `pad = { x1: ..., x2: ..., y }` → bir **nesne**: birbirine ait bilgileri `ad: değer` çiftleriyle tek pakette tutar.
  Sadece `y` yazmak, `y: y` yazmanın kısasıdır. İçinden `pad.x1` diye okunur.

**Herhangi bir `x`'te zemin nerede?** İleride aracın ayağının altındaki zemini bilmemiz gerekecek, ama elimizde sadece
her 40 pikseldeki noktalar var. İki nokta arası düz bir çizgi olduğu için: `x`'in hangi iki nokta arasında olduğunu
buluruz (`i`) ve aradaki yolun ne kadarını gittiğini (`t`, 0 ile 1 arası) hesaplarız:

```js
const t = (x - i * STEP) / STEP                  // i. noktada 0, bir sonrakinde 1
return ground[i] + (ground[i + 1] - ground[i]) * t
```

Örnek: noktalar 100 ve 200, `x` tam ortada (`t = 0.5`) → 100 + 100 × 0.5 = 150. Buna **doğrusal ara değer**
(linear interpolation) denir; oyunlarda renk geçişinden yumuşak harekete kadar her yerde kullanılır.
`Math.max`/`Math.min` `i`'yi listenin içinde tutar (ikisinden büyüğünü/küçüğünü verirler).

**Şekil çizmek (path).** Zemini tek bir dolu şekil olarak çizeriz: kalemi sol alt köşeye koy, her noktaya çizgi çek,
sağ alt köşeye in, içini boya:

- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.moveTo(x, y)` → kalemi kaldırıp buraya koy. `ctx.lineTo(x, y)` → buraya çizgi çek.
- `ground.forEach((y, i) => ...)` → listenin her elemanı için bir kez çalışır; `y` elemanın değeri, `i` sıra numarası.
- `ctx.fill()` → çizilen şeklin içini boya.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der. `loop` en
sonda kendini yeniden istediği için saniyede ~60 kez çizim yapılır.

# --task--

1. Add `STEP = 40`, and write `makeGround()`: `ground` gets `canvas.width / STEP + 1` random heights from `210` to `330`.
   Pick a random start point from `1` so the pad fits, a random `y` from `250` to `320`, set the pad's 3 points (a width of
   2 steps) to that `y`, and save `pad = { x1, x2, y }` in pixels.
2. Write `groundY(x)` with linear interpolation, keeping `i` between `0` and `ground.length - 2`.
3. Draw every frame: a `'#020617'` sky, the ground as one `'#475569'` shape through all the points, and the pad as a
   `'#22c55e'` bar 4 pixels high centered on its `y`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan satırları yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve nokta aralığını yaz:

   ```js
   const STEP = 40 // the ground is a line through a point every STEP pixels
   ```

3. Bir boş satır bırak ve iki boş değişkeni aç:

   ```js
   let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
   let pad // { x1, x2, y }: the flat landing pad
   ```

4. Bir boş satır bırak ve zemini üreten fonksiyonu yaz:

   ```js
   // Random hills, with one flat stretch: the pad.
   function makeGround() {
     const points = canvas.width / STEP + 1
     ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
     const width = 2
     const start = 1 + Math.floor(Math.random() * (points - 2 - width))
     const y = 250 + Math.random() * 70
     for (let i = start; i <= start + width; i++) ground[i] = y
     pad = { x1: start * STEP, x2: (start + width) * STEP, y }
   }
   ```

5. Bir boş satır bırak ve her `x` için zemin yüksekliğini veren fonksiyonu yaz:

   ```js
   // The ground between two points is a straight line: find where x is along it.
   function groundY(x) {
     const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
     const t = (x - i * STEP) / STEP
     return ground[i] + (ground[i + 1] - ground[i]) * t
   }
   ```

6. Bir boş satır bırak ve oyunu kuran `reset()` fonksiyonunu yaz (şimdilik sadece zemini üretir):

   ```js
   function reset() {
     makeGround()
   }
   ```

7. Bir boş satır bırak ve çizim fonksiyonunu yaz: gökyüzü, zemin şekli, yeşil pist (4 piksel yüksek, `y`'nin 2
   piksel üstünden başlar ki ortalansın):

   ```js
   function draw() {
     ctx.fillStyle = '#020617'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#475569'
     ctx.beginPath()
     ctx.moveTo(0, canvas.height)
     ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
     ctx.lineTo(canvas.width, canvas.height)
     ctx.fill()
     ctx.fillStyle = '#22c55e'
     ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)
   }
   ```

8. Bir boş satır bırak ve oyun döngüsünü yazıp oyunu başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

9. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda koyu gökyüzü, gri tepeler ve tepelerin arasında yeşil bir pist
   görmelisin; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri ve süslü parantezleri tek tek
   karşılaştır; büyük/küçük harf de önemlidir (`Math.floor`, `forEach`).

# --tests--

The ground should be random hills with one flat pad.
tr: Zemin, düz bir pisti olan rastgele tepeler olmalı.

```js
assert.lengthOf(ground, 13)
assert.isTrue(ground.every((y) => y >= 210 && y <= 330))
assert.strictEqual(pad.x2 - pad.x1, 80)
assert.isTrue(pad.x1 >= 40 && pad.x2 <= 480)
assert.strictEqual(groundY(pad.x1), pad.y)
assert.strictEqual(groundY((pad.x1 + pad.x2) / 2), pad.y)
```

Between the points, the ground should be a straight line.
tr: Noktaların arasında zemin düz bir çizgi olmalı.

```js
ground = [100, 200, 200, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
assert.strictEqual(groundY(0), 100)
assert.strictEqual(groundY(20), 150)
assert.strictEqual(groundY(30), 175)
assert.strictEqual(groundY(100), 250)
assert.strictEqual(groundY(480), 300)
```

The ground and the pad should be drawn.
tr: Zemin ve pist çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#22c55e').map((r) => [r.x, r.y, r.w, r.h]), [[pad.x1, pad.y - 2, 80, 4]])
const lines = $.screen().filter((c) => c.op === 'lineTo')
assert.lengthOf(lines, 14, 'one line to every point, then to the bottom right')
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === '#475569'))
```

# --seed--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function reset() {
  makeGround()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
