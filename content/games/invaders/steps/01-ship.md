---
title: The cannon
title_tr: Top
skills: [game.input, game.loop]
---

# --explanation--

The player controls a cannon at the bottom of the screen that slides left and right. You have built this before
(Pong's paddles, Breakout's keyboard controls): keep a record of **held** keys, and let the loop move the ship a few
pixels every frame while a key is down.

```js
if (keys.ArrowLeft) ship.x -= SHIP_SPEED
if (keys.ArrowRight) ship.x += SHIP_SPEED
ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))   // stay on screen
```

The ship is two rectangles: a wide base and a small barrel on top, centered. Simple shapes, but together they read as
"cannon" at a glance. Games have been drawn this way since the 1970s.

# --explanation-tr--

**Bu adımda:** ekranın altına sağa sola kayan bir top (oyuncunun gemisi) koyacağız. Çalıştırınca sağda koyu lacivert
bir alan ve altında turkuaz bir top göreceksin; ok tuşlarıyla onu kaydırabileceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan satırlar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 520 piksel boyunda boş bir resim alanı var: `canvas`.
Oyundaki her şeyi onun üstüne boyayacağız. Önce kâğıdı buluruz, sonra fırçayı (çizim bağlamı, **context**) alırız:

```js
const canvas = document.getElementById('game')   // kimliği 'game' olan canvas'ı bul
const ctx = canvas.getContext('2d')              // onun 2D fırçasını al
```

- `const canvas =` → "bundan sonra buna `canvas` diyeceğim". `const` ile verilen ada **sabit** denir: bir kutuya
  yapıştırılan, hiç değişmeyen bir etiket.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).

Fırçayla iki şey yaparız: renk seçmek (`ctx.fillStyle = '#22d3ee'`) ve dikdörtgen boyamak
(`ctx.fillRect(x, y, genişlik, yükseklik)`). **Konum:** sol üst köşe `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru
büyür. Renkler `'#22d3ee'` (turkuaz) gibi kodlarla yazılır.

**Sayılara ad vermek.** `const SHIP_W = 36` "geminin eni 36" demektir. Sayıyı her yere tek tek yazmak yerine ona ad
veririz; sonra değiştirmek istersen tek yeri değiştirirsin. Büyük harfli adlar "ayar" olduğunu belli eder.

**Nesne (object).** Bir şeyin birkaç bilgisini tek pakette tutar:

```js
let ship = { x: 222, y: 480, w: 36, h: 16 }
```

Süslü parantez `{ }` paketi açar ve kapatır; içinde `ad: değer` çiftleri virgülle ayrılır. `ship.x` ile içindeki `x`'i
okursun. `let` de `const` gibi ad verir, ama `let` ile verilenin değeri **sonradan değişebilir** (değişken).

**Fonksiyon (function).** Bir iş listesine ad vermektir: `function update() { ... }` yazınca iş listesi hazırlanır
ama **çalışmaz**; `update()` yazdığında (çağırdığında) çalışır. Süslü parantezin içi fonksiyonun gövdesidir.

**Klavye olayları.** Bir tuşa basılınca tarayıcı bir **olay** (event) yayar. `document.addEventListener('keydown', ...)`
"tuşa basıldığında şunu yap" demektir. `(event) => { ... }` kısa yoldan yazılmış bir fonksiyondur (ok, `=>`, "şunu
yap" diye okunur); `event.key` basılan tuşun adıdır, örneğin `'ArrowLeft'` (sol ok). Hangi tuşların **basılı**
olduğunu `keys` adlı bir nesnede tutarız: basılınca `true` (doğru), bırakılınca `false` (yanlış). `keys[event.key]`
köşeli parantezle "adı `event.key` olan alan" demektir.

**`if` (eğer).** `if (keys.ArrowLeft) ship.x -= SHIP_SPEED` → "sol ok basılıysa geminin `x`'inden 4 çıkar". `-=`
"şu kadar azalt", `+=` "şu kadar artır" demektir.

**Ekranda tutmak.** `Math.max(a, b)` ikisinin büyüğünü, `Math.min(a, b)` küçüğünü verir. Birlikte bir sayıyı iki
sınır arasına sıkıştırırlar: gemi `0`'ın soluna ve `canvas.width - SHIP_W`'nin sağına geçemez.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der.
`loop` her seferinde önce `update()` (hesapla), sonra `draw()` (boya) yapar ve kendini yeniden sıraya koyar. Böylece
saniyede yaklaşık 60 kez (60 **kare**) tekrar eder; bu bir çizgi film gibi hareket yanılsaması verir.

Gemi iki dikdörtgenden oluşur: geniş bir taban ve üstünde ortalanmış küçük bir namlu. Basit şekiller, ama birlikte
bir bakışta "top" diye okunur. Oyunlar 1970'lerden beri böyle çizilir.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `SHIP_Y = 480`, `SHIP_W = 36`, `SHIP_H = 16`,
   `SHIP_SPEED = 4` and `let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }`.
2. Keep held keys in `const keys = {}`. In `update()`, move the ship `SHIP_SPEED` pixels per frame with
   `ArrowLeft`/`ArrowRight` and clamp it to the screen.
3. `draw()`: fill the canvas with `'#020617'`, draw the ship in `'#22d3ee'` plus a 6×6 barrel centered on top of it
   (`ship.x + SHIP_W / 2 - 3`, `ship.y - 6`). Run `update()` and `draw()` in a `requestAnimationFrame` loop.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve geminin ayarlarını ekle:

   ```js
   const SHIP_Y = 480
   const SHIP_W = 36
   const SHIP_H = 16
   const SHIP_SPEED = 4
   ```

3. Bir boş satır bırak; gemiyi ve basılı tuşları tutan satırları ekle:

   ```js
   let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
   const keys = {}
   ```

   `canvas.width / 2 - SHIP_W / 2` gemiyi yatayda ortalar: alanın ortasından geminin yarı eni kadar sola. `/` bölme
   işaretidir. `{}` şimdilik boş bir nesnedir.

4. Altına tuşları dinleyen iki bloğu yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   ```

5. Altına hareketi hesaplayan `update` fonksiyonunu yaz:

   ```js
   function update() {
     if (keys.ArrowLeft) ship.x -= SHIP_SPEED
     if (keys.ArrowRight) ship.x += SHIP_SPEED
     ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))
   }
   ```

6. Altına boyayan `draw` fonksiyonunu yaz. Önce bütün alanı koyu renge boyar, sonra topun tabanını ve namlusunu:

   ```js
   function draw() {
     ctx.fillStyle = '#020617'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#22d3ee'
     ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
     ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
   }
   ```

   Son satır 6×6'lık namludur: geminin ortasından 3 piksel sola, gövdenin 6 piksel üstüne.

7. En alta oyun döngüsünü ekle ve onu başlat:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Altta ortada turkuaz bir top görmelisin. Oynamak için önce oyuna tıkla,
   sonra sol/sağ ok tuşlarını basılı tut: top kaymalı ve kenarda durmalı. Alttaki kontrollerin hepsi yeşil olmalı.
   Kırmızı kalırsa büyük/küçük harfleri kontrol et: `ArrowLeft` ve `ArrowRight` tam böyle yazılır.

# --tests--

The ship should start centered at the bottom.
tr: Gemi altta ortada başlamalı.

```js
assert.deepEqual(ship, { x: 222, y: 480, w: 36, h: 16 })
$.tick()
assert.sameDeepMembers($.rects('#22d3ee'), [
  { x: 222, y: 480, w: 36, h: 16, color: '#22d3ee' },
  { x: 237, y: 474, w: 6, h: 6, color: '#22d3ee' },
])
```

Holding an arrow should slide the ship, and it should stop at the edge.
tr: Bir oku basılı tutmak gemiyi kaydırmalı ve gemi kenarda durmalı.

```js
$.press('ArrowLeft')
$.tick(10)
assert.strictEqual(ship.x, 182)
$.tick(100)
assert.strictEqual(ship.x, 0)
$.release('ArrowLeft')
$.press('ArrowRight')
$.tick(200)
assert.strictEqual(ship.x, 480 - 36)
```

# --seed--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
