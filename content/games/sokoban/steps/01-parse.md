---
title: Reading a level
title_tr: Bir bölümü okumak
skills: [prog.arrays, game.state]
---

# --explanation--

Sokoban puzzles have been shared for decades in one tiny text format:

```
#  wall        .  goal        $  box        @  player
*  box that is already on a goal            +  player standing on a goal
```

Using an existing standard means you can paste in any of the thousands of published levels. Reading it is a job of
turning characters into **state**: walk every character with its `x` and `y`, and sort what you find.

Walls and goals never move, and the only question you will ever ask them is "is there one at this tile?". A **`Set`**
answers that instantly (`walls.has(...)`), but a Set can only compare simple values, not `{x, y}` objects (two objects
with the same numbers are still different objects). So turn each position into a **string key**:

```js
const key = (x, y) => x + ',' + y   // key(3, 2) is "3,2"
walls.add(key(x, y))
```

Boxes do move, so they stay a list of `{ x, y }` objects. Notice `*` and `+`: one character sets **two** things (a box
and a goal, or the player and a goal), which is why each test is its own `if`, not an `else if`.

# --explanation-tr--

**Bu adımda:** Sokoban'ın ilk bölümünü yazıdan okuyup ekrana çizeceğiz. Sağda ortada küçük bir oda göreceksin: gri
duvarlar, kahverengi bir kutu, turuncu küçük bir hedef noktası ve mavi kare olarak oyuncu. (Hareket sonraki adımda.)

**Sokoban nedir?** Bir depo işçisi, kutuları iterek hedef noktalara yerleştirir. Kutuyu sadece itebilir, çekemez.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların listesidir.
Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**: bilgisayar atlar.

**Canvas ve fırça.** Sayfada 480×520 piksellik bir resim alanı (`<canvas id="game">`) var. Onu bulur ve fırçasını
(bağlam, **context**) alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

`const ad = ...` bir şeye **kalıcı bir ad** verir (sabit): kutuya etiket yapıştırmak gibi. `let ad` ise içi sonradan
değişebilen bir kutu (değişken) açar. Nokta (`.`) "bunun içindeki şu" demektir. `ctx.fillStyle = renk` renk seçer,
`ctx.fillRect(x, y, genişlik, yükseklik)` dikdörtgen boyar. Sol üst köşe `(0, 0)`; `x` sağa, `y` **aşağı** büyür.

**Bölümler yazıyla saklanır.** Sokoban bölümleri onlarca yıldır bu küçük harf düzeniyle paylaşılır:

```
#  duvar      .  hedef      $  kutu      @  oyuncu
*  hedefin üstündeki kutu   +  hedefin üstündeki oyuncu
```

Bir bölüm, satırlardan oluşan bir **dizidir** (array, sıralı liste): `['#####', '#@$.#', '#####']`. Tırnak içindekiler
**yazıdır**. `LEVELS` de bölümlerden oluşan bir liste: sıra numaraları (**index**) **0'dan başlar**, `LEVELS[0]` ilk bölüm.

**Yazıyı okumak.** Her satırı ve satırdaki her harfi gezeriz. Satırın sırası `y`, harfin sırası `x` olur:

```js
LEVELS[level].forEach((line, y) => {
  ;[...line].forEach((ch, x) => { ... })
})
```

- `forEach` listenin **her elemanı için** `{ }` içini çalıştırır; `line` o satırın yazısı, `y` onun numarası.
- `[...line]` yazıyı harflerden oluşan bir listeye çevirir: `[...'#@$']` → `['#', '@', '$']`.
- Baştaki `;` bir güvenlik işaretidir: satır `[` ile başladığında bilgisayarın onu önceki satıra yapıştırmasını engeller.

Her harf için `if` ile soruyoruz. `===` "eşit mi?", `||` "**ya da**" demektir. `*` ve `+` **iki şey birden** olduğu için
(kutu + hedef, oyuncu + hedef) her soru ayrı bir `if`'tir; biri doğru olunca diğerleri yine sorulur.

**Duvarlar ve hedefler: `Set`.** Duvar ve hedef hiç yer değiştirmez; onlara soracağımız tek soru "şu karede var mı?"dır.
`Set` (küme) bunu anında cevaplar: `walls.add(...)` ekler, `walls.has(...)` "var mı?" diye sorar, `walls.size` kaç tane
olduğunu verir. Ama `Set` `{ x: 3, y: 2 }` gibi iki nesneyi karşılaştıramaz (aynı sayılar olsa da farklı nesnedirler). Bu
yüzden her konumu bir yazıya çeviririz:

```js
const key = (x, y) => x + ',' + y   // key(3, 2) → "3,2"
```

`(x, y) => ...` kısa bir **fonksiyondur**: iki değer alır, sağdaki hesabı **geri verir**.

**Kutular ve oyuncu.** Kutular hareket edeceği için `{ x, y }` **nesnelerinden** (adlandırılmış değerlerden oluşan küçük
kart) oluşan bir listede durur; `boxes.push(...)` listeye ekler. `{ x, y }`, `{ x: x, y: y }`'nin kısa yazımıdır.

**Çizim.** Bölümü canvas'ın ortasına koymak için genişliğini (`cols`) ve yüksekliğini (`rows`) bulup kalan boşluğu ikiye
böleriz (`ox`, `oy`). `Math.max(...liste)` listedeki en büyük sayıyı verir. İçerideki `tile(x, y, renk, inset)` küçük
yardımcısı bir kareyi her yandan `inset` kadar içeri çekerek boyar; `inset = 0` "verilmezse 0 kullan" demektir. Böylece
duvar tam kare, hedef küçük bir nokta olur.

`const [x, y] = k.split(',').map(Number)` → `"3,2"` yazısını virgülden böl (`['3', '2']`), her parçayı sayıya çevir, ilkine
`x`, ikincisine `y` de. `for (const k of walls)` "kümedeki her eleman için" demektir. Hedefin üstündeki kutu yeşil,
diğerleri kahverengi: `koşul ? a : b` "doğruysa `a`, değilse `b`".

# --task--

1. Store the canvas and context in `canvas` and `ctx`, add `TILE = 48`, `TOP = 48`, `BOTTOM = 40` and the `LEVELS` array from the
   solution (three levels, each a list of strings).
2. Add `let level = 0`, `let walls`, `let goals`, `let boxes`, `let player` and `const key = (x, y) => x + ',' + y`.
3. Write `loadLevel(index)`: set `level`, make `walls` and `goals` new `Set`s and `boxes` an empty array, then read every
   character of `LEVELS[level]`: `#` adds a wall; `.`, `*` and `+` add a goal; `$` and `*` add a box; `@` and `+` set
   `player`.
4. Write `draw()` as in the solution (level centered; walls, goals, boxes, player) and call `loadLevel(0)` and `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp ayarları ve üç bölümü ekle. Bölümlerdeki **boşluklar da önemli**; en kolayı buradan kopyalamak:

   ```js
   const TILE = 48
   const TOP = 48 // room for the level number and the move counter
   const BOTTOM = 40 // room for the hint line
   // The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
   const LEVELS = [
     [
       '#####',
       '#@$.#',
       '#####',
     ],
     [
       '######',
       '#    #',
       '# $$ #',
       '# .. #',
       '#  @ #',
       '######',
     ],
     [
       '  #####',
       '###   #',
       '#.@$  #',
       '### $.#',
       '#.##$ #',
       '# # . ##',
       '#$ *$$.#',
       '#   .  #',
       '########',
     ],
   ]
   ```

3. Bir satır boşluk bırakıp durum değişkenlerini ve `key`'i ekle:

   ```js
   let level = 0
   let walls
   let goals
   let boxes
   let player

   const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set
   ```

4. Altına bölümü okuyan fonksiyonu yaz:

   ```js
   function loadLevel(index) {
     level = index
     walls = new Set()
     goals = new Set()
     boxes = []
     LEVELS[level].forEach((line, y) => {
       ;[...line].forEach((ch, x) => {
         if (ch === '#') walls.add(key(x, y))
         if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))
         if (ch === '$' || ch === '*') boxes.push({ x, y })
         if (ch === '@' || ch === '+') player = { x, y }
       })
     })
   }
   ```

   `new Set()` boş bir küme, `[]` boş bir liste yapar. Her bölüm yüklenişinde temiz başlarız.

5. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#1c1917'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     // Center the level on the canvas.
     const rows = LEVELS[level].length
     const cols = Math.max(...LEVELS[level].map((line) => line.length))
     const ox = (canvas.width - cols * TILE) / 2
     const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
     const tile = (x, y, color, inset = 0) => {
       ctx.fillStyle = color
       ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
     }

     for (const k of walls) {
       const [x, y] = k.split(',').map(Number)
       tile(x, y, '#78716c', 1)
     }
     for (const k of goals) {
       const [x, y] = k.split(',').map(Number)
       tile(x, y, '#f59e0b', 18)
     }
     for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
     tile(player.x, player.y, '#38bdf8', 10)
   }
   ```

6. En alta ilk bölümü yükleyip çizen iki satırı ekle:

   ```js
   loadLevel(0)
   draw()
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda ortada küçük bir oda görmelisin: solda mavi oyuncu, yanında
   kahverengi kutu, sağında turuncu hedef noktası. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa bölüm
   satırlarını ve `if` satırlarındaki harfleri (`'#'`, `'.'`, `'*'`, `'+'`, `'$'`, `'@'`) karşılaştır.

# --tests--

The first level should be read into walls, a goal, a box and the player.
tr: İlk bölüm duvarlara, bir hedefe, bir kutuya ve oyuncuya okunmalı.

```js
assert.lengthOf(LEVELS, 3)
assert.strictEqual(key(3, 2), '3,2')
assert.strictEqual(walls.size, 12)
assert.isTrue(walls.has('0,0'))
assert.sameMembers([...goals], ['3,1'])
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
assert.deepEqual(player, { x: 1, y: 1 })
```

`*` and `+` should each count as two things.
tr: `*` ve `+` her biri iki şey sayılmalı.

```js
LEVELS.push(['#####', '#+*.#', '#####'])
loadLevel(3)
assert.sameMembers([...goals], ['1,1', '2,1', '3,1'])
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
assert.deepEqual(player, { x: 1, y: 1 })
LEVELS.pop()
```

Loading another level should start from a clean slate.
tr: Başka bir bölüm yüklemek temiz bir sayfadan başlamalı.

```js
loadLevel(1)
assert.strictEqual(level, 1)
assert.lengthOf(boxes, 2)
assert.strictEqual(goals.size, 2)
assert.deepEqual(player, { x: 3, y: 4 })
assert.isFalse(walls.has('4,1'), 'no walls left over from level 1')
```

The level should be drawn centered.
tr: Bölüm ortalanarak çizilmeli.

```js
draw()
assert.deepInclude($.rects('#38bdf8'), { x: 178, y: 250, w: 28, h: 28, color: '#38bdf8' })
```

# --seed--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 48
const TOP = 48 // room for the level number and the move counter
const BOTTOM = 40 // room for the hint line
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
  [
    '######',
    '#    #',
    '# $$ #',
    '# .. #',
    '#  @ #',
    '######',
  ],
  [
    '  #####',
    '###   #',
    '#.@$  #',
    '### $.#',
    '#.##$ #',
    '# # . ##',
    '#$ *$$.#',
    '#   .  #',
    '########',
  ],
]

let level = 0
let walls
let goals
let boxes
let player

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  goals = new Set()
  boxes = []
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
      if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))
      if (ch === '$' || ch === '*') boxes.push({ x, y })
      if (ch === '@' || ch === '+') player = { x, y }
    })
  })
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Center the level on the canvas.
  const rows = LEVELS[level].length
  const cols = Math.max(...LEVELS[level].map((line) => line.length))
  const ox = (canvas.width - cols * TILE) / 2
  const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
  for (const k of goals) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#f59e0b', 18)
  }
  for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
