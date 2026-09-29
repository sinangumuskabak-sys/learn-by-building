---
title: What is solid?
title_tr: Ne katı?
skills: [game.collision, prog.functions]
---

# --goal--

Everything the player does will ask one question: **is this point inside a solid tile?** `solidAt(x, y)` turns pixels
into a tile and answers, including what happens outside the level.

# --goal-tr--

Oyuncunun yaptığı her şey aynı soruyu soracak: **bu nokta katı bir döşemenin içinde mi?** Yürürken önündeki duvar,
düşerken ayağının altındaki zemin... Hepsini tek bir fonksiyon cevaplayacak: `solidAt` (şurada katı mı?).

Önce pikseli döşemeye çeviririz. Sonra bölümün **dışını** da kararlaştırırız, çünkü oyuncu kenarlara ulaşacak:

- en solun ve en sağın ötesi **katı**: görünmez duvarlar, oyuncu bölümden yürüyüp çıkamaz;
- tepenin üstü **hava**: gökyüzüne zıplayabilirsin;
- en alt satırın altı **hava**: çukurların dibi yok, oyuncu dünyadan düşer.

# --code--

```js
function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}
```

# --meaning--

- `Math.floor(x / TILE)` turns a pixel into a column: pixel 100 is in column 3 (100 / 32 = 3.1, floored).
- Outside the level on the left or right: solid. Above or below: air.
- Inside, the answer is whether the tile is ground or brick.

# --meaning-tr--

- `Math.floor(x / TILE)` → pikseli **sütuna** çevirir: 100 / 32 = 3.125 → `Math.floor` küsuratı atar → **3**.
  y için aynısı satırı verir.
- `if (col < 0 || col >= COLS) return true` → sütun bölümün solunda **veya** sağındaysa: katı (görünmez duvar).
- `if (row < 0 || row >= ROWS) return false` → satır bölümün üstünde veya altındaysa: hava.
- `const tile = LEVEL[row][col]` → bölümün içindeysek o yerdeki harf.
- `return tile === '#' || tile === 'B'` → zemin veya tuğla ise `true`, değilse `false`. Karşılaştırmanın sonucu doğrudan
  cevap olur.

# --task--

Above `function draw() {` write `solidAt`, with an empty line between them.

# --task-tr--

`function draw() {` satırının **üstüne** `solidAt` fonksiyonunu yaz; aralarında bir boş satır kalsın. **Çalıştır**:
ekran aynı, kontroller yeşil.

# --hint--

Check the outside cases **before** reading `LEVEL[row][col]`: `LEVEL[-1]` does not exist.

# --hint-tr--

Dışarıdaki durumları `LEVEL[row][col]`'u okumadan **önce** kontrol et: `LEVEL[-1]` diye bir satır yok.

# --tests--

`solidAt()` should read tiles by pixel position.
tr: `solidAt()` döşemeleri piksel konumuna göre okumalı.

```js
assert.isTrue(solidAt(0, 300), 'ground at the bottom left')
assert.isTrue(solidAt(9 * 32 + 5, 6 * 32 + 5), 'a brick')
assert.isFalse(solidAt(100, 100), 'sky')
assert.isFalse(solidAt(16 * 32 + 5, 300), 'a pit')
```

Outside the level: walls at the sides, air above and below.
tr: Bölümün dışı: yanlarda duvar, üstte ve altta hava.

```js
assert.isTrue(solidAt(-1, 100))
assert.isTrue(solidAt(64 * 32, 100))
assert.isFalse(solidAt(100, -50))
assert.isFalse(solidAt(100, 11 * 32 + 10))
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
