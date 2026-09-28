---
title: A second tower with splash damage
title_tr: Alan hasarlı ikinci bir kule
skills: [game.collision, game.state]
---

# --explanation--

One kind of tower gives one way to play. A second kind with **different strengths** turns building into a choice:

| | arrow | cannon |
|---|---|---|
| cost | 50 | 70 |
| reload | 24 frames | 60 frames |
| damage | 4, one enemy | 8, everyone within 1.2 tiles |

The cannon hits hard but slowly, and its **splash** hurts every enemy near the one it aims at. Against enemies far
apart the arrows are better; against the tight groups of later waves the cannon shines. Neither is simply better, and
that is what makes a choice interesting.

Because the towers already read everything from the `TOWERS` table, a new kind is mostly **one new line of data**. Only
`hit()` changes: instead of hurting the target alone, it hurts every enemy within the kind's `splash` of the target (and
arrows have `splash: 0`, so for them nothing changes). Designing code so that new content is data, not new code, is what
lets real games grow to hundreds of units.

Pick the kind with the keys 1 and 2, or with the two buttons in the top bar.

# --explanation-tr--

**Bu adımda:** ikinci bir kule türü, **top** (cannon) ekleyeceğiz. Üst çubuğun sağında iki düğme görünecek:
**arrow 50** ve **cannon 70**. Seçili olan kendi renginde (ok mavi, top turuncu) parlayacak. Turuncu top kuleleri
yavaş ama güçlü ateş edecek ve hedefin çevresindeki düşmanları da yaralayacak.

**Tek tür, tek oyun tarzı demek.** Farklı **güçlü yanları** olan ikinci bir tür, kule kurmayı bir seçime çevirir:

| | ok (arrow) | top (cannon) |
|---|---|---|
| bedel | 50 | 70 |
| yeniden dolma | 24 kare | 60 kare |
| hasar | 4, tek düşman | 8, 1,2 kare içindeki herkes |

Top sert ama yavaş vurur; **alan hasarı** (splash) nişan aldığı düşmanın yakınındaki herkesi yaralar. Birbirinden uzak
düşmanlara karşı oklar daha iyidir; sonraki dalgaların sıkışık gruplarına karşı top parlar. Hiçbiri açıkça daha iyi
değil; seçimi ilginç yapan da bu.

**Yeni içerik = yeni veri.** Kuleler her şeyi zaten `TOWERS` tablosundan okuduğu için yeni bir tür çoğunlukla **tek
satırlık veridir**. Yalnızca `hit()` değişir: artık sadece hedefi değil, hedefin noktasına türün `splash` mesafesi
kadar yakın olan her düşmanı yaralar. Okların `splash` değeri `0` olduğu için onlar için hiçbir şey değişmez. Kodu, yeni
içerik yeni kod değil veri olacak şekilde tasarlamak, gerçek oyunların yüzlerce birime büyümesini sağlar.

**Yeni `hit()`, parça parça:**

- `const center = pointAt(bullet.target.d)` → hedefin haritadaki noktası; patlamanın merkezi.
- Her düşman için: `e === bullet.target` (hedefin kendisi) **veya** (`||`) merkeze uzaklığı (`Math.hypot`) `splash`'ten
  küçük ya da eşitse `close` (yakın) `true` olur ve canı hasar kadar azalır.
- Hedefin kendisini ayrıca saymamızın sebebi: okta `splash` 0, yani yalnızca hedef vurulsun.

**Tür seçmek.** `1` ve `2` tuşları türü seçer. Üst çubukta da iki düğme var; her biri `{ kind, x, w }` bilgisi olan
bir nesne, hepsi `BUTTONS` listesinde:

```js
const button = BUTTONS.find((b) => p.x >= b.x && p.x < b.x + b.w)
```

`find` listede koşulu sağlayan **ilk** elemanı verir; hiçbiri sağlamazsa `undefined` ("yok") verir. Koşul: tıklamanın
x'i düğmenin sol kenarı ile sağ kenarı arasında mı? `if (button)` "bir düğme bulunduysa" demektir. Tıklama üst
çubuktaysa (`p.y < TOP`) iş orada biter (`return`), kule kurulmaya çalışılmaz.

**Düğmeleri çizmek.** Seçili düğme türün renginde, koyu yazılı; öteki gri (`'#334155'`), beyaz yazılı:
`b.kind === selected ? kind.color : '#334155'` → "seçiliyse türün rengi, değilse gri". Yazı `b.kind + ' ' + kind.cost`
→ `'cannon 70'`. Düğmelerden sonra fırçayı yeniden beyaza boyarız ki alt çubuktaki yazılar beyaz çıksın.

# --task--

1. Add `splash: 0` to the arrow, and add the cannon to `TOWERS`:
   `cannon: { cost: 70, range: 2, damage: 8, reload: 60, splash: 1.2, color: '#f97316' }`.
2. Rewrite `hit(bullet)`: every enemy that is the target, or whose point is within the kind's `splash` of the target's
   point, loses the kind's `damage`.
3. Keys `1` and `2` select `'arrow'` and `'cannon'`. Add `BUTTONS` (`arrow` at `x: 250`, `cannon` at `x: 364`, both
   `w: 110`); a click in the top bar on a button selects it.
4. Draw the buttons from `y = 6`, 28 high: the selected one in its kind's color with `'#0f172a'` text, the other
   `'#334155'` with white text, showing `arrow 50` and `cannon 70`.

# --task-tr--

1. `TOWERS` tablosunu şöyle yap (okun satırına `splash: 0` eklendi, top satırı yeni):

   ```js
   const TOWERS = {
     arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, splash: 0, color: '#38bdf8' }, // ← değişti
     cannon: { cost: 70, range: 2, damage: 8, reload: 60, splash: 1.2, color: '#f97316' }, // ← yeni
   }
   ```

2. `let selected` satırının yorumunu kısalt:

   ```js
   let selected // the kind of tower to build
   ```

3. `// The start button in the bottom bar.` yorumunu değiştir ve altına düğme listesini ekle; `const START` satırı
   aynen kalır:

   ```js
   // The tower buttons in the top bar, and the start button in the bottom bar. // ← değişti
   const BUTTONS = [ // ← yeni
     { kind: 'arrow', x: 250, w: 110 }, // ← yeni
     { kind: 'cannon', x: 364, w: 110 }, // ← yeni
   ] // ← yeni
   const START = { x: 150, w: 180 }
   ```

4. `pointerdown` bloğunda, `if (state === 'over') { ... }` kısmından sonra ve `if (p.y >= BAR)` satırından önce üst
   çubuk kontrolünü ekle:

   ```js
     if (state === 'over') {
       reset()
       return
     }
     if (p.y < TOP) { // ← yeni
       const button = BUTTONS.find((b) => p.x >= b.x && p.x < b.x + b.w) // ← yeni
       if (button) selected = button.kind // ← yeni
       return // ← yeni
     } // ← yeni
     if (p.y >= BAR) {
   ```

5. `keydown` bloğunun en başına iki satır ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === '1') selected = 'arrow' // ← yeni
     if (event.key === '2') selected = 'cannon' // ← yeni
     if (event.key === ' ') {
   ```

6. `hit(bullet)` fonksiyonunun içini değiştir:

   ```js
   function hit(bullet) {
     const kind = TOWERS[bullet.kind] // ← yeni (buradan kapanışa kadar)
     const center = pointAt(bullet.target.d)
     for (const e of enemies) {
       const p = pointAt(e.d)
       const close = e === bullet.target || Math.hypot(p.x - center.x, p.y - center.y) <= kind.splash
       if (close) e.hp -= kind.damage
     }
   }
   ```

   Eski tek satır `bullet.target.hp -= TOWERS[bullet.kind].damage` silinir.

7. `draw()` içinde, `ctx.fillText('Gold ' + ...)` satırının altındaki `ctx.textAlign = 'center'` ile
   `if (state === 'building')` satırı arasına düğmeleri çizen kısmı ekle:

   ```js
     ctx.textAlign = 'center'
     for (const b of BUTTONS) { // ← yeni
       const kind = TOWERS[b.kind] // ← yeni
       ctx.fillStyle = b.kind === selected ? kind.color : '#334155' // ← yeni
       ctx.fillRect(b.x, 6, b.w, 28) // ← yeni
       ctx.fillStyle = b.kind === selected ? '#0f172a' : 'white' // ← yeni
       ctx.fillText(b.kind + ' ' + kind.cost, b.x + b.w / 2, 26) // ← yeni
     } // ← yeni

     ctx.fillStyle = 'white' // ← yeni
     if (state === 'building') {
   ```

8. **Çalıştır**'a bas. Üst çubuğun sağında **arrow 50** (mavi) ve **cannon 70** (gri) düğmeleri görünmeli. Oynamak
   için önce oyuna tıkla; `2`'ye bas ya da **cannon 70**'e tıkla, sonra çimene tıklayıp turuncu bir top kulesi kur.
   Alttaki kontrollerin hepsi yeşil olmalı. Düğmeye tıklayınca kule kuruluyorsa `if (p.y < TOP)` bloğundaki `return`'e
   bak.

# --tests--

A cannon shell should hurt every enemy near its target.
tr: Bir top mermisi hedefinin yakınındaki her düşmanı yaralamalı.

```js
const a = { d: 3, hp: 20, maxHp: 20 } // (2, 1)
const b = { d: 4, hp: 20, maxHp: 20 } // (3, 1)
const c = { d: 7, hp: 20, maxHp: 20 } // (3, 4)
enemies = [a, b, c]
hit({ target: b, kind: 'cannon' })
assert.deepEqual([a.hp, b.hp, c.hp], [12, 12, 20])
hit({ target: b, kind: 'arrow' })
assert.deepEqual([a.hp, b.hp, c.hp], [12, 8, 20], 'arrows only hit their target')
```

Keys and buttons should choose the kind of tower to build.
tr: Tuşlar ve düğmeler kurulacak kule türünü seçmeli.

```js
$.press('2')
assert.strictEqual(selected, 'cannon')
$.click(60, 180)
assert.deepEqual(towers[0], { col: 1, row: 3, kind: 'cannon', cooldown: 0 })
assert.strictEqual(gold, 50)
$.click(300, 20)
assert.strictEqual(selected, 'arrow')
$.click(60, 220)
assert.strictEqual(gold, 0)
$.click(400, 20)
assert.strictEqual(selected, 'cannon')
```

The buttons should show which kind is selected.
tr: Düğmeler hangi türün seçili olduğunu göstermeli.

```js
$.tick(1)
assert.isTrue($.rects('#38bdf8').some((r) => r.x === 250 && r.w === 110), 'arrow selected')
assert.isTrue($.rects('#334155').some((r) => r.x === 364))
assert.include($.texts(), 'cannon 70')
$.press('2')
$.tick(1)
assert.isTrue($.rects('#f97316').some((r) => r.x === 364))
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
const BAR = TOP + ROWS * TILE // the bottom bar, with the start button, begins here
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
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, splash: 0, color: '#38bdf8' },
  cannon: { cost: 70, range: 2, damage: 8, reload: 60, splash: 1.2, color: '#f97316' },
}

let road // keys of the tiles the road covers
let enemies
let towers
let bullets
let gold
let lives
let wave
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one
let state // 'building', 'wave' or 'over'
let selected // the kind of tower to build
let hover = null // the tile under the mouse
let best = Number(localStorage.getItem('td-best')) || 0

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
  wave = 0
  toSpawn = 0
  spawnIn = 0
  state = 'building'
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

function startWave() {
  wave += 1
  toSpawn = 6 + wave * 2
  spawnIn = 0
  state = 'wave'
}

function enemyHp() {
  return Math.round(10 * 1.25 ** (wave - 1))
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

// The tower buttons in the top bar, and the start button in the bottom bar.
const BUTTONS = [
  { kind: 'arrow', x: 250, w: 110 },
  { kind: 'cannon', x: 364, w: 110 },
]
const START = { x: 150, w: 180 }

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  if (state === 'over') {
    reset()
    return
  }
  if (p.y < TOP) {
    const button = BUTTONS.find((b) => p.x >= b.x && p.x < b.x + b.w)
    if (button) selected = button.kind
    return
  }
  if (p.y >= BAR) {
    if (state === 'building' && p.x >= START.x && p.x < START.x + START.w) startWave()
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
  if (event.key === '1') selected = 'arrow'
  if (event.key === '2') selected = 'cannon'
  if (event.key === ' ') {
    event.preventDefault()
    if (state === 'building') startWave()
    else if (state === 'over') reset()
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
  const kind = TOWERS[bullet.kind]
  const center = pointAt(bullet.target.d)
  for (const e of enemies) {
    const p = pointAt(e.d)
    const close = e === bullet.target || Math.hypot(p.x - center.x, p.y - center.y) <= kind.splash
    if (close) e.hp -= kind.damage
  }
}

function update() {
  if (state === 'over') return

  if (state === 'wave' && toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      const hp = enemyHp()
      enemies.push({ d: 0, hp, maxHp: hp })
      toSpawn -= 1
      // Later waves come closer together, which is where splash damage shines.
      spawnIn = Math.max(20, 46 - wave * 2)
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
    if (wave - 1 > best) {
      best = wave - 1
      localStorage.setItem('td-best', best)
    }
    return
  }
  if (state === 'wave' && toSpawn === 0 && enemies.length === 0) {
    state = 'building'
    gold += 20 + wave * 5
    if (wave > best) {
      best = wave
      localStorage.setItem('td-best', best)
    }
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
  for (const b of BUTTONS) {
    const kind = TOWERS[b.kind]
    ctx.fillStyle = b.kind === selected ? kind.color : '#334155'
    ctx.fillRect(b.x, 6, b.w, 28)
    ctx.fillStyle = b.kind === selected ? '#0f172a' : 'white'
    ctx.fillText(b.kind + ' ' + kind.cost, b.x + b.w / 2, 26)
  }

  ctx.fillStyle = 'white'
  if (state === 'building') {
    ctx.fillStyle = '#4f46e5'
    ctx.fillRect(START.x, BAR + 6, START.w, 28)
    ctx.fillStyle = 'white'
    ctx.fillText('Start wave ' + (wave + 1), START.x + START.w / 2, BAR + 26)
  } else if (state === 'wave') {
    ctx.fillText('Wave ' + wave + ': ' + (toSpawn + enemies.length) + ' left', canvas.width / 2, BAR + 26)
  }
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + best, canvas.width - 10, BAR + 26)
  ctx.textAlign = 'center'
  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Survived ' + (wave - 1) + ' waves (best ' + best + ')', canvas.width / 2, canvas.height / 2 + 30)
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 56)
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
