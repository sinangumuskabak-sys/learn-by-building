---
title: New tiles, and a sneaky array bug
title_tr: Yeni karolar ve sinsi bir dizi hatası
skills: [prog.arrays]
---

# --explanation--

A game starts with two tiles in random empty cells, and every move adds one more: a `2` nine times out of ten, a `4`
otherwise.

To pick a random **empty** cell, first collect all of them as `[row, col]` pairs, then pick one from that list. This is
far better than "try random cells until one is empty", which gets slower and slower as the board fills up, and never
ends when it is full.

Building an empty board hides one of JavaScript's most famous traps:

```js
Array(4).fill(Array(4).fill(0))   // looks right... but it is ONE row, shared four times
```

`fill` puts the **same** array object in every slot. Set `board[0][0] = 2` and `board[1][0]`, `board[2][0]` and
`board[3][0]` all become 2 too, because they are the same row. `Array.from` calls a function for **each** slot, so each
row is a brand new array:

```js
Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
```

This difference between a *value* and a *reference to an object* is behind countless bugs, far beyond games.

# --explanation-tr--

**Bu adımda:** oyunu iki karoyla başlatacağız. **Çalıştır**'a her bastığında tahtada rastgele iki boş hücrede birer `2`
(ara sıra `4`) belirecek.

**Kural.** Oyun rastgele iki boş hücredeki iki karoyla başlar ve her hamle bir karo daha ekler: 10 seferin 9'unda `2`,
kalanında `4`.

**Rastgele bir boş hücre seçmek.** Önce bütün boş hücreleri `[satır, sütun]` çiftleri olarak bir listeye toplarız,
sonra o listeden birini seçeriz. "Boş olanı bulana kadar rastgele hücre dene" yöntemi tahta doldukça yavaşlar, tahta
tamamen doluysa da hiç bitmez.

- `const cells = []` → boş bir liste. `cells.push([row, col])` sonuna bir öğe ekler (burada iki sayılık küçük bir
  liste). `cells.length` listedeki öğe sayısıdır.
- `Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı verir. Onu `cells.length` ile çarpıp
  `Math.floor` ile aşağı yuvarlayınca `0` ile `length - 1` arasında rastgele bir **sıra numarası** (index) çıkar.
  Örneğin 5 boş hücre varsa 0, 1, 2, 3 ya da 4.
- `const [row, col] = cells[...]` → seçilen çiftin ilk sayısını `row`'a, ikincisini `col`'a koyar. Buna **parçalama**
  (destructuring) denir.
- `Math.random() < 0.9 ? 2 : 4` → rastgele sayı 0.9'dan küçükse (yaklaşık %90) `2`, değilse `4`.
- `if (cells.length === 0) return` → boş hücre yoksa `return` ile fonksiyondan hemen çık; dolu tahta olduğu gibi kalır.

**JavaScript'in ünlü tuzağı.** Boş bir tahta kurmak kolay görünür:

```js
Array(4).fill(Array(4).fill(0))   // doğru görünüyor... ama bu TEK bir satır, dört kez paylaşılmış
```

`Array(4)` 4 yerlik bir liste yapar, `.fill(x)` her yere `x` koyar. Ama `fill` her yere **aynı** satırı koyar. Aynı
defterin dört fotokopisi değil, dört kişinin elinde tuttuğu **tek bir defter** gibi: `board[0][0] = 2` yazarsan
`board[1][0]`, `board[2][0]`, `board[3][0]` da 2 olur, çünkü hepsi aynı satır. `Array.from` ise her yer için bir
fonksiyonu **ayrı ayrı** çağırır, böylece her satır yepyeni bir liste olur:

```js
Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
```

`() => ...` kısa yazılmış, adsız bir fonksiyondur (**ok fonksiyonu**): "her seferinde yeni bir sıfır satırı yap".
**Değer** ile bir nesneye **başvuru** (reference) arasındaki bu fark, oyunların çok ötesinde sayısız hatanın sebebidir.

Artık tahta `newGame()` ile kurulduğu için en üstte `let board` değersiz yazılır; değerini `newGame()` verir.

# --task--

1. Write `function emptyCells()` returning every `[row, col]` whose value is `0`.
2. Write `function addTile()`: if there are empty cells, pick one at random and set it to `2` if
   `Math.random() < 0.9`, otherwise `4`.
3. Write `function newGame()`: build a fresh board with `Array.from` (each row its own array), then add two tiles. Call
   it before `draw()`, and declare `let board` without a value.

# --task-tr--

1. `let board = [ ... ]` tahtasının tamamını (kapanış `]` dahil) sil ve yerine yalnızca şunu yaz:

   ```js
   let board
   ```

2. Bir satır boşluk bırak ve altına boş hücreleri listeleyen fonksiyonu yaz:

   ```js
   function emptyCells() {
     const cells = []
     for (let row = 0; row < SIZE; row++) {
       for (let col = 0; col < SIZE; col++) {
         if (board[row][col] === 0) cells.push([row, col])
       }
     }
     return cells
   }
   ```

3. Altına rastgele bir boş hücreye karo koyan fonksiyonu yaz:

   ```js
   function addTile() {
     const cells = emptyCells()
     if (cells.length === 0) return
     const [row, col] = cells[Math.floor(Math.random() * cells.length)]
     board[row][col] = Math.random() < 0.9 ? 2 : 4
   }
   ```

4. Altına yeni oyunu kuran fonksiyonu yaz:

   ```js
   function newGame() {
     // Array.from her satır için fonksiyonu çağırır; böylece her satır kendi listesi olur.
     board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
     addTile()
     addTile()
   }
   ```

5. En alttaki `draw()` satırının **hemen üstüne** oyunu başlatan çağrıyı ekle:

   ```js
   newGame()
   draw()
   ```

6. **Çalıştır**'a bas. Tahtada iki karo (genelde iki `2`) görünmeli; her **Çalıştır**'da başka yerlerde çıkmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `newGame()`'in `draw()`'dan **önce** geldiğine ve `Array.from`
   satırını harf harf yazdığına bak.

# --tests--

Each row should be its own array.
tr: Her satır kendi dizisi olmalı.

```js
newGame()
assert.notStrictEqual(board[0], board[1])
board[0][0] = 64
assert.strictEqual(board[1][0] === 64, false, 'changing one row must not change the others')
```

A new game should start with exactly two tiles.
tr: Yeni bir oyun tam olarak iki karoyla başlamalı.

```js
for (let i = 0; i < 20; i++) {
  newGame()
  const tiles = board.flat().filter((v) => v !== 0)
  assert.lengthOf(tiles, 2)
  assert.isTrue(tiles.every((v) => v === 2 || v === 4))
}
```

`emptyCells()` should list the empty cells as [row, col].
tr: `emptyCells()` boş hücreleri [row, col] olarak listelemeli.

```js
board = [[2, 2, 2, 2], [2, 0, 2, 2], [2, 2, 2, 2], [2, 2, 2, 0]]
assert.sameDeepMembers(emptyCells(), [[1, 1], [3, 3]])
```

`addTile()` should fill empty cells only, with 2 about 90% of the time.
tr: `addTile()` yalnızca boş hücreleri, yaklaşık %90 oranında 2 ile doldurmalı.

```js
let twos = 0
for (let i = 0; i < 1000; i++) {
  board = [[8, 8, 8, 8], [8, 0, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
  addTile()
  assert.notStrictEqual(board[1][1], 0)
  if (board[1][1] === 2) twos++
}
assert.isAbove(twos, 850)
assert.isBelow(twos, 950)
board = [[8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
addTile()
assert.deepEqual(board.flat(), Array(16).fill(8), 'a full board stays as it is')
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board

function emptyCells() {
  const cells = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) cells.push([row, col])
    }
  }
  return cells
}

function addTile() {
  const cells = emptyCells()
  if (cells.length === 0) return
  const [row, col] = cells[Math.floor(Math.random() * cells.length)]
  board[row][col] = Math.random() < 0.9 ? 2 : 4
}

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  addTile()
  addTile()
}

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

newGame()
draw()
```
