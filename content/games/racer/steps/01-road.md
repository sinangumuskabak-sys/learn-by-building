---
title: A road drawn with perspective
title_tr: Perspektifle çizilen bir yol
skills: [game.canvas]
---

# --explanation--

Arcade racers of the eighties had no 3D hardware, yet their roads rushed towards you. The trick is **perspective
projection**: things twice as far away look half as big. A point on the road `dz` in front of the camera, `dx` to the side
and `dy` above the camera, lands on the screen at:

```js
const scale = DEPTH / dz                  // smaller when further away
x = W / 2 + scale * dx * (W / 2)
y = H / 2 - scale * dy * (H / 2)          // the camera is above the road, so dy is negative: below the horizon
```

`DEPTH` sets the field of view. The road itself is a long list of short **segments**. Each one becomes a trapezoid on the
screen: the near edge is wide and low, the far edge narrow and higher, and as the segments get further away they squeeze
towards the horizon in the middle.

Draw them **from far to near** (the painter's algorithm): nearer road is painted over whatever is behind it, so there is
never a question of what hides what. Alternating the colors every three segments (grass, red and white kerbs, road, a
center line) is what will make the road look like it is moving.

# --explanation-tr--

**Bu adımda:** mavi bir gökyüzünün altında, ufka doğru daralan gri bir yol çizeceğiz. Yolun kenarında kırmızı-beyaz
bordürler, ortasında kesik beyaz bir çizgi olacak. Henüz hiçbir şey kıpırdamıyor; sadece çizim. Bu ilk adım uzun,
çünkü yarış oyununun bütün temelini birlikte kuruyoruz. Acele etme, parça parça git.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not. Bir satırın sonuna da yorum yazabilirsin.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 320 piksel boyunda boş bir resim alanı var: `canvas`,
kimliği (id) `game`. Oyundaki her şeyi bu alana **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun 2B çizim aracını (context) al
```

- `const canvas =` → "Bundan sonra buna `canvas` diyeceğim." Buna **sabit** denir: bir kutuya etiket yapıştırmak gibi.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` artık fırçan. `ctx.fillStyle = '#7dd3fc'` fırçaya renk sürer, `ctx.fillRect(x, y, en, boy)` dikdörtgen boyar.
  Renkler `'#7dd3fc'` gibi kodlarla yazılır (bu açık mavi).

**Konum:** canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür.

**`const` ve `let`, sayılar.** `const SEG = 200` bir sayıya ad verir ve o ad hiç değişmez. `let position` ise
**değişken**dir: değeri sonradan değişebilir (araba ilerledikçe `position` büyüyecek). `=` "şu değeri koy" demektir.
Sayılarla `+ - * /` işlemleri yapılır. `Math.tan`, `Math.PI` hazır matematik araçlarıdır; `DEPTH` satırını olduğu gibi
kopyalaman yeterli (kameranın ne kadar geniş gördüğünü ayarlar).

**Fonksiyon (function)** bir işe verilmiş addır; bir **tarif** gibi. Önce tarifi yazarsın (tanımlama), sonra
adıyla kullanırsın (**çağırma**):

```js
function selamla(isim) {      // tarif: isim diye bir malzeme (parametre) alır
  return 'Merhaba ' + isim    // return: sonucu geri ver
}
selamla('Ayşe')               // çağırma: 'Merhaba Ayşe' sonucunu verir
```

Süslü parantezler `{ }` fonksiyonun içini, yani tarifin adımlarını çevreler.

**Dizi (array) ve nesne (object).** `[]` boş bir listedir. `segments.push(x)` listenin sonuna `x`'i ekler,
`segments.length` listedeki eleman sayısıdır. `{ curve: 0 }` ise bir **nesnedir**: etiketli bilgi kutusu
(`curve` adında bir alanı var, değeri `0`). `{ curve }` kısaltmasının anlamı `{ curve: curve }`'dür.

**Döngü (loop).** Aynı işi birçok kez yaptırır:

```js
for (let i = 0; i < 800; i++) { ... }
```

"`i` 0'dan başlasın; `i` 800'den küçük olduğu sürece `{ }` içini yap; her turdan sonra `i`'yi 1 artır (`i++`)."
Ters sayan hali `for (let i = shown.length - 1; i >= 0; i--)`: sondan başa doğru gider.

**Perspektif: hilenin kendisi.** Seksenlerin yarış oyunlarında 3B yoktu ama yol üstüne akıyordu. Sır şu:
**iki kat uzaktaki şey yarım büyüklükte görünür.** Kameranın `dz` önündeki, `dx` yanındaki, `dy` yukarısındaki bir
nokta ekranda şuraya düşer:

```js
const scale = DEPTH / dz               // uzaklaştıkça küçülür
x = W / 2 + scale * dx * (W / 2)
y = H / 2 - scale * dy * (H / 2)       // kamera yolun üstünde, dy eksi: nokta ufkun altına düşer
```

`project` fonksiyonumuz tam bunu hesaplar ve sonucu `{ x, y, w }` nesnesi olarak **döndürür**; `w`, o uzaklıkta
yolun yarı genişliğidir.

**Yol = parçalar.** Yol, 200 birim uzunluğunda 800 kısa **parçadan** (segment) oluşan bir listedir. Her parça ekranda bir
**yamuk** olur: yakın kenarı geniş ve aşağıda, uzak kenarı dar ve yukarıda. `quad` fonksiyonu bu yamuğu çizer:
`beginPath()` yeni bir şekle başlar, `moveTo` kalemi bir köşeye koyar, `lineTo` sonraki köşelere çizgi çeker,
`fill()` içini boyar.

**Uzaktan yakına boya** (ressam algoritması): önce en uzak parçayı, en son en yakını boyarız. Yakındaki,
arkasındakinin üstüne gelir; neyin neyi örttüğü hiç sorun olmaz.

**Yeni küçük işaretler:**

- `%` bölümden kalandır: `7 % 2` → `1`. `x % 2 === 0` "x çift mi?" demektir.
- `===` "eşit mi?" diye sorar; `<`, `>=` küçük/büyük-eşit karşılaştırmalarıdır. Cevap doğru (`true`) ya da yanlış (`false`) olur.
- `if (koşul) iş` → koşul doğruysa işi yap.
- `light ? 'beyaz' : 'kırmızı'` → "`light` doğruysa ilkini, değilse ikincisini seç".
- `Math.floor(3.7)` → `3`: sayıyı aşağı yuvarlar. `Math.floor(index / 3)` sayesinde renkler **üç parçada bir** değişir.
- `const { index, near, far } = shown[i]` → nesnenin üç alanını tek seferde üç ayrı ada çıkarır.
- `const add = (count, curve) => { ... }` → fonksiyonun kısa yazılışı (ok fonksiyonu). `=>` "şunu yap" gibi okunur.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden hemen önce `loop`'u çağır" der.
`loop` de çizip kendini tekrar ister; böylece saniyede yaklaşık 60 kez çizim yapılır. Şimdilik resim hep aynı,
sonraki adımda hareket ekleyeceğiz.

# --task--

1. Add the constants from the solution (`SEG`, `ROAD`, `CAMERA_HEIGHT`, `DEPTH`, `DRAW`) and `buildTrack()`, which fills
   `segments` with 800 straight segments `{ curve: 0 }` and sets `trackLength`. `reset()` builds it and sets `position = 0`.
2. Write `project(dx, dy, dz)` returning `{ x, y, w }`, where `w` is the half width of the road at that distance
   (`scale * ROAD * (W / 2)`), and `quad(color, x1, y1, w1, x2, y2, w2)` that fills the trapezoid between the two edges.
3. Fill the whole canvas with a `'#7dd3fc'` sky and its lower half with `'#15803d'` ground, then work out the near and far edge of the next `DRAW` segments (skipping
   any that start behind the camera) and paint them from far to near: a grass band across the whole width, the kerb
   (1.15 × the road width), the road and, on light segments, a center line (0.03 × the width). Light segments are those with
   `Math.floor(index / 3)` even; see the solution for the colors.

# --task-tr--

Kodu aşağıdaki sırayla, hep bir öncekinin **altına** yaz. Her bloktan sonra bir boş satır bırakabilirsin.

1. Kod panelinde en alttaki `// Write your code below.` satırının altına, kâğıdı ve fırçayı alan satırları, sonra
   ölçüleri yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const W = canvas.width
   const H = canvas.height
   const SEG = 200 // length of one road segment, in world units
   const ROAD = 1000 // half the width of the road
   const CAMERA_HEIGHT = 1000
   const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
   const DRAW = 100 // segments drawn
   ```

   `W` ve `H` canvas'ın eni ve boyu (480 ve 320). `DRAW`, ekranda kaç parça çizeceğimiz.

2. Altına, değeri sonradan verilecek üç değişkeni ekle:

   ```js
   let segments // the track: { curve } for each segment
   let trackLength
   let position // how far along the track the camera is
   ```

3. Altına pisti kuran `buildTrack` ve oyunu başlangıca getiren `reset` fonksiyonlarını yaz:

   ```js
   // The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
   function buildTrack() {
     segments = []
     const add = (count, curve) => {
       for (let i = 0; i < count; i++) segments.push({ curve })
     }
     add(800, 0) // straight for now
     trackLength = segments.length * SEG
   }

   function reset() {
     buildTrack()
     position = 0
   }
   ```

   `add(800, 0)` listeye 800 düz parça (`{ curve: 0 }`) ekler. `trackLength` pistin toplam uzunluğu: 800 × 200.

4. Altına perspektif hesabını yapan `project` ve yamuk çizen `quad` fonksiyonlarını yaz:

   ```js
   // Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
   function project(dx, dy, dz) {
     const scale = DEPTH / dz
     return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
   }

   function quad(color, x1, y1, w1, x2, y2, w2) {
     ctx.fillStyle = color
     ctx.beginPath()
     ctx.moveTo(x1 - w1, y1)
     ctx.lineTo(x2 - w2, y2)
     ctx.lineTo(x2 + w2, y2)
     ctx.lineTo(x1 + w1, y1)
     ctx.fill()
   }
   ```

   `quad` bir yakın kenar (`x1`, `y1`, yarı genişlik `w1`) ve bir uzak kenar (`x2`, `y2`, `w2`) alır; aradaki dört
   köşeyi birleştirip `color` rengiyle boyar.

5. Altına her şeyi çizen `draw` fonksiyonunu yaz. İlk dört satır gökyüzü ve zemin; ilk döngü parçaların ekrandaki
   yerini hesaplar (kameranın arkasında kalanları, yani `z` sıfır ya da eksi olanları atlar); ikinci döngü onları
   **sondan başa**, yani uzaktan yakına boyar:

   ```js
   function draw() {
     ctx.fillStyle = '#7dd3fc'
     ctx.fillRect(0, 0, W, H)
     ctx.fillStyle = '#15803d'
     ctx.fillRect(0, H / 2, W, H / 2)

     // Work out where every segment is on screen, from near to far.
     const base = Math.floor(position / SEG)
     const shown = []
     for (let i = 0; i < DRAW; i++) {
       const index = (base + i) % segments.length
       const z = (base + i) * SEG - position
       const near = project(0, -CAMERA_HEIGHT, z)
       const far = project(0, -CAMERA_HEIGHT, z + SEG)
       if (z > 0) shown.push({ index, near, far })
     }

     // Paint from far to near, so nearer road covers what is behind it.
     for (let i = shown.length - 1; i >= 0; i--) {
       const { index, near, far } = shown[i]
       const light = Math.floor(index / 3) % 2 === 0
       ctx.fillStyle = light ? '#16a34a' : '#15803d'
       ctx.fillRect(0, far.y, W, near.y - far.y + 1)
       quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
       quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
       if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
     }
   }
   ```

   İkinci döngüdeki dört boyama sırasıyla: bütün en boyunca bir çimen şeridi, yoldan biraz geniş (1.15 kat) bordür,
   yolun kendisi ve açık parçalarda ince (0.03 kat) orta çizgi. Arkadan gelen öncekinin üstünü örter, bu yüzden bordür
   sadece yolun iki kenarında görünür.

6. En alta oyun döngüsünü ve başlatma satırlarını ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

   Buraya kadar yazdıkların hep **tarifti**; `reset()` ve `requestAnimationFrame(loop)` bu tarifleri gerçekten
   çalıştıran ilk iki satır.

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda mavi gökyüzü, yeşil çimen ve ufka doğru daralan, kenarları
   kırmızı-beyaz bir yol görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa önce renk kodlarını
   ve `for` döngülerindeki `>=`, `--` işaretlerini kontrol et; yol ters sırada çizilirse "uzaktan yakına" kontrolü kırmızı olur.

# --tests--

Points further away should be drawn smaller and closer to the horizon.
tr: Daha uzaktaki noktalar daha küçük ve ufka daha yakın çizilmeli.

```js
const near = project(0, -CAMERA_HEIGHT, 1000)
const far = project(0, -CAMERA_HEIGHT, 4000)
const s = DEPTH / 1000
assert.closeTo(near.y, 160 + s * 1000 * 160, 1e-9)
assert.closeTo(near.w, s * 1000 * 240, 1e-9)
assert.closeTo(far.w, near.w / 4, 1e-9)
assert.isBelow(far.y, near.y)
assert.isAbove(far.y, 160)
assert.strictEqual(project(1000, -CAMERA_HEIGHT, 1000).x, 240 + s * 1000 * 240)
```

The road should be painted from far to near.
tr: Yol uzaktan yakına boyanmalı.

```js
$.tick(1)
const calls = $.screen()
const roads = calls.filter((c) => c.op === 'fill' && (c.fill === '#6b7280' || c.fill === '#646b75'))
assert.lengthOf(roads, DRAW - 1)
const starts = calls.filter((c, i) => c.op === 'moveTo' && calls.slice(i, i + 5).some((d) => d.op === 'fill' && (d.fill === '#6b7280' || d.fill === '#646b75')))
assert.isBelow(starts[0].args[1], starts[starts.length - 1].args[1], 'the first road drawn is the one nearest the horizon')
assert.strictEqual(trackLength, 800 * SEG)
```

# --seed--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const SEG = 200 // length of one road segment, in world units
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
const DRAW = 100 // segments drawn

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
}

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}

function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) shown.push({ index, near, far })
  }

  // Paint from far to near, so nearer road covers what is behind it.
  for (let i = shown.length - 1; i >= 0; i--) {
    const { index, near, far } = shown[i]
    const light = Math.floor(index / 3) % 2 === 0
    ctx.fillStyle = light ? '#16a34a' : '#15803d'
    ctx.fillRect(0, far.y, W, near.y - far.y + 1)
    quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
    if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
