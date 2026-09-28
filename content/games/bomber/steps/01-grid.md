---
title: Walls, pillars and crates
title_tr: Duvarlar, sütunlar ve sandıklar
skills: [prog.arrays, game.canvas]
---

# --explanation--

A Bomberman-style arena is a grid with three kinds of tiles: **walls** (`'#'`) that nothing can break, **crates** (`'+'`)
that bombs destroy, and **floor** (`' '`).

The walls follow a simple pattern. The border is wall all round, and inside, every tile whose row **and** column are both even
is a pillar. That checkerboard of pillars is what makes the classic corridors: flames and players can only travel in straight
lines between them.

The crates are random, about 45% of the free tiles, with one important exception. If the player started boxed in by crates,
their first bomb would have no escape. So the tiles **next to** the start corners (the player's at `(1, 1)` and three for the
enemies) are always floor. "Next to" is a Manhattan distance of at most 1:

```js
Math.abs(sr - r) + Math.abs(sc - c) <= 1
```

Each tile is `TILE` pixels, drawn from `TOP` down so the top strip stays free for the lives and the time.

# --explanation-tr--

**Bu adımda:** Bomberman tarzı bir oyunun arenasını çizeceğiz. Sağda gri duvarlarla çevrili, içinde gri sütunlar,
yeşil zemin ve kahverengi (üstünde koyu bir çizgi olan) kasalarla dolu bir alan göreceksin. Kasalar her çalıştırmada
başka yerde olur.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar.

**Canvas ve fırça.** Sayfada 416×384 piksellik boş bir resim alanı (`canvas`) var. Önce onu buluruz, sonra fırçasını
(çizim bağlamı, **context**) alırız:

```js
const canvas = document.getElementById('game')   // kimliği 'game' olan alanı bul
const ctx = canvas.getContext('2d')              // onun 2D fırçasını al
```

`const ad = ...` bir şeye **sabit** bir ad (değişmeyen etiket) verir; `let` ile verilen adın değeri sonradan değişebilir
(**değişken**). Nokta (`.`) "bunun içindeki" demektir; tırnak içi bir **yazıdır**. Fırçayla renk seçilir
(`ctx.fillStyle = '#475569'`) ve dikdörtgen boyanır (`ctx.fillRect(x, y, en, boy)`). Sol üst köşe `(0, 0)`'dır; `x`
sağa, `y` **aşağı** doğru büyür.

**Arena bir ızgaradır.** 11 satır, 13 sütun kare (tile). Her kareyi tek bir karakterle tutarız:

- `'#'` → **duvar**, hiçbir şey kıramaz,
- `'+'` → **kasa**, bombalar yok eder,
- `' '` (boşluk) → **zemin**.

Izgara bir **liste içinde listedir**: `grid` 11 satırlık bir **dizi** (liste), her satır da 13 karakterlik bir dizi.
`grid[r][c]` → `r`. satırın `c`. karesi. Listelerde sayma **0'dan başlar**: ilk satır `grid[0]`, son satır `grid[10]`.
`push` listenin sonuna eleman ekler.

**Duvar deseni.** Kenarların hepsi duvardır; içeride satırı **ve** sütunu çift olan her kare bir sütundur (pillar). Bu
dama tahtası gibi sütun deseni klasik koridorları oluşturur: alevler ve oyuncular aralarında yalnızca düz çizgilerde
ilerleyebilir. Kodda:

- `%` bölümden kalanı verir: `r % 2 === 0` "r çift mi?" demektir. `===` iki değerin eşit olup olmadığını sorar.
- `||` "veya", `&&` "ve" demektir. İlk satırda: "ilk satır **veya** ilk sütun **veya** son satır **veya** son sütun
  **veya** (satır çift **ve** sütun çift) ise duvar".
- `if ... else if ... else` → "şuysa bunu, değilse şuysa bunu, hiçbiri değilse bunu yap".

**Rastgele kasalar.** `Math.random()` 0 ile 1 arasında rastgele bir sayı verir. `Math.random() > 0.55` yüzde 45
ihtimalle doğrudur: doğruysa kare **zemin**, yanlışsa **kasa** olur. Böylece duvar olmayan karelerin yaklaşık yarısı
kasayla dolar.

**Önemli bir istisna.** Oyuncu kasalarla çevrili başlasaydı ilk bombasından kaçacak yeri olmazdı. Bu yüzden başlangıç
köşelerinin **yanındaki** kareler (oyuncununki `(1, 1)`, düşmanlar için üç tane) hep zemindir. "Yanında" Manhattan
uzaklığı en fazla 1 demektir: satır farkı ile sütun farkının toplamı.

```js
const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)
```

- `(r, c, spots) => ...` bir **fonksiyondur** (ok `=>` "şunu ver"): `near(3, 4, liste)` diye çağrılır, sonucu geri verir.
- `spots.some(...)` → "noktalardan **en az biri** için doğru mu?"
- `([sr, sc])` → her nokta `[satır, sütun]` biçiminde iki elemanlı bir liste; bu yazım onu açıp iki ada koyar.
- `Math.abs` sayının eksisiz hâlidir. `<=` "küçük ya da eşit".

`[[1, 1], ...ENEMY_STARTS]` → `...` (yayma) `ENEMY_STARTS`'ın üç elemanını açıp `[1, 1]`'in yanına koyar: dört noktalık
tek bir liste.

**Çizmek.** İç içe iki `for` döngüsü her kareyi dolaşır. `for (let r = 0; r < ROWS; r++)` "r 0'dan başlasın, ROWS'tan
küçükken devam et, her turda 1 artsın (`++`)" demektir. Her kare `TILE` (32) piksel; `TOP` kadar aşağıdan başlarız ki
üstteki şerit canlar ve süre için boş kalsın. Renk `koşul ? A : B` ("doğruysa A, değilse B") zinciriyle seçilir.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der;
`loop` kendini yeniden çağırdığı için ekran saniyede yaklaşık 60 kez çizilir.

# --task--

1. Add `COLS = 13`, `ROWS = 11`, `TILE = 32`, `TOP = 32` and `ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]`.
2. Write `near(r, c, spots)`: true if `(r, c)` is at Manhattan distance 1 or less from any `[row, col]` in `spots`.
3. Write `makeGrid()`: `'#'` on the border and where row and column are both even; `' '` next to `(1, 1)` and the enemy
   starts, or when `Math.random() > 0.55`; otherwise `'+'`. `reset()` calls it.
4. Draw every tile as a `TILE` square at `(c * TILE, TOP + r * TILE)`: walls `'#475569'`, crates `'#b45309'` with a
   `'#92400e'` stripe (`x + 4`, `y + 14`, `TILE - 8` by 4), floor `'#3f6212'`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırakıp ayarları ekle:

   ```js
   const COLS = 13
   const ROWS = 11
   const TILE = 32
   const TOP = 32 // room for the lives and the time
   const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]
   ```

3. Bir boş satır bırakıp ızgaranın değişkenini ve `near` fonksiyonunu ekle:

   ```js
   let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

   const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)
   ```

4. Altına ızgarayı kuran fonksiyonu ve `reset`'i yaz:

   ```js
   // Walls all round, a pillar on every even row and column, and crates on about half of the rest,
   // but never next to where the player and the enemies start.
   function makeGrid() {
     grid = []
     for (let r = 0; r < ROWS; r++) {
       grid.push([])
       for (let c = 0; c < COLS; c++) {
         if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
         else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
         else grid[r].push('+')
       }
     }
   }

   function reset() {
     makeGrid()
   }
   ```

   Her satır için önce boş bir satır listesi eklenir (`grid.push([])`), sonra o satıra 13 karakter eklenir. Zemin
   karakteri tırnak içinde **bir boşluktur**: `' '`.

5. Altına çizen `draw`'u yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let r = 0; r < ROWS; r++) {
       for (let c = 0; c < COLS; c++) {
         const x = c * TILE
         const y = TOP + r * TILE
         const tile = grid[r][c]
         ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
         ctx.fillRect(x, y, TILE, TILE)
         if (tile === '+') {
           ctx.fillStyle = '#92400e'
           ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
         }
       }
     }
   }
   ```

   Renk satırı: "duvarsa gri, değilse kasaysa kahverengi, o da değilse yeşil". Kasanın üstüne koyu bir şerit çizilir.

6. En alta döngüyü ekle, ızgarayı kur ve başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Gri duvarlarla çevrili, içinde düzenli gri sütunlar ve rastgele
   kahverengi kasalar olan yeşil bir arena görmelisin; dört köşenin yanı boş olmalı. Alttaki kontrollerin hepsi yeşil
   olmalı. Kırmızı kalırsa zemin karakterinin `' '` (tırnak içinde bir boşluk) olduğunu kontrol et.

# --tests--

The border should be wall, with pillars on every even row and column.
tr: Kenar duvar olmalı; her çift satır ve sütunda sütunlar olmalı.

```js
assert.lengthOf(grid, ROWS)
for (const row of grid) assert.lengthOf(row, COLS)
for (let c = 0; c < COLS; c++) assert.deepEqual([grid[0][c], grid[ROWS - 1][c]], ['#', '#'])
for (let r = 0; r < ROWS; r++) assert.deepEqual([grid[r][0], grid[r][COLS - 1]], ['#', '#'])
assert.strictEqual(grid[2][2], '#', 'pillars on even rows and columns')
assert.strictEqual(grid[4][6], '#')
assert.notStrictEqual(grid[3][5], '#', 'no pillar on odd tiles')
```

The start corners should always be clear, and there should be plenty of crates.
tr: Başlangıç köşeleri her zaman açık olmalı ve bol sandık olmalı.

```js
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const [r, c] of [[1, 1], [1, 2], [2, 1], [ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]) {
    assert.strictEqual(grid[r][c], ' ', 'the start corners are clear')
  }
}
let crates = 0
let free = 0
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const row of grid) for (const t of row) {
    if (t === '+') crates++
    if (t !== '#') free++
  }
}
assert.isAbove(crates / free, 0.3, 'plenty of crates')
assert.isBelow(crates / free, 0.6)
```

Walls, floor and crates should be drawn in place.
tr: Duvarlar, zemin ve sandıklar yerlerinde çizilmeli.

```js
grid[1][3] = '+'
$.tick(1)
assert.deepInclude($.rects('#475569'), { x: 0, y: 32, w: 32, h: 32, color: '#475569' }, 'a wall')
assert.deepInclude($.rects('#3f6212'), { x: 32, y: 64, w: 32, h: 32, color: '#3f6212' }, 'the floor')
assert.deepInclude($.rects('#b45309'), { x: 96, y: 64, w: 32, h: 32, color: '#b45309' }, 'a crate')
```

# --seed--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

function reset() {
  makeGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
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
