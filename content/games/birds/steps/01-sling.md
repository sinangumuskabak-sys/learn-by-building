---
title: The sling
title_tr: Sapan
skills: [game.canvas, prog.functions]
---

# --explanation--

In an Angry Birds-style game you pull a bird back in a sling and let go. The further you pull, the faster it flies, and it
flies the **opposite** way to your pull.

So the aim is two numbers: an `angle` (the direction the bird will fly) and a `pull` (how far back the band is stretched).
From those, where is the bird drawn? Going *along* the angle from the sling uses `cos` and `sin`; going **back** means
subtracting:

```js
const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
```

The `0.5` only makes the drawing smaller; the real pull can be up to 70 pixels, but a bird drawn 70 pixels back would leave
the sling far behind. A line from the sling to the bird is the band.

Remember the canvas y axis points **down**: an angle of `-0.6` radians aims up and to the right, so the bird is drawn down and
to the left.

# --explanation-tr--

**Bu adımda:** açık mavi bir gökyüzü, yeşil bir zemin, kahverengi bir sapan direği ve sapanda geri çekilmiş kırmızı bir
kuş çizeceğiz. Kuşu sapana koyu bir lastik bağlayacak. Henüz hiçbir şey hareket etmiyor.

Angry Birds tarzı bir oyunda kuşu sapanda geri çeker ve bırakırsın. Ne kadar çok çekersen o kadar hızlı uçar ve
çektiğin yönün **tersine** uçar.

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
- `ctx.fillStyle = '#bae6fd'` fırçaya renk sürer (bu açık mavi), `ctx.fillRect(x, y, en, boy)` dikdörtgen boyar.
- Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür (okuldaki grafiğin tersine).

**Nesne (object).** `{ x: 90, y: 220 }` etiketli bir bilgi kutusudur: içinde `x` ve `y` adlı iki değer var. İçindekine
`SLING.x` diye ulaşılır. Nesnenin içinde nesne de olabilir: `MATERIALS.bird.color` → malzemeler içinden kuşun rengi.
`MATERIALS`'ı şimdilik sadece kuşun rengi için kullanıyoruz; ileride tahta, taş ve domuzlar da buraya eklenecek.

**Nişan iki sayıdır:** bir `angle` (açı: kuşun uçacağı yön) ve bir `pull` (çekiş: lastiğin ne kadar gerildiği).
Bilgisayar açıları derece yerine **radyan** ile tutar: yarım tur `Math.PI` (yaklaşık 3.14) radyandır. `0` düz sağa
demektir. Canvas'ta `y` aşağı büyüdüğü için **eksi** açılar yukarı bakar: `-0.6` radyan (yaklaşık 34°) sağa ve yukarı nişan alır.

**Kuş nerede çizilir?** Bir açı yönünde gitmek için `Math.cos(açı)` yatay payı, `Math.sin(açı)` dikey payı verir
(ikisi de -1 ile 1 arası). Açı yönünde **geri** gitmek için bunları çıkarırız:

```js
const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
```

Nişan sağa ve yukarıysa kuş sola ve aşağıda çizilir, tıpkı gerçek bir sapan gibi. `0.5` sadece çizimi küçültür:
gerçek çekiş 70 piksele kadar çıkabilir ama 70 piksel geride çizilen bir kuş sapandan çok uzak kalırdı.

**Çizgi ve daire çizmek:**

- `ctx.beginPath()` yeni bir şekle başlar, `ctx.moveTo(x, y)` kalemi bir noktaya koyar, `ctx.lineTo(x, y)` oraya
  çizgi çeker, `ctx.stroke()` çizgiyi `strokeStyle` rengiyle ve `lineWidth` kalınlığıyla boyar. Sapandan kuşa giden
  bu çizgi **lastiktir**.
- `ctx.arc(x, y, yarıçap, 0, Math.PI * 2)` tam bir daire yolu çizer, `ctx.fill()` içini boyar. Kuş bu dairedir.

**Fonksiyon (function)** bir işe verilmiş addır, bir **tarif** gibi: önce yazılır, sonra adıyla **çağrılır**
(`reset()`). `{ }` süslü parantezler tarifin adımlarını çevreler.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der. `loop` çizer ve
kendini yeniden ister; böylece saniyede ~60 kez çizim yapılır.

# --task--

1. Add `GROUND = 290`, `SLING = { x: 90, y: 220 }`, `MAX_PULL = 70`, `BIRD = 10` and
   `MATERIALS = { bird: { color: '#dc2626', density: 4 } }`.
2. `reset()` sets `aim = { angle: -0.6, pull: 50 }`.
3. Draw: the sky `'#bae6fd'`, the ground `'#65a30d'` from `GROUND` down, the sling post `'#78350f'` (8 wide, centered on
   `SLING.x`, from `SLING.y` to the ground), the band (`'#451a03'`, width 3) from the sling to the bird, and the bird: a
   circle of radius `BIRD` at `(bx, by)` above.

# --task-tr--

Kodu aşağıdaki sırayla, hep bir öncekinin **altına** yaz.

1. En alttaki `// Write your code below.` satırının altına kâğıdı, fırçayı ve oyunun ölçülerini yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const GROUND = 290
   const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
   const MAX_PULL = 70
   const BIRD = 10 // the bird is a 20 by 20 box
   const MATERIALS = {
     bird: { color: '#dc2626', density: 4 },
   }
   ```

   `GROUND` zeminin başladığı `y`, `SLING` sapanın tepesi, `MAX_PULL` en fazla çekiş, `BIRD` kuşun yarıçapı.
   `density` (yoğunluk) ileride ağırlık için kullanılacak.

2. Altına nişanı ve onu kuran `reset` fonksiyonunu yaz:

   ```js
   let aim // { angle, pull }

   function reset() {
     aim = { angle: -0.6, pull: 50 }
   }
   ```

3. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#bae6fd'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#65a30d'
     ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

     // The sling, and the bird pulled back in it.
     ctx.fillStyle = '#78350f'
     ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
     const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
     const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
     ctx.strokeStyle = '#451a03'
     ctx.lineWidth = 3
     ctx.beginPath()
     ctx.moveTo(SLING.x, SLING.y)
     ctx.lineTo(bx, by)
     ctx.stroke()
     ctx.fillStyle = MATERIALS.bird.color
     ctx.beginPath()
     ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
     ctx.fill()
   }
   ```

   Sırayla: gökyüzü, zemin (`GROUND`'dan en alta), sapan direği (8 piksel eninde, `SLING.x - 4` ile ortalanmış,
   sapandan zemine), kuşun yeri, lastik ve kuş.

4. En alta oyun döngüsünü ve başlatma satırlarını yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda açık mavi gökyüzü, altta yeşil zemin, solda kahverengi bir direk
   ve direğin tepesinden sol aşağıya uzanan koyu bir lastiğin ucunda kırmızı bir kuş görmelisin. Alttaki kontrollerin
   hepsi yeşil olmalı. Kuş yanlış tarafta çıkıyorsa `bx` ve `by` satırlarında `-` işaretlerini kontrol et.

# --tests--

The ground and the sling post should be drawn.
tr: Zemin ve sapan direği çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#65a30d'), { x: 0, y: 290, w: 560, h: 30, color: '#65a30d' }, 'the ground')
assert.deepInclude($.rects('#78350f'), { x: 86, y: 220, w: 8, h: 70, color: '#78350f' }, 'the sling post')
```

The bird should sit back in the sling, opposite to the aim.
tr: Kuş sapanda, nişanın tersine geride durmalı.

```js
$.tick(1)
const bx = 90 - Math.cos(-0.6) * 25
const by = 220 - Math.sin(-0.6) * 25
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, bx, 1e-9, 'the bird sits back, away from the aim')
assert.closeTo(b.y, by, 1e-9)
assert.strictEqual(b.r, 10)
```

A longer pull should draw the bird further back, with the band reaching it.
tr: Daha uzun bir çekiş kuşu daha geride çizmeli ve lastik ona ulaşmalı.

```js
aim = { angle: 0, pull: 70 }
$.tick(1)
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, 55, 1e-9, 'pulled 70 to the left: half of that on screen')
assert.closeTo(b.y, 220, 1e-9)
const band = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map((v) => Math.round(v)).join())
assert.include(band, '55,220', 'the band reaches the bird')
```

# --seed--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling, and the bird pulled back in it.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
  const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
  ctx.strokeStyle = '#451a03'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(SLING.x, SLING.y)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
