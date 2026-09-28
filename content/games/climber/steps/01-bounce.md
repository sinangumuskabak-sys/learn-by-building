---
title: Bouncing forever
title_tr: Sonsuza kadar sekmek
skills: [game.physics, game.loop]
---

# --explanation--

In this game you never press "jump". The player **bounces automatically** whenever it lands, and all you do is steer.
That makes the physics the heart of the game, and it is only three lines:

```js
player.vy += GRAVITY   // gravity changes the speed a little every frame
player.y += player.vy  // the speed changes the position
if (landed) player.vy = JUMP   // a bounce starts with a fixed upward speed
```

Because every bounce starts with the same speed, every bounce reaches the **same height**. You can even calculate it:
the speed shrinks by `GRAVITY` each frame until it reaches zero, so the rise is about `JUMP² / (2 × GRAVITY)` =
`121 / 0.7` ≈ 172 pixels (a little less, 167, because the game moves in whole frames). Later that number decides how far
apart platforms may be, so the game is always possible.

When the player touches the floor, put it exactly **on** the floor before bouncing. Otherwise it would sink a few
pixels into the ground on each bounce.

# --explanation-tr--

**Bu adımda:** turuncu bir kareyi (oyuncuyu) yere düşürüp durmadan zıplatacağız. Sağdaki açık renkli alanın altında
turuncu kare hep aynı yüksekliğe sekip duracak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 400 piksel eninde, 600 piksel boyunda boş bir resim alanı var:

```html
<canvas id="game" width="400" height="600"></canvas>
```

Oyundaki her şeyi bu alanın üstüne **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir
  kutuya etiket yapıştırmak gibi, sonra hep o adla çağırırsın ve değeri değişmez.
- `document.getElementById('game')` → "sayfada kimliği (id) `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `canvas.getContext('2d')` → canvas'ın çizim aracını (bağlam, **context**) verir. `ctx` artık senin fırçan.

**Nasıl çizilir?** Önce renk seçilir, sonra dikdörtgen boyanır:

```js
ctx.fillStyle = 'orange'      // fırçaya turuncu boya sür
ctx.fillRect(10, 20, 50, 30)  // dikdörtgen: x, y, genişlik, yükseklik
```

Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Renkler `'#f59e0b'`
gibi kodlarla da yazılabilir (bu bir turuncu).

**Sayı sabitleri.** `const GRAVITY = 0.35` gibi satırlar bir sayıya ad verir. Böylece kodda anlamsız `0.35` yerine
"yerçekimi" yazarız. Ondalık sayılarda virgül değil **nokta** kullanılır.

**Nesne (object) ve `let`.** Oyuncunun birkaç bilgisi var: konumu (`x`, `y`), eni (`w`), boyu (`h`) ve dikey hızı
(`vy`). Bunları süslü parantezle tek bir paket yaparız:

```js
let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
```

Her `ad: değer` çiftine **alan** denir. Bir alana nokta ile ulaşırsın: `player.y` "oyuncunun y'si" demektir. `let`,
`const` gibidir ama sonradan değişebilecek şeyler için kullanılır.

**Fonksiyon (function).** Bir fonksiyon, adı olan bir talimat paketidir. `function update() { ... }` yazmak paketi
**tanımlar** (tarif defterine yazmak gibi); `update()` yazmak onu **çağırır**, yani içindeki satırları o anda çalıştırır.
Süslü parantezler `{ }` paketin başını ve sonunu gösterir.

**Fizik üç satırdır.** Bu oyunda "zıpla" tuşu yok; oyuncu yere her değdiğinde **kendiliğinden seker**:

- `player.vy += GRAVITY` → `+=` "üstüne ekle" demektir. Yerçekimi her karede hızı biraz artırır (aşağı doğru).
- `player.y += player.vy` → hız, konumu değiştirir. `vy` pozitifse aşağı, negatifse yukarı gider.
- Yere değince `player.vy = JUMP` → `JUMP` `-11` olduğu için oyuncu hızla yukarı fırlar. Sonra yerçekimi onu yavaşlatır,
  durdurur ve geri indirir.

**`if` (eğer).** `if (koşul) { ... }` "koşul doğruysa süslü parantezin içini yap, değilse atla" demektir. `>=`
"büyük ya da eşit" demektir. Oyuncunun **alt kenarı** `player.y + player.h`'dir (üst kenar + boy). Bu değer `FLOOR`'a
(600, canvas'ın dibi) ulaştıysa oyuncu yere değmiş demektir. O zaman önce onu **tam zeminin üstüne** koyarız
(`y = 600 - 40 = 560`); yoksa her sekişte biraz daha yere gömülürdü.

Her sekiş aynı hızla başladığı için hep **aynı yüksekliğe** çıkar: yaklaşık `JUMP² / (2 × GRAVITY)` = `121 / 0.7` ≈ 172
piksel (oyun kare kare ilerlediği için gerçekte 167). Bu sayı ileride platformların arasının ne kadar olabileceğini
belirleyecek; böylece oyun hep oynanabilir kalır.

**Oyun döngüsü.** Hareketi görmek için ekranı saniyede yaklaşık 60 kez yeniden çizmeliyiz. `requestAnimationFrame(loop)`
tarayıcıya "bir sonraki karede `loop`'u çalıştır" der. `loop` de her seferinde önce `update()` (hesapla), sonra `draw()`
(çiz) yapar ve kendini yeniden sıraya koyar. Böylece durmadan dönen bir döngü olur. `draw()` her karede önce bütün
arka planı boyar; yoksa eski kareler silinmez ve iz kalırdı.

# --task--

1. Add `GRAVITY = 0.35`, `JUMP = -11`, `FLOOR = 600`, and `let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }`.
2. Write `update()`: add `GRAVITY` to `player.vy`, add `player.vy` to `player.y`, and if the player's bottom
   (`y + h`) reached `FLOOR`, put it on the floor and set `vy` to `JUMP`.
3. Write `draw()`: a `'#f8fafc'` background and the player as a `'#f59e0b'` rectangle.
4. Call `update()` and `draw()` every frame with `requestAnimationFrame`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve oyunun sayılarını ekle (sondaki yorumları yazmasan da olur):

   ```js
   const GRAVITY = 0.35
   const JUMP = -11 // her sekiş bu hızla başlar (eksi = yukarı)
   const FLOOR = 600 // canvas'ın dibi
   ```

3. Altına oyuncuyu ekle:

   ```js
   let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
   ```

4. Altına fiziği hesaplayan `update` fonksiyonunu yaz:

   ```js
   function update() {
     player.vy += GRAVITY
     player.y += player.vy
     // Yere değmek bir sonraki sekişi başlatır.
     if (player.y + player.h >= FLOOR) {
       player.y = FLOOR - player.h
       player.vy = JUMP
     }
   }
   ```

5. Altına her şeyi çizen `draw` fonksiyonunu yaz. İlk iki satır arka planı açık renge boyar, son iki satır oyuncuyu
   turuncu bir kare olarak çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#f8fafc'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#f59e0b'
     ctx.fillRect(player.x, player.y, player.w, player.h)
   }
   ```

6. En alta oyun döngüsünü ekle ve onu başlat:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda turuncu kare aşağı düşüp yerden durmadan sekmeli ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata: `JUMP`'ın başındaki eksiyi unutmak ya da `if`
   satırında `>=` yerine başka bir şey yazmak. Yazdığını harf harf karşılaştır.

# --tests--

Gravity should pull the player down faster and faster.
tr: Yerçekimi oyuncuyu gittikçe hızlanarak aşağı çekmeli.

```js
$.tick(1)
assert.closeTo(player.vy, 0.35, 1e-9)
assert.closeTo(player.y, 460.35, 1e-9)
$.tick(1)
assert.closeTo(player.vy, 0.7, 1e-9)
assert.closeTo(player.y, 461.05, 1e-9)
```

Touching the floor should start a bounce, standing exactly on the floor.
tr: Zemine değmek, tam zeminin üstünde durarak bir sekiş başlatmalı.

```js
let frames = 0
while (player.vy >= 0 && frames < 200) {
  $.tick(1)
  frames++
}
assert.isBelow(frames, 200, 'the player never bounced')
assert.strictEqual(player.y, 560)
assert.strictEqual(player.vy, -11)
```

Every bounce should reach the same height.
tr: Her sekiş aynı yüksekliğe çıkmalı.

```js
const peaks = []
let lowest = Infinity
for (let i = 0; i < 300; i++) {
  const before = player.vy
  $.tick(1)
  if (before < 0 && player.vy >= 0) peaks.push(player.y)
}
assert.isAtLeast(peaks.length, 2)
for (const y of peaks) assert.closeTo(y, 392.6, 0.5)
```

The player should be drawn where it is.
tr: Oyuncu bulunduğu yerde çizilmeli.

```js
$.tick(1)
const [p] = $.rects('#f59e0b')
assert.deepEqual([p.x, p.w, p.h], [180, 40, 40])
assert.closeTo(p.y, 460.35, 1e-9)
```

# --seed--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const JUMP = -11 // every bounce starts with this speed (negative = up)
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }

function update() {
  player.vy += GRAVITY
  player.y += player.vy
  // Touching the floor starts the next bounce.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
