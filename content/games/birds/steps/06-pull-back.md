---
title: Pull the bird back
title_tr: Kuşu geri çek
skills: [game.canvas, game.physics]
---

# --goal--

A sling is pulled back, away from the aim: if you aim up and right, the bird sits down and left of the sling.
`Math.cos` and `Math.sin` turn the angle into a sideways and an up-down share.

# --goal-tr--

Gerçek bir sapanda kuşu **nişanın tersine** çekersin: sağa ve yukarı nişan alıyorsan kuş sapanın **sol altında**
durur. Ne kadar çok çekersen o kadar geride.

Bir açının yönünde yürümek için iki yardımcımız var: `Math.cos(açı)` yolun **yatay** payını, `Math.sin(açı)`
**dikey** payını verir (ikisi de −1 ile 1 arası). Açı yönünde **ileri** gitmek için bunları ekleriz, **geri**
gitmek için çıkarırız.

# --code--

```js
const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
ctx.fillStyle = MATERIALS.bird.color
ctx.beginPath()
ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
```

# --meaning--

- `Math.cos(angle)` is how much of a step along the angle goes sideways, `Math.sin(angle)` how much goes down.
- Multiplying by `aim.pull` makes the step that long; subtracting goes **backwards** from the sling.
- `* 0.5` only draws it at half size, so a full pull of 70 does not leave the bird far behind the sling.

# --meaning-tr--

- `Math.cos(aim.angle)` → açı yönündeki bir adımın ne kadarı **yana** gider. Açı 0 (düz sağ) ise 1: hepsi.
- `Math.sin(aim.angle)` → ne kadarı **aşağı** gider. Açı eksi (yukarı) olduğu için bu sayı eksidir.
- `* aim.pull` → adımı çekiş kadar uzatır.
- `SLING.x - ...` ve `SLING.y - ...` → **çıkarma**, sapandan **geriye** gitmek demek. Nişan sağ-yukarıysa kuş
  sol-aşağıda çizilir.
- `* 0.5` → yalnız çizimi yarıya küçültür: çekiş 70'e kadar çıkabilir, ama 70 piksel geride çizilen kuş sapandan
  kopuk görünürdü.
- `ctx.arc(bx, by, ...)` → kuş artık sapanın tepesine değil, geri çekildiği yere çizilir.
- `const` → `bx` ve `by` yalnız bu çizim için hesaplanan, fonksiyonun içinde yaşayan geçici adlar.

# --task--

In `draw`, write the `bx` and `by` lines above `ctx.fillStyle = MATERIALS.bird.color`, and change the `arc` to use
`bx, by`.

# --task-tr--

1. `draw` içinde `ctx.fillStyle = MATERIALS.bird.color` satırının **üstüne** `bx` ve `by` satırlarını yaz.
2. `ctx.arc(SLING.x, SLING.y, ...)` satırında `SLING.x, SLING.y` yerine `bx, by` yaz.
3. **Çalıştır**: kuş sapanın sol altına kaymalı.

# --predict--

The aim points up and to the right. Where will the bird be drawn?
- [ ] Up and to the right of the sling
- [x] Down and to the left of the sling
  We subtract, so we go backwards from the aim, like a real sling.
- [ ] Exactly on top of the sling

# --predict-tr--

Nişan sağa ve yukarı bakıyor. Kuş nereye çizilecek?
- [ ] Sapanın sağ üstüne
- [x] Sapanın sol altına
  Çıkarıyoruz; yani nişanın tersine, geriye gidiyoruz. Gerçek bir sapan gibi.
- [ ] Tam sapanın tepesine

# --hint--

If the bird is on the wrong side, check the two `-` signs after `SLING.x` and `SLING.y`.

# --hint-tr--

Kuş yanlış taraftaysa `SLING.x` ve `SLING.y`'den sonraki iki `-` işaretini kontrol et.

# --try--

In `reset`, try `angle: 0` and then `angle: -1.2` and run: the bird moves around the sling. Put `-0.6` back.

# --try-tr--

`reset` içinde önce `angle: 0`, sonra `angle: -1.2` dene ve çalıştır: kuş sapanın çevresinde yer değiştirir. Sonra `-0.6`'ya geri al.

# --tests--

The bird should sit back in the sling, opposite to the aim.
tr: Kuş sapanda, nişanın tersine geride durmalı.

```js
$.tick()
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, 90 - Math.cos(-0.6) * 25, 1e-9, 'the bird sits back, away from the aim')
assert.closeTo(b.y, 220 - Math.sin(-0.6) * 25, 1e-9)
assert.strictEqual(b.r, 10)
```

A longer pull should draw the bird further back.
tr: Daha uzun bir çekiş kuşu daha geride çizmeli.

```js
aim = { angle: 0, pull: 70 }
$.tick()
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, 55, 1e-9, 'pulled 70 to the left: half of that on screen')
assert.closeTo(b.y, 220, 1e-9)
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
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

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
