---
title: Turning and walking
title_tr: Dönmek ve yürümek
skills: [game.input, game.physics]
---

# --explanation--

In a first-person game the arrow keys do not move you up, down, left and right on the map. **Left and right turn**
you, and **up and down walk** forwards and backwards, in whatever direction you are facing:

```js
player.angle += TURN                          // turn a little
player.x += Math.cos(player.angle) * MOVE     // walk along the angle
player.y += Math.sin(player.angle) * MOVE
```

This is why `cos` and `sin` matter: they split one step "forwards" into its across and down parts, for any angle.
Walking backwards is the same step with the opposite sign.

Movement is smooth, so keys are **held**, and the same `keys` object also takes the WASD keys, which many players
prefer. On a phone, holding the left third of the screen turns left, the right third turns right and the middle walks.

For now nothing stops you: you can walk straight through the walls. That comes next.

# --explanation-tr--

**Bu adımda:** haritada dönüp yürüyeceğiz. Sol/Sağ ok sarı oyuncuyu döndürecek, Yukarı/Aşağı ok baktığı yöne ileri
geri yürütecek. Şimdilik duvarların içinden geçebileceksin; onu bir sonraki adımda düzelteceğiz.

**Birinci şahıs kontrolü.** Birinci şahıs oyunlarda oklar seni haritada yukarı-aşağı-sola-sağa götürmez. **Sol ve
sağ seni döndürür**, **yukarı ve aşağı** ise hangi yöne bakıyorsan o yöne **ileri ve geri yürütür**:

```js
player.angle += TURN                          // biraz dön
player.x += Math.cos(player.angle) * MOVE     // baktığın yöne yürü
player.y += Math.sin(player.angle) * MOVE
```

`+=` "üstüne ekle", `-=` "çıkar" demektir. `cos` ve `sin` bu yüzden önemli: bir "ileri" adımını, her açı için yana
ve aşağı parçalarına ayırırlar. Geri yürümek aynı adımın eksi işaretlisidir.

**Tuşlar basılı tutulur.** Hareket akıcı olsun diye hangi tuşların **şu an basılı** olduğunu bir nesnede tutarız:
`keys`. Tuşa basılınca (`keydown` olayı) `keys[tuş] = true`, bırakılınca (`keyup`) `false` yaparız. Her karede
`update()` bu nesneye bakar. Aynı nesne WASD tuşlarını da alır (`w` ileri, `s` geri, `a` sol, `d` sağ).

**Yeni parçalar:**

- **Olay (event):** `document.addEventListener('keydown', (event) => { ... })` "bir tuşa basılınca bu kodu çalıştır"
  der. `event.key` basılan tuşun adıdır: `'ArrowUp'`, `'a'` gibi.
- `keys[event.key] = true`: köşeli parantezle, adı bir değişkende duran alana yazmak. Tuş `'w'` ise bu
  `keys.w = true` ile aynıdır. `true`/`false` evet/hayır değerleridir.
- `event.key.startsWith('Arrow')`: tuşun adı `'Arrow'` ile mi başlıyor? Oklarda `event.preventDefault()` tarayıcının
  sayfayı kaydırmasını engeller.
- **`if (koşul) ...`**: koşul doğruysa yap. `||` "veya": `keys.ArrowLeft || keys.a` iki tuştan biri basılıysa doğru.
  `!==` "eşit değil".
- `forward` bir sayıdır: ileri tuşu `1`, geri tuşu `-1`, hiçbiri ya da ikisi birden `0` verir. Adımı bununla
  çarparız; böylece ileri ve geri tek satırda olur.
- **Parametreli fonksiyon:** `function move(dx, dy)` çağrılırken verilen iki sayıyı `dx` ve `dy` adıyla kullanır.

**Telefonda:** ekranın sol üçte birini basılı tutmak sola döndürür, sağ üçte biri sağa, ortası yürütür. Dokunulan
yerin canvas'taki oranını (`0` sol kenar, `1` sağ kenar) 3 ile çarparız: 1'den küçükse sol, 2'den küçükse orta,
değilse sağ. `pointerdown` parmak (ya da fare) değince, `pointerup` kalkınca, `pointercancel` dokunuş kesilince
gelir.

# --task--

1. Add `MOVE = 0.05` (tiles per frame), `TURN = 0.04` (radians per frame) and a `keys` object filled by `keydown` and
   `keyup` (`preventDefault()` for arrow keys).
2. Write `move(dx, dy)` that adds to the player's position, and `update()`: `ArrowLeft` or `a` turns by `-TURN`,
   `ArrowRight` or `d` by `TURN`; `ArrowUp` or `w` walks forwards and `ArrowDown` or `s` backwards by `MOVE` along the
   angle. Call it every frame.
3. On `pointerdown` on the canvas, hold `ArrowLeft`, `ArrowUp` or `ArrowRight` depending on which third of the canvas
   was touched; release all three on `pointerup` and `pointercancel`.

# --task-tr--

1. `const MINI = 24 ...` satırının **üstüne** iki sabit ekle:

   ```js
   const MOVE = 0.05 // tiles per frame
   const TURN = 0.04 // radians per frame
   ```

2. `let player` satırının altına basılı tuşları tutacak boş nesneyi ekle:

   ```js
   const keys = {}
   ```

3. `reset()` fonksiyonunun kapanış `}`'inin altına bir satır boşluk bırakıp şunları yaz:

   ```js
   // For now nothing stops the player.
   function move(dx, dy) {
     player.x += dx
     player.y += dy
   }

   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key.startsWith('Arrow')) event.preventDefault()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   ```

4. Altına dokunma kodunu yaz:

   ```js
   // Touch: hold the left third to turn left, the right third to turn right, the middle to walk.
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const third = ((event.clientX - rect.left) / rect.width) * 3
     keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
   })
   function stopTouch() {
     keys.ArrowLeft = false
     keys.ArrowUp = false
     keys.ArrowRight = false
   }
   canvas.addEventListener('pointerup', stopTouch)
   canvas.addEventListener('pointercancel', stopTouch)
   ```

   `getBoundingClientRect()` canvas'ın ekrandaki yerini ve enini verir; `event.clientX` dokunuşun ekrandaki x'idir.

5. Altına her karede tuşlara bakan `update()` fonksiyonunu yaz:

   ```js
   function update() {
     if (keys.ArrowLeft || keys.a) player.angle -= TURN
     if (keys.ArrowRight || keys.d) player.angle += TURN
     const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
     if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
   }
   ```

6. En alttaki `loop()` fonksiyonunda `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla: oklarla (ya da WASD ile) dönüp yürüyebilmelisin. Alttaki
   kontrollerin hepsi yeşil olmalı. Oyuncu durmadan kayıyorsa `keyup` kısmını kontrol et.

# --tests--

Up should walk forwards along the angle, down backwards.
tr: Yukarı açı boyunca ileri, aşağı geri yürütmeli.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(player.x, 2, 1e-9)
assert.closeTo(player.y, 1.5, 1e-9)
$.release('ArrowUp')
$.press('s')
$.tick(4)
assert.closeTo(player.x, 1.8, 1e-9)
```

Left and right should turn, and walking should follow the new angle.
tr: Sol ve sağ döndürmeli ve yürüme yeni açıyı izlemeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(player.angle, 0.4, 1e-9)
$.release('ArrowRight')
$.press('ArrowUp')
$.tick(10)
assert.closeTo(player.x, 1.5 + Math.cos(0.4) * 0.5, 1e-9)
assert.closeTo(player.y, 1.5 + Math.sin(0.4) * 0.5, 1e-9)
$.release('ArrowUp')
$.press('a')
$.tick(20)
assert.closeTo(player.angle, -0.4, 1e-9)
```

Touching the thirds of the screen should turn and walk.
tr: Ekranın üçte birlerine dokunmak döndürmeli ve yürütmeli.

```js
$.pointerDown(400, 100)
$.tick(5)
assert.closeTo(player.angle, 0.2, 1e-9)
$.pointerUp(400, 100)
$.pointerDown(240, 100)
$.tick(5)
assert.isAbove(player.x, 1.7)
$.pointerUp(240, 100)
$.tick(5)
const x = player.x
$.tick(5)
assert.strictEqual(player.x, x, 'letting go stops')
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MOVE = 0.05 // tiles per frame
const TURN = 0.04 // radians per frame
const MINI = 24 // map pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

// For now nothing stops the player.
function move(dx, dy) {
  player.x += dx
  player.y += dy
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle to walk.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The map, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
