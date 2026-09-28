---
title: The table and the rack
title_tr: Masa ve üçgen
skills: [game.canvas, prog.loops]
---

# --explanation--

A pool table is a green rectangle (the felt) inside a brown frame (the rails), with a white **cue ball** and the numbered
balls packed in a triangle, the **rack**.

Every ball is the same kind of object: a position, a velocity (zero for now), a color, a number, and whether it is the cue
ball. Keeping them all in one array, `balls`, means the physics later can treat them all alike; `cue` is just a second name
for the white one.

The triangle comes from two loops. Row 0 has 1 ball, row 1 has 2, row 3 has 4: row `row` has `row + 1` balls. Inside a row,
balls are one diameter apart (`2R`), centered on the table's middle line with `(i - row / 2)`. Rows are a little **less**
than a diameter apart: in a packed triangle the centres form equilateral triangles, and the height of one is
`2R × 0.87` (that is `2R × √3 / 2`). A tiny extra `0.5` keeps the balls from touching exactly, so nothing collides before the
break.

# --explanation-tr--

**Bu adımda:** bilardo masasını kuracağız. Çalıştırınca sağda kahverengi çerçeveli yeşil bir masa, solda beyaz bir
**isteka topu** ve sağda üçgen şeklinde dizilmiş, üstünde numaraları yazan on renkli top göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480×340 piksellik boş bir resim alanı var; kimliği (id) `game`. Oyundaki her
şeyi bu alana **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı (çizim bağlamı, **context**) alırız:

```js
const canvas = document.getElementById('game')   // kâğıdı bul
const ctx = canvas.getContext('2d')              // fırçayı al
```

- `const ad = ...` → "bundan sonra şuna `ad` diyeceğim". `const` ile ad verilen şeye **sabit** denir, içi değişmez.
- Nokta (`.`) "bunun içindeki şu komut" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx.fillStyle = '#15803d'` fırçanın rengini seçer (`'#...'` renk kodudur, `'white'` gibi adlar da olur);
  `ctx.fillRect(x, y, en, boy)` bir dikdörtgen boyar.

**Konum:** canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür. Masanın
yeşil kısmı soldan 20'den (`LEFT`) 460'a (`RIGHT`), yukarıdan 40'tan (`TOP`) 280'e (`BOTTOM`) uzanır.

**`let`, nesne, dizi.**

- `let balls` de bir ad koyar ama `const`'tan farkı, içine sonra başka bir şey konabilmesidir.
- **Nesne** (object), birkaç bilgiyi bir arada tutar: `{ x: 130, y: 160, color: 'white' }`. Bilgilere `top.x` diye
  nokta ile ulaşırsın.
- **Dizi** (array), bir sıra listedir: `['#facc15', '#2563eb', ...]`. Öğelere sıra numarasıyla ulaşırsın ve numara
  **0'dan** başlar: `COLORS[0]` sarı, `COLORS[1]` mavi.

Her top aynı türden bir nesnedir: konum (`x`, `y`), hız (`vx`, `vy`, şimdilik 0), renk, numara ve isteka topu olup
olmadığı (`cue`). Hepsini tek bir `balls` dizisinde tutarız; böylece ileride fizik hepsine aynı şekilde davranır.
`cue` de beyaz topa verilen ikinci bir addır.

**Fonksiyon.** Bir talimat paketine ad vermektir; tarif yazmak gibi, yazmak onu pişirmez. `function rack() { ... }`
paketi **tanımlar**, `rack()` onu **çağırır** (çalıştırır). Kısa bir yazımı da var:

```js
const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })
```

- Parantezdeki `x, y, color, number` **parametrelerdir**: çağırırken verdiğin bilgilerin adları.
- `=>` "şunu üret" demektir; sağındaki nesne sonuç olarak **geri verilir**. Nesne parantez içinde `({ ... })` yazılır.
- `{ x, y }` kısa yazımdır: `{ x: x, y: y }` ile aynı.
- `number === 0` "numara 0'a eşit mi?" diye sorar ve `true` (evet) ya da `false` (hayır) verir. Yalnız isteka
  topunun numarası 0'dır.

**Üçgeni dizmek: iç içe döngü.** `for (let row = 0; row < 4; row++) { ... }` bir **sayan döngüdür**: `row` 0'dan
başlar, 4'ten küçük olduğu sürece içindeki işi yapar, her turda `row++` ile 1 artar (0, 1, 2, 3). İçindeki ikinci döngü
her sırada `row + 1` top koyar (`<=` "küçük ya da eşit"): 1, 2, 3, 4 top.

- Sıralar arasında yatay aralık bir çaptan (`2R`) biraz **az**: `R * 2 * 0.87`. Sıkı dizilmiş toplarda merkezler
  eşkenar üçgenler oluşturur, onun yüksekliği çapın 0.87 katıdır. Üstüne eklenen `0.5` toplar birbirine tam
  değmesin diye.
- Bir sıradaki toplar dikeyde birer çap aralıklıdır ve `(i - row / 2)` ile masanın orta çizgisine (`y` = 160) göre
  ortalanır.
- `n` saydığımız top sayısıdır: rengi `COLORS[n]`, numarası `n + 1`.

**Top çizmek.** `ctx.beginPath()` yeni bir şekle başlar, `ctx.arc(x, y, R, 0, Math.PI * 2)` merkezi `(x, y)`,
yarıçapı `R` olan bir **tam daire** tanımlar (`Math.PI * 2` tam tur demek), `ctx.fill()` onu boyar. Sonra numarayı
`ctx.fillText(yazı, x, y)` ile yazarız; `String(b.number)` sayıyı yazıya çevirir. `continue` "bu topu burada bırak,
döngüde sonrakine geç" demektir: isteka topuna numara yazmayız.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der.
`loop` çizer ve kendini tekrar ister; böylece ekran saniyede yaklaşık 60 kez çizilir.

# --task--

1. Add the table edges `LEFT = 20`, `TOP = 40`, `RIGHT = 460`, `BOTTOM = 280`, the radius `R = 9`, the ten `COLORS` and
   `CUE_START = { x: 130, y: 160 }`.
2. Write `ball(x, y, color, number)`, returning `{ x, y, vx: 0, vy: 0, color, number, cue: number === 0 }`.
3. Write `rack()`: the cue ball (`'#f8fafc'`, number 0) at `CUE_START`, then 4 rows of 1 to 4 balls numbered 1 to 10, at
   `x = 330 + row * (R * 2 * 0.87 + 0.5)` and `y = 160 + (i - row / 2) * (R * 2 + 0.5)`. `reset()` racks.
4. Each frame: fill `'#0f172a'`, the rails `'#78350f'` 12 pixels around the table, the felt `'#15803d'`, and each ball as a
   circle of radius `R`, with its number in white (`'bold 9px sans-serif'`, centered, `y + 3`) except on the cue ball.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boş bırak ve masanın ölçülerini, top yarıçapını, renkleri ve isteka topunun başlangıç yerini yaz:

   ```js
   const LEFT = 20
   const TOP = 40
   const RIGHT = 460
   const BOTTOM = 280
   const R = 9 // ball radius
   const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
   const CUE_START = { x: 130, y: 160 }
   ```

3. Bir satır boş bırak, topları tutacak adları ve top üreten kısa fonksiyonu yaz:

   ```js
   let balls // { x, y, vx, vy, color, number, cue }
   let cue

   const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })
   ```

4. Altına topları dizen fonksiyonu ve onu çağıran `reset`'i yaz:

   ```js
   // Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
   function rack() {
     cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
     balls = [cue]
     let n = 0
     for (let row = 0; row < 4; row++) {
       for (let i = 0; i <= row; i++) {
         const x = 330 + row * (R * 2 * 0.87 + 0.5)
         const y = 160 + (i - row / 2) * (R * 2 + 0.5)
         balls.push(ball(x, y, COLORS[n], n + 1))
         n += 1
       }
     }
   }

   function reset() {
     rack()
   }
   ```

   `balls = [cue]` listeyi isteka topuyla başlatır; `balls.push(...)` listenin sonuna bir top ekler; `n += 1`
   "`n`'yi 1 artır" demektir.

5. Altına her şeyi çizen fonksiyonu yaz: koyu arka plan, 12 piksel kalınlıkta kahverengi çerçeve, yeşil çuha ve toplar:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#78350f'
     ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
     ctx.fillStyle = '#15803d'
     ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

     for (const b of balls) {
       ctx.fillStyle = b.color
       ctx.beginPath()
       ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
       ctx.fill()
       if (b.cue) continue
       ctx.fillStyle = 'white'
       ctx.font = 'bold 9px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText(String(b.number), b.x, b.y + 3)
     }
   }
   ```

   `for (const b of balls)` → "listedeki her top için, ona `b` de ve işi yap". `font` yazının kalınlığını, boyunu ve
   türünü; `textAlign = 'center'` yazının verilen noktaya ortalanmasını seçer. `b.y + 3` yazıyı dikeyde ortalar.

6. Altına oyun döngüsünü ve en sona onu başlatan iki satırı yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda çerçeveli yeşil masa, solda beyaz top, sağda 1'den 10'a numaralı
   üçgen görmelisin; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata: iç döngüdeki `<=` yerine
   `<` yazmak (o zaman top eksik çıkar) ya da renk kodunda bir harf hatası.

# --tests--

There should be the cue ball and ten numbered balls, with ball 1 at the front of the triangle.
tr: İsteka topu ve on numaralı top olmalı; 1 numara üçgenin önünde.

```js
assert.lengthOf(balls, 11)
assert.strictEqual(balls[0], cue)
assert.deepEqual([cue.x, cue.y, cue.number], [130, 160, 0])
assert.isTrue(cue.cue)
assert.deepEqual(balls.slice(1).map((b) => b.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
assert.deepEqual([balls[1].x, balls[1].y], [330, 160], 'ball 1 is at the front of the triangle')
for (const b of balls.slice(2)) assert.isAbove(b.x, 330)
```

No two balls should overlap, and the back row should be straight.
tr: Hiçbir iki top üst üste binmemeli ve arka sıra düz olmalı.

```js
for (let i = 0; i < balls.length; i++) {
  for (let j = i + 1; j < balls.length; j++) {
    assert.isAtLeast(Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y), R * 2, 'balls must not overlap')
  }
}
const back = balls.filter((b) => b.number >= 7)
assert.lengthOf(new Set(back.map((b) => Math.round(b.x))), 1, 'the back row is one column')
```

The felt, the balls and their numbers should be drawn.
tr: Çuha, toplar ve numaraları çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#15803d'), { x: 20, y: 40, w: 440, h: 240, color: '#15803d' })
assert.deepInclude($.arcs(), { x: 130, y: 160, r: 9, color: '#f8fafc' })
assert.deepInclude($.arcs(), { x: 330, y: 160, r: 9, color: '#facc15' })
for (let n = 1; n <= 10; n++) assert.include($.texts(), String(n))
```

# --seed--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
