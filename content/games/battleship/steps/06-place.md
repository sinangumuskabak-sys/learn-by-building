---
title: A random fleet
title_tr: Rastgele bir filo
skills: [prog.loops, prog.arrays]
---

# --goal--

A fleet has ships of length 5, 4, 3, 3 and 2. Each ship tries random spots until it fits on the sea without overlapping
a ship already placed.

# --goal-tr--

Her filoda uzunluğu 5, 4, 3, 3 ve 2 olan beş gemi var. Onları denize **rastgele** dizeceğiz. Klasik küçük bir
algoritma: her gemi için rastgele bir yön ve denize sığan rastgele bir başlangıç seç; önceki bir gemiyle **çakışıyorsa
yeniden dene**. Dolu kareleri bir `taken` (alındı) tablosunda işaretleriz.

100 karelik denizde gemiler yalnız 17 kare tuttuğu için boş bir yer birkaç denemede bulunur.

# --code--

```js
const SHIPS = [5, 4, 3, 3, 2]

// A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
function placeFleet() {
  const taken = grid(false)
  return SHIPS.map((length) => {
    for (;;) {
      const down = Math.random() < 0.5
      const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
      const c = Math.floor(Math.random() * (down ? N : N - length + 1))
      const cells = shipCells(r, c, length, down)
      if (cells.some(([cr, cc]) => taken[cr][cc])) continue
      for (const [cr, cc] of cells) taken[cr][cc] = true
      return { cells }
    }
  })
}
```

# --meaning--

- `SHIPS.map(...)` turns each length into a ship; the result is the list of five ships.
- `for (;;)` loops forever; `continue` tries again, `return` leaves with a ship that fits.
- The start is chosen so the whole ship fits: a ship of 5 going down can start only in rows 0 to 5.
- `some` asks whether any of its squares is already taken; if not, they are marked taken.

# --meaning-tr--

- `const SHIPS = [5, 4, 3, 3, 2]` → gemi uzunlukları.
- `const taken = grid(false)` → hangi karelerin dolu olduğunu tutan tablo; başta hepsi boş.
- `SHIPS.map((length) => { ... })` → her uzunluk için içerideki kodu çalıştırır ve sonuçlardan (gemilerden) liste yapar.
- `for (;;) { ... }` → koşulsuz, **sonsuz** bir döngü; `return` ile çıkılır.
- `Math.random() < 0.5` → yarı yarıya `true`: gemi aşağı mı gidecek?
- `Math.floor(Math.random() * (down ? N - length + 1 : N))` → 0'dan başlayan rastgele bir satır. Aşağı giden 5'lik
  gemi sığsın diye 10 − 5 + 1 = **6** seçenek (0–5). Sütun için aynısı ters yönde.
- `cells.some(([cr, cc]) => taken[cr][cc])` → karelerden **en az biri** dolu mu? `[cr, cc]` gelen iki elemanlı
  listeyi açıp adlarını verir: satır ve sütun.
- `continue` → doluysa bu denemeyi bırak, baştan dene.
- `for (const [cr, cc] of cells) taken[cr][cc] = true` → gemi yerleşti: karelerini dolu işaretle.
- `return { cells }` → gemi: kapladığı karelerin listesi.

# --task--

1. Under `const N = 10` write `SHIPS`.
2. Above `function drawSea(`, write `placeFleet` with its comment, followed by an empty line.

# --task-tr--

1. `const N = 10` satırının altına `SHIPS` sabitini yaz.
2. `function drawSea(` satırının **üstüne** yorumuyla birlikte `placeFleet` fonksiyonunu yaz; altında bir boş satır
   kalsın.
3. **Çalıştır**: ekran değişmez (gemileri henüz kimse dizmiyor), kontroller yeşil olmalı.

# --hint--

The start row for a ship going down is chosen from `N - length + 1` values; for a ship going across it is the column.

# --hint-tr--

Aşağı giden geminin başlangıç satırı `N - length + 1` değerden seçilir; yatay giden gemide bu sınır sütun için geçerli.

# --tests--

Every fleet should have straight ships of the right lengths, on the sea, never overlapping.
tr: Her filonun doğru uzunlukta, denizde, asla örtüşmeyen düz gemileri olmalı.

```js
for (let i = 0; i < 50; i++) {
  const fleet = placeFleet()
  assert.deepEqual(fleet.map((s) => s.cells.length), [5, 4, 3, 3, 2])
  const seen = new Set()
  for (const ship of fleet) {
    const rows = new Set(ship.cells.map(([r]) => r))
    const cols = new Set(ship.cells.map(([, c]) => c))
    assert.isTrue(rows.size === 1 || cols.size === 1, 'a ship is a straight line')
    for (const [r, c] of ship.cells) {
      assert.isTrue(r >= 0 && r < N && c >= 0 && c < N, 'on the sea')
      assert.isFalse(seen.has(r * N + c), 'ships do not overlap')
      seen.add(r * N + c)
    }
  }
}
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const SHIPS = [5, 4, 3, 3, 2]
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))

// A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
function placeFleet() {
  const taken = grid(false)
  return SHIPS.map((length) => {
    for (;;) {
      const down = Math.random() < 0.5
      const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
      const c = Math.floor(Math.random() * (down ? N : N - length + 1))
      const cells = shipCells(r, c, length, down)
      if (cells.some(([cr, cc]) => taken[cr][cc])) continue
      for (const [cr, cc] of cells) taken[cr][cc] = true
      return { cells }
    }
  })
}

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
