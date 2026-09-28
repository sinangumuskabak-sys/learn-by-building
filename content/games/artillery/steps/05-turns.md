---
title: Taking turns and taking damage
title_tr: Sırayla oynamak ve hasar almak
skills: [game.state, game.collision]
---

# --explanation--

Now two players share the keyboard (or the screen) and take turns. `turn` is 0 for blue and 1 for red. Every rule that talked about
"the tank" now means `tanks[turn]`: the keys aim it, the pointer points from it, and the shell leaves from its barrel. When a shot
is over, `turn = 1 - turn` hands over.

Explosions hurt. A tank closer to the centre takes more damage: right in the middle 60, at the edge of the blast nothing, and in
between it shrinks in a straight line:

```js
if (d < BLAST) t.hp -= (1 - d / BLAST) * 60
```

A shell flying straight into the other tank should not pass through it, so `fly` also reports `'tank'` when the shell comes within
12 pixels of a tank that is not the shooter. The explosion happens right there.

When a tank reaches 0 hp, the other side wins.

# --explanation-tr--

**Bu adımda:** iki kişi aynı klavyeyi (ya da ekranı) paylaşıp sırayla ateş edecek. Tankların üstünde yeşil can çubukları
olacak, sırası gelen tankın üstünde küçük bir üçgen belirecek ve sağ üstte `Blue to shoot` (Mavi atar) ya da
`Red to shoot` (Kırmızı atar) yazacak. Bir tankın canı bitince kazanan ilan edilecek.

**Sıra tek bir sayıdır.** `turn` mavi için `0`, kırmızı için `1`. Şimdiye kadar "tank" dediğimiz her kural
(`tanks[0]`) artık `tanks[turn]` olacak: tuşlar ona nişan aldırır, fare ondan gösterir, mermi onun namlusundan çıkar.
Atış bitince `turn = 1 - turn` sırayı devreder: `1 - 0` → `1`, `1 - 1` → `0`.

**Patlamalar can yakar.** Her tankın `hp` (can) değeri 100 ile başlar. Patlamanın merkezine yakın olan tank daha çok
hasar alır: tam ortada 60, patlamanın kenarında hiç, arada düz bir çizgi hâlinde azalır:

```js
if (d < BLAST) t.hp -= (1 - d / BLAST) * 60
```

`d` tankın ortası ile patlama arasındaki uzaklıktır (`Math.hypot`). `d = 0` ise `(1 - 0) * 60 = 60`; `d = 15` ise
`(1 - 0.5) * 60 = 30`. Sonucu `Math.round` ile yuvarlarız ve `Math.max(0, ...)` ile asla eksiye düşürmeyiz.

**Mermi tankın içinden geçmemeli.** Doğrudan öbür tanka uçan bir mermi, tankın 12 pikselden yakınına gelince `fly`
artık `'tank'` da döndürür ve patlama tam orada olur. `tanks.some(f)` → "listede `f`'in doğru dediği **en az bir**
eleman var mı?" `t !== tanks[turn]` → "ateş eden tank değilse" (kendi mermin sana çarpmasın).

**Sıranın sonu: `endTurn()`.** Patlama bitince çağrılır. Kırmızının canı 0 ise `'won'` (mavi kazandı), mavinin canı 0
ise `'lost'` (mavi kaybetti), değilse sıra öbür tanka geçer ve tekrar `'aiming'` olur. Bitti ekranında Boşluk ya da
dokunuş `reset()` ile yeniden başlatır. `return reset()` → "`reset`'i çağır ve burada dur".

**Yeni küçük şeyler:**

- `for (const [i, t] of tanks.entries())` → listedeki her tankı numarasıyla birlikte verir: `i` 0 ya da 1, `t` tank.
  Böylece "bu tank sırası gelen mi?" (`i === turn`) diye sorabiliriz.
- Can çubuğu iki dikdörtgendir: önce 32 piksellik koyu bir zemin, üstüne canla orantılı renkli kısım (`32 * t.hp / 100`).
  Can 30'un üstündeyse yeşil, değilse kırmızı.
- Üçgen: `moveTo` ile bir köşe, iki `lineTo` ile diğer köşeler, `fill()` ile içini boya.

# --task--

1. Give each tank `hp: 100` and add `turn` (`0` in `reset()`). `fire`, `aimBy` and `pointAt` use `tanks[turn]`.
2. `fly` returns `'tank'` when the shell is within 12 pixels of `(t.x, t.y - 6)` of any tank other than the shooter.
3. `explode` hurts every tank within `BLAST` of the blast by `(1 - d / BLAST) * 60` (rounded, never below 0).
4. Write `endTurn()`, called when the explosion is over: `'won'` if red has 0 hp, `'lost'` if blue has, otherwise the other tank's
   turn and `'aiming'`. In `'won'` or `'lost'`, Space or a tap starts again.
5. Draw a health bar above each tank (32 by 4 at `t.y - 22`, `'#0f172a'`, with `'#22c55e'` over it, or `'#ef4444'` at 30 hp or
   less), a small dark triangle above the tank whose turn it is, `Blue to shoot` or `Red to shoot` at the top right, and at the end
   a panel with `Blue wins!` or `Red wins!`.

# --task-tr--

1. Değişkenlerde `let tanks` ve `let state` satırlarının yorumlarını güncelle, `let tanks`'ın altına `turn`'ü ekle:

   ```js
   let tanks // [blue, red]: { x, y, hp, angle, power, color }
   let turn // 0 or 1: whose shot it is
   ```

   ```js
   let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
   ```

2. `reset()` içinde iki tank satırına `hp: 100` ekle ve `for (const t of tanks) ...` satırının altına `turn = 0` yaz:

   ```js
       { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' }, // ← değişti
       { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' }, // ← değişti
     ]
     for (const t of tanks) t.y = groundAt(t.x)
     turn = 0 // ← yeni
   ```

3. `fire()`, `aimBy()` ve `pointAt()` içindeki `const t = tanks[0]` satırlarının üçünü de şöyle yap:

   ```js
     const t = tanks[turn] // ← değişti
   ```

   `pointAt`'in üstündeki yorumu da güncelle: `// Point from the tank whose turn it is: the direction is the aim, the distance is the power.`

4. `fly()` içinde `return 'ground'` satırının altına (`return null`'un üstüne) ekle:

   ```js
     if (tanks.some((t) => t !== tanks[turn] && Math.hypot(t.x - s.x, t.y - 6 - s.y) < 12)) return 'tank'
   ```

5. `explode()`'u şöyle yap (yorum değişti, zemin döngüsünden sonra hasar döngüsü eklendi); hemen altına `endTurn`'ü yaz:

   ```js
   // Blow a round hole in the ground and hurt the tanks nearby.
   function explode(x, y) {
     for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
       if (cx < 0 || cx >= W) continue
       const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
       if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
     }
     for (const t of tanks) { // ← yeni (buradan)
       const d = Math.hypot(t.x - x, t.y - 6 - y)
       if (d < BLAST) t.hp = Math.max(0, Math.round(t.hp - (1 - d / BLAST) * 60))
     } // ← (buraya kadar)
     blast = { x, y }
   }

   function endTurn() {
     if (tanks[1].hp === 0) state = 'won'
     else if (tanks[0].hp === 0) state = 'lost'
     else {
       turn = 1 - turn
       state = 'aiming'
     }
   }
   ```

6. `update()` içinde patlama bitince yapılan işi değiştir:

   ```js
     if (state === 'boom' && --timer === 0) {
       blast = null
       endTurn() // ← değişti (eskiden: state = 'aiming')
     }
   ```

7. `keydown` olayında son iki satırı (`else if (event.key === ' ') fire()` ve `else return`) sil, yerine şunu yaz:

   ```js
     else if (event.key === ' ') {
       if (state === 'won' || state === 'lost') reset()
       else fire()
     } else return
   ```

8. `pointerdown` olayının en başına ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (state === 'won' || state === 'lost') return reset() // ← yeni
     if (state !== 'aiming') return
   ```

9. `draw()` içindeki tank döngüsünü şöyle değiştir (ilk satır değişti, sona can çubuğu ve üçgen eklendi):

   ```js
     for (const [i, t] of tanks.entries()) { // ← değişti
       ctx.fillStyle = t.color
       ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
       ctx.strokeStyle = t.color
       ctx.lineWidth = 3
       ctx.beginPath()
       ctx.moveTo(t.x, t.y - 8)
       ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
       ctx.stroke()
       // Health bar // ← yeni (buradan)
       ctx.fillStyle = '#0f172a'
       ctx.fillRect(t.x - 16, t.y - 22, 32, 4)
       ctx.fillStyle = t.hp > 30 ? '#22c55e' : '#ef4444'
       ctx.fillRect(t.x - 16, t.y - 22, (32 * t.hp) / 100, 4)
       if (i === turn && state === 'aiming') {
         ctx.fillStyle = '#0f172a'
         ctx.beginPath()
         ctx.moveTo(t.x - 5, t.y - 34)
         ctx.lineTo(t.x + 5, t.y - 34)
         ctx.lineTo(t.x, t.y - 27)
         ctx.fill()
       } // ← (buraya kadar)
     }
   ```

10. `draw()`'un sonunda `const now = tanks[0]` satırını `tanks[turn]` yap ve açı yazısının altına sıra yazısını ve bitiş
    panelini ekle:

    ```js
      const now = tanks[turn] // ← değişti
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
      ctx.textAlign = 'right' // ← yeni (buradan)
      ctx.fillText(turn === 0 ? 'Blue to shoot' : 'Red to shoot', W - 10, 20)
      if (state === 'won' || state === 'lost') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
        ctx.fillRect(140, 110, 280, 80)
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText(state === 'won' ? 'Blue wins!' : 'Red wins!', W / 2, 145)
        ctx.font = '15px sans-serif'
        ctx.fillText('Space or tap to play again', W / 2, 172)
      } // ← (buraya kadar)
    }
    ```

11. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Mavi ile ateş et; patlama bitince sağ üstte `Red to shoot`
    yazmalı ve oklar artık kırmızı namluyu çevirmeli. Tanka isabet eden atış can çubuğunu kısaltmalı. Alttaki
    kontrollerin hepsi yeşil olmalı. Tuşlar hâlâ maviyi oynatıyorsa üç `tanks[0]`'ın hepsini `tanks[turn]` yaptığından emin ol.

# --tests--

After a shot the turn should pass to red, and the keys should aim red.
tr: Bir atıştan sonra sıra kırmızıya geçmeli ve tuşlar kırmızıya nişan aldırmalı.

```js
fire()
for (let i = 0; i < 400 && state !== 'aiming'; i++) $.tick(1)
assert.strictEqual(turn, 1, 'red to shoot')
const red = tanks[1]
const angle = red.angle
$.press('ArrowRight')
assert.closeTo(red.angle, angle + 0.03, 1e-9, 'the keys aim the tank whose turn it is')
$.tick(1)
assert.include($.texts(), 'Red to shoot')
```

A blast on a tank should take 60 hp, and a shell reaching a tank should hit it.
tr: Bir tankın üstündeki patlama 60 hp almalı ve bir tanka ulaşan mermi ona çarpmalı.

```js
const red = tanks[1]
explode(red.x, red.y - 6)
assert.strictEqual(red.hp, 40, 'a hit right on the tank takes 60')
assert.strictEqual(tanks[0].hp, 100)
const s = { x: red.x - 40, y: red.y - 6, vx: 10, vy: 0 }
assert.strictEqual(fly(s), null)
assert.strictEqual(fly(s), null)
assert.strictEqual(fly(s), 'tank', 'a shell reaching the tank hits it')
```

A tank at 0 hp should end the game, and Space should start again.
tr: 0 hp'deki bir tank oyunu bitirmeli ve Boşluk yeniden başlatmalı.

```js
tanks[1].hp = 20
explode(tanks[1].x, tanks[1].y - 6)
state = 'boom'
timer = 1
$.tick(1)
assert.strictEqual(state, 'won')
$.tick(1)
assert.include($.texts(), 'Blue wins!')
$.press(' ')
assert.strictEqual(state, 'aiming')
assert.strictEqual(tanks[1].hp, 100)
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const GRAVITY = 0.15
const BLAST = 30 // explosion radius
const MAX_POWER = 12
const FALL = 2 // pixels per frame a tank drops when the ground under it is gone

let ground // ground[x]: the y of the surface in column x
let tanks // [blue, red]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let dragging

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  turn = 0
  shell = null
  blast = null
  state = 'aiming'
  dragging = false
}

function fire() {
  if (state !== 'aiming') return
  const t = tanks[turn]
  // The shell leaves from the end of the barrel.
  shell = {
    x: t.x + Math.cos(t.angle) * 14,
    y: t.y - 8 + Math.sin(t.angle) * 14,
    vx: Math.cos(t.angle) * t.power,
    vy: Math.sin(t.angle) * t.power,
  }
  state = 'flying'
}

// One frame of flight: gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  if (tanks.some((t) => t !== tanks[turn] && Math.hypot(t.x - s.x, t.y - 6 - s.y) < 12)) return 'tank'
  return null
}

// Blow a round hole in the ground and hurt the tanks nearby.
function explode(x, y) {
  for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
    if (cx < 0 || cx >= W) continue
    const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
    if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
  }
  for (const t of tanks) {
    const d = Math.hypot(t.x - x, t.y - 6 - y)
    if (d < BLAST) t.hp = Math.max(0, Math.round(t.hp - (1 - d / BLAST) * 60))
  }
  blast = { x, y }
}

function endTurn() {
  if (tanks[1].hp === 0) state = 'won'
  else if (tanks[0].hp === 0) state = 'lost'
  else {
    turn = 1 - turn
    state = 'aiming'
  }
}

function update() {
  for (const t of tanks) {
    if (t.y < groundAt(t.x)) t.y = Math.min(groundAt(t.x), t.y + FALL) // nothing under it: it falls
    else t.y = groundAt(t.x)
  }
  if (state === 'boom' && --timer === 0) {
    blast = null
    endTurn()
  }
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20
}

function aimBy(dAngle, dPower) {
  if (state !== 'aiming') return
  const t = tanks[turn]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else if (event.key === ' ') {
    if (state === 'won' || state === 'lost') reset()
    else fire()
  } else return
  event.preventDefault()
})

// Point from the tank whose turn it is: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[turn]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won' || state === 'lost') return reset()
  if (state !== 'aiming') return
  dragging = true
  pointAt(event)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pointAt(event)
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  fire()
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const [i, t] of tanks.entries()) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
    // Health bar
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(t.x - 16, t.y - 22, 32, 4)
    ctx.fillStyle = t.hp > 30 ? '#22c55e' : '#ef4444'
    ctx.fillRect(t.x - 16, t.y - 22, (32 * t.hp) / 100, 4)
    if (i === turn && state === 'aiming') {
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.moveTo(t.x - 5, t.y - 34)
      ctx.lineTo(t.x + 5, t.y - 34)
      ctx.lineTo(t.x, t.y - 27)
      ctx.fill()
    }
  }

  if (shell) {
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(shell.x, shell.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  if (blast) {
    // The fireball grows as the timer runs down.
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
    ctx.beginPath()
    ctx.arc(blast.x, blast.y, BLAST * (1 - timer / 40), 0, Math.PI * 2)
    ctx.fill()
  }

  const now = tanks[turn]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Blue to shoot' : 'Red to shoot', W - 10, 20)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'Blue wins!' : 'Red wins!', W / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', W / 2, 172)
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
