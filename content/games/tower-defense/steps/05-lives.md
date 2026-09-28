---
title: Lives and health bars
title_tr: Canlar ve can çubukları
skills: [game.state]
---

# --explanation--

Now the enemies need to be a threat. Every enemy that walks off the end of the road costs one of your 20 **lives**; at
zero the game is over. Note the order: an enemy that gets through has its health set to 0 so no bullet keeps chasing
it, but it must not pay gold, because the towers did not kill it.

Players also need to see how the fight is going. A **health bar** is two rectangles on top of each other: the full width
in dark red, and on top a green part as wide as the health that is left:

```js
ctx.fillRect(x - 14, y - 20, 28 * e.hp / e.maxHp, 4)
```

`hp / maxHp` is a fraction from 0 to 1, so the same line works for weak and strong enemies. That is why each enemy now
remembers its `maxHp`.

# --explanation-tr--

**Bu adımda:** düşmanları gerçek bir tehdit yapacağız. Sol üstte **Gold 120  Lives 20** yazacak; yolun sonundan çıkan
her düşman bir can götürecek. Her düşmanın üstünde yeşil bir can çubuğu görünecek. Canlar bitince ekran kararıp
**Game Over** yazacak; Boşluk ya da bir tıklama yeni oyun başlatacak.

**Canlar.** 20 **canın** (`lives`) var. Yolun sonundan çıkan her düşman bir can götürür; sıfırda oyun biter. Sıraya
dikkat: geçip giden düşmanın canı (`hp`) 0 yapılır ki peşinden mermi gitmesin, ama altın **vermemeli**, çünkü onu
kuleler öldürmedi. Bu yüzden onu, ödül satırından önce listeden sileriz (önceki adımda kurduğumuz sıra aynen kalıyor).
`lives -= 1` "canı 1 azalt" demektir.

**Oyunun durumu.** `let state` bir yazı tutar: `'playing'` (oynanıyor) ya da `'over'` (bitti). Bitince:

- `update()` en başta `if (state === 'over') return` ile hemen çıkar; hiçbir şey hareket etmez.
- `build()` kule kurmaz.
- Boşluk ya da tıklama `reset()` ile yeni oyun başlatır.

**Klavye.** `document.addEventListener('keydown', ...)` sayfada bir tuşa basılınca çalışır; `event.key` basılan
tuşun adıdır. Boşluk tuşunun adı `' '` (tırnaklar arasında tek boşluk). Tarayıcı normalde Boşluk'a basınca sayfayı
aşağı kaydırır; `event.preventDefault()` bu **varsayılan davranışı** durdurur.

**Can çubuğu.** Üst üste iki dikdörtgendir: altta tam genişlikte koyu kırmızı, üstte kalan can kadar geniş yeşil:

```js
ctx.fillRect(x - 14, y - 20, (28 * e.hp) / e.maxHp, 4)
```

`e.hp / e.maxHp` 0 ile 1 arasında bir orandır (yarı can → 0,5). 28 ile çarpınca yeşil kısmın genişliği çıkar
(0,5 × 28 = 14 piksel). Aynı satır zayıf ve güçlü düşmanlar için çalışsın diye her düşman artık en yüksek canını da
(`maxHp`) hatırlar.

**Karartma.** Oyun bitince bütün ekranı yarı saydam koyu bir renkle (`'rgba(15, 23, 42, 0.8)'`, %80 kapak) boyarız;
harita hafifçe altta görünür, yazılar öne çıkar. `ctx.fillText` yazı yazar; `canvas.width / 2` yatayda ortası.

`!==` "eşit değil" demektir: `hover && state !== 'over'` → "farenin altında bir kare varsa **ve** oyun bitmediyse
önizlemeyi çiz".

# --task--

1. Enemies start as `{ d: 0, hp: 10, maxHp: 10 }`. Add `lives` (20) and `state` (`'playing'`).
2. An enemy past the end costs a life. Remove escaped enemies before the towers look for targets, so that only enemies
   the towers killed give gold.
3. When `lives` reaches `0`, the state becomes `'over'`: `update()` stops, no more building, and Space (or a click)
   starts a new game.
4. Draw a health bar above each enemy: `'#7f1d1d'` 28 by 4 at `x - 14, y - 20`, and over it `'#22c55e'` as wide as the
   health left. Show `Gold 120  Lives 20`, and when the game is over cover the screen with `'rgba(15, 23, 42, 0.8)'` and
   draw `Game Over` and `Press Space to play again`.

# --task-tr--

1. Değişken satırlarına iki yeni satır ekle:

   ```js
   let gold
   let lives // ← yeni
   let toSpawn // enemies still to come
   let spawnIn // frames until the next one
   let state // 'playing' or 'over' // ← yeni
   let selected // the kind of tower to build: only 'arrow' so far
   ```

2. `reset()` içine iki satır ekle:

   ```js
     gold = 120
     lives = 20 // ← yeni
     toSpawn = 30
     spawnIn = 0
     state = 'playing' // ← yeni
     selected = 'arrow'
   ```

3. `build()` fonksiyonunun ilk satırını değiştir:

   ```js
     if (state === 'over' || !canBuild(col, row)) return // ← değişti
   ```

4. `pointerdown` bloğunu şöyle yap:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     const p = tileAt(event)
     if (state === 'over') { // ← yeni
       reset() // ← yeni
       return // ← yeni
     } // ← yeni
     build(p.col, p.row)
   })
   ```

5. `pointerleave` bloğunun bittiği `})` satırının hemen altına Boşluk tuşunu dinleyen bloğu ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === ' ') {
       event.preventDefault()
       if (state === 'over') reset()
     }
   })
   ```

6. `update()` fonksiyonunun başını şöyle değiştir (en üste bir satır, düşman satırına `maxHp`, yolun sonu kısmına can
   kaybı):

   ```js
   function update() {
     if (state === 'over') return // ← yeni

     if (toSpawn > 0) {
       spawnIn -= 1
       if (spawnIn <= 0) {
         enemies.push({ d: 0, hp: 10, maxHp: 10 }) // ← değişti
         toSpawn -= 1
         spawnIn = 45
       }
     }

     for (const e of enemies) e.d += SPEED
     // Walked off the end of the road: it got through. Its hp drops to 0 so no bullet chases it any more. // ← değişti
     for (const e of enemies) { // ← değişti
       if (pointAt(e.d) === null) { // ← değişti
         e.hp = 0 // ← değişti
         lives -= 1 // ← yeni
       } // ← yeni
     } // ← yeni
     enemies = enemies.filter((e) => e.hp > 0)
   ```

   Eski tek satırlık `for (const e of enemies) if (pointAt(e.d) === null) e.hp = 0` satırını silmeyi unutma.

7. `update()`'in en sonunda, son `enemies = enemies.filter(...)` satırının altına oyun sonu kontrolünü ekle:

   ```js
     for (const e of enemies) if (e.hp <= 0) gold += 5
     enemies = enemies.filter((e) => e.hp > 0)

     if (lives <= 0) { // ← yeni
       lives = 0 // ← yeni
       state = 'over' // ← yeni
     } // ← yeni
   }
   ```

8. `draw()` içinde önizleme satırını değiştir:

   ```js
     if (hover && state !== 'over') { // ← değişti
   ```

9. `draw()` içindeki düşman döngüsünde, `ctx.fill()` satırının altına can çubuğunu ekle:

   ```js
       ctx.arc(x, y, 11, 0, Math.PI * 2)
       ctx.fill()
       // Health bar: red underneath, green for what is left. // ← yeni
       ctx.fillStyle = '#7f1d1d' // ← yeni
       ctx.fillRect(x - 14, y - 20, 28, 4) // ← yeni
       ctx.fillStyle = '#22c55e' // ← yeni
       ctx.fillRect(x - 14, y - 20, (28 * e.hp) / e.maxHp, 4) // ← yeni
     }
   ```

10. `draw()`'un sonunu şöyle yap:

    ```js
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Gold ' + gold + '  Lives ' + lives, 10, 26) // ← değişti
      ctx.textAlign = 'center'
      if (state === 'over') { // ← yeni (buradan kapanışa kadar)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 32px sans-serif'
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
        ctx.font = '18px sans-serif'
        ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 30)
      }
    }
    ```

    `'  Lives '` içinde başta **iki** boşluk var; kontroller yazıyı harfi harfine arar.

11. **Çalıştır**'a bas. Sol üstte **Gold 120  Lives 20** görünmeli; hiç kule kurmazsan her çıkan düşman bir can
    götürmeli ve sonunda **Game Over** çıkmalı. Oynamak için önce oyuna tıkla; Boşluk yeni oyun başlatmalı. Alttaki
    kontrollerin hepsi yeşil olmalı.

# --tests--

An enemy that gets through should cost a life and give no gold.
tr: Geçip giden bir düşman bir cana mal olmalı ve altın vermemeli.

```js
toSpawn = 0
enemies = [{ d: 26.99, hp: 10, maxHp: 10 }]
$.tick(1)
assert.strictEqual(lives, 19)
assert.lengthOf(enemies, 0)
assert.strictEqual(gold, 120)
assert.include($.texts(), 'Gold 120 Lives 19')
```

The health bar should show the health that is left.
tr: Can çubuğu kalan canı göstermeli.

```js
toSpawn = 0
enemies = [{ d: 5, hp: 5, maxHp: 10 }]
$.tick(1)
assert.lengthOf($.rects('#7f1d1d'), 1)
const [green] = $.rects('#22c55e')
assert.strictEqual(green.w, 14)
assert.strictEqual(green.h, 4)
```

Losing the last life should end the game, and Space should start a new one.
tr: Son canı kaybetmek oyunu bitirmeli, Boşluk yenisini başlatmalı.

```js
toSpawn = 0
lives = 1
enemies = [{ d: 26.99, hp: 10, maxHp: 10 }, { d: 3, hp: 10, maxHp: 10 }]
$.tick(1)
assert.strictEqual(state, 'over')
assert.strictEqual(lives, 0)
assert.include($.texts(), 'Game Over')
const d = enemies[0].d
$.tick(10)
assert.strictEqual(enemies[0].d, d, 'nothing moves any more')
build(1, 3)
assert.lengthOf(towers, 0)
$.press(' ')
assert.deepEqual([state, lives, gold, enemies.length], ['playing', 20, 120, 0])
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
const TOP = 40 // room for gold, lives and the tower buttons
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
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}

let road // keys of the tiles the road covers
let enemies
let towers
let bullets
let gold
let lives
let toSpawn // enemies still to come
let spawnIn // frames until the next one
let state // 'playing' or 'over'
let selected // the kind of tower to build: only 'arrow' so far
let hover = null // the tile under the mouse

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
  towers = []
  bullets = []
  gold = 120
  lives = 20
  toSpawn = 30
  spawnIn = 0
  state = 'playing'
  selected = 'arrow'
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

// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
}

function canBuild(col, row) {
  const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
  const taken = towers.some((t) => t.col === col && t.row === row)
  return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
}

function build(col, row) {
  if (state === 'over' || !canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  if (state === 'over') {
    reset()
    return
  }
  build(p.col, p.row)
})
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
})
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault()
    if (state === 'over') reset()
  }
})

// The enemy in range that has walked the furthest: it is the closest to getting through.
function targetFor(tower) {
  const range = TOWERS[tower.kind].range
  let target = null
  for (const e of enemies) {
    const p = pointAt(e.d)
    const inRange = Math.hypot(p.x - tower.col, p.y - tower.row) <= range
    if (inRange && (!target || e.d > target.d)) target = e
  }
  return target
}

function hit(bullet) {
  bullet.target.hp -= TOWERS[bullet.kind].damage
}

function update() {
  if (state === 'over') return

  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10, maxHp: 10 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  // Walked off the end of the road: it got through. Its hp drops to 0 so no bullet chases it any more.
  for (const e of enemies) {
    if (pointAt(e.d) === null) {
      e.hp = 0
      lives -= 1
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)

  for (const t of towers) {
    t.cooldown -= 1
    if (t.cooldown > 0) continue
    const target = targetFor(t)
    if (!target) continue
    bullets.push({ x: t.col, y: t.row, target, kind: t.kind })
    t.cooldown = TOWERS[t.kind].reload
  }

  // Bullets fly towards their target; if it is gone, they fizzle out.
  for (const b of bullets) {
    if (b.target.hp <= 0) {
      b.done = true
      continue
    }
    const p = pointAt(b.target.d)
    const dx = p.x - b.x
    const dy = p.y - b.y
    const distance = Math.hypot(dx, dy)
    if (distance < 0.3) {
      hit(b)
      b.done = true
    } else {
      b.x += (dx / distance) * 0.3
      b.y += (dy / distance) * 0.3
    }
  }
  bullets = bullets.filter((b) => !b.done)

  for (const e of enemies) if (e.hp <= 0) gold += 5
  enemies = enemies.filter((e) => e.hp > 0)

  if (lives <= 0) {
    lives = 0
    state = 'over'
  }
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

  if (hover && state !== 'over') {
    ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
    ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc((hover.col + 0.5) * TILE, TOP + (hover.row + 0.5) * TILE, TOWERS[selected].range * TILE, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const t of towers) {
    ctx.fillStyle = TOWERS[t.kind].color
    ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
    // Health bar: red underneath, green for what is left.
    ctx.fillStyle = '#7f1d1d'
    ctx.fillRect(x - 14, y - 20, 28, 4)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(x - 14, y - 20, (28 * e.hp) / e.maxHp, 4)
  }

  ctx.fillStyle = '#fef08a'
  for (const b of bullets) {
    ctx.beginPath()
    ctx.arc((b.x + 0.5) * TILE, TOP + (b.y + 0.5) * TILE, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Gold ' + gold + '  Lives ' + lives, 10, 26)
  ctx.textAlign = 'center'
  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 30)
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
