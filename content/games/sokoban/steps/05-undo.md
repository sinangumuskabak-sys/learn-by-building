---
title: Undo
title_tr: Geri al
skills: [prog.arrays, game.state]
---

# --explanation--

In Sokoban one careless push can make a level impossible. Restarting the whole level for one mistake is painful, so
every good version has **undo**.

The simplest reliable undo is a **history of snapshots**: before each move, save a copy of everything the move could
change. Undo pops the last snapshot and puts it back.

```js
history.push(JSON.stringify({ player, boxes, moves }))   // before the move
...
;({ player, boxes, moves } = JSON.parse(history.pop()))   // undo
```

`JSON.stringify` makes a **deep copy** in text form. That matters: pushing the `boxes` array itself would store a
reference to the same array, and the next move would change the "saved" copy too. (It is the same value-versus-reference
lesson as the shared row in 2048.) The last line uses destructuring assignment to set three variables at once; the
leading `;` and the parentheses are needed because a line cannot start with `{` there.

A **stack** (push, then pop the last) is exactly the right shape for undo: the most recent change is undone first. `R`
restarts the level, and a move counter shows how efficient the solution is.

# --explanation-tr--

**Bu adımda:** hamleleri geri alabileceksin. **Z** son hamleyi geri alacak, **R** bölümü baştan başlatacak. Sağ üstte
`Moves: 12` gibi bir hamle sayacı, altta da `Arrows: move   Z: undo   R: restart` ipucu göreceksin.

**Neden geri alma?** Sokoban'da tek bir dikkatsiz itiş bölümü çözülemez yapabilir (kutu köşeye sıkışır). Tek hata için
bütün bölümü baştan oynamak can sıkar.

**Fotoğraf defteri (history).** En basit ve güvenilir yol: her hamleden **önce**, hamlenin değiştirebileceği her şeyin
(oyuncu, kutular, hamle sayısı) bir kopyasını, bir "fotoğrafını" (**snapshot**) deftere eklemek. Geri alırken son fotoğrafı
defterden çıkarıp her şeyi ona göre geri koyarız.

```js
history.push(snapshot())   // hamleden önce: fotoğrafı listenin sonuna ekle
history.pop()              // geri al: listenin SON elemanını çıkar ve ver
```

Böyle "sona ekle, sondan al" diye çalışan listeye **yığın** (stack) denir; üst üste konmuş tabaklar gibi: en son koyduğun
tabağı ilk alırsın. Geri alma için tam uygun: en son hamle ilk geri alınır.

**Neden `JSON.stringify`?** `JSON.stringify({ player, boxes, moves })` bütün bu değerleri **yazıya** çevirir, örneğin
`'{"player":{"x":3,"y":4},"boxes":[...],"moves":0}'`. Bu gerçek bir kopyadır. `boxes` listesinin kendisini deftere
koysaydık, defterde aynı listeye bir **işaret** (referans) olurdu; sonraki itiş kutuyu değiştirince "kaydedilmiş" hâl de
değişirdi. Aynı fotoğrafı değil, fotoğrafın çıktısını saklamak gibi.

`JSON.parse(yazı)` ters işi yapar: yazıyı yeniden nesneye çevirir.

**Üç değeri birden geri koymak:**

```js
;({ player, boxes, moves } = JSON.parse(previous))
```

"Gelen nesnedeki `player`'ı `player`'a, `boxes`'ı `boxes`'a, `moves`'u `moves`'a koy." Baştaki `;` ve dıştaki parantezler
şart: satır `{` ile başlasaydı bilgisayar onu bir kod bloğu sanırdı.

`if (!previous) return` → defter boşsa `pop()` `undefined` verir; `!` "değil" demektir: "fotoğraf yoksa hiçbir şey yapma".

**Yalnızca gerçekleşen hamleler.** Fotoğrafı, hamlenin olacağı **kesinleştikten** sonra çekeriz: kutu itilecekse duvar ve
kutu kontrolünden sonra, kutu yoksa `else` ("değilse") içinde. Engellenen hamle deftere girmez ve sayılmaz.

**Baştan başlamak** kolay: `loadLevel(level)` şu anki bölümü yazıdan yeniden kurar; `moves` ve `history`'yi de orada
sıfırlarız.

# --task--

1. Add `let moves` and `let history`, set to `0` and `[]` in `loadLevel()`.
2. Write `snapshot()` returning `JSON.stringify({ player, boxes, moves })`. In `move()`, push a snapshot just before a
   move happens (only when it is allowed), and add 1 to `moves` after it.
3. Write `undo()`: pop the last snapshot, if any, and restore `player`, `boxes` and `moves` from it. Call it on `z`,
   and restart the level on `r` (compare `event.key.toLowerCase()`, so Caps Lock does not matter).
4. Draw `Moves: 12` right-aligned at the top, and change the hint to `Arrows: move   Z: undo   R: restart`.

# --task-tr--

1. `let player` satırının altına iki değişken ekle:

   ```js
   let moves
   let history
   ```

2. `loadLevel()` fonksiyonunun sonuna, son `}`'den hemen önce ekle:

   ```js
     moves = 0
     history = []
   ```

3. `solved()` fonksiyonunun kapanış `}`'sinin altına `snapshot()`'ı yaz:

   ```js
   function snapshot() {
     return JSON.stringify({ player, boxes, moves })
   }
   ```

4. `move()` fonksiyonunun alt kısmını şöyle değiştir:

   ```js
     const box = boxAt(x, y)
     if (box) {
       const bx = x + dx
       const by = y + dy
       if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
       history.push(snapshot()) // ← yeni
       box.x = bx
       box.y = by
     } else {                   // ← yeni
       history.push(snapshot()) // ← yeni
     }
     player = { x, y }
     moves += 1                 // ← yeni
   }
   ```

5. `move()`'un kapanış `}`'sinin altına `undo()`'yu yaz:

   ```js
   function undo() {
     const previous = history.pop()
     if (!previous) return
     ;({ player, boxes, moves } = JSON.parse(previous))
   }
   ```

6. `keydown` dinleyicisinde, Boşluk satırının (`if (event.key === ' ' ...`) hemen üstüne iki satır ekle:

   ```js
     if (event.key.toLowerCase() === 'z') undo()
     if (event.key.toLowerCase() === 'r') loadLevel(level)
   ```

   `event.key.toLowerCase()` basılan harfi küçük harfe çevirir; böylece Caps Lock açıkken (`Z`) de çalışır.

7. `draw()`'da `Level` yazısının altına hamle sayacını ekle ve ipucunu değiştir:

   ```js
     ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)
     ctx.textAlign = 'right'                                     // ← yeni
     ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2) // ← yeni
   ```

   ```js
       ctx.fillText('Arrows: move   Z: undo   R: restart', canvas.width / 2, canvas.height - 16) // ← değişti
   ```

   (İpucunda bölümler arasında **üç boşluk** var.)

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Birkaç adım at: `Moves` artmalı. **Z** son adımı geri almalı, **R**
   bölümü baştan başlatmalı (Caps Lock açık olsa da). Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Each move should be counted, and blocked moves should not.
tr: Her hamle sayılmalı, engellenen hamleler sayılmamalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.strictEqual(moves, 2, 'the third push was blocked by the wall')
assert.lengthOf(history, 2)
assert.include($.texts(), 'Moves: 2')
```

Undo should step back through pushes, one at a time.
tr: Geri alma itişleri tek tek geri almalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 3 })
assert.deepEqual(boxAt(3, 2), { x: 3, y: 2 }, 'the box is back where it was')
assert.strictEqual(moves, 1)
$.tap('z')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 4 })
assert.strictEqual(moves, 0)
```

Snapshots should be real copies, not shared with the live boxes.
tr: Anlık görüntüler canlı kutularla paylaşılan değil gerçek kopyalar olmalı.

```js
loadLevel(1)
$.press('ArrowUp')
const saved = history[0]
$.press('ArrowUp')
assert.strictEqual(history[0], saved, 'pushing a box later must not change an earlier snapshot')
```

`r` should restart the level.
tr: `r` bölümü yeniden başlatmalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('r')
assert.deepEqual(player, { x: 3, y: 4 })
assert.strictEqual(moves, 0)
assert.lengthOf(history, 0)
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
let moves
let history

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
  moves = 0
  history = []
}

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function snapshot() {
  return JSON.stringify({ player, boxes, moves })
}

function move(dx, dy) {
  if (solved()) return
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  const box = boxAt(x, y)
  if (box) {
    const bx = x + dx
    const by = y + dy
    if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
    history.push(snapshot())
    box.x = bx
    box.y = by
  } else {
    history.push(snapshot())
  }
  player = { x, y }
  moves += 1
}

function undo() {
  const previous = history.pop()
  if (!previous) return
  ;({ player, boxes, moves } = JSON.parse(previous))
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  if (event.key.toLowerCase() === 'z') undo()
  if (event.key.toLowerCase() === 'r') loadLevel(level)
  if (event.key === ' ' && solved() && level < LEVELS.length - 1) loadLevel(level + 1)
  draw()
})

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2)

  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  if (solved()) {
    const last = level === LEVELS.length - 1
    ctx.fillStyle = '#4ade80'
    ctx.fillText(last ? 'All levels solved!' : 'Solved! Press Space for the next level', canvas.width / 2, canvas.height - 16)
  } else {
    ctx.fillStyle = '#a8a29e'
    ctx.fillText('Arrows: move   Z: undo   R: restart', canvas.width / 2, canvas.height - 16)
  }
}

loadLevel(0)
draw()
```
