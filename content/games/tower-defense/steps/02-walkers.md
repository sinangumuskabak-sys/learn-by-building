---
title: Walking by distance
title_tr: Mesafeyle yürümek
skills: [game.loop, prog.arrays]
---

# --explanation--

How do you move something along a road with corners? Steering it ("go right until the corner, then turn down") gets
messy fast. There is a much simpler idea: give each enemy **one number**, `d`, the distance it has walked along the road.
Moving is just `e.d += SPEED`, and a function turns a distance into a point:

```js
function pointAt(d) {
  for each straight piece of the road:
    if d fits in this piece: return the point d tiles along it
    otherwise: d -= the piece's length, and try the next one
  return null   // past the end
}
```

This is called **parametrizing** a path, and it pays off again and again: "which enemy is closest to getting through?"
is simply the biggest `d`, and "did it get through?" is `pointAt(d) === null`.

Enemies arrive one at a time: a counter `spawnIn` counts down, and when it runs out a new enemy starts at `d = 0` and the
counter starts again.

# --explanation-tr--

**Bu adımda:** düşmanları yola çıkaracağız. Kırmızı daireler soldan birer birer girip yol boyunca kıvrılarak yürüyecek
ve sağdan çıkıp kaybolacak.

**Köşeli bir yolda nasıl yürünür?** Düşmanı yönlendirmek ("köşeye kadar sağa git, sonra aşağı dön") çabuk karışır.
Çok daha basit bir fikir var: her düşmana **tek bir sayı** ver, `d`: yol boyunca yürüdüğü mesafe (kare cinsinden).
Yürümek yalnızca `e.d += SPEED` olur; bir fonksiyon da mesafeyi haritadaki bir noktaya çevirir. Otobüs hattı gibi
düşün: "durağa 3,5 km kaldı" demek, otobüsün hangi sokakta olduğunu söylemeye yeter.

**Nesne (object).** Birkaç bilgiyi tek pakette tutar: `{ d: 0 }` "mesafesi 0 olan bir şey"; `{ x: 3, y: 1.5 }` bir
nokta. İçindeki bilgiye nokta ile ulaşırsın: `e.d`, `p.x`. Her düşman bir nesnedir; hepsi `enemies` dizisinde durur.

**`pointAt(d)`, parça parça.** Yolu köşeden köşeye düz parçalara ayırıp sırayla bakarız:

- Bir parçanın uzunluğu: `Math.abs(bx - ax) + Math.abs(by - ay)`. `Math.abs` bir sayının **eksisini atar** (mutlak
  değer): `Math.abs(-4)` → `4`. Parça düz olduğu için iki farktan biri zaten 0'dır.
- `if (d <= length)` → mesafe bu parçanın içine düşüyorsa (`<=` küçük ya da eşit), noktayı hesaplayıp **geri ver**:
  başlangıç köşesinden, parçanın yönünde (`Math.sign`) `d` kare ilerisi. `return` fonksiyonu o anda bitirir.
- Değilse `d -= length` → bu parçanın uzunluğunu mesafeden düş (`-=` "üstünden çıkar") ve sonraki parçaya bak.
- Hiçbir parçaya sığmadıysa düşman yolun sonunu geçmiştir: `return null` ("hiçbir şey").

Bir yolu bu şekilde tek sayıyla ifade etmeye **parametreleme** denir ve defalarca işe yarar: "geçmeye en yakın düşman
hangisi?" sorusu en büyük `d`'dir; "geçti mi?" sorusu `pointAt(d) === null`'dır.

**Birer birer gelmek.** `toSpawn` daha kaç düşman geleceğini, `spawnIn` bir sonrakine kaç kare kaldığını sayar. Her
karede `spawnIn` 1 azalır; 0'a ya da altına inince yeni bir düşman `{ d: 0 }` ile yola girer, `toSpawn` 1 azalır ve
`spawnIn` yeniden 45 olur. Ekran saniyede yaklaşık 60 kare çizildiği için bu, üç çeyrek saniyede bir düşman demektir.
`enemies.push(...)` diziye sona bir eleman ekler.

**Yolun sonu.** Her karede bütün düşmanlar `SPEED` kadar yürür. Sonra
`enemies.filter((e) => pointAt(e.d) !== null)` yalnızca hâlâ yolda olanları tutar: `filter` koşulu sağlayanlardan yeni
bir liste yapar, `!==` "eşit değil" demektir.

**`update` ve `draw` ayrımı.** `update()` oyunun durumunu bir kare ilerletir (hesap), `draw()` o anki durumu çizer
(resim). Döngü her karede önce `update()`, sonra `draw()` çağırır.

**Daire çizmek.** Canvas'ta daire bir **yol** (path) olarak çizilir: `ctx.beginPath()` yeni bir şekle başla,
`ctx.arc(x, y, yarıçap, başlangıç, bitiş)` merkezi `(x, y)` olan bir yay ekle, `ctx.fill()` içini boya. Açılar
**radyan** cinsindendir; `0`'dan `Math.PI * 2`'ye kadar tam bir tur demektir. Düşmanı karenin ortasına koymak için
noktaya `0.5` ekleyip `TILE` ile çarparız.

# --task--

1. Add `SPEED = 0.03`, and `enemies`, `toSpawn` and `spawnIn`; `reset()` sets `[]`, `30` and `0`.
2. Write `pointAt(d)` as above. A piece from corner `a` to corner `b` is `|bx - ax| + |by - ay|` long, and the point `d`
   tiles along it is `ax + Math.sign(bx - ax) * d`, `ay + Math.sign(by - ay) * d`.
3. Write `update()`: while enemies are left to come, count `spawnIn` down, and when it is `0` or less add `{ d: 0 }`, count
   `toSpawn` down and set `spawnIn = 45`. Then move every enemy by `SPEED` and remove those that are past the end.
4. Draw each enemy as a `'#dc2626'` circle of radius 11 in the middle of its point: `(x + 0.5) * TILE` across,
   `TOP + (y + 0.5) * TILE` down.

# --task-tr--

1. `PATH` listesinin kapanış `]`'sinin hemen altına hız sabitini ekle:

   ```js
   const SPEED = 0.03 // tiles per frame
   ```

2. `let road` satırının altına üç değişken ekle:

   ```js
   let road // keys of the tiles the road covers
   let enemies // ← yeni
   let toSpawn // enemies still to come // ← yeni
   let spawnIn // frames until the next one // ← yeni
   ```

3. `reset()` fonksiyonunu şöyle yap, sonra altına iki yeni fonksiyon yaz:

   ```js
   function reset() {
     findRoad()
     enemies = [] // ← yeni
     toSpawn = 30 // ← yeni
     spawnIn = 0 // ← yeni
   }

   // Where on the road an enemy is after walking `d` tiles (null once it is past the end).
   function pointAt(d) {
     for (let i = 1; i < PATH.length; i++) {
       const [ax, ay] = PATH[i - 1]
       const [bx, by] = PATH[i]
       const length = Math.abs(bx - ax) + Math.abs(by - ay)
       if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
       d -= length
     }
     return null
   }

   function update() {
     if (toSpawn > 0) {
       spawnIn -= 1
       if (spawnIn <= 0) {
         enemies.push({ d: 0 })
         toSpawn -= 1
         spawnIn = 45
       }
     }

     for (const e of enemies) e.d += SPEED
     // Walked off the end of the road: gone.
     enemies = enemies.filter((e) => pointAt(e.d) !== null)
   }
   ```

   `for (const e of enemies)` dizideki her düşman için bir kez çalışır; her turda o anki düşmanın adı `e` olur.

4. `draw()` fonksiyonunda, kareleri çizen iki döngünün altına, fonksiyonun kapanış `}`'sinden önce düşmanları çizen
   döngüyü ekle:

   ```js
         ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
       }
     }

     for (const e of enemies) { // ← yeni
       const p = pointAt(e.d) // ← yeni
       const x = (p.x + 0.5) * TILE // ← yeni
       const y = TOP + (p.y + 0.5) * TILE // ← yeni
       ctx.fillStyle = '#dc2626' // ← yeni
       ctx.beginPath() // ← yeni
       ctx.arc(x, y, 11, 0, Math.PI * 2) // ← yeni
       ctx.fill() // ← yeni
     } // ← yeni
   }
   ```

5. `loop()` fonksiyonunda `draw()`'dan önce `update()` çağrısını ekle:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

6. **Çalıştır**'a bas. Kırmızı daireler soldan birer birer girip yol boyunca yürümeli ve sağdan çıkmalı; alttaki
   kontrollerin hepsi yeşil olmalı. Düşmanlar yoldan sapıyorsa `pointAt` içindeki `Math.sign` ve `d -= length`
   satırlarını kontrol et.

# --tests--

A distance along the road should turn into a point on it.
tr: Yol boyunca bir mesafe, üzerinde bir noktaya dönüşmeli.

```js
assert.deepEqual(pointAt(0), { x: -1, y: 1 })
assert.deepEqual(pointAt(4), { x: 3, y: 1 })
assert.deepEqual(pointAt(4.5), { x: 3, y: 1.5 })
assert.deepEqual(pointAt(9), { x: 3, y: 6 })
assert.deepEqual(pointAt(15), { x: 7, y: 4 })
assert.deepEqual(pointAt(27), { x: 12, y: 7 })
assert.isNull(pointAt(27.01))
```

Enemies should arrive 45 frames apart and walk along the road.
tr: Düşmanlar 45 kare arayla gelmeli ve yol boyunca yürümeli.

```js
$.tick(1)
assert.lengthOf(enemies, 1)
assert.closeTo(enemies[0].d, 0.03, 1e-9)
$.tick(44)
assert.lengthOf(enemies, 1)
$.tick(1)
assert.lengthOf(enemies, 2)
assert.closeTo(enemies[0].d, 46 * 0.03, 1e-9)
assert.strictEqual(toSpawn, 28)
```

An enemy that reaches the end should leave.
tr: Sona ulaşan bir düşman gitmeli.

```js
toSpawn = 0
enemies = [{ d: 26.95 }]
$.tick(1)
assert.lengthOf(enemies, 1)
$.tick(1)
assert.lengthOf(enemies, 0)
```

Enemies should be drawn on the road.
tr: Düşmanlar yolun üstünde çizilmeli.

```js
toSpawn = 0
enemies = [{ d: 5.97 }]
$.tick(1)
const [e] = $.arcs().filter((a) => a.color === '#dc2626')
assert.deepEqual([e.x, e.r], [140, 11])
assert.closeTo(e.y, 40 + 3.5 * 40, 1e-6)
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for a status line (it comes later)
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]
const SPEED = 0.03 // tiles per frame

let road // keys of the tiles the road covers
let enemies
let toSpawn // enemies still to come
let spawnIn // frames until the next one

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
  enemies = []
  toSpawn = 30
  spawnIn = 0
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

function update() {
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  // Walked off the end of the road: gone.
  enemies = enemies.filter((e) => pointAt(e.d) !== null)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
