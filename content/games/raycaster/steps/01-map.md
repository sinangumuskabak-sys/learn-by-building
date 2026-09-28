---
title: The world is a flat map
title_tr: Dünya düz bir harita
skills: [game.canvas]
---

# --explanation--

The first 3D shooters had a secret: their worlds were not really 3D. The level is a **flat grid**, seen from above, and
the 3D picture is computed from it every frame. So we start where the game really lives: a map.

```
'#....#.....#'      # stone wall   2 brick wall   E exit   . floor
```

The player has a position **inside** a tile, not just a tile: `{ x: 1.5, y: 1.5 }` is the middle of tile (1, 1). And the
player faces a direction, an **angle** in radians: `0` looks right (+x), `Math.PI / 2` looks down (+y, because y grows
downwards on a screen), `Math.PI` looks left.

To draw where the player looks, go 1 tile along the angle:

```js
x + Math.cos(angle), y + Math.sin(angle)
```

`cos` and `sin` turn an angle into a step of length 1: how much across and how much down. Every movement and every ray
in this game comes from these two numbers.

# --explanation-tr--

**Bu adımda:** labirentin haritasını yukarıdan bakarak çizeceğiz. Sağda açık renkli duvar kareleri, koyu zemin,
yeşil bir çıkış karesi ve sol üstte küçük sarı bir kare (sen) ile baktığın yönü gösteren sarı bir çizgi göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×320 piksellik boş bir resim alanı (`canvas`, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (context) alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

`const` bir şeye kalıcı bir ad (**sabit**) verir: kutuya etiket yapıştırmak gibi. Nokta (`.`) "bunun içindeki şu
komut" demektir, tırnak içi (`'game'`) bir **yazıdır**. `ctx.fillStyle = renk` fırçaya renk sürer,
`ctx.fillRect(x, y, en, boy)` dikdörtgen boyar. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y` **aşağı**
doğru büyür.

**Dünya aslında düz bir harita.** İlk 3D nişancı oyunlarının sırrı: dünyaları gerçekten 3D değildi. Bölüm
yukarıdan görülen **düz bir ızgaradır** (grid); 3D görüntü her karede bundan hesaplanır. Haritayı yazılarla
tutarız:

```
'#....#.....#'      # taş duvar   2 tuğla duvar   E çıkış   . zemin
```

`MAP` bir **dizidir** (array, köşeli parantez `[ ]` içinde sıralı bir liste). Her elemanı haritanın bir satırı
olan bir yazı. `MAP[1]` ikinci satırdır (sayma **0'dan** başlar), `MAP[1][3]` o satırın dördüncü harfi.

**Oyuncu bir karenin içinde bir noktadır.** `{ x: 1.5, y: 1.5, angle: 0 }` bir **nesnedir** (object): süslü
parantez içinde `ad: değer` çiftleri. `player.x` "oyuncunun x'i". `1.5`, (1, 1) karesinin tam ortası demek. `let`
ile oluşturulan **değişkenin** içi, `const`'tan farklı olarak sonradan değişebilir.

**Yön = açı.** `angle` oyuncunun baktığı yön, **radyan** cinsinden: `0` sağa (+x), `Math.PI / 2` aşağı, `Math.PI`
(π, yarım tur) sola bakar. Baktığın yöne 1 kare gitmek için:

```js
x + Math.cos(angle), y + Math.sin(angle)
```

`cos` ve `sin` bir açıyı 1 uzunluğunda bir adıma çevirir: ne kadar yana, ne kadar aşağı. Bu oyundaki her hareket
ve her ışın bu iki sayıdan çıkar.

**Yeni parçalar:**

- **Fonksiyon:** `function reset() { ... }` bir talimat grubuna ad verir (tanımlar); `reset()` onu çalıştırır
  (çağırır).
- **`dizi.forEach((eleman, sıra) => { ... })`**: dizinin her elemanı için içerdeki kodu çalıştırır. `(line, row) =>`
  "bu elemana `line`, sırasına `row` de" demektir. `=>` ile yazılan şey kısa, adsız bir fonksiyondur.
- **`[...line]`**: bir yazıyı harflerine ayırıp diziye çevirir: `[...'#.E']` → `['#', '.', 'E']`. Satırın başındaki
  `;` bir önceki satırla karışmasın diye konur (satır `[` ile başladığı için).
- **`koşul ? a : b`**: "doğruysa `a`, değilse `b`". Zincirlenebilir: `ch === '.' ? zemin : ch === 'E' ? yeşil : duvar`.
  `===` "eşit mi?" demektir.
- **Çizgi:** `ctx.beginPath()` yeni çizim, `moveTo(x, y)` kalemi koy, `lineTo(x, y)` oraya çiz, `stroke()` boya;
  `strokeStyle` çizgi rengi.
- Her kare `MINI = 24` piksel. Harita karesi `(col, row)` ekranda `(col * MINI, row * MINI)`'dan başlar; `*` çarpma,
  `/` bölmedir.
- **Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "sonraki ekran yenilemesinde `loop`'u çağır" der.
  `loop` çizer ve kendini tekrar ister; saniyede yaklaşık 60 kez.

# --task--

1. Add the `MAP` below (`#` stone wall, `2` brick wall, `E` the exit, a wall you walk into, `.` floor) and `MINI = 24`
   (map pixels per tile). `reset()` puts the player at
   `{ x: 1.5, y: 1.5, angle: 0 }`.
2. Draw every frame: a `'#0f172a'` background, then every tile of the map as a `MINI` square: floor
   `'rgba(15, 23, 42, 0.6)'`, exit `'#22c55e'`, any wall `'rgba(226, 232, 240, 0.8)'`.
3. Draw the player as a `'#facc15'` square half a tile wide, centered on its position, and a `'#facc15'` line from the
   player to 1 tile ahead in the direction of `angle`.

   ```js
   const MAP = [
     '############',
     '#....#.....#',
     '#.##.#.###.#',
     '#.#..#...#.#',
     '#.#.###2#..#',
     '#.#.....#.##',
     '#.#22#.##..#',
     '#..........#',
     '###.##.#.#.#',
     '#...#..#.#.#',
     '#.#...##.#E#',
     '############',
   ]
   ```

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp haritayı ve kare boyunu ekle (haritayı aynen kopyala):

   ```js
   // # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
   const MAP = [
     '############',
     '#....#.....#',
     '#.##.#.###.#',
     '#.#..#...#.#',
     '#.#.###2#..#',
     '#.#.....#.##',
     '#.#22#.##..#',
     '#..........#',
     '###.##.#.#.#',
     '#...#..#.#.#',
     '#.#...##.#E#',
     '############',
   ]
   const MINI = 24 // map pixels per tile
   ```

3. Altına oyuncuyu ve onu başlangıca koyan `reset()` fonksiyonunu yaz:

   ```js
   let player

   function reset() {
     player = { x: 1.5, y: 1.5, angle: 0 }
   }
   ```

4. Altına `draw()` fonksiyonunu yaz. Önce arka planı, sonra haritanın her karesini, en son oyuncuyu ve baktığı yönü
   çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     // The map, seen from above.
     MAP.forEach((line, row) => {
       ;[...line].forEach((ch, col) => {
         ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
         ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
       })
     })
     ctx.fillStyle = '#facc15'
     ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
     ctx.strokeStyle = '#facc15'
     ctx.beginPath()
     ctx.moveTo(player.x * MINI, player.y * MINI)
     ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
     ctx.stroke()
   }
   ```

   Oyuncunun karesi yarım kare (`MINI / 2`) enindedir ve çeyrek kare (`MINI / 4`) geri kaydırılır ki ortası tam
   oyuncunun noktasına gelsin.

5. En alta döngüyü ve başlatma satırlarını ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda harita, sağ altta yeşil çıkış, sol üstte sağa bakan sarı oyuncu
   görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa renk yazılarını karşılaştır: `'rgba(...)'`
   içindeki virgül ve boşluklar da önemli.

# --tests--

The map should be drawn tile by tile.
tr: Harita döşeme döşeme çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('rgba(226, 232, 240, 0.8)'), 82)
assert.lengthOf($.rects('rgba(15, 23, 42, 0.6)'), 61)
assert.deepEqual($.rects('#22c55e'), [{ x: 240, y: 240, w: 24, h: 24, color: '#22c55e' }])
```

The player should be drawn at its position, looking along its angle.
tr: Oyuncu konumunda, açısı boyunca bakarak çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#facc15'), [{ x: 30, y: 30, w: 12, h: 12, color: '#facc15' }])
const line = $.screen().filter((c) => c.op === 'lineTo').pop()
assert.deepEqual(line.args, [60, 36])
player.angle = Math.PI / 2
$.tick(1)
const down = $.screen().filter((c) => c.op === 'lineTo').pop()
assert.closeTo(down.args[0], 36, 1e-9)
assert.closeTo(down.args[1], 60, 1e-9)
```

# --seed--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MINI = 24 // map pixels per tile

let player

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The map, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
