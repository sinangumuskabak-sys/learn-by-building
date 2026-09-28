---
title: Sinking ships
title_tr: Gemi batırmak
skills: [game.state]
---

# --explanation--

A ship sinks when every one of its squares has been hit. Each ship keeps a `hits` count, and a ship is sunk when `hits` equals its
length. That is a one-line function, `sunk(ship)`, and "the whole fleet is sunk" is `fleet.every(sunk)`: passing the function
itself to `every` reads almost like the sentence.

Being told "you sank a ship" matters to the player: it means stop searching around that ship. So sinking gets its own message, the
sunk ship is outlined on the sea, and a list shows the lengths of the ships still afloat. Knowing only the 2 is left changes where
it is worth looking.

When the last enemy ship sinks you win, and the number of shots it took is your score: fewer is better.

# --explanation-tr--

**Bu adımda:** gemiler batacak. Bir geminin bütün karelerini vurunca `You sank a ship!` yazacak, batan gemi pembe bir
çerçeveyle çizilecek, isabet noktaları koyulaşacak. Küçük denizin sağında atış sayını ve kalan gemileri
(`Left: 5 4 3 3 2`) göreceksin. Hepsini batırınca kazanırsın.

**İsabet sayacı.** Her gemi kaç kez vurulduğunu `hits` alanında tutar (başta `0`). Vurulunca `ship.hits += 1` ile bir
artar (`+=` "şu kadar artır"). Gemi, isabet sayısı uzunluğuna eşitse batmıştır:

```js
const sunk = (ship) => ship.hits === ship.cells.length
```

Her listenin **uzunluğu** `.length` ile okunur: 3 karelik geminin `cells.length`'i 3'tür.

**Bütün donanma battı mı?** `enemyFleet.every(sunk)` → "listedeki **her** gemi için `sunk` doğru mu?" `every`,
`some`'ın tersidir: `some` birinin, `every` hepsinin uymasını ister. Burada fonksiyonun kendisini (`sunk`) veriyoruz;
satır neredeyse cümle gibi okunur: "düşman donanmasının hepsi batmış mı?" Aynı şekilde `enemyFleet.filter(sunk)` batmış
gemileri verir.

**Üç sonuçlu cevap.** `fire` artık üç şeyden birini geri verir: `'miss'`, `'hit'` ya da `'sunk'`. Mesajı seçmek için
iki `? :` art arda kullanılır:

```js
message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
```

"Iska ise `Miss`; değilse, isabet ise `Hit!`; o da değilse `You sank a ship!`".

**Oyunun durumu.** `state` oyun sürerken `'playing'`, kazanınca `'won'` olur. `||` "veya" demektir:
`if (state !== 'playing' || myShots[r][c]) return` → "oyun sürmüyorsa **veya** kare zaten denendiyse hiçbir şey yapma".
`!==` "eşit değil" demektir.

**Batırdığını bilmek** oyuncu için önemlidir: o geminin çevresini aramayı bırakabilir. Bu yüzden batış kendi mesajını
alır, batan gemi denizde çerçevelenir ve bir liste hâlâ yüzen gemilerin uzunluklarını gösterir. Yalnızca 2'liğin kaldığını
bilmek, nereye bakmaya değdiğini değiştirir.

**Çerçeve çizmek.** `strokeRect` dikdörtgenin içini değil **kenarını** çizer; rengi `ctx.strokeStyle`, kalınlığı
`ctx.lineWidth`'tir. Geminin kapladığı alanı bulmak için satır ve sütunlarını ayrı listelere alırız:

- `ship.cells.map(([r]) => r)` → her karenin yalnızca satırı. `([, c]) => c` ise virgülle ilk elemanı atlayıp sütunu
  alır.
- `Math.min(...cs)` → `...` (yayma) listeyi açıp elemanlarını tek tek verir, `Math.min` en küçüğünü bulur. En küçük ve en
  büyük sütun arası kaç kare ise (`max - min + 1`) çerçevenin eni o kadar kare olur.

**Kalan gemiler yazısı.** `.filter((s) => !sunk(s))` batmamışları seçer, `.map((s) => s.cells.length)` her birinin
yerine uzunluğunu koyar, `.join(' ')` listeyi araya boşluk koyarak tek bir yazı yapar: `[5, 4, 2]` → `'5 4 2'`.

**Yeniden başlamak.** Oyun bitince tıklama ya da Enter yeni oyun başlatır. `return reset()` hem `reset()`'i çağırır
hem de fonksiyondan çıkar. Enter için `keydown` dinleriz; `event.preventDefault()` tarayıcının o tuşla kendi bildiği
bir şey yapmasını engeller. `else return` ise "Enter değilse ya da oyun sürüyorsa hiçbir şey yapma, sayfanın normal
davranışına dokunma" demektir.

Son düşman gemisi batınca kazanırsın; kaç atışta bitirdiğin skorundur: az olan iyidir.

# --task--

1. Ships get `hits: 0`. `fire` adds 1 to the ship's `hits` on a hit and returns `'sunk'` when that sinks it. Write `sunk(ship)`.
2. Add `state` (`'playing'`) and `shots` (`0`). `playerShoots` only works while playing, counts shots, and says
   `'You sank a ship!'` for a sinking. When every enemy ship is sunk, set `'won'` and `'You won in 23 shots!'`.
3. After the end, a tap or Enter starts again.
4. Outline each sunk enemy ship (`'#fca5a5'`, width 2) around its squares, and draw `Shots 3` and `Left: 5 4 3 3 2` beside your sea.

# --task-tr--

1. Değişkenlere iki satır ekle (`let message` satırının altına); `enemyFleet` satırının yorumunu da güncelleyebilirsin:

   ```js
   let enemyFleet // ships: { cells: [[r, c], ...], hits }
   ```

   ```js
   let state // 'playing' or 'won'
   let shots // how many shots you took
   ```

2. `placeFleet()` içinde geminin döndürüldüğü satırı değiştir:

   ```js
         return { cells, hits: 0 } // ← değişti
   ```

3. `reset()`'in son kısmını şöyle yap:

   ```js
     myShots = grid(null)
     message = 'Your turn: pick a square' // ← değişti
     state = 'playing' // ← yeni
     shots = 0 // ← yeni
   }
   ```

4. `const shipAt = ...` satırının altına `sunk`'ı ekle:

   ```js
   const sunk = (ship) => ship.hits === ship.cells.length
   ```

5. `fire` fonksiyonunun son iki satırını şöyle yap:

   ```js
     record[r][c] = 'hit'
     ship.hits += 1 // ← yeni
     return sunk(ship) ? 'sunk' : 'hit' // ← değişti
   }
   ```

6. `playerShoots`'u şöyle yap:

   ```js
   function playerShoots(r, c) {
     if (state !== 'playing' || myShots[r][c]) return // ← değişti
     shots += 1 // ← yeni
     const result = fire(enemyFleet, myShots, r, c) // ← yeni
     message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!' // ← değişti
     if (enemyFleet.every(sunk)) { // ← yeni
       state = 'won'
       message = 'You won in ' + shots + ' shots!'
     }
   }
   ```

7. `pointerdown` bloğunun ilk satırı olarak (`const rect = ...` satırının üstüne) şunu ekle:

   ```js
     if (state !== 'playing') return reset()
   ```

8. `pointerdown` bloğunun kapanışının (`})`) altına Enter'ı dinleyen bloğu ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'Enter' && state !== 'playing') reset()
     else return
     event.preventDefault()
   })
   ```

9. `drawSea` içinde nokta rengini seçen satırı iki satırla değiştir (batmış geminin isabetleri koyu kırmızı olur):

   ```js
         const ship = shot === 'hit' && shipAt(fleet, r, c) // ← yeni
         ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444' // ← değişti
   ```

   `a && b`: `a` yanlışsa sonuç `a`, doğruysa `b` olur. Yani atış isabet değilse `ship` yanlış, isabetse o karedeki
   gemidir.

10. `draw()` içinde `drawSea(SEA, BIG, myShots, enemyFleet, false)` satırının altına batan gemilerin çerçevesini ekle:

    ```js
      // Sunk enemy ships are outlined so you can see what is left.
      ctx.strokeStyle = '#fca5a5'
      ctx.lineWidth = 2
      for (const ship of enemyFleet.filter(sunk)) {
        const rs = ship.cells.map(([r]) => r)
        const cs = ship.cells.map(([, c]) => c)
        ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
      }
    ```

11. `draw()`'un sonuna, `drawSea(HOME, SMALL, grid(null), myFleet, true)` satırının altına küçük denizin sağındaki
    yazıları ekle:

    ```js
      const x = HOME.x + N * SMALL + 20
      ctx.fillStyle = 'white'
      ctx.font = '14px sans-serif'
      ctx.fillText('Shots ' + shots, x, HOME.y + 16)
      ctx.fillText('Left: ' + enemyFleet.filter((s) => !sunk(s)).map((s) => s.cells.length).join(' '), x, HOME.y + 38)
      if (state !== 'playing') ctx.fillText('Tap or Enter: again', x, HOME.y + 60)
    ```

12. **Çalıştır**'a bas. Küçük denizin sağında `Shots 0` ve `Left: 5 4 3 3 2` yazmalı. Bir gemiyi tamamen vurunca
    `You sank a ship!` yazmalı, gemi pembe çerçeve almalı ve listeden düşmeli. Alttaki kontrollerin hepsi yeşil
    olmalı.

# --tests--

Hitting every square of a ship should sink it, outline it and take it off the list.
tr: Bir geminin her karesini vurmak onu batırmalı, çerçevelemeli ve listeden çıkarmalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }, { cells: [[5, 5], [6, 5], [7, 5]], hits: 0 }]
$.click(48, 68)
assert.strictEqual(message, 'Hit!')
$.click(84, 68)
assert.strictEqual(message, 'You sank a ship!')
assert.isTrue(sunk(enemyFleet[0]))
$.tick(1)
assert.include($.texts(), 'Left: 3')
assert.lengthOf($.screen().filter((c) => c.op === 'strokeRect' && c.stroke === '#fca5a5'), 1, 'the sunk ship is outlined')
```

Sinking the last ship should win, counting the shots, and a tap should start again.
tr: Son gemiyi batırmak atışları sayarak kazandırmalı ve bir dokunuş yeniden başlatmalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }]
$.click(156, 176)
$.click(48, 68)
$.click(84, 68)
assert.strictEqual(state, 'won')
assert.strictEqual(shots, 3)
$.tick(1)
assert.include($.texts(), 'You won in 3 shots!')
$.click(228, 248)
assert.strictEqual(myShots[5][5], null, 'no more shooting after the end: a tap starts again')
assert.strictEqual(state, 'playing')
```

The shots and the ships left should be shown.
tr: Atışlar ve kalan gemiler gösterilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Shots 0')
assert.include($.texts(), 'Left: 5 4 3 3 2')
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

let enemyFleet // ships: { cells: [[r, c], ...], hits }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
let message
let state // 'playing' or 'won'
let shots // how many shots you took

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
      return { cells, hits: 0 }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
  message = 'Your turn: pick a square'
  state = 'playing'
  shots = 0
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))
const sunk = (ship) => ship.hits === ship.cells.length

// Fire at a square of a fleet and record the result on that shots grid.
function fire(fleet, record, r, c) {
  const ship = shipAt(fleet, r, c)
  if (!ship) {
    record[r][c] = 'miss'
    return 'miss'
  }
  record[r][c] = 'hit'
  ship.hits += 1
  return sunk(ship) ? 'sunk' : 'hit'
}

function playerShoots(r, c) {
  if (state !== 'playing' || myShots[r][c]) return
  shots += 1
  const result = fire(enemyFleet, myShots, r, c)
  message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
  if (enemyFleet.every(sunk)) {
    state = 'won'
    message = 'You won in ' + shots + ' shots!'
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') return reset()
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && state !== 'playing') reset()
  else return
  event.preventDefault()
})

function drawSea(origin, size, shotsGrid, fleet, showShips) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
      const shot = shotsGrid[r][c]
      if (!shot) continue
      const ship = shot === 'hit' && shipAt(fleet, r, c)
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, shot === 'miss' ? size / 8 : size / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(message, SEA.x, 34)
  drawSea(SEA, BIG, myShots, enemyFleet, false)
  // Sunk enemy ships are outlined so you can see what is left.
  ctx.strokeStyle = '#fca5a5'
  ctx.lineWidth = 2
  for (const ship of enemyFleet.filter(sunk)) {
    const rs = ship.cells.map(([r]) => r)
    const cs = ship.cells.map(([, c]) => c)
    ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, grid(null), myFleet, true)
  const x = HOME.x + N * SMALL + 20
  ctx.fillStyle = 'white'
  ctx.font = '14px sans-serif'
  ctx.fillText('Shots ' + shots, x, HOME.y + 16)
  ctx.fillText('Left: ' + enemyFleet.filter((s) => !sunk(s)).map((s) => s.cells.length).join(' '), x, HOME.y + 38)
  if (state !== 'playing') ctx.fillText('Tap or Enter: again', x, HOME.y + 60)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
