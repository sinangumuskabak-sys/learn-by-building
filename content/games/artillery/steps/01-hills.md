---
title: Hills from sine waves
title_tr: Sinüs dalgalarından tepeler
skills: [prog.arrays, game.canvas]
---

# --explanation--

In an artillery game two tanks stand on hills and take turns lobbing shells at each other. First, the hills.

The ground is a **height map**: one number per column of pixels, `ground[x]`, the y of the surface there. Drawing it is one thin
rectangle per column, from the surface down to the bottom.

Where do natural-looking hills come from? One sine wave gives regular bumps, like a corrugated roof. But **adding** a few sine waves
of different sizes and lengths, each shifted by a random amount, gives hills that look irregular and are still smooth:

```js
let y = 220
for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
```

The big slow wave makes the valleys, the small quick ones the bumps on top. Every game gets new random waves and a new landscape.
The result is clamped so hills are never too tall or too low.

The tanks stand on the surface: a tank's `y` is just `ground` at its `x`. `groundAt(x)` rounds `x` and keeps it on the canvas,
since shells will ask about any position at all.

# --explanation-tr--

**Bu adımda:** mavi bir gökyüzünün altına yeşil, dalgalı tepeler çizeceğiz ve iki tepenin üstüne birer tank koyacağız:
solda mavi, sağda kırmızı. **Çalıştır**'a her bastığında tepeler farklı olacak.

Topçu (artillery) oyununda iki tank tepelerin üstünde durur ve sırayla birbirine top mermisi atar. Önce tepeler.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 560 piksel eninde, 320 piksel boyunda bir resim alanı var: `canvas`, kimliği
(id) `game`. Oyundaki her şeyi bu alana **boyayarak** göstereceğiz:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun 2B çizim aracını (context) al: fırçan
```

- `const canvas =` → "Bundan sonra buna `canvas` diyeceğim." Buna **sabit** denir: kutuya yapıştırılmış bir etiket gibi.
  `let` ile verilen adlar ise **değişkendir**: değerleri sonradan değişebilir.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx.fillStyle = '#7dd3fc'` fırçaya renk sürer (bu açık mavi), `ctx.fillRect(x, y, en, boy)` dikdörtgen boyar.
- Canvas'ın sol üst köşesi `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür. Yani `y` büyüdükçe nokta aşağı iner.

**Zemin bir yükseklik haritasıdır.** Her piksel sütunu için tek bir sayı tutarız: `ground[x]`, o sütunda yüzeyin `y`'si.
560 sütun, 560 sayı. Bunlar bir **dizi** (array) içinde durur: köşeli parantezle yazılan sıralı bir liste. `ground[0]`
ilk sayı (numaralar 0'dan başlar), `ground.push(y)` listenin sonuna ekler, `ground.length` kaç eleman olduğunu söyler.
Çizmek kolay: her sütun için yüzeyden en alta kadar 1 piksel eninde ince bir dikdörtgen.

**Doğal görünen tepeler nereden gelir?** `Math.sin` (sinüs) düzenli iniş-çıkışlar veren bir dalgadır; tek başına oluklu
bir çatı gibi görünür. Ama farklı büyüklükte ve uzunlukta birkaç dalgayı **toplarsan**, her birini rastgele biraz
kaydırarak, hem düzensiz hem de yumuşak tepeler çıkar:

```js
let y = 220
for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
```

Büyük ve yavaş dalga vadileri, küçük ve hızlı olanlar üstlerindeki tümsekleri yapar. `Math.random()` her çağrıda 0 ile 1
arasında rastgele bir sayı verdiği için her oyunda yeni dalgalar, yeni bir manzara olur. Sonucu 120 ile `H - 20` arasında
tutarız ki tepeler ne çok yüksek ne çok alçak olsun.

**Fonksiyon (function)** bir işe verilmiş addır, bir **tarif** gibi. Önce yazılır (tanımlanır), sonra adıyla
**çağrılır**. Parantez içindeki adlar malzemedir (**parametre**):

```js
function makeGround() { ... }   // tarif
makeGround()                    // tarifi uygula
```

Kısa yazılışı da var (ok fonksiyonu): `const groundAt = (x) => ground[...]` → "`x` alır, `ground[...]`'ı geri verir."

**Bu adımdaki diğer yeni şeyler:**

- **Nesne** (object): `{ x: 70, color: '#2563eb' }` etiketli bir bilgi kutusu. İçine `t.x` diye ulaşılır.
- **Döngü:** `for (let x = 0; x < W; x++) { ... }` → "`x` 0'dan başlasın; `W`'den küçük olduğu sürece `{ }` içini yap;
  her turdan sonra 1 artır (`x++`)." `for (const t of tanks)` → "listedeki her tank için, ona `t` de".
- `+=` "üstüne ekle": `y += 5` → `y = y + 5`.
- `Math.min(a, b)` küçüğü, `Math.max(a, b)` büyüğü verir; ikisi birlikte bir sayıyı iki sınır arasında tutar.
- `Math.round(10.4)` → `10`: en yakın tam sayı.
- `[1, 2, 3].map((n) => ...)` → listedeki her `n` için yeni bir şey üretip yeni bir liste yapar. Burada üç dalga nesnesi üretir.

**Tanklar yüzeyde durur.** Bir tankın `y`'si, kendi `x`'indeki zemin yüksekliğidir. `groundAt(x)` bunu verir; `x`'i
yuvarlar ve canvas'ın içinde tutar (0 ile `W - 1` arası), çünkü ileride mermiler ekranın dışındaki yerleri de soracak.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der. `loop` çizer ve
kendini yeniden ister; böylece saniyede ~60 kez çizim yapılır.

# --task--

1. Add `W = canvas.width` and `H = canvas.height`. Write `makeGround()`: three waves `n = 1, 2, 3` with
   `size = (30 / n) * (0.5 + Math.random())`, `length = W / (n + Math.random())` and `shift = Math.random() * W`; for each `x` add
   them to 220 as above and clamp between 120 and `H - 20`.
2. Write `groundAt(x)`: `ground` at `Math.round(x)`, with `x` kept between 0 and `W - 1`.
3. In `reset()`, make the ground and two tanks, `{ x: 70, color: '#2563eb' }` and `{ x: W - 70, color: '#dc2626' }`, each with `y` on
   the ground.
4. Draw the sky `'#7dd3fc'`, a `'#65a30d'` column 1 wide from `ground[x]` to the bottom for every `x`, and each tank as a 20 by 8
   rectangle standing on its point (`t.x - 10`, `t.y - 8`).

# --task-tr--

Kodu aşağıdaki sırayla, hep bir öncekinin **altına** yaz.

1. En alttaki `// Write your code below.` satırının altına kâğıdı, fırçayı ve ölçüleri yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const W = canvas.width
   const H = canvas.height
   ```

2. Altına iki değişken ekle:

   ```js
   let ground // ground[x]: the y of the surface in column x
   let tanks // [blue, red]: { x, y, color }
   ```

3. Altına tepeleri üreten `makeGround` fonksiyonunu yaz:

   ```js
   // Hills from three sine waves of random size and position, added together.
   function makeGround() {
     const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
     ground = []
     for (let x = 0; x < W; x++) {
       let y = 220
       for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
       ground.push(Math.max(120, Math.min(H - 20, y)))
     }
   }
   ```

   İlk satır üç dalga yapar: `n` büyüdükçe dalga küçülür (`30 / n`) ve kısalır. Sonra her sütun için 220'den başlayıp
   üç dalgayı ekler ve sonucu sınırlar içinde listeye koyar.

4. Altına zemin yüksekliğini soran yardımcıyı yaz:

   ```js
   const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]
   ```

5. Altına oyunu kuran `reset` fonksiyonunu yaz:

   ```js
   function reset() {
     makeGround()
     tanks = [
       { x: 70, y: 0, color: '#2563eb' },
       { x: W - 70, y: 0, color: '#dc2626' },
     ]
     for (const t of tanks) t.y = groundAt(t.x)
   }
   ```

   Tankları önce `y: 0` ile kurar, sonra her birinin `y`'sini altındaki zemine eşitler.

6. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#7dd3fc'
     ctx.fillRect(0, 0, W, H)
     ctx.fillStyle = '#65a30d'
     for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

     for (const t of tanks) {
       ctx.fillStyle = t.color
       ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
     }
   }
   ```

   Önce bütün alan gökyüzü mavisi olur. Sonra her sütun için yüzeyden (`ground[x]`) en alta kadar yeşil bir çizgi.
   Tank 20 eninde, 8 boyunda; `t.x - 10` onu ortalar, `t.y - 8` yüzeyin hemen üstüne oturtur.

7. En alta oyun döngüsünü ve başlatma satırlarını yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda mavi gökyüzü, yeşil tepeler ve iki tepede birer küçük tank
   görmelisin; her çalıştırmada tepeler değişmeli. Alttaki kontrollerin hepsi yeşil olmalı. "Yumuşak tepeler" kontrolü
   kırmızıysa `makeGround`'daki parantezleri ve `Math.PI * 2`'yi kontrol et.

# --tests--

The ground should be smooth hills within limits, new every time.
tr: Zemin sınırlar içinde yumuşak tepeler olmalı ve her seferinde yeni olmalı.

```js
assert.lengthOf(ground, W)
for (const y of ground) {
  assert.isAtLeast(y, 120)
  assert.isAtMost(y, H - 20)
}
for (let x = 1; x < W; x++) assert.isBelow(Math.abs(ground[x] - ground[x - 1]), 3, 'smooth hills, no cliffs')
const first = ground.join()
makeGround()
assert.notStrictEqual(ground.join(), first, 'new hills every time')
```

The tanks should sit on the ground, and `groundAt` should stay on the canvas.
tr: Tanklar zeminde durmalı ve `groundAt` canvas üstünde kalmalı.

```js
for (const t of tanks) assert.strictEqual(t.y, groundAt(t.x), 'the tanks sit on the ground')
assert.strictEqual(tanks[0].x, 70)
assert.strictEqual(tanks[1].x, W - 70)
assert.strictEqual(groundAt(-5), ground[0], 'off the left edge: the first column')
assert.strictEqual(groundAt(9999), ground[W - 1])
assert.strictEqual(groundAt(10.4), ground[10])
```

The ground should be drawn one column per x, and the tanks on it.
tr: Zemin x başına bir sütun olarak, tanklar da üstünde çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#65a30d'), { x: 0, y: ground[0], w: 1, h: H - ground[0], color: '#65a30d' })
assert.lengthOf($.rects('#65a30d'), W, 'one column per x')
assert.deepInclude($.rects('#2563eb'), { x: 60, y: tanks[0].y - 8, w: 20, h: 8, color: '#2563eb' })
```

# --seed--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x
let tanks // [blue, red]: { x, y, color }

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, color: '#2563eb' },
    { x: W - 70, y: 0, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
