---
title: A set of pellets
title_tr: Yem kümesi
skills: [prog.arrays, game.state]
---

# --goal--

The pellets get eaten, so they must be state, not map. Each pellet is named by a key like `'8,15'`, and all keys go in
a `Set`: a collection where each value is in at most once, with quick `has`, `add` and `delete`.

# --goal-tr--

Harita değişmez, ama **yemler yenecek**. O yüzden yemleri haritadan okuyup ayrı, **değişebilen** bir yerde tutacağız.

Her yemi döşemesinin adıyla tanıyacağız: sütun ve sıra, araya virgül: `'8,15'`. Bu adları bir **Set**'e (küme)
koyacağız. Küme bir torba gibidir: içinde bir şey **ya vardır ya yoktur**, aynı şey iki kez girmez. "Bu döşemede yem
var mı?" (`has`), "şu yemi çıkar" (`delete`), "kaç yem kaldı?" (`size`) soruları çok hızlı cevaplanır.

Güç yemleri (`o`) ayrı bir kümede: `powers`.

# --code--

```js
let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet

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

function reset() {
  fillPellets()
}

reset()
```

# --meaning--

- `key(8, 15)` gives `'8,15'`: one string per tile.
- `new Set()` is an empty set; `add` puts a key in.
- `fillPellets` walks the map like `draw` does and collects every `.` and `o`.
- `reset()` will set up a whole new game; for now it fills the pellets. It runs once before the loop starts.

# --meaning-tr--

- `let pellets`, `let powers` → yemlerin ve güç yemlerinin kümeleri. `let`, çünkü her oyunda yeniden doldurulacaklar.
- `const key = (col, row) => col + ',' + row` → kısa bir **ok fonksiyonu**: `key(8, 15)` → `'8,15'`. Sayıyla metni
  `+` ile birleştirmek metin verir.
- `new Set()` → **boş bir küme** yapar. `pellets.add(...)` → kümeye bir ad ekler.
- `fillPellets` → haritayı `draw`'daki gibi gezer; `.` gördüğü döşemenin adını `pellets`'e, `o` gördüğününkini
  `powers`'a ekler. `if` gövdesi tek satırsa süslü parantez yazılmayabilir.
- `function reset()` → yeni bir oyunu kuracak fonksiyon; şimdilik yalnız yemleri dolduruyor.
- En alttaki `reset()` → döngü başlamadan **önce** bir kez çalışır.

# --task--

1. Under `COLS`, leave an empty line and write the two variables, `key`, `fillPellets` and `reset`.
2. Above the last line, `requestAnimationFrame(loop)`, write `reset()`.

# --task-tr--

1. `const COLS = ...` satırının altına bir boş satır bırakıp iki değişkeni, `key`'i, `fillPellets`'i ve `reset`'i yaz
   (aralarında birer boş satır; `draw`'dan önce de bir boş satır kalsın).
2. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**. Ekran değişmez; yemleri bir sonraki adımda çizeceğiz.

# --predict--

How many pellets are there? Guess before you run: what does `pellets.size` say?
- [ ] 19 × 21 = 399, one per tile
- [x] 146: only the tiles with a `.`
  Walls, spaces, the house, the power pellets and the `P` are not pellets.
- [ ] 4

# --predict-tr--

Kaç yem var? Çalıştırmadan tahmin et: `pellets.size` ne der?
- [ ] 19 × 21 = 399, her döşemeye bir
- [x] 146: yalnız `.` olan döşemeler
  Duvarlar, boşluklar, ev, güç yemleri ve `P` yem değil.
- [ ] 4

# --tests--

The maze text should become sets of pellets and power pellets.
tr: Labirent metni yem ve güç yemi kümelerine dönüşmeli.

```js
assert.strictEqual(key(8, 15), '8,15')
assert.strictEqual(pellets.size, 146)
assert.strictEqual(powers.size, 4)
assert.isTrue(pellets.has('1,1'))
assert.isTrue(powers.has('17,2'))
assert.isFalse(pellets.has('0,0'), 'no pellets in walls')
```

`reset()` should refill the pellets.
tr: `reset()` yemleri yeniden doldurmalı.

```js
pellets.delete('1,1')
powers.clear()
reset()
assert.strictEqual(pellets.size, 146)
assert.strictEqual(powers.size, 4)
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

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet

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

function reset() {
  fillPellets()
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
