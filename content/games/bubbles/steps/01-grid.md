---
title: A grid of nested bubbles
title_tr: İç içe geçmiş balonlardan bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

In a bubble shooter the bubbles hang from the ceiling, packed as tightly as marbles in a box: every other row is shifted half a
bubble to the right, so each bubble nests in the gap between the two above it. This is a **hex grid**, the same pattern as a
honeycomb.

We still store it as a plain 2D array, `grid[r][c]`, and the geometry lives in one function that turns a cell into a position:

- **x**: `R + c * 2R`, plus `R` more on odd rows (the shift);
- **y**: rows are closer than one diameter, because the bubbles nest. In a honeycomb the row height is `R * √3`, about
  `1.73 R` instead of `2 R`.

That `√3` is not magic: a bubble and the two it rests on form an equilateral triangle with sides `2R`, and its height is
`2R × √3 / 2`. The test checks that two bubbles in neighbouring rows are exactly `2R` apart, just touching.

An odd row fits one bubble less: shifted right by `R`, a tenth bubble would stick out of the canvas.

# --explanation-tr--

**Bu adımda:** tavandan sarkan renkli balonları çizeceğiz. Sağda, lacivert bir zeminin üstünde beş sıra renkli balon
göreceksin; her ikinci sıra yarım balon sağa kaymış, balonlar bal peteği gibi birbirinin arasına oturmuş olacak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların listesidir.
Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas ve fırça.** Sayfada 400×520 piksellik bir resim alanı (`<canvas id="game">`) var. Onu bulur ve çizim aracını
(bağlam, **context**) alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const ad = ...` bir şeye kalıcı bir ad verir (**sabit**): kutuya etiket yapıştırmak gibi. `let ad` ise içi sonradan
  değişebilen bir kutu (**değişken**) açar. Nokta (`.`) "bunun içindeki şu" demektir. Tırnak içi **yazıdır**.
- `ctx.fillStyle = renk` renk seçer, `ctx.fillRect(x, y, genişlik, yükseklik)` dikdörtgen boyar. Sol üst köşe `(0, 0)`;
  `x` sağa, `y` **aşağı** büyür. Renkler `'#ef4444'` (kırmızı) gibi kodlarla yazılır.

**Daire çizmek.** Daire için üç komut:

```js
ctx.beginPath()                      // yeni bir şekle başla
ctx.arc(x, y, yarıçap, 0, Math.PI * 2) // merkezi (x, y) olan bir çember çiz
ctx.fill()                           // içini boya
```

`Math.PI * 2` tam tur demektir (açılar derece değil **radyan** ile ölçülür; tam tur 2π ≈ 6.28).

**Renkler bir listede.** `COLORS` beş renkten oluşan bir **dizidir** (array, sıralı liste). Sıra numarası (**index**)
**0'dan başlar**: `COLORS[0]` kırmızı, `COLORS[4]` mor. Izgarada rengin kendisini değil numarasını saklarız; `-1` "boş
hücre" demektir.

**Izgara.** Izgara satırlardan oluşan bir liste, her satır da hücrelerden oluşan bir liste: `grid[r][c]` = `r`
numaralı satırın `c` numaralı hücresi.

**Bal peteği dizilimi.** Balonlar misket kutusundaki misketler gibi sıkı dizilir: her **tek** numaralı satır yarım balon
(`R`) sağa kayar ve her balon üstteki iki balonun arasına oturur.

- `r % 2` → `r`'yi 2'ye bölünce kalan: çift satırda 0, tek satırda 1. Tek satırda `(r % 2) * R` = `R` kadar kayarız.
- Tek satır bir balon **eksik** alır: sağa kaydığı için onuncu balon canvas'tan taşardı.
  `r % 2 === 0 ? COLS : COLS - 1` → "çift satırsa 10, değilse 9". `===` "eşit mi?" sorar; `a ? b : c` "doğruysa `b`,
  değilse `c`".
- Satırlar arası yükseklik bir çap (`2R`) değil, `R * √3` ≈ `1.73 R`'dir; balonlar iç içe geçer. Neden? Bir balon ve
  altındaki ikisi, kenarı `2R` olan eşkenar bir üçgen oluşturur; o üçgenin yüksekliği `2R × √3 / 2` = `R × √3`.
  `Math.sqrt(3)` 3'ün kareköküdür.

**Fonksiyonlar.** Fonksiyon bir işe ad verip paketlemektir; önce **tanımlar**, sonra adıyla **çağırırsın**.
`const cols = (r) => ...` kısa yazımdır: `r` alır, `=>`'nin sağındakini **geri verir**. `cellPos(r, c)` bir hücrenin
ekrandaki yerini `{ x: ..., y: ... }` **nesnesi** (adlandırılmış değerlerden oluşan kart) olarak verir; nesneyi geri veren
kısa fonksiyonda nesne parantez içine alınır: `=> ({ ... })`.

`drawBubble(x, y, color, r = R)` → son değer verilmezse `R` kullanılır. Çizerken yarıçaptan 1 çıkarırız ki balonlar arasında
ince bir boşluk kalsın.

**Döngü (`for`).** `for (let r = 0; r < ROWS; r++) { ... }` → "`r` 0'dan başlasın, `ROWS`'tan küçük olduğu sürece `{ }`
içini yap, her turdan sonra 1 artsın". İç içe iki döngü bütün hücreleri gezer. `grid.push([])` listeye boş bir satır
ekler. İlk 5 satır (`r < 5`) rastgele renk alır: `Math.random()` 0–1 arası rastgele sayı, `Math.floor` aşağı yuvarlar;
ikisi birlikte 0–4 arası bir renk numarası verir. Diğer satırlar `-1` (boş).

`if (grid[r][c] < 0) continue` → "hücre boşsa bu turu atla, çizme".

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der. `loop`
çizip kendini yeniden sıraya koyar; saniyede yaklaşık 60 kez (60 **kare**).

# --task--

1. Add `R = 20`, `COLS = 10`, `ROWS = 14`, `ROW_H = R * Math.sqrt(3)`, `TOP = 30` and five `COLORS`
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'`).
2. Write `cols(r)` (`COLS` on even rows, one less on odd rows) and `cellPos(r, c)` as described
   (`y = TOP + R + r * ROW_H`).
3. In `reset()`, build `grid`: rows 0 to 4 filled with random colors, the rest `-1` (empty).
4. Draw: fill `'#1e1b4b'`, the top strip (`TOP` high) `'#312e81'`, and every bubble as a circle of radius `R - 1` in its color,
   using a helper `drawBubble(x, y, color, r = R)`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp ayarları ekle:

   ```js
   const R = 20 // bubble radius
   const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
   const ROWS = 14
   const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
   const TOP = 30 // room for the score
   const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
   ```

3. Altına ızgara değişkenini ve iki yardımcıyı ekle:

   ```js
   let grid // grid[r][c]: a color index, or -1 for an empty cell

   const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
   const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })
   ```

4. Altına ızgarayı kuran `reset()`'i yaz:

   ```js
   function reset() {
     grid = []
     for (let r = 0; r < ROWS; r++) {
       grid.push([])
       for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
     }
   }
   ```

5. Altına balon çizen yardımcıyı ve `draw()`'u yaz:

   ```js
   function drawBubble(x, y, color, r = R) {
     ctx.fillStyle = COLORS[color]
     ctx.beginPath()
     ctx.arc(x, y, r - 1, 0, Math.PI * 2)
     ctx.fill()
   }

   function draw() {
     ctx.fillStyle = '#1e1b4b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#312e81'
     ctx.fillRect(0, 0, canvas.width, TOP)

     for (let r = 0; r < ROWS; r++) {
       for (let c = 0; c < cols(r); c++) {
         if (grid[r][c] < 0) continue
         const p = cellPos(r, c)
         drawBubble(p.x, p.y, grid[r][c])
       }
     }
   }
   ```

6. En alta oyun döngüsünü ve başlatan satırları ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Üstte beş sıra renkli balon görmelisin; ikinci ve dördüncü sıra yarım balon
   sağa kaymış olmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `cellPos` satırındaki parantezleri harf
   harf karşılaştır.

# --tests--

The grid should have 14 rows, alternating 10 and 9 cells, with the first five filled.
tr: Izgarada 10 ve 9 hücre arasında değişen 14 satır olmalı ve ilk beşi dolu olmalı.

```js
assert.lengthOf(grid, ROWS)
assert.lengthOf(grid[0], 10)
assert.lengthOf(grid[1], 9, 'odd rows have one bubble less')
assert.lengthOf(grid[2], 10)
for (let r = 0; r < 5; r++) for (const color of grid[r]) assert.include([0, 1, 2, 3, 4], color)
for (let r = 5; r < ROWS; r++) for (const color of grid[r]) assert.strictEqual(color, -1)
```

Odd rows should be shifted, and neighbouring rows should just touch.
tr: Tek satırlar kaymış olmalı ve komşu satırlar yalnızca değmeli.

```js
assert.deepEqual(cellPos(0, 0), { x: 20, y: 50 })
assert.deepEqual(cellPos(0, 9), { x: 380, y: 50 })
const p = cellPos(1, 0)
assert.strictEqual(p.x, 40, 'odd rows sit half a bubble to the right')
assert.closeTo(p.y, 50 + 20 * Math.sqrt(3), 1e-9)
assert.closeTo(Math.hypot(p.x - 20, p.y - 50), 2 * R, 1e-9, 'bubbles in neighbouring rows just touch')
```

Every bubble should be drawn in its place and color.
tr: Her balon kendi yerinde ve renginde çizilmeli.

```js
$.tick(1)
const bubbles = $.arcs().filter((a) => a.r === 19)
assert.lengthOf(bubbles, 48, 'five rows: 10 + 9 + 10 + 9 + 10')
assert.deepInclude(bubbles, { x: 20, y: 50, r: 19, color: COLORS[grid[0][0]] })
```

# --seed--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

let grid // grid[r][c]: a color index, or -1 for an empty cell

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
}

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
