---
title: A table of lines
title_tr: Çizgilerden bir masa
skills: [game.canvas, prog.arrays]
---

# --explanation--

A pinball table is walls, bumpers and flippers. The walls are the simplest part, and the most flexible way to describe them is as
a list of **line segments**, each `[x1, y1, x2, y2]`.

That one idea goes a long way. A curved top is just a few short segments at angles; the launch lane on the right is two long
parallel segments and a floor; the slopes that guide the ball towards the flippers are two more. To change the table you edit the
list, and every later rule (collisions) works for any shape you draw with it.

Drawing is one loop: for every segment, a path from one end to the other, stroked. `lineCap = 'round'` rounds the ends so the
corners where segments meet look joined.

The ball starts at the bottom of the launch lane, waiting.

# --explanation-tr--

**Bu adımda:** pinball masasının duvarlarını ve fırlatma kanalında bekleyen topu çizeceğiz. Sağda koyu bir masa,
açık gri çizgilerden duvarlar ve sağ altta küçük beyaz bir top göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 400 piksel eninde, 600 piksel boyunda boş bir resim alanı var: kimliği (id)
`game` olan bir `canvas`. Oyundaki her şeyi onun üstüne boyayacağız. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')  // sayfadaki "game" kimlikli canvas'ı bul
const ctx = canvas.getContext('2d')             // onun çizim aracını (context) al
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile adlandırılan şeye **sabit** denir: bir
  kutuya etiket yapıştırmak gibidir; sonra hep o etiketle çağırırsın ve içi değişmez.
- Nokta (`.`) "bunun içindeki şu komut" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` artık senin fırçan. `ctx.fillStyle = 'red'` fırçaya renk sürer, `ctx.fillRect(x, y, en, boy)` bir
  dikdörtgen boyar.

**Konum:** canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Renkler
`'white'` gibi adlarla ya da `'#0c0a09'` gibi kodlarla yazılır.

**Duvarlar = çizgi listesi.** Masanın her duvarı düz bir çizgi parçasıdır ve iki ucuyla anlatılır:
`[x1, y1, x2, y2]` ("şu noktadan şu noktaya"). Köşeli parantez `[ ]` bir **dizidir** (array): sırayla dizilmiş
değerlerden oluşan bir liste. `WALLS` ise dizilerden oluşan bir dizi, yani her satırı bir duvar olan bir liste.
Kavisli tepe birkaç kısa eğik çizgiden, sağdaki fırlatma kanalı iki uzun çizgi ve bir tabandan oluşur. Masayı
değiştirmek istersen sadece bu listeyi değiştirirsin.

**Değişken ve nesne.** `let ball` bir **değişkendir**: `const` gibi etiketli bir kutu, ama içi sonradan
değiştirilebilir. Topun bilgilerini bir **nesnede** (object) tutarız:

```js
ball = { x: 375, y: 570, vx: 0, vy: 0 }
```

Süslü parantez `{ }` içinde `ad: değer` çiftleri vardır. `ball.x` "topun x'i" demektir. `vx` ve `vy` topun hızı
(şimdilik 0: top duruyor).

**Fonksiyon** bir talimat grubuna verilen addır. `function newBall() { ... }` onu **tanımlar** (tarifi yazar),
`newBall()` ise **çağırır** (tarifi uygular). Süslü parantezlerin arasındaki satırlar fonksiyonun içidir.

**Çizgi ve daire çizmek:**

```js
ctx.beginPath()        // yeni bir çizime başla
ctx.moveTo(20, 470)    // kalemi buraya koy
ctx.lineTo(20, 120)    // buraya kadar çiz
ctx.stroke()           // çizgiyi boya
ctx.arc(x, y, R, 0, Math.PI * 2)  // (x, y) merkezli, R yarıçaplı tam daire; sonra ctx.fill() ile doldurulur
```

`strokeStyle` çizgi rengi, `lineWidth` kalınlığı, `lineCap = 'round'` çizgi uçlarını yuvarlar ki köşeler birleşik
görünsün.

**Döngü:** `for (const [x1, y1, x2, y2] of WALLS) { ... }` "WALLS'taki **her** duvar için, dört sayısını
`x1, y1, x2, y2` diye aç ve içerdekini yap" demektir. Böylece 11 duvarı tek bir kalıpla çizeriz.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenilemeden önce `loop`'u çağır"
der. `loop` her seferinde çizip kendini yeniden ister; böylece saniyede yaklaşık 60 kez çizim yapılır.

# --task--

1. Add `R = 8`, `LANE_X = 375` and `WALLS`, line segments `[x1, y1, x2, y2]`: the outline, the launch lane and the two
   slopes.

   ```js
   const WALLS = [
     [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
     [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
     [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
   ]
   ```

2. Write `newBall()`, which puts `ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }`, and `reset()`, which calls it.
3. Draw the table `'#0c0a09'`, every wall as a `'#a8a29e'` line 4 wide with round caps, and the ball as a `'#e7e5e4'` circle.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve topun yarıçapını, kanalın yerini ve duvar listesini ekle (listeyi aynen kopyala,
   sayılar önemli):

   ```js
   const R = 8 // ball radius
   const LANE_X = 375 // the launch lane on the right
   // The walls, as line segments [x1, y1, x2, y2].
   const WALLS = [
     [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
     [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
     [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
   ]
   ```

3. Altına topu tutacak değişkeni ve iki fonksiyonu yaz. `newBall()` topu kanalın dibine koyar, `reset()` oyunu
   baştan kurar (şimdilik sadece `newBall()`'u çağırır):

   ```js
   let ball // { x, y, vx, vy }

   function newBall() {
     ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
   }

   function reset() {
     newBall()
   }
   ```

4. Altına masayı, duvarları ve topu çizen `draw()` fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0c0a09'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.strokeStyle = '#a8a29e'
     ctx.lineWidth = 4
     ctx.lineCap = 'round'
     for (const [x1, y1, x2, y2] of WALLS) {
       ctx.beginPath()
       ctx.moveTo(x1, y1)
       ctx.lineTo(x2, y2)
       ctx.stroke()
     }
     ctx.fillStyle = '#e7e5e4'
     ctx.beginPath()
     ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
     ctx.fill()
   }
   ```

5. En alta oyun döngüsünü ve başlatma satırlarını ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

   `reset()` topu hazırlar, `requestAnimationFrame(loop)` çizimi başlatır.

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda koyu masa, gri duvarlar ve sağ altta kanalda bekleyen beyaz
   top görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Bir şey çizilmiyorsa parantezleri ve virgülleri kontrol
   et: her `[` ve `{` bir `]` ve `}` ile kapanmalı.

# --tests--

The walls should be a list of segments, four numbers each.
tr: Duvarlar her biri dört sayıdan oluşan bir parçalar listesi olmalı.

```js
assert.isAtLeast(WALLS.length, 10)
for (const w of WALLS) assert.lengthOf(w, 4)
assert.deepInclude(WALLS, [20, 470, 20, 120], 'the left wall')
```

Every wall should be drawn as one line.
tr: Her duvar bir çizgi olarak çizilmeli.

```js
$.tick(1)
assert.lengthOf($.screen().filter((c) => c.op === 'stroke'), WALLS.length, 'one line per wall')
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.include(ends, '20,120')
```

The ball should wait in the launch lane.
tr: Top fırlatma kanalında beklemeli.

```js
$.tick(1)
assert.deepInclude($.arcs(), { x: LANE_X, y: 570, r: R, color: '#e7e5e4' }, 'the ball waits in the launch lane')
```

# --seed--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

function reset() {
  newBall()
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
