---
title: Aim with the arrow keys
title_tr: Ok tuşlarıyla nişan al
skills: [game.input]
---

# --goal--

The arrow keys change the aim: Up and Down turn the angle, Right and Left stretch or loosen the band, between 10 and
`MAX_PULL`.

# --goal-tr--

Şimdi nişanı oyuncu alsın. Tarayıcıya "bir tuşa basılınca bana haber ver" diyeceğiz; buna **olay dinlemek** (event
listener) denir. Kapı zili gibi: çalınca ne yapılacağını önceden söylersin.

- **Yukarı / Aşağı** ok → açıyı değiştirir.
- **Sağ / Sol** ok → lastiği gerer ya da gevşetir; çekiş 10 ile `MAX_PULL` (70) arasında kalır.

# --code--

```js
const MAX_PULL = 70

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else return
  event.preventDefault()
})
```

# --meaning--

- `addEventListener('keydown', (event) => { ... })` runs the function each time a key goes down; `event.key` is its
  name.
- The `if ... else if` chain does the first matching line only; `else return` leaves for any other key.
- `Math.min(MAX_PULL, ...)` never lets the pull go over 70, `Math.max(10, ...)` never under 10.
- `event.preventDefault()` stops the arrow keys from also scrolling the page.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** (keydown) bu
  fonksiyonu çalıştır". `(event) => { }` adı olmayan kısa bir fonksiyondur (ok fonksiyonu); `event` basılan tuşun
  bilgilerini taşır.
- `event.key === 'ArrowUp'` → basılan tuş yukarı ok mu? `===` "tam olarak eşit mi" diye sorar.
- `aim.angle -= 0.03` → açıdan 0.03 çıkar (`-=` "üstünden çıkar"): açı daha eksi olur, nişan **yukarı** kalkar.
  Aşağı ok `+=` ile ekler.
- `if ... else if ... else if` zinciri → yukarıdan aşağı bakar, **ilk doğru** koşulun işini yapar, gerisini atlar.
- `Math.min(MAX_PULL, aim.pull + 2)` → iki sayıdan **küçüğünü** seçer: çekiş 70'i hiç geçmez.
  `Math.max(10, aim.pull - 2)` → **büyüğünü** seçer: 10'un altına hiç inmez.
- `else return` → başka bir tuşsa fonksiyondan hemen çık.
- `event.preventDefault()` → tarayıcının o tuşla yapacağı olağan işi (sayfayı kaydırmak) engeller.

# --task--

1. Under the `SLING` line write `const MAX_PULL = 70`.
2. Write the listener above `function draw() {`, with an empty line between them.

# --task-tr--

1. `const SLING = ...` satırının hemen altına `const MAX_PULL = 70` yaz.
2. Dinleyiciyi `function draw() {` satırının **üstüne** yaz; aralarında bir boş satır kalsın.
3. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin) ve oklarla oyna: kuş sapanın çevresinde dönmeli, lastik
   uzayıp kısalmalı.

# --hint--

Key names are case-sensitive: `'ArrowUp'`, `'ArrowRight'`...

# --hint-tr--

Tuş adlarında büyük/küçük harf önemli: `'ArrowUp'`, `'ArrowRight'`... Ayrıca `Math.min` ile `Math.max`'ı karıştırma.

# --tests--

Up and Down should turn the aim by 0.03.
tr: Yukarı ve aşağı nişanı 0.03 döndürmeli.

```js
$.press('ArrowUp')
assert.closeTo(aim.angle, -0.63, 1e-9)
$.press('ArrowDown')
$.press('ArrowDown')
assert.closeTo(aim.angle, -0.57, 1e-9)
```

Right and Left should change the pull by 2, between 10 and `MAX_PULL`.
tr: Sağ ve sol çekişi 2 değiştirmeli; 10 ile `MAX_PULL` arasında.

```js
assert.strictEqual(MAX_PULL, 70)
$.press('ArrowRight')
assert.strictEqual(aim.pull, 52)
for (let i = 0; i < 20; i++) $.press('ArrowRight')
assert.strictEqual(aim.pull, 70)
for (let i = 0; i < 40; i++) $.press('ArrowLeft')
assert.strictEqual(aim.pull, 10)
```

Other keys should change nothing.
tr: Başka tuşlar hiçbir şeyi değiştirmemeli.

```js
$.press('a')
assert.deepEqual(aim, { angle: -0.6, pull: 50 })
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
  const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
  ctx.strokeStyle = '#451a03'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(SLING.x, SLING.y)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
