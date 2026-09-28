---
title: Splitting missiles and a high score
title_tr: Bölünen füzeler ve rekor
skills: [game.state]
---

# --explanation--

From wave 3, some missiles **split into three** as they come down. A missile that looked easy to stop suddenly becomes a
spread of three, heading for different cities. It rewards stopping missiles early, high in the sky.

Splitting reuses `launch()`: it only needs to accept a starting point, with the top of the screen as the default:

```js
function launch(sx = Math.random() * canvas.width, sy = 0) { ... }
launch(m.x, m.y)   // a new missile starting where this one is
```

**Default parameters** let one function serve both jobs: `launch()` for a normal missile, `launch(x, y)` for a fragment.

Finally, the high score is saved when the game ends and shown next to the score.

# --explanation-tr--

**Bu adımda:** 3. dalgadan itibaren bazı füzeler inerken **üçe bölünecek**. Kolay durdurulur görünen bir füze birden
farklı şehirlere giden üç füzeye dönüşecek. Ayrıca en iyi skorun saklanacak; sol üstte `Score 0  Best 4200` gibi bir
yazı göreceksin.

**Neden bölünme?** Füzeleri erken, gökyüzünde yüksekteyken durdurmayı ödüllendirir. Bölünecek füzeler `split: true`
işaretini taşır. 3. dalgadan itibaren her yeni füzenin dörtte bir şansı vardır:

```js
const split = wave >= 3 && Math.random() < 0.25
```

`>=` "büyük ya da eşit" demektir. `Math.random() < 0.25` yüzde 25 ihtimalle doğrudur. İkisi `&&` ile bağlı: 1. ve 2.
dalgada ilki yanlış olduğu için sonuç hep `false`'tur.

**Varsayılan parametre.** Bölünme `launch()`'u yeniden kullanır; yalnızca bir başlangıç noktası kabul etmesi gerekir,
verilmezse ekranın üstü kullanılır:

```js
function launch(sx = Math.random() * canvas.width, sy = 0) { ... }
launch()           // normal füze: üstte rastgele bir yerden
launch(m.x, m.y)   // parça: bu füzenin şu anki yerinden
```

Parametrenin yanındaki `= ...` onun **varsayılan değeridir**: çağırırken o değeri vermezsen bu kullanılır. Böylece tek
fonksiyon iki işe yarar. Eskiden fonksiyonun içinde olan `const sx = ...` ve `const sy = 0` satırları artık parantezin
içine taşınır.

**Bölünme anı.** Bölünecek bir füze `y = 150`'nin altına inince bölünme işareti kalkar (bir daha bölünmesin) ve
bulunduğu yerden iki füze daha fırlatılır; kendisi de yoluna devam eder, toplam üç. İki kez tekrar için sayan bir `for`
döngüsü kullanırız:

```js
for (let i = 0; i < 2; i++) launch(m.x, m.y)
```

"`i` 0'dan başlasın; 2'den küçük olduğu sürece tekrar et; her turdan sonra 1 artır (`i++`)." Yani `i` 0 ve 1 iken, iki
kez çalışır.

**En iyi skor: `localStorage`.** Tarayıcının, sayfayı kapatsan da silinmeyen küçük defteridir:
`localStorage.setItem('missile-best', 4200)` yazar, `localStorage.getItem('missile-best')` okur. Defter her şeyi
**yazı** olarak tutar; `Number(...)` yazıyı sayıya çevirir. İlk oyunda not yoktur; `|| 0` "yoksa 0 kullan" demektir.
Oyun bittiğinde skor en iyiden büyükse (`score > best`) kaydederiz.

# --task--

1. `launch(sx, sy)` takes a starting point, by default a random `x` at the top and `y = 0`. From wave 3, each new missile has a
   one in four chance of `split: true`.
2. A splitting missile below `y = 150` stops splitting and launches two more missiles from where it is.
3. Add `best` (`localStorage` `'missile-best'`), saved when the game ends with a higher score, and draw
   `Score 900  Best 4200` at the top left.

# --task-tr--

1. `let incoming` satırının yorumunu güncelle ve `let pause` satırının altına en iyi skoru okuyan satırı ekle:

   ```js
   let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed, split }
   ```

   ```js
   let best = Number(localStorage.getItem('missile-best')) || 0
   ```

2. `launch()` fonksiyonunu şöyle yap (ilk iki satırı parametrelere taşındı):

   ```js
   function launch(sx = Math.random() * canvas.width, sy = 0) { // ← değişti
     const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
     const tx = targets[Math.floor(Math.random() * targets.length)]
     const split = wave >= 3 && Math.random() < 0.25 // ← yeni
     incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15, split }) // ← değişti
   }
   ```

3. `update()` içinde düşman füzelerinin döngüsünde, patlama kontrolünün (`continue` ile biten blok) altına ve
   `if (stepTowards(m, m.speed))` satırının üstüne bölünmeyi ekle:

   ```js
       // Some missiles split into three halfway down.
       if (m.split && m.y > 150) {
         m.split = false
         for (let i = 0; i < 2; i++) launch(m.x, m.y)
       }
   ```

4. Aynı fonksiyonda oyun bitince en iyi skoru kaydet:

   ```js
     if (!cities.some((c) => c.alive)) {
       state = 'over'
       if (score > best) { // ← yeni
         best = score // ← yeni
         localStorage.setItem('missile-best', best) // ← yeni
       } // ← yeni
       return
     }
   ```

5. `draw()` içinde skoru yazan satırı değiştir:

   ```js
     ctx.fillText('Score ' + score + '  Best ' + best, 10, 22) // ← değişti
   ```

6. **Çalıştır**'a bas. Sol üstte `Score 0  Best 0` yazmalı. 3. dalgaya ulaşınca bazı füzeler yolun üçte biri civarında
   üçe ayrılmalı. Oyun bitince `Best` yeni skorunu göstermeli. Alttaki kontrollerin hepsi yeşil olmalı. `Best` kontrolü
   kırmızıysa `'  Best '` içindeki iki boşluğu kontrol et.

# --tests--

A splitting missile should become three halfway down.
tr: Bölünen bir füze yolun yarısında üç olmalı.

```js
toLaunch = 0
incoming = [{ sx: 200, sy: 0, x: 200, y: 149.5, tx: 50, ty: 370, speed: 0.8, split: true }]
$.tick(1)
assert.lengthOf(incoming, 1)
$.tick(1)
assert.lengthOf(incoming, 3)
assert.isFalse(incoming[0].split)
assert.isTrue(incoming.slice(1).every((m) => m.sx === incoming[0].sx || Math.abs(m.sy - 150) < 3))
```

Only waves from 3 on should have splitting missiles.
tr: Yalnızca 3. dalgadan itibaren bölünen füzeler olmalı.

```js
for (let i = 0; i < 100; i++) launch()
assert.isTrue(incoming.every((m) => !m.split))
incoming = []
wave = 3
for (let i = 0; i < 400; i++) launch()
const share = incoming.filter((m) => m.split).length / incoming.length
assert.isTrue(share > 0.15 && share < 0.35)
```

The best score should be saved when the game ends.
tr: Rekor oyun bitince kaydedilmeli.

```js
score = 4200
cities.forEach((c) => (c.alive = false))
$.tick(1)
assert.strictEqual(best, 4200)
assert.strictEqual(localStorage.getItem('missile-best'), '4200')
$.click(240, 100)
$.tick(1)
assert.include($.texts(), 'Score 0 Best 4200')
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]
const SHOT_SPEED = 7
const BLAST = 32 // the biggest radius of an explosion
const BLAST_FRAMES = 50 // how long an explosion lasts, growing then shrinking

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed, split }
let shots // your interceptors on their way: { x, y, tx, ty }
let blasts // explosions: { x, y, age, own }: own ones destroy missiles, impacts on the ground do not
let wave
let toLaunch // enemy missiles still to come in this wave
let launchIn
let ammo
let score
let state // 'playing', 'between' (a pause after a wave) or 'over'
let pause
let best = Number(localStorage.getItem('missile-best')) || 0

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  wave = 0
  score = 0
  nextWave()
}

function nextWave() {
  wave += 1
  toLaunch = 8 + wave * 2
  launchIn = 30
  ammo = 12 + wave * 2
  state = 'playing'
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch(sx = Math.random() * canvas.width, sy = 0) {
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  const split = wave >= 3 && Math.random() < 0.25
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15, split })
}

function fire(tx, ty) {
  if (state !== 'playing' || ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
})

// Move a point `speed` pixels towards its target; true when it has arrived.
function stepTowards(m, speed) {
  const dx = m.tx - m.x
  const dy = m.ty - m.y
  const distance = Math.hypot(dx, dy)
  if (distance <= speed) {
    m.x = m.tx
    m.y = m.ty
    return true
  }
  m.x += (dx / distance) * speed
  m.y += (dy / distance) * speed
  return false
}

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
}

function update() {
  if (state === 'over') return
  if (state === 'between') {
    pause -= 1
    if (pause <= 0) nextWave()
    return
  }

  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = Math.max(20, 70 - wave * 6)
    }
  }

  for (const s of shots) {
    if (stepTowards(s, SHOT_SPEED)) {
      s.done = true
      blasts.push({ x: s.x, y: s.y, age: 0, own: true })
    }
  }
  shots = shots.filter((s) => !s.done)

  for (const b of blasts) b.age += 1
  blasts = blasts.filter((b) => b.age < BLAST_FRAMES)

  for (const m of incoming) {
    // Caught by an explosion: it explodes too, which can catch the missiles next to it.
    if (blasts.some((b) => b.own && Math.hypot(m.x - b.x, m.y - b.y) <= radius(b))) {
      m.done = true
      score += 25
      blasts.push({ x: m.x, y: m.y, age: 0, own: true })
      continue
    }
    // Some missiles split into three halfway down.
    if (m.split && m.y > 150) {
      m.split = false
      for (let i = 0; i < 2; i++) launch(m.x, m.y)
    }
    if (stepTowards(m, m.speed)) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0, own: false })
      const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
      if (city) city.alive = false
    }
  }
  incoming = incoming.filter((m) => !m.done)

  if (!cities.some((c) => c.alive)) {
    state = 'over'
    if (score > best) {
      best = score
      localStorage.setItem('missile-best', best)
    }
    return
  }
  if (toLaunch === 0 && incoming.length === 0 && blasts.length === 0) {
    // Bonus for every city still standing and every interceptor left.
    score += cities.filter((c) => c.alive).length * 100 + ammo * 5
    state = 'between'
    pause = 90
  }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  for (const c of cities) {
    ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
    ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)

  ctx.lineWidth = 2
  ctx.strokeStyle = '#f87171'
  for (const m of incoming) {
    ctx.beginPath()
    ctx.moveTo(m.sx, m.sy)
    ctx.lineTo(m.x, m.y)
    ctx.stroke()
  }
  ctx.strokeStyle = '#a3e635'
  for (const s of shots) {
    ctx.beginPath()
    ctx.moveTo(BASE.x, BASE.y)
    ctx.lineTo(s.x, s.y)
    ctx.stroke()
  }
  for (const b of blasts) {
    ctx.fillStyle = b.age % 6 < 3 ? '#fde047' : '#fb923c'
    ctx.beginPath()
    ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score + '  Best ' + best, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('Wave ' + wave + '  Ammo ' + ammo, canvas.width - 10, 22)
  ctx.textAlign = 'center'
  if (state === 'between') ctx.fillText('Wave ' + wave + ' cleared!', canvas.width / 2, 180)
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('The end', canvas.width / 2, 180)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 210)
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
