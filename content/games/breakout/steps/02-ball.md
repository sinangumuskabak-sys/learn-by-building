---
title: A round ball and three walls
title_tr: Yuvarlak top ve üç duvar
skills: [game.physics, game.collision]
---

# --explanation--

This time the ball is a **circle**, so its position is its **center**, and its edges are one radius away:

```
left edge = ball.x - BALL_R        right edge  = ball.x + BALL_R
top edge  = ball.y - BALL_R        bottom edge = ball.y + BALL_R
```

Mixing up "position is the corner" (rectangles) and "position is the center" (circles) is behind many collision bugs,
so always ask which one you are dealing with.

The ball bounces off the left, right and top walls by flipping the matching velocity, and is put back inside the
walls so it cannot get stuck. For the top wall, instead of flipping, force the velocity to point **down** with
`Math.abs(ball.vy)`. That can never send it the wrong way, even if it is still inside the wall on the next frame.

The bottom is open. For now, a ball that falls out simply starts again from the middle; losing lives comes later.
Starting again goes in a function, `resetBall()`, because more code will need it.

# --explanation-tr--

**Bu adımda:** beyaz, yuvarlak bir top ekleyeceğiz. Top ortadan çapraz yukarı fırlayacak, sol, sağ ve üst
duvarlardan sekecek. Alttan düşerse ortadan yeniden başlayacak. (Raketten sekmeyi bir sonraki adımda ekleyeceğiz,
şimdilik raketin içinden geçer.)

**Hareket: konum + hız.** Top her karede biraz yer değiştirir. Bunun için iki çift sayı tutarız:

- **konum**: `ball.x`, `ball.y` (top nerede?)
- **hız**: `ball.vx`, `ball.vy` (her karede x ve y ne kadar değişiyor?)

```js
ball.x += ball.vx   // += "üstüne ekle": x'e yatay hızı ekle
ball.y += ball.vy   // y'ye dikey hızı ekle
```

`vx: 3, vy: -4` her karede 3 piksel sağa, 4 piksel **yukarı** demektir (`y` aşağı doğru büyüdüğü için eksi
yukarıdır).

**Top bir daire: konumu merkezidir.** Raket bir dikdörtgendi; onun `x`'i **sol kenarıydı**. Topun `x`, `y`'si ise
**merkezidir**, kenarları merkezden bir yarıçap (`BALL_R`) uzaktadır:

```
sol kenar = ball.x - BALL_R        sağ kenar = ball.x + BALL_R
üst kenar = ball.y - BALL_R        alt kenar = ball.y + BALL_R
```

"Konum köşe mi, merkez mi?" karışıklığı pek çok çarpışma hatasının kaynağıdır; her seferinde hangisiyle
uğraştığını sor.

**Daire çizmek.** Canvas'ta hazır "daire boya" komutu yok; önce şekli tarif eder, sonra boyarız:

```js
ctx.beginPath()                                   // yeni bir şekle başla
ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)   // merkez, yarıçap, tam tur
ctx.fill()                                        // boya
```

Açılar radyanla verilir; `0`'dan `Math.PI * 2`'ye (2π) kadar "tam bir tur" demektir.

**Karar vermek: `if`.** `if (koşul) { ... }` "eğer koşul doğruysa süslü parantezin içini yap, değilse atla" demektir.
Koşullarda `<` "küçük mü?", `>` "büyük mü?", `||` ise "**veya**" demektir.

**Duvardan sekmek.**

- **Sol/sağ:** sol kenar 0'ın soluna **veya** sağ kenar canvas'ın sağına geçtiyse yatay hızı ters çevir:
  `ball.vx = -ball.vx` (3 ise -3, -3 ise 3 olur). Sonra topu `clamp` ile duvarların içine geri koy ki duvarda
  sıkışıp kalmasın.
- **Üst:** burada ters çevirmek yerine hızı **aşağıyı gösterecek** şekilde zorlarız: `Math.abs(sayı)` sayının
  eksisini atar (`Math.abs(-4)` → `4`). Böylece top bir sonraki karede hâlâ duvarın içinde olsa bile yanlış yöne
  gidemez.
- **Alt:** açık. Top tamamen alttan çıkınca (üst kenarı bile canvas'ın dibinden aşağıdaysa) şimdilik ortadan yeniden
  başlar. Can kaybetmek sonra gelecek.

**Yeniden başlatmayı bir fonksiyona koyalım.** Topu başa koyan satırı `resetBall()` (topu sıfırla) fonksiyonuna
yazarız, çünkü onu hem oyunun başında hem top düşünce, ileride başka yerlerde de çağıracağız.

```js
let ball            // şimdilik boş (değeri yok)

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}
```

`let ball` değer verilmeden tanımlanır; değerini `resetBall()` verir. Değişken en üstte tanımlı olmalı ki bütün
fonksiyonlar onu görebilsin.

# --task--

1. Add `const BALL_R = 7`, `let ball`, and `function resetBall()` that sets `ball = { x: 240, y: 200, vx: 3, vy: -4 }`.
   Call it once at startup.
2. Write `function update()` that moves the ball by its velocity, then:
   - left/right: if an edge crosses a wall, flip `vx` and clamp `ball.x` between `BALL_R` and
     `canvas.width - BALL_R`;
   - top: if `ball.y - BALL_R < 0`, set `vy` to `Math.abs(ball.vy)` and `ball.y` to `BALL_R`;
   - bottom: if the ball is completely below the canvas (`ball.y - BALL_R > canvas.height`), call `resetBall()`.
3. Call `update()` in the loop before drawing, and draw the ball as a `'#f8fafc'` circle.

# --task-tr--

1. `const PADDLE_Y = 370` satırının altına topun yarıçapını ekle:

   ```js
   const BALL_R = 7
   ```

2. `let paddle = { x: 200 }` satırının altına:

   ```js
   let ball
   ```

3. `clamp()` fonksiyonunun kapanış `}`'inden sonra bir boş satır bırak ve topu başa koyan fonksiyonu yaz:

   ```js
   function resetBall() {
     ball = { x: 240, y: 200, vx: 3, vy: -4 }
   }
   ```

4. `canvas.addEventListener('pointermove', ...)` kodunun kapanış `})`'inden sonra, `function draw()`'dan **önce**,
   topu hareket ettiren fonksiyonu yaz:

   ```js
   function update() {
     ball.x += ball.vx
     ball.y += ball.vy

     if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
       ball.vx = -ball.vx
       ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
     }
     if (ball.y - BALL_R < 0) {
       ball.vy = Math.abs(ball.vy)
       ball.y = BALL_R
     }
     if (ball.y - BALL_R > canvas.height) resetBall()
   }
   ```

   Üç `if` sırayla: yan duvarlar, tavan, alttan düşme. Son `if` tek komutluk olduğu için `{ }` gerekmez.

5. `draw()` fonksiyonunda, raketi çizen `ctx.fillRect(paddle.x, ...)` satırının altına topu çizen satırları ekle:

   ```js
     ctx.fillStyle = '#f8fafc'
     ctx.beginPath()
     ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
     ctx.fill()
   ```

6. `loop()` fonksiyonunda `draw()`'dan **önce** `update()`'i çağır:

   ```js
   function loop() {
     update()   // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** topu ilk kez yerleştiren çağrıyı ekle:

   ```js
   resetBall()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Top ortadan çıkıp duvarlardan sekmeli, alttan düşünce ortadan yeniden
   başlamalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa: `resetBall()` çağrısını unutmadığından
   ve `update()`'te `<` ve `>` işaretlerinin yönünden emin ol.

# --tests--

The ball should start in the middle and move by its velocity.
tr: Top ortada başlamalı ve hızı kadar hareket etmeli.

```js
assert.strictEqual(BALL_R, 7)
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
$.tick()
assert.include(ball, { x: 243, y: 196 })
assert.deepEqual($.arcs(), [{ x: 243, y: 196, r: 7, color: '#f8fafc' }])
```

The ball should bounce off the left and right walls.
tr: Top sol ve sağ duvarlardan sekmeli.

```js
ball = { x: 9, y: 200, vx: -3, vy: -4 }
update()
assert.strictEqual(ball.vx, 3)
assert.strictEqual(ball.x, 7)
ball = { x: 471, y: 200, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vx, -3)
assert.strictEqual(ball.x, 473)
```

The ball should bounce off the top wall.
tr: Top üst duvardan sekmeli.

```js
ball = { x: 100, y: 9, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vy, 4)
assert.strictEqual(ball.y, 7)
```

A ball that falls out of the bottom should start again from the middle.
tr: Alttan düşen top ortadan yeniden başlamalı.

```js
ball = { x: 100, y: 405, vx: 3, vy: 4 }
update()
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370
const BALL_R = 7

let paddle = { x: 200 }
let ball

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function update() {
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
    ball.vx = -ball.vx
    ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
  }
  if (ball.y - BALL_R < 0) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }
  if (ball.y - BALL_R > canvas.height) resetBall()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

resetBall()
requestAnimationFrame(loop)
```
