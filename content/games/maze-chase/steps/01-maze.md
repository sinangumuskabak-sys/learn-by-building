---
title: A maze made of text
title_tr: Metinden bir labirent
skills: [prog.arrays]
---

# --explanation--

A maze is a grid, and the easiest way to design a grid is to **draw it as text**. Each string is one row, each
character one tile:

```
'#o##.###.#.###.##o#'
 # wall   . pellet   o power pellet   - ghost house   P player start   (space) empty
```

You can see the level while you edit it, and changing the maze never means changing code. `MAZE[row][col]` answers
"what is on this tile?".

Pellets get eaten, so they need a data structure you can **remove from**. A `Set` of keys like `'8,15'` is perfect:
`has`, `add` and `delete` are all instant, and `size` is how many are left. The maze text itself never changes; it is the
starting layout, and `fillPellets()` rebuilds the sets from it whenever a new maze starts.

Keeping "the level" (the text) apart from "the state of this game" (the sets) is a pattern you will see in every game:
the level is data you design, the state is what changes while you play.

# --explanation-tr--

**Bu adımda:** labirenti çizeceğiz. Çalıştırınca sağda mavi duvarlı bir labirent, koridorlarda küçük sarı yemler,
köşelerde dört büyük yem, ortada mor bir "hayalet evi" ve aşağıda sarı yuvarlak oyuncunu göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 456×544 piksellik boş bir resim alanı var; kimliği (id) `game`. Oyundaki her
şeyi bu alana **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı (çizim bağlamı, **context**) alırız:

```js
const canvas = document.getElementById('game')   // kâğıdı bul
const ctx = canvas.getContext('2d')              // fırçayı al
```

- `const ad = ...` → "bundan sonra şuna `ad` diyeceğim". `const` ile ad verilen şeye **sabit** denir, içi değişmez.
  `let` ile verilen adın içine ise sonra başka bir şey konabilir.
- Nokta (`.`) "bunun içindeki şu komut" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx.fillStyle = '#1d4ed8'` fırçanın rengini seçer (`'#...'` bir renk kodudur); `ctx.fillRect(x, y, en, boy)` bir
  dikdörtgen boyar.
- Konum: canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa gittikçe, `y` **aşağı** indikçe büyür.

**Labirenti yazıyla çizmek.** Labirent bir ızgaradır (satırlar ve sütunlar). Onu tasarlamanın en kolay yolu **yazı
olarak çizmektir**: her yazı bir satır, her harf bir kare (döşeme, tile).

```
'#o##.###.#.###.##o#'
 # duvar   . yem   o güç yemi   - hayalet evi   P oyuncunun başlangıcı   (boşluk) boş
```

Düzenlerken labirenti gözünle görürsün ve labirenti değiştirmek kodu değiştirmek anlamına gelmez. Bütün satırlar
`MAZE` adlı bir **diziye** (array, köşeli parantez `[ ]` içinde virgülle ayrılmış liste) konur. Sıra numaraları
**0'dan** başlar: `MAZE[0]` ilk satır, `MAZE[15][9]` 16. satırın 10. harfi, yani "bu karede ne var?".
`MAZE.length` satır sayısı (21), `MAZE[0].length` bir satırın harf sayısı (19).

Her kare 24 piksel (`TILE`). Üstte puan için 40 piksel boşluk (`TOP`) bırakırız. Böylece `row` satırı, `col` sütunu
olan karenin sol üst köşesi `(col * TILE, TOP + row * TILE)`'dır (`*` çarpma).

**Yenen yemler için küme (Set).** Yemler yenecek, yani onları tutan yapıdan **silebilmeliyiz**. Her yemi `'8,15'` gibi
bir yazıyla (anahtar, key) adlandırıp bir **küme** (`Set`) içinde tutarız:

- `new Set()` → boş bir küme kurar.
- `küme.add(k)` ekler, `küme.has(k)` "içinde var mı?" diye sorar, `küme.delete(k)` siler, `küme.size` kaç tane kaldığı.

Labirent yazısı hiç değişmez; o başlangıç düzenidir. `fillPellets()` her yeni labirentte kümeleri yazıdan yeniden kurar.
"Bölüm" (tasarladığın veri) ile "bu oyunun durumunu" (oynarken değişen şeyler) ayrı tutmak her oyunda göreceğin bir
düzendir.

**Yeni araçlar:**

- `const key = (col, row) => col + ',' + row` → kısa yazılmış bir **fonksiyon**: parantezdekiler **parametreler**
  (çağırırken verilen bilgiler), `=>`'nin sağı **sonuç**. `+` yazıları yan yana ekler: `key(8, 15)` → `'8,15'`.
- `function ad() { ... }` bir talimat paketini **tanımlar**; `ad()` onu **çağırır** (çalıştırır).
- `MAZE.forEach((line, row) => { ... })` → dizideki her öğe için işi yapar: `line` satırın yazısı, `row` sıra numarası.
- `[...line]` → yazıyı harflerine ayırıp bir diziye çevirir. Başındaki `;` bir güvenliktir: köşeli parantezle başlayan
  satır, bir üstteki satırın devamı sanılmasın.
- `if (ch === '.') ...` → `if` "eğer", `===` "eşit mi?": harf nokta ise yem ekle.
- `MAZE.findIndex((line) => line.includes('P'))` → içinde `P` geçen **ilk** satırın numarası. `line.indexOf('P')`
  o satırda `P`'nin kaçıncı harf olduğu.
- `{ col: 9, row }` → bir **nesne** (object): birkaç bilgiyi bir arada tutar, `player.col` diye ulaşırsın. `row` tek
  başına `row: row` demektir.
- `for (const k of pellets)` → kümedeki her anahtar için. `k.split(',')` `'8,15'`'i `['8', '15']`'e böler;
  `.map(Number)` ikisini de sayıya çevirir; `const [col, row] = ...` iki sayıyı iki ayrı ada koyar.
- `ctx.beginPath()`, `ctx.arc(x, y, yarıçap, 0, Math.PI * 2)`, `ctx.fill()` → bir **tam daire** boyar
  (`Math.PI * 2` tam tur).

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der.
`loop` çizer ve kendini tekrar ister; ekran saniyede yaklaşık 60 kez çizilir.

# --task--

1. Add `TILE = 24`, `TOP = 40` and the `MAZE` from the solution, with `ROWS` and `COLS` taken from it.
2. Write `key(col, row)` returning `'col,row'`, and `fillPellets()` that makes `pellets` (every `.`) and `powers` (every
   `o`) new `Set`s of keys.
3. Write `placeActors()` that puts `player = { col, row }` on the `P`, and `reset()` that calls both.
4. Draw every frame: a `'#0b1020'` background; walls as `'#1d4ed8'` squares 2 pixels smaller than their tile on each side;
   house tiles as full `'#312e81'` tiles; pellets as 4 by 4 `'#fde68a'` squares in the middle of their tile; power pellets
   as `'#fde68a'` circles of radius 6; the player as a `'#facc15'` circle of radius 10. Row `r` starts at `TOP + r * TILE`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boş bırak ve kare boyunu, üst boşluğu ve labirenti yaz. Labirenti buradan **kopyalayıp yapıştırmak** en
   güvenlisi; her satır tam 19 harf olmalı (boşluklar da sayılır):

   ```js
   const TILE = 24
   const TOP = 40 // room for the score and the lives
   // # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
   const MAZE = [
     '###################',
     '#........#........#',
     '#o##.###.#.###.##o#',
     '#.................#',
     '#.##.#.#####.#.##.#',
     '#....#...#...#....#',
     '####.### # ###.####',
     '   #.#       #.#   ',
     '####.# #---# #.####',
     '    .  #---#  .    ',
     '####.# ##### #.####',
     '   #.#       #.#   ',
     '####.# ##### #.####',
     '#........#........#',
     '#.##.###.#.###.##.#',
     '#o.#.....P.....#.o#',
     '##.#.#.#####.#.#.##',
     '#....#...#...#....#',
     '#.######.#.######.#',
     '#.................#',
     '###################',
   ]
   const ROWS = MAZE.length
   const COLS = MAZE[0].length
   ```

3. Bir satır boş bırak, oyunun değişen bilgilerinin adlarını ve anahtar fonksiyonunu yaz:

   ```js
   let pellets // keys of the tiles that still have a pellet
   let powers // keys of the tiles that still have a power pellet
   let player

   const key = (col, row) => col + ',' + row
   ```

4. Altına yemleri labirentten toplayan, oyuncuyu yerine koyan ve ikisini çağıran fonksiyonları yaz:

   ```js
   function fillPellets() {
     pellets = new Set()
     powers = new Set()
     MAZE.forEach((line, row) => {
       ;[...line].forEach((ch, col) => {
         if (ch === '.') pellets.add(key(col, row))
         if (ch === 'o') powers.add(key(col, row))
       })
     })
   }

   function placeActors() {
     const row = MAZE.findIndex((line) => line.includes('P'))
     player = { col: MAZE[row].indexOf('P'), row }
   }

   function reset() {
     fillPellets()
     placeActors()
   }
   ```

5. Altına her şeyi çizen fonksiyonu yaz. Duvarlar karelerinden her yanda 2 piksel küçük (aralarında ince çizgi kalsın),
   hayalet evi tam kare, yemler karenin ortasında 4×4 kare, güç yemleri 6 yarıçaplı daire, oyuncu 10 yarıçaplı daire:

   ```js
   function draw() {
     ctx.fillStyle = '#0b1020'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     MAZE.forEach((line, row) => {
       ;[...line].forEach((ch, col) => {
         if (ch === '#') {
           ctx.fillStyle = '#1d4ed8'
           ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
         }
         if (ch === '-') {
           ctx.fillStyle = '#312e81'
           ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
         }
       })
     })

     ctx.fillStyle = '#fde68a'
     for (const k of pellets) {
       const [col, row] = k.split(',').map(Number)
       ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
     }
     for (const k of powers) {
       const [col, row] = k.split(',').map(Number)
       ctx.beginPath()
       ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
       ctx.fill()
     }

     ctx.fillStyle = '#facc15'
     ctx.beginPath()
     ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
     ctx.fill()
   }
   ```

   `TILE / 2` (12) karenin ortasıdır; `/` bölme demektir.

6. Altına oyun döngüsünü ve en sona onu başlatan iki satırı yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda mavi labirent, sarı yemler, köşelerde dört büyük yem, ortada mor
   ev ve alt ortada sarı oyuncu görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata
   labirent yazısındadır: bir satırın 19 harften kısa ya da uzun olması. Yukarıdan yeniden kopyala.

# --tests--

The maze text should become sets of pellets and power pellets.
tr: Labirent metni yem ve güç yemi kümelerine dönüşmeli.

```js
assert.strictEqual(ROWS, 21)
assert.strictEqual(COLS, 19)
assert.strictEqual(key(8, 15), '8,15')
assert.strictEqual(pellets.size, 146)
assert.strictEqual(powers.size, 4)
assert.isTrue(pellets.has('1,1'))
assert.isTrue(powers.has('17,2'))
assert.isFalse(pellets.has('0,0'), 'no pellets in walls')
```

The player should start on the P.
tr: Oyuncu P'nin üstünde başlamalı.

```js
assert.strictEqual(player.col, 9)
assert.strictEqual(player.row, 15)
```

The maze should be drawn tile by tile.
tr: Labirent döşeme döşeme çizilmeli.

```js
$.tick(1)
const walls = $.rects('#1d4ed8')
assert.lengthOf(walls, 196)
assert.deepEqual(walls[0], { x: 2, y: 42, w: 20, h: 20, color: '#1d4ed8' })
assert.lengthOf($.rects('#312e81'), 6)
const dots = $.rects('#fde68a')
assert.lengthOf(dots, 146)
assert.deepEqual(dots[0], { x: 34, y: 74, w: 4, h: 4, color: '#fde68a' })
assert.lengthOf($.arcs().filter((a) => a.color === '#fde68a' && a.r === 6), 4)
```

The player should be drawn in the middle of its tile.
tr: Oyuncu döşemesinin ortasında çizilmeli.

```js
$.tick(1)
const me = $.arcs().filter((a) => a.color === '#facc15')
assert.lengthOf(me, 1)
assert.deepEqual([me[0].x, me[0].y, me[0].r], [228, 412, 10])
```

# --seed--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
```

# --solution--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 24
const TOP = 40 // room for the score and the lives
// # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# #---# #.####',
  '    .  #---#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const ROWS = MAZE.length
const COLS = MAZE[0].length
// Checked in this order, so ties go to up, then left, then down.

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

const key = (col, row) => col + ',' + row

function fillPellets() {
  pellets = new Set()
  powers = new Set()
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '.') pellets.add(key(col, row))
      if (ch === 'o') powers.add(key(col, row))
    })
  })
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row }
}

function reset() {
  fillPellets()
  placeActors()
}

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })

  ctx.fillStyle = '#fde68a'
  for (const k of pellets) {
    const [col, row] = k.split(',').map(Number)
    ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
  }
  for (const k of powers) {
    const [col, row] = k.split(',').map(Number)
    ctx.beginPath()
    ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
