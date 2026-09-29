---
title: Which keys are down?
title_tr: Hangi tuşlar basılı?
skills: [game.input]
---

# --goal--

The arrow keys will steer the ship. We keep the keys held down in an object `keys`: `true` while a key is down, `false`
after it is released. Every frame the game can then ask "is left held?".

# --goal-tr--

Gemiyi ok tuşlarıyla süreceğiz. Hangi tuşların **basılı** olduğunu `keys` adlı bir nesnede tutacağız: basılınca
`true`, bırakılınca `false`. Böylece oyun her karede "sol ok basılı mı?" diye sorabilecek.

Klavye bir **olay** (event) bildirir: tuşa basılınca `keydown`, bırakılınca `keyup`. Kapıya zil takmak gibi: zil
çalınca verdiğin iş yapılır. Bu adımda ekran değişmez.

# --code--

```js
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the arrow function every time a key is pressed; `event.key` is its name,
  like `'ArrowLeft'`.
- `keys[event.key] = true` writes into the field with that name; `keyup` writes `false`.

# --meaning-tr--

- `const keys = {}` → boş nesne; basılı tuşlar içine yazılacak.
- `document.addEventListener('keydown', (event) => { ... })` → "bir tuşa basılınca bu fonksiyonu çalıştır".
  `(event) => { ... }` kısa yoldan yazılmış bir fonksiyon (**ok fonksiyonu**); `event` olayın bilgisi.
- `event.key` → basılan tuşun adı: `'ArrowLeft'` (sol ok), `'ArrowUp'` (yukarı ok), `' '` (boşluk)...
- `keys[event.key] = true` → köşeli parantez, adı değişkenden gelen alana yazar: `keys['ArrowLeft']` ile
  `keys.ArrowLeft` aynı şey.
- `'keyup'` → tuş bırakılınca o tuşa `false` yazar.

# --task--

1. Under `let ship` write `const keys = {}`.
2. Above `function drawShip() {` write the two listeners, followed by an empty line.

# --task-tr--

1. `let ship` satırının altına `const keys = {}` yaz.
2. `function drawShip() {` satırının **üstüne** iki olay dinleyicisini yaz; altlarında bir boş satır kalsın.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

Pressing and releasing a key should be recorded in `keys`.
tr: Tuşa basmak ve bırakmak `keys` içine yazılmalı.

```js
$.press('ArrowLeft')
assert.isTrue(keys.ArrowLeft)
$.release('ArrowLeft')
assert.isFalse(keys.ArrowLeft)
$.press('ArrowUp')
assert.isTrue(keys.ArrowUp)
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose

let ship
const keys = {}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
  const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  drawShip()
}

resetShip()
draw()
```
