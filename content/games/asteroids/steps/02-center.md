---
title: Where the ship is
title_tr: Gemi nerede?
skills: [game.state, game.physics]
---

# --goal--

The ship is an object: its position, the **angle** it faces and its velocity. `resetShip` puts it in the middle, facing
up. Angles in JavaScript are in **radians**: a full turn is `2 * Math.PI`.

# --goal-tr--

Gemiyi birkaç bilgiyle tek bir **nesne**de tutacağız: yeri (`x`, `y`), **baktığı açı** (`angle`) ve hızı (`vx`, `vy`).
`resetShip` (gemiyi sıfırla) onu ortaya, **yukarı bakar** hâlde koyacak. Bu adımda ekranda bir şey görünmez; gemi
önce bellekte doğuyor.

Bu oyunun farkı şu: gemi dört yöne değil **her açıya** bakabilir. JavaScript açıyı derece değil **radyan** ile ölçer:
`Math.PI` (π ≈ 3.14) yarım tur, `2 * Math.PI` tam tur.

# --code--

```js
let ship

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

resetShip()
```

# --meaning--

- The ship starts in the middle of the canvas (300, 225).
- Angle `0` points right; because `y` grows downwards, `Math.PI / 2` points down and `-Math.PI / 2` points up.
- `vx` and `vy` are its speed to the right and downwards, 0 for now.

# --meaning-tr--

- `let ship` → gemi; `resetShip` onu dolduracak.
- `canvas.width / 2`, `canvas.height / 2` → tuvalin ortası: (300, 225).
- `angle: -Math.PI / 2` → açılar şöyle: `0` **sağa** bakar. Tuvalde `y` aşağı doğru büyüdüğü için `Math.PI / 2`
  **aşağı**, `-Math.PI / 2` **yukarı** bakar. Çeyrek tur = `Math.PI / 2`.
- `vx: 0, vy: 0` → sağa ve aşağı doğru **hız**. Şimdilik gemi duruyor.
- `resetShip()` → en altta, `draw()`'dan önce çağrılır: önce gemi kurulur, sonra çizilir.

# --task--

1. Above `function draw() {` write `let ship` and `resetShip`, followed by an empty line.
2. Above the `draw()` call at the bottom write `resetShip()`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `let ship` satırını ve `resetShip` fonksiyonunu yaz; aralarında ve
   `draw`'dan önce birer boş satır kalsın.
2. En alttaki `draw()` satırının **üstüne** `resetShip()` yaz.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

The ship should start in the middle, still.
tr: Gemi ortada, hareketsiz başlamalı.

```js
assert.include(ship, { x: 300, y: 225, vx: 0, vy: 0 })
```

The ship should face up.
tr: Gemi yukarı bakmalı.

```js
assert.closeTo(ship.angle, -Math.PI / 2, 1e-9)
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let ship

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

resetShip()
draw()
```
