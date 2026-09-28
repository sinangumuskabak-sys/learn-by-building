---
title: Six cities to protect
title_tr: Korunacak altı şehir
skills: [game.canvas, prog.arrays]
---

# --explanation--

Every game needs something to lose. Here it is six cities on the ground, with your missile base in the middle.

Each city is a small object, `{ x, alive }`, built from a list of x positions with `map`:

```js
cities = CITY_XS.map((x) => ({ x, alive: true }))
```

(The extra parentheses around `{ x, alive: true }` matter: without them JavaScript would read the `{` as the start of a
function body, not an object.)

A city is drawn as a block when it is alive and as flat rubble when it is not, so the same loop draws both.

# --explanation-tr--

**Bu adımda:** korumamız gereken şeyleri çizeceğiz. Sağda koyu bir gökyüzü, altta kahverengi bir zemin, zeminin üstünde
altı mavi şehir ve ortada yeşil füze üssün görünecek.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 400 piksel boyunda boş bir resim alanı var. Her şeyi onun
üstüne boyarız. Önce kâğıdı buluruz, sonra fırçayı (çizim bağlamı, **context**) alırız:

```js
const canvas = document.getElementById('game')   // kimliği 'game' olan canvas'ı bul
const ctx = canvas.getContext('2d')              // onun 2D fırçasını al
```

- `const canvas =` → "bundan sonra buna `canvas` diyeceğim". `const` ile verilen ada **sabit** denir: bir kutuya
  yapıştırılan, hiç değişmeyen bir etiket. `let` ile verilen adın değeri ise sonradan değişebilir (**değişken**).
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).

Fırçayla renk seçilir (`ctx.fillStyle = '#38bdf8'`) ve dikdörtgen boyanır (`ctx.fillRect(x, y, en, boy)`). **Konum:**
sol üst köşe `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür. Zemin `y = 370`'ten başlar, yani ekranın altındadır.

**Her oyunun kaybedilecek bir şeyi olmalı.** Burada bu, yerdeki altı şehirdir. Her şehir küçük bir **nesnedir**:
`{ x: 50, alive: true }` → "yatay konumu 50, canlı: evet". Süslü parantez bilgileri adlarıyla bir pakette toplar;
`c.x` ile içindeki `x` okunur. `true`/`false` doğru/yanlış demektir.

**Listeden liste yapmak.** Şehirlerin konumları bir **dizide** (listede) durur: `[50, 110, 170, 310, 370, 430]`. Her
konumdan bir şehir nesnesi yapmak için `map` kullanırız:

```js
cities = CITY_XS.map((x) => ({ x, alive: true }))
```

- `map` listedeki her eleman için verdiğin küçük fonksiyonu çalıştırır ve sonuçlardan **yeni bir liste** yapar.
- `(x) => ...` bir **fonksiyondur**: `x` gelen elemanın adıdır, ok `=>` "şunu ver" diye okunur.
- `{ x, alive: true }` içindeki tek başına `x`, `x: x`'in kısaltmasıdır.
- Nesnenin etrafındaki fazladan parantez önemlidir: onlar olmasa JavaScript `{`'yi bir nesne değil, fonksiyon gövdesinin
  başlangıcı sanardı.

**Fonksiyonlar.** `function reset() { ... }` bir iş listesine ad verir; `reset()` yazınca çalışır. `draw()` her şeyi
boyar.

**Aynı döngü ikisini de çizer.** `for (const c of cities)` listedeki her şehri sırayla `c` adıyla dolaşır. Şehir canlıysa
bir blok, değilse yassı bir enkaz çizilir. Seçimi `koşul ? A : B` yapar: "doğruysa A, değilse B".

```js
ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'   // canlıysa mavi, değilse gri-kahve
```

Blok 32 piksel enindedir ve şehrin `x`'inde ortalanır: `c.x - 16`. Yüksekliği canlıyken 14, enkazken 4'tür; ikisi de
zemine basar: `GROUND - 14` ya da `GROUND - 4`.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der.
`loop` kendini yeniden sıraya koyduğu için ekran saniyede yaklaşık 60 kez yeniden çizilir.

# --task--

1. Add `GROUND = 370`, `BASE = { x: 240, y: GROUND - 14 }` and `CITY_XS = [50, 110, 170, 310, 370, 430]`.
2. `reset()` makes `cities` from `CITY_XS`, all alive.
3. Draw every frame: a `'#020617'` sky, `'#854d0e'` ground from `GROUND` down, each city as a 32-wide block centered on its
   `x`: 14 high in `'#38bdf8'` if alive, 4 high in `'#44403c'` if not (both standing on the ground), and the base as a
   `'#a3e635'` block 24 wide and 14 high at `BASE`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırakıp ayarları ekle:

   ```js
   const GROUND = 370
   const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
   const CITY_XS = [50, 110, 170, 310, 370, 430]
   ```

3. Bir boş satır bırakıp şehirlerin değişkenini ve onları kuran `reset`'i yaz:

   ```js
   let cities

   function reset() {
     cities = CITY_XS.map((x) => ({ x, alive: true }))
   }
   ```

4. Altına her şeyi boyayan `draw`'u yaz: gökyüzü, zemin, şehirler ve üs:

   ```js
   function draw() {
     ctx.fillStyle = '#020617'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#854d0e'
     ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

     for (const c of cities) {
       ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
       ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
     }
     ctx.fillStyle = '#a3e635'
     ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
   }
   ```

   `canvas.height - GROUND` zeminin boyudur (400 − 370 = 30). Üs 24 piksel enindedir ve `BASE.x`'te ortalanır.

5. En alta döngüyü ekle, şehirleri kur ve başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Altta kahverengi zemin, üstünde altı mavi şehir ve ortada yeşil üs
   görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa renk kodlarını ve sayıları harf harf
   karşılaştır.

# --tests--

There should be six living cities.
tr: Altı yaşayan şehir olmalı.

```js
assert.deepEqual(cities.map((c) => c.x), [50, 110, 170, 310, 370, 430])
assert.isTrue(cities.every((c) => c.alive))
```

Cities, ground and base should be drawn, and a lost city as rubble.
tr: Şehirler, zemin ve üs çizilmeli; kaybedilen bir şehir enkaz olarak.

```js
$.tick(1)
const alive = $.rects('#38bdf8')
assert.lengthOf(alive, 6)
assert.deepEqual([alive[0].x, alive[0].y, alive[0].w, alive[0].h], [34, 356, 32, 14])
assert.deepEqual($.rects('#a3e635').map((r) => [r.x, r.y, r.w, r.h]), [[228, 356, 24, 14]])
assert.deepEqual($.rects('#854d0e').map((r) => [r.y, r.h]), [[370, 30]])
cities[0].alive = false
$.tick(1)
assert.lengthOf($.rects('#38bdf8'), 5)
assert.deepEqual($.rects('#44403c').map((r) => [r.x, r.y, r.h]), [[34, 366, 4]])
```

# --seed--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

let cities

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  for (const c of cities) {
    ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
    ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
