---
title: A paddle that follows the mouse
title_tr: Fareyi takip eden raket
skills: [game.input]
---

# --explanation--

In Breakout you steer the paddle with the mouse (or a finger). The `pointermove` event fires whenever the pointer moves
over the canvas, and it works for mouse, pen and touch alike, so one handler covers every device.

The event gives page coordinates. As in any canvas game, convert them to canvas pixels, taking both the canvas's
position **and** its displayed size into account:

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
```

The pointer should grab the paddle by its **middle**, so the paddle's left edge goes to `x - PADDLE_W / 2`. Then clamp
it so the paddle never leaves the screen.

Notice that the event handler only **changes state** (`paddle.x`); the loop does the drawing. Even though this step has
no movement of its own yet, the loop is already there: the next steps will fill it.

# --explanation-tr--

**Bu adımda:** koyu lacivert bir oyun alanının altına açık renkli bir raket (paddle) çizeceğiz. Fareni oyun alanının
üstünde gezdirince raket sağa sola onu takip edecek; telefonda parmağınla da sürükleyebilirsin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan satırlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 400 piksel boyunda boş bir resim alanı var:
`<canvas id="game" width="480" height="400"></canvas>`. Oyundaki her şeyi bunun üstüne boyayacağız. Önce kâğıdı
buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun 2D çizim aracını (bağlam, context) al
```

- `const canvas =` → "bundan sonra buna `canvas` diyeceğim". `const` ile verilen ada **sabit** denir: bir kutuya
  etiket yapıştırmak gibi.
- Nokta (`.`) "bunun içindeki şu şey" demektir: `document.getElementById` "sayfanın, kimlikle bulma komutu".
- Tırnak içindekiler (`'game'`, `'2d'`) **yazıdır** (metin).

`ctx` senin fırçan. Önce renk seçer, sonra dikdörtgen boyarsın:

```js
ctx.fillStyle = '#0f172a'        // rengi seç (# ile başlayan bir renk kodu)
ctx.fillRect(10, 20, 50, 30)     // dikdörtgen boya: x, y, genişlik, yükseklik
```

Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa, `y` **aşağı** doğru büyür.

**Değişken ve nesne.** Raketin nerede olduğunu tutmamız gerekiyor:

```js
let paddle = { x: 200 }
```

`let` de bir ad verir ama içindeki değer sonradan **değiştirilebilir** (buna **değişken** denir). `{ x: 200 }` bir
**nesnedir**: etiketli bilgilerden oluşan bir kart. `paddle.x` "raketin x'i" demektir, şimdilik 200. Raketin boyu
ve yüksekliği hiç değişmeyeceği için onları `PADDLE_W`, `PADDLE_H`, `PADDLE_Y` gibi büyük harfli sabitlerde tutarız.

**Fonksiyon: adı olan bir tarif.** Bazı satırları bir ad altında toplarız, sonra o adla çalıştırırız:

```js
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
```

- `function clamp(...)` → `clamp` (sıkıştır) adında bir tarif **tanımla**. Parantezdeki `value, min, max`, tarif
  çağrılırken verilecek bilgilerin adlarıdır (**parametre**).
- `{ ... }` arası tarifin adımları. `return` "bu değeri cevap olarak geri ver" demektir.
- `Math.min(a, b)` iki sayıdan küçüğünü, `Math.max(a, b)` büyüğünü verir. İkisi birlikte değeri `min` ile `max`
  arasına **sıkıştırır**: `clamp(500, 0, 400)` → `400`, `clamp(-3, 0, 400)` → `0`, `clamp(50, 0, 400)` → `50`.
- Tarifi çalıştırmak (**çağırmak**) için adını ve parantezi yazarsın: `clamp(500, 0, 400)`.

**Olaylar: fare hareket edince.** Tarayıcı, fare canvas'ın üstünde her kıpırdadığında `'pointermove'` adlı bir
**olay** yayınlar (fare, kalem ve dokunmatik için aynı olay). Biz de onu dinleriz:

```js
canvas.addEventListener('pointermove', (event) => {
  // fare her hareket ettiğinde bu satırlar çalışır
})
```

`(event) => { ... }` adı olmayan, oracıkta yazılmış bir fonksiyondur (**ok fonksiyonu**). Tarayıcı onu çağırırken
içine olayın bilgilerini `event` adıyla verir. `event.clientX` farenin **sayfadaki** yatay konumudur.

**Sayfa pikseli → canvas pikseli.** Sayfadaki konum ile canvas'taki konum aynı değil: canvas sayfanın içinde bir
yerde duruyor ve ekranda büyütülmüş ya da küçültülmüş gösteriliyor olabilir. Çeviriyoruz:

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
```

- `rect` canvas'ın ekranda durduğu kutudur: `rect.left` sol kenarının sayfadaki yeri, `rect.width` ekranda
  göründüğü genişlik.
- `event.clientX - rect.left` → farenin canvas'ın sol kenarından uzaklığı.
- `* (canvas.width / rect.width)` → canvas iki kat büyük gösteriliyorsa uzaklığı ikiye böler, yani ölçeği düzeltir.
  (`*` çarpma, `/` bölme.)

Raketi farenin tam **ortasından** tutmak istiyoruz, bu yüzden sol kenarı `x - PADDLE_W / 2` olur. Sonra `clamp`
ile ekrandan taşmasını engelleriz.

**Oyun döngüsü.** Olay sadece raketin **bilgisini** değiştirir (`paddle.x`); çizimi döngü yapar:

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}
```

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenileyişinde `loop`'u çalıştır" der. `loop` en
sonunda kendini yeniden sıraya koyduğu için saniyede yaklaşık 60 kez çizim yapılır. Burada `loop` parantezsiz
yazılır: "şimdi çalıştır" değil, "sırası gelince sen çalıştır" diyoruz. Döngü bu adımda sadece çiziyor; sonraki
adımlar onu dolduracak.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `const PADDLE_W = 80`, `const PADDLE_H = 12`,
   `const PADDLE_Y = 370`, `let paddle = { x: 200 }` and a `clamp(value, min, max)` helper.
2. On `pointermove` over the canvas, convert the pointer to canvas pixels and set `paddle.x` so the paddle is centered
   on it, clamped between `0` and `canvas.width - PADDLE_W`.
3. Write `draw()` (background `'#0f172a'`, paddle `'#e2e8f0'` at `paddle.x`, `PADDLE_Y`) and a `loop()` that draws
   and requests the next frame. Start the loop.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan satırları
   yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve raketin ölçülerini, sonra bir boş satır daha bırakıp raketin kendisini ekle:

   ```js
   const PADDLE_W = 80
   const PADDLE_H = 12
   const PADDLE_Y = 370

   let paddle = { x: 200 }
   ```

   `PADDLE_W` genişlik, `PADDLE_H` yükseklik, `PADDLE_Y` raketin yukarıdan uzaklığı (alta yakın).

3. Bir boş satır bırak ve sıkıştırma fonksiyonunu yaz:

   ```js
   function clamp(value, min, max) {
     return Math.max(min, Math.min(max, value))
   }
   ```

4. Altına fareyi dinleyen kodu ekle:

   ```js
   canvas.addEventListener('pointermove', (event) => {
     // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
     const rect = canvas.getBoundingClientRect()
     const x = (event.clientX - rect.left) * (canvas.width / rect.width)
     paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
   })
   ```

   Son satır: raketin sol kenarını farenin yarım raket soluna koy, ama 0'dan küçük ya da
   `canvas.width - PADDLE_W`'den büyük olmasın (yoksa raket ekrandan taşar). Kapanış `})` ile olur.

5. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#e2e8f0'
     ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
   }
   ```

   Önce bütün alanı koyu laciverte boyar (her karede eski resmi siler), sonra raketi açık griyle çizer.

6. Altına döngüyü ve onu başlatan satırı ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Altta açık renkli bir raket görmelisin; fareni oyun alanında
   gezdirince raket onu takip etmeli ve kenarlardan taşmamalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa sayıları (80, 12, 370, 200) ve renk kodlarını harf harf kontrol et.

# --tests--

The paddle should start at x = 200, drawn at the bottom.
tr: Raket x = 200'de başlamalı ve altta çizilmeli.

```js
assert.deepEqual([PADDLE_W, PADDLE_H, PADDLE_Y], [80, 12, 370])
$.tick()
assert.deepEqual($.rects('#e2e8f0'), [{ x: 200, y: 370, w: 80, h: 12, color: '#e2e8f0' }])
```

Moving the pointer should center the paddle on it.
tr: İşaretçiyi hareket ettirmek raketi ona ortalamalı.

```js
$.move(100, 300)
assert.strictEqual(paddle.x, 60)
$.tick()
assert.strictEqual($.rects('#e2e8f0')[0].x, 60)
```

The paddle should stay on the screen.
tr: Raket ekranda kalmalı.

```js
$.move(5, 300)
assert.strictEqual(paddle.x, 0)
$.move(479, 300)
assert.strictEqual(paddle.x, 400)
```

Pointer positions should be scaled when the canvas is displayed at another size.
tr: Canvas başka bir boyutta gösterildiğinde işaretçi konumları ölçeklenmeli.

```js
$.canvas.getBoundingClientRect = () => ({ left: 20, top: 0, x: 20, y: 0, width: 960, height: 800, right: 980, bottom: 800 })
$.move(20 + 480, 300)
assert.strictEqual(paddle.x, 200, 'the middle of the displayed canvas is x = 240 in canvas pixels')
```

# --seed--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370

let paddle = { x: 200 }

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
