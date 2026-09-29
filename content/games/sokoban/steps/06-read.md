---
title: Read the walls
title_tr: Duvarları oku
skills: [prog.arrays, game.state]
---

# --goal--

`loadLevel` turns the text into state: it walks every character with its column `x` and row `y`, and puts every wall's
key into a `Set`.

# --goal-tr--

Şimdi yazıyı **okuyacağız**: bölümün her satırını, satırdaki her harfi gezip ne olduğuna bakacağız. Satırın sırası
`y` (satır), harfin sırası `x` (sütun) olur. Bu adımda sadece **duvarları** (`#`) topluyoruz; kalanlar sonraki
adımlarda.

Duvarları bir **`Set`** (küme) içinde tutacağız. Küme bir liste gibidir ama her değeri bir kez tutar ve "şu var mı?"
sorusunu anında cevaplar.

# --code--

```js
let level = 0
let walls

function loadLevel(index) {
  level = index
  walls = new Set()
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
    })
  })
}

loadLevel(0)
```

# --meaning--

- `level` is the index of the current level, `walls` the Set of wall keys.
- `new Set()` makes an empty Set, so every load starts clean.
- `forEach((line, y) => ...)` runs the function for every row, with the row's text and its number.
- `[...line]` spreads a row into characters; the inner `forEach` gives each character and its column.
- The `;` at the start stops JavaScript from gluing a line that starts with `[` to the line before.
- `walls.add(key(x, y))` adds the tile's name to the Set.

# --meaning-tr--

- `let level = 0` → şu anki bölümün **sıra numarası**. Sayma 0'dan başlar: `LEVELS[0]` ilk bölüm.
- `let walls` → duvarların kümesi. `let` "değeri sonradan değişebilen" ad demek.
- `function loadLevel(index)` → `index` bir **parametre**: hangi bölüm yüklensin.
- `walls = new Set()` → **boş bir küme** yapar. Her yüklemede temiz başlarız.
- `LEVELS[level].forEach((line, y) => { ... })` → `forEach` listenin **her elemanı için** fonksiyonu çalıştırır: `line`
  satırın yazısı (`'#@$.#'`), `y` onun sıra numarası (0, 1, 2).
- `[...line]` → yazıyı harflerine dağıtıp bir listeye koyar: `[...'#@$']` → `['#', '@', '$']`.
- İçteki `forEach((ch, x) => ...)` → satırdaki her harf (`ch`) ve sütun numarası (`x`).
- Baştaki `;` → bir güvenlik işareti: satır `[` ile başlayınca JavaScript onu bir önceki satıra yapıştırmaya kalkar;
  `;` "önceki satır burada bitti" der.
- `if (ch === '#') walls.add(key(x, y))` → harf duvarsa karenin adını kümeye **ekle**. `===` "tam olarak eşit mi?"
- En alttaki `loadLevel(0)` → ilk bölümü yükle (`draw()`'dan önce).

# --task--

1. Above `const key`, write `let level = 0` and `let walls`, and leave an empty line.
2. Under the `key` line, leave an empty line and write `loadLevel`.
3. At the bottom, write `loadLevel(0)` above `draw()`. Press **Run**.

# --task-tr--

1. `const key = ...` satırının **üstüne** `let level = 0` ve `let walls` satırlarını yaz; `key` ile arada bir boş satır
   kalsın.
2. `key` satırının altına bir boş satır bırakıp `loadLevel` fonksiyonunu yaz.
3. En alttaki `draw()` satırının **üstüne** `loadLevel(0)` yaz.
4. **Çalıştır**. Duvarları henüz çizmiyoruz; kontroller kümeyi okuyor.

# --hint--

Check the two closing lines: the inner `forEach` ends with `})`, and so does the outer one.

# --hint-tr--

Kapanışları kontrol et: içteki `forEach` `})` ile biter, dıştaki de `})` ile.

# --tests--

The first level's 12 walls should be read into `walls`.
tr: İlk bölümün 12 duvarı `walls`'a okunmalı.

```js
assert.strictEqual(level, 0)
assert.instanceOf(walls, Set)
assert.strictEqual(walls.size, 12)
assert.isTrue(walls.has('0,0'))
assert.isTrue(walls.has('4,1'))
assert.isFalse(walls.has('1,1'), 'the player is not a wall')
```

Loading a level should start from a clean slate.
tr: Bölüm yüklemek temiz bir sayfadan başlamalı.

```js
walls.add('9,9')
loadLevel(0)
assert.isFalse(walls.has('9,9'))
assert.strictEqual(walls.size, 12)
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

let level = 0
let walls

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
    })
  })
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

loadLevel(0)
draw()
```
