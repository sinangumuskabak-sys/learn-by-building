---
title: Towers that shoot
title_tr: Ateş eden kuleler
skills: [game.collision, game.state]
---

# --explanation--

A tower needs to answer one question many times a second: **which enemy do I shoot?** The classic answer is "the one
that has walked the furthest, among those in range", because it is the closest to getting through. Thanks to the
distance `d` from the last step, "furthest" is just the largest `d`:

```js
if (inRange && (!target || e.d > target.d)) target = e
```

Towers do not shoot every frame. Each has a `cooldown` that counts down; when it reaches zero the tower fires and the
cooldown starts again at `reload`. The same idea controls every weapon, spell and ability in games: a timer per thing,
counted down in `update()`.

Bullets **home in** on their target: every frame they move 0.3 tiles straight towards where the target is now. Dividing
the arrow to the target by its length (`dx / distance`) gives a direction of length 1, and multiplying by 0.3 gives the
step. When the target is closer than one step, it is hit. If the target dies before the bullet arrives, the bullet
simply fizzles out.

Every enemy starts with 10 health; each kill is worth 5 gold, which pays for the next tower.

# --explanation-tr--

**Bu adımda:** kuleler ateş etmeye başlayacak. Menzile giren düşmana doğru küçük sarı mermiler uçacak; üç isabet alan
düşman kaybolacak ve her öldürülen düşman 5 altın kazandıracak.

**Hangi düşmana ateş edilir?** Kule saniyede defalarca aynı soruyu cevaplar. Klasik cevap: "menzildekiler arasında en
uzağa yürümüş olan", çünkü geçmeye en yakın odur. Önceki adımdaki mesafe `d` sayesinde "en uzak" yalnızca en büyük
`d`'dir:

```js
if (inRange && (!target || e.d > target.d)) target = e
```

"Menzildeyse **ve** (henüz hedef yoksa **veya** bu düşman hedeften daha ilerideyse) hedef bu olsun." `target` `null` ile
başlar; `!target` "hedef yok" demektir. Döngü bitince elimizde en ilerideki kalır.

**Uzaklık.** `Math.hypot(dx, dy)` iki nokta arasındaki düz çizgi uzaklığını verir (okuldaki Pisagor:
√(dx² + dy²)). Kulenin karesinden düşmanın noktasına olan uzaklık menzilden küçük ya da eşitse düşman menzildedir.

**Yeniden doldurma (cooldown).** Kuleler her karede ateş etmez. Her kulenin geri sayan bir `cooldown`'u vardır; sıfıra
inince kule ateş eder ve sayaç `reload`'dan (24 kare) yeniden başlar. Oyunlardaki her silah ve yetenek aynı fikirle
çalışır: her şeyin kendi sayacı, `update()` içinde geri sayılır. Döngüdeki `continue` "bu kuleyi bırak, sıradakine
geç" demektir.

**Güdümlü mermi.** Mermi her karede hedefin **şu anki** yerine doğru 0,3 kare ilerler:

- `dx`, `dy` → hedefe doğru ok: yatay ve dikey fark.
- `dx / distance` → oku kendi uzunluğuna bölersek boyu 1 olan bir **yön** elde ederiz. 0,3 ile çarpınca bir adım.
- Hedef bir adımdan yakınsa (`distance < 0.3`) vurulmuştur: `hit(b)` düşmanın canından (`hp`) kulenin hasarını düşer.
- Hedef mermi varmadan ölürse mermi söner. Biten mermileri `b.done = true` ile işaretleriz; döngüden sonra
  `filter` onları listeden atar. (Liste üstünde dolaşırken elemanları silmek karışıklık çıkarır; önce işaretleyip sonra
  süzmek daha güvenlidir.)

**Can ve ödül.** Her düşman 10 canla (`hp: 10`) başlar. Yolun sonuna varan düşmanın canı 0 yapılır; böylece peşinden
mermi gitmez ve aynı "canı bitenleri sil" satırıyla listeden çıkar. Bu karede ölen her düşman 5 altın verir; bu da bir
sonraki kulenin parası olur. Dikkat: yolun sonundan çıkanlar ödül getirmez, çünkü onlar ödül satırından **önce**
silinir.

# --task--

1. Enemies start as `{ d: 0, hp: 10 }`; towers get `cooldown: 0`; add `bullets` (`[]` in `reset()`). An enemy past the end
   gets `hp = 0`, and enemies with no health left are removed.
2. Write `targetFor(tower)`: among enemies within the tower's range (`Math.hypot` from the tower's tile to the enemy's
   point), the one with the largest `d`, or `null`.
3. Every frame, count each tower's `cooldown` down; at `0` or below, if it has a target, add a bullet
   `{ x: col, y: row, target, kind }` and set `cooldown` to the kind's `reload`.
4. Move each bullet 0.3 tiles towards its target's point. Closer than 0.3: `hit(bullet)` (the target loses the kind's
   `damage`) and the bullet is done. A bullet whose target has no health left is done too.
5. Each enemy that dies this frame gives 5 gold. Draw bullets as `'#fef08a'` circles of radius 4.

# --task-tr--

1. `let towers` satırının altına mermi listesini ekle:

   ```js
   let towers
   let bullets // ← yeni
   let gold
   ```

2. `reset()` içinde `towers = []` satırının altına şunu ekle:

   ```js
     towers = []
     bullets = [] // ← yeni
   ```

3. `build()` fonksiyonundaki `towers.push(...)` satırını değiştir:

   ```js
     towers.push({ col, row, kind: selected, cooldown: 0 }) // ← değişti
   ```

4. `canvas.addEventListener('pointerleave', ...)` bloğunun bittiği `})` satırının altına, `function update()`
   satırından önce iki fonksiyon yaz:

   ```js
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
   ```

5. `update()` fonksiyonunun tamamını sil ve yerine bunu yaz:

   ```js
   function update() {
     if (toSpawn > 0) {
       spawnIn -= 1
       if (spawnIn <= 0) {
         enemies.push({ d: 0, hp: 10 }) // ← değişti
         toSpawn -= 1
         spawnIn = 45
       }
     }

     for (const e of enemies) e.d += SPEED
     // Walked off the end of the road. Its hp drops to 0 so no bullet chases it any more. // ← değişti
     for (const e of enemies) if (pointAt(e.d) === null) e.hp = 0 // ← yeni
     enemies = enemies.filter((e) => e.hp > 0) // ← değişti

     for (const t of towers) { // ← yeni (buradan sona kadar)
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
   }
   ```

   `else` "değilse" demektir: vurmadıysa bir adım daha yaklaş.

6. `draw()` içinde, düşmanları çizen döngünün kapanış `}`'sinin altına ve `ctx.fillStyle = 'white'` satırının üstüne
   mermileri çizen kısmı ekle:

   ```js
     ctx.fillStyle = '#fef08a'
     for (const b of bullets) {
       ctx.beginPath()
       ctx.arc((b.x + 0.5) * TILE, TOP + (b.y + 0.5) * TILE, 4, 0, Math.PI * 2)
       ctx.fill()
     }
   ```

7. **Çalıştır**'a bas. Yolun kenarına bir kule kur: düşmanlar yaklaşınca sarı mermiler uçmalı, düşmanlar ölmeli ve
   altın artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Mermiler hiç çıkmıyorsa `build()` içindeki `cooldown: 0`'ı
   unutmuş olabilirsin.

# --tests--

A tower should aim at the enemy in range that has walked the furthest.
tr: Bir kule menzildeki en uzağa yürümüş düşmanı hedeflemeli.

```js
const tower = { col: 2, row: 2, kind: 'arrow', cooldown: 0 }
enemies = [{ d: 1, hp: 10 }, { d: 3, hp: 10 }, { d: 12, hp: 10 }]
assert.strictEqual(targetFor(tower), enemies[1], '(2, 1) is further along than (0, 1); (6, 6) is out of range')
enemies = [{ d: 12, hp: 10 }]
assert.isNull(targetFor(tower))
```

A tower should fire, reload, and kill an enemy for gold.
tr: Bir kule ateş etmeli, yeniden dolmalı ve altın karşılığı bir düşman öldürmeli.

```js
toSpawn = 0
$.click(100, 140) // a tower at (2, 2)
assert.strictEqual(gold, 70)
enemies = [{ d: 2, hp: 10 }]
$.tick(1)
assert.lengthOf(bullets, 1)
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#fef08a' && a.r === 4), 1)
$.tick(8)
assert.strictEqual(enemies[0].hp, 6)
assert.lengthOf(bullets, 0)
$.tick(60)
assert.lengthOf(enemies, 0)
assert.strictEqual(gold, 75)
```

A bullet should fizzle out if its target is already gone.
tr: Hedefi çoktan gitmiş bir mermi sönmeli.

```js
toSpawn = 0
$.click(100, 140)
enemies = [{ d: 2, hp: 10 }]
$.tick(1)
const target = enemies[0]
target.hp = 0 // killed by another tower, and already removed
enemies = []
$.tick(1)
assert.lengthOf(bullets, 0)
assert.strictEqual(gold, 70, 'no reward: the tower did not kill it')
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
let toSpawn // enemies still to come
let spawnIn // frames until the next one
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
  toSpawn = 30
  spawnIn = 0
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
  if (!canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
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
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  // Walked off the end of the road. Its hp drops to 0 so no bullet chases it any more.
  for (const e of enemies) if (pointAt(e.d) === null) e.hp = 0
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

  if (hover) {
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
  ctx.fillText('Gold ' + gold, 10, 26)
  ctx.textAlign = 'center'
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
