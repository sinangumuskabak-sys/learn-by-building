---
title: A computer that aims
title_tr: Nişan alan bir bilgisayar
skills: [prog.functions, game.physics]
---

# --explanation--

Red is now the computer. How can a program aim? It does what a patient human would do with a notebook: **try shots in its head**.

For every angle to the left (in steps of 0.03) and every power (in steps of 0.5), it makes a pretend shell and runs `fly` on it, the
same function the real shells use, with the same wind, until it hits something. The shot that lands closest to you wins. That is a
few thousand pretend shots, and a computer does them in a blink.

A computer that never misses is no fun to play against. So after finding its best shot it adds a little **random error** to the
angle and the power. With that error it wins about half its games against a careful player; a sloppy player almost always loses.
Tuning that one number is how you set the difficulty.

The computer waits a second (60 frames) before shooting, so you can see whose turn it is, and you cannot aim for it.

# --explanation-tr--

**Bu adımda:** kırmızı tankı bilgisayar oynayacak. Sen ateş ettikten sonra sağ üstte `Computer` yazacak, bir saniye
bekleyip kendisi nişan alıp ateş edecek. Oyun sonunda `You win!` (kazandın) ya da `You lose` (kaybettin) çıkacak.

**Bir program nasıl nişan alır?** Sabırlı bir insanın defterle yapacağını yapar: **atışları kafasında dener.**
Sola doğru her açı için (0.03'lük adımlarla) ve her güç için (0.5'lik adımlarla) hayali bir mermi yapar ve onu, gerçek
mermilerin kullandığı **aynı** `fly` fonksiyonuyla, aynı rüzgârla, bir şeye çarpana kadar uçurur. Sana en yakın düşen
atış kazanır. 3. adımda `fly`'ı ayrı bir fonksiyon yapmamızın sebebi tam buydu. Bu birkaç bin hayali atış eder;
bilgisayar bunları göz açıp kapayana kadar yapar.

**İç içe döngüler.** Her açı için her gücü denemek, bir döngünün içine başka bir döngü koymaktır:

```js
for (let angle = -Math.PI + 0.2; angle < -Math.PI / 2; angle += 0.03) {   // sola bakan açılar
  for (let power = 4; power <= MAX_POWER; power += 0.5) {                 // her güç
    // hayali mermiyi uçur, ne kadar ıskaladığına bak
  }
}
```

En içte bir döngü daha var: mermiyi en fazla 400 kare, bir şeye çarpana kadar uçurur
(`for (let i = 0; i < 400 && !hit; i++) hit = fly(s)`). Ekrandan çıkan atışlar (`'away'`) atlanır (`continue`).
Iskalama `Math.abs(s.x - tanks[0].x)`: merminin düştüğü yer ile senin tankın arasındaki yatay uzaklık. En iyi atışı
`best` nesnesinde tutarız; `!best || miss < best.miss` → "henüz en iyi yoksa **ya da** bu daha az ıskalıyorsa, en iyi bu".

**Hiç ıskalamayan bilgisayar sıkıcıdır.** Bu yüzden en iyi atışı bulduktan sonra açıya ve güce biraz **rastgele hata**
ekler: `(Math.random() - 0.5) * 0.08` -0.04 ile 0.04 arasında bir sayıdır. Bu hatayla dikkatli bir oyuncuya karşı
oyunların yaklaşık yarısını kazanır; özensiz bir oyuncu neredeyse hep kaybeder. Zorluğu bu tek sayıyla ayarlarsın.

**Bir saniye düşünme.** Sıra kırmızıya geçince `thinking = 60` olur. Her karede 1 azalır (`--thinking`, 3. adımdaki
`--timer` gibi); 0 olunca bilgisayar nişan alır ve ateş eder. Böylece sıranın kimde olduğunu görebilirsin.

**Onun yerine sen oynayamazsın.** Tuşlar, fare ve Boşluk artık sadece senin sıranda (`turn === 0`) çalışır ve her zaman
mavi tanka (`tanks[0]`) nişan aldırır. `turn !== 0` "sıra bende değil" demektir.

# --task--

1. Add `thinking`: when the turn passes to red, set it to 60. In `update()`, while red is aiming, count it down and at `0` call
   `computerAim()` and `fire()`.
2. Write `computerAim()`: for angles from `-Math.PI + 0.2` up to (not including) `-Math.PI / 2` by `0.03`, and powers from 4 to
   `MAX_POWER` by `0.5`, fly a pretend shell from red's barrel for up to 400 frames; skip shots that go away; keep the one whose
   landing `x` is closest to blue. Set red's angle to it plus `(Math.random() - 0.5) * 0.08` and its power to it plus
   `(Math.random() - 0.5) * 0.8` (at most `MAX_POWER`).
3. `aimBy`, `pointAt`, Space and the pointer only work on your turn (turn 0), and `pointAt` always aims the blue tank.
4. The HUD shows your angle and power, `Your turn` or `Computer`, and the end says `You win!` or `You lose`.

# --task-tr--

1. `let tanks ...` satırının yorumunu güncelle ve `let state ...` satırının altına `thinking`'i ekle:

   ```js
   let tanks // [you, the computer]: { x, y, hp, angle, power, color }
   ```

   ```js
   let thinking // frames until the computer shoots
   ```

2. `endTurn()`'ün `else` kısmına bir satır ekle ve hemen altına `computerAim` fonksiyonunu yaz:

   ```js
   function endTurn() {
     if (tanks[1].hp === 0) state = 'won'
     else if (tanks[0].hp === 0) state = 'lost'
     else {
       turn = 1 - turn
       newWind()
       state = 'aiming'
       if (turn === 1) thinking = 60 // ← yeni
     }
   }

   // The computer tries many shots in its head, picks the one landing closest to you, then misses a little.
   function computerAim() {
     const me = tanks[1]
     let best = null
     for (let angle = -Math.PI + 0.2; angle < -Math.PI / 2; angle += 0.03) {
       for (let power = 4; power <= MAX_POWER; power += 0.5) {
         const s = { x: me.x + Math.cos(angle) * 14, y: me.y - 8 + Math.sin(angle) * 14, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power }
         let hit = null
         for (let i = 0; i < 400 && !hit; i++) hit = fly(s)
         if (hit === 'away') continue
         const miss = Math.abs(s.x - tanks[0].x)
         if (!best || miss < best.miss) best = { miss, angle, power }
       }
     }
     me.angle = best.angle + (Math.random() - 0.5) * 0.08
     me.power = Math.min(MAX_POWER, best.power + (Math.random() - 0.5) * 0.8)
   }
   ```

   Hayali mermi `s`, `fire()`'daki gerçek mermiyle aynı şekilde kırmızının namlu ucundan çıkar.

3. `update()`'te patlama bitişini yöneten `if (state === 'boom' ...) { ... }` bloğunun altına bilgisayarın ateşini ekle:

   ```js
     if (state === 'aiming' && turn === 1 && --thinking === 0) {
       computerAim()
       fire()
     }
   ```

4. `aimBy()`'ın ilk iki satırını değiştir:

   ```js
   function aimBy(dAngle, dPower) {
     if (state !== 'aiming' || turn !== 0) return // ← değişti
     const t = tanks[0] // ← değişti
   ```

5. `keydown` olayında Boşluk kısmındaki `else fire()` satırını değiştir:

   ```js
       else if (turn === 0) fire() // ← değişti
   ```

6. `pointAt()`'in üstündeki yorumu ve içindeki `const t = ...` satırını değiştir:

   ```js
   // Point from your tank: the direction is the aim, the distance is the power.
   ```

   ```js
     const t = tanks[0] // ← değişti
   ```

7. `pointerdown` olayındaki ikinci satırı değiştir:

   ```js
     if (state !== 'aiming' || turn !== 0) return // ← değişti
   ```

8. `draw()`'un sonundaki yazılarda dört değişiklik yap: `now` yerine `you`, sıra yazısı ve bitiş yazısı:

   ```js
     const you = tanks[0] // ← değişti
     ctx.fillStyle = '#0f172a'
     ctx.font = 'bold 14px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20) // ← değişti
   ```

   ```js
     ctx.fillText(turn === 0 ? 'Your turn' : 'Computer', W - 10, 20) // ← değişti
   ```

   ```js
       ctx.fillText(state === 'won' ? 'You win!' : 'You lose', W / 2, 145) // ← değişti
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve ateş et. Patlamadan sonra sağ üstte `Computer` yazmalı; oklar
   artık bir şey yapmamalı; bir saniye sonra kırmızı tank sana doğru ateş etmeli. Alttaki kontrollerin hepsi yeşil
   olmalı. Bilgisayar hiç ateş etmiyorsa `endTurn`'e `thinking = 60` satırını eklediğini kontrol et.

# --tests--

After your shot the computer should take its turn by itself, and you cannot aim for it.
tr: Senin atışından sonra bilgisayar sırasını kendi almalı ve sen onun yerine nişan alamazsın.

```js
fire()
for (let i = 0; i < 400 && state !== 'aiming'; i++) $.tick(1)
assert.strictEqual(turn, 1)
$.tick(1)
assert.include($.texts(), 'Computer')
const angle = tanks[1].angle
$.press('ArrowLeft')
assert.strictEqual(tanks[1].angle, angle, 'you cannot aim for the computer')
$.tick(60)
assert.strictEqual(state, 'flying', 'the computer shoots by itself')
```

The computer should aim close to you, to the left.
tr: Bilgisayar sana yakın, sola nişan almalı.

```js
turn = 1
wind = 0
computerAim()
const me = tanks[1]
const s = { x: me.x + Math.cos(me.angle) * 14, y: me.y - 8 + Math.sin(me.angle) * 14, vx: Math.cos(me.angle) * me.power, vy: Math.sin(me.angle) * me.power }
let hit = null
for (let i = 0; i < 400 && !hit; i++) hit = fly(s)
assert.isBelow(Math.abs(s.x - tanks[0].x), 60, 'it aims close to you')
assert.isBelow(me.angle, -Math.PI / 2, 'to the left')
```

Losing all your hp should lose the game, and a tap should play again.
tr: Bütün hp'ni kaybetmek oyunu kaybettirmeli ve bir dokunuş yeniden oynatmalı.

```js
tanks[0].hp = 10
turn = 1
explode(tanks[0].x, tanks[0].y - 6)
state = 'boom'
timer = 1
$.tick(1)
assert.strictEqual(state, 'lost')
$.tick(1)
assert.include($.texts(), 'You lose')
$.click(280, 150)
assert.strictEqual(state, 'aiming', 'a tap plays again')
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
let tanks // [you, the computer]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let wind
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let thinking // frames until the computer shoots
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
  newWind()
  state = 'aiming'
  dragging = false
}

const newWind = () => (wind = Math.round((Math.random() - 0.5) * 10) / 100) // -0.05 to 0.05

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

// One frame of flight: wind pushes sideways, gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vx += wind
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
    newWind()
    state = 'aiming'
    if (turn === 1) thinking = 60
  }
}

// The computer tries many shots in its head, picks the one landing closest to you, then misses a little.
function computerAim() {
  const me = tanks[1]
  let best = null
  for (let angle = -Math.PI + 0.2; angle < -Math.PI / 2; angle += 0.03) {
    for (let power = 4; power <= MAX_POWER; power += 0.5) {
      const s = { x: me.x + Math.cos(angle) * 14, y: me.y - 8 + Math.sin(angle) * 14, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power }
      let hit = null
      for (let i = 0; i < 400 && !hit; i++) hit = fly(s)
      if (hit === 'away') continue
      const miss = Math.abs(s.x - tanks[0].x)
      if (!best || miss < best.miss) best = { miss, angle, power }
    }
  }
  me.angle = best.angle + (Math.random() - 0.5) * 0.08
  me.power = Math.min(MAX_POWER, best.power + (Math.random() - 0.5) * 0.8)
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
  if (state === 'aiming' && turn === 1 && --thinking === 0) {
    computerAim()
    fire()
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
  if (state !== 'aiming' || turn !== 0) return
  const t = tanks[0]
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
    else if (turn === 0) fire()
  } else return
  event.preventDefault()
})

// Point from your tank: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[0]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won' || state === 'lost') return reset()
  if (state !== 'aiming' || turn !== 0) return
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

  const you = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20)
  ctx.textAlign = 'center'
  const arrow = wind > 0 ? '→' : wind < 0 ? '←' : ''
  ctx.fillText('Wind ' + arrow + ' ' + Math.abs(Math.round(wind * 100)), W / 2, 20)
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Your turn' : 'Computer', W - 10, 20)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'You lose', W / 2, 145)
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
