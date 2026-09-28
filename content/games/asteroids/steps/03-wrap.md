---
title: Wrapping around the screen
title_tr: Ekranın çevresinde dolaşmak
skills: [game.physics]
---

# --explanation--

In Asteroids there are no walls: fly off the right edge and you come back on the left, off the top and you reappear at
the bottom. The space is a loop, like the surface of a doughnut.

The tool for "go around in a loop" is the remainder operator `%`. `605 % 600` is `5`: past the right edge becomes near
the left. But there is a trap. In JavaScript, `%` keeps the **sign** of the left side: `-5 % 600` is `-5`, not `595`.
Flying off the **left** or **top** edge would produce negative positions and the ship would vanish.

The fix is a classic one-liner: add the size before taking the remainder a second time, so the result is always between
`0` and `size`:

```js
function wrap(value, size) {
  return ((value % size) + size) % size
}
```

Write it once as a function and use it for every moving thing: the ship now, bullets and asteroids soon.

# --explanation-tr--

**Bu adımda:** ekranın kenarlarını birbirine bağlayacağız. Gemi sağdan çıkınca soldan, yukarıdan çıkınca aşağıdan geri
gelecek. Çalıştırıp uçunca gemin artık hiç kaybolmayacak.

Asteroids'te duvar yoktur: uzay bir halka gibi kendi etrafında döner, tıpkı eski bir bilgisayar oyununda haritanın bir
ucundan çıkıp öbür ucundan girmek gibi.

**Kalan işlemi `%`.** `a % b`, "a'yı b'ye böl, **kalanı** ver" demektir. `605 % 600` sonucu `5`'tir: sağ kenarı 5
piksel geçen gemi, sol kenardan 5 piksel içeride olur. Saat de böyle çalışır: 13 saat, `13 % 12` = 1'dir.

**Tuzak:** JavaScript'te `%` soldaki sayının **işaretini** korur. `-5 % 600` sonucu `595` değil, `-5`'tir. Yani gemi
sol ya da üst kenardan çıkınca eksi bir konuma gider ve görünmez olur.

Çözüm klasik bir tek satırdır: kalanı al, boyutu ekle, bir kez daha kalanı al. Sonuç her zaman `0` ile boyut
arasında çıkar:

```js
function wrap(value, size) {
  return ((value % size) + size) % size
}
```

Örnek: `wrap(-5, 600)` → `-5 % 600` = `-5`, `+ 600` = `595`, `595 % 600` = `595`. Doğru!

Bunu parça parça okuyalım:

- `function wrap(value, size)` → parantez içindeki `value` ve `size` **parametredir**: fonksiyonu çağırırken
  verdiğin bilgilerin adları. `wrap(605, 600)` dediğinde içeride `value` 605, `size` 600 olur.
- `return ...` → "sonucu şu olarak geri ver". Fonksiyonu çağırdığın yerde bu sonuç kullanılır; örneğin
  `ship.x = wrap(...)` sonucu `ship.x`'e yazar.
- Parantezler matematikteki gibi önce yapılacak işi gösterir.

Bir kez fonksiyon olarak yazıp hareket eden her şeyde kullanacağız: şimdi gemide, yakında mermilerde ve kayalarda.

# --task--

1. Write `function wrap(value, size)` as above.
2. In `update()`, wrap the ship's new position: `ship.x = wrap(ship.x + ship.vx, canvas.width)`, and the same for `y`
   with `canvas.height`.

# --task-tr--

1. `const keys = {}` satırının altına bir satır boşluk bırakıp `wrap` fonksiyonunu yaz (üstteki yorum satırı
   isteğe bağlı):

   ```js
   // Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
   function wrap(value, size) {
     return ((value % size) + size) % size
   }
   ```

2. `update()` fonksiyonunun en sonundaki iki satırı değiştir. Gemi artık yeni konumunu `wrap`'ten geçirerek alsın:

   ```js
     ship.x = wrap(ship.x + ship.vx, canvas.width)   // ← değişti (eskiden ship.x += ship.vx)
     ship.y = wrap(ship.y + ship.vy, canvas.height)  // ← değişti (eskiden ship.y += ship.vy)
   }
   ```

   Yatay konum canvas'ın eniyle (600), dikey konum boyuyla (450) sarılır.

3. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve gemiyi bir kenara doğru uçur: öbür kenardan geri gelmeli.
   Alttaki kontrollerin hepsi yeşil olmalı. `wrap` kontrolü kırmızıysa parantezleri say: `((value % size) + size) % size`.

# --tests--

`wrap()` should always return a value from 0 up to the size.
tr: `wrap()` her zaman 0 ile boyut arasında bir değer döndürmeli.

```js
assert.strictEqual(wrap(605, 600), 5)
assert.strictEqual(wrap(-5, 600), 595)
assert.strictEqual(wrap(0, 600), 0)
assert.strictEqual(wrap(600, 600), 0)
assert.strictEqual(wrap(-1205, 600), 595)
assert.strictEqual(wrap(250, 600), 250)
```

Leaving through any edge should bring the ship back on the other side.
tr: Herhangi bir kenardan çıkmak gemiyi öbür yandan geri getirmeli.

```js
ship.y = 2
ship.vy = -5
ship.vx = 0
update()
assert.isAbove(ship.y, 440)
ship.x = 598
ship.vx = 5
update()
assert.isBelow(ship.x, 10)
ship.x = 1
ship.vx = -4
update()
assert.isAbove(ship.x, 590)
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose
const TURN = 0.07 // radians per frame
const THRUST = 0.12
const FRICTION = 0.99
const MAX_SPEED = 6

let ship
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.angle -= TURN
  if (keys.ArrowRight) ship.angle += TURN
  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * THRUST
    ship.vy += Math.sin(ship.angle) * THRUST
  }
  ship.vx *= FRICTION
  ship.vy *= FRICTION
  const speed = Math.hypot(ship.vx, ship.vy)
  if (speed > MAX_SPEED) {
    ship.vx *= MAX_SPEED / speed
    ship.vy *= MAX_SPEED / speed
  }
  ship.x = wrap(ship.x + ship.vx, canvas.width)
  ship.y = wrap(ship.y + ship.vy, canvas.height)
}

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

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

resetShip()
requestAnimationFrame(loop)
```
