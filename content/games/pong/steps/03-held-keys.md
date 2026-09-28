---
title: Moving while a key is held
title_tr: Tuş basılıyken hareket
skills: [game.input, game.loop]
---

# --explanation--

In Snake, one key press meant one turn. Paddles are different: they move **as long as a key is held down**.

`keydown` is the wrong tool on its own. When you hold a key, the browser sends one `keydown`, pauses about half a
second, then repeats at the operating system's typing speed. Movement driven by that stutters and depends on the
player's keyboard settings.

The fix is to separate **events** from **state**:

1. The events only record which keys are down right now:
   ```js
   const keys = {}
   document.addEventListener('keydown', (e) => { keys[e.key] = true })
   document.addEventListener('keyup', (e) => { keys[e.key] = false })
   ```
2. The game loop reads that state every frame and moves smoothly:
   ```js
   if (keys.w) left.y -= PADDLE_SPEED
   ```

This also lets two players hold keys at the same time: `w`/`s` for the left paddle, the arrows for the right one.

Finally, paddles must stay on the court. **Clamping** keeps a number inside a range:

```js
Math.max(0, Math.min(canvas.height - PADDLE_H, left.y))
```

`Math.min` stops it going past the bottom, `Math.max` stops it going above the top.

# --explanation-tr--

**Bu adımda:** raketleri klavyeyle hareket ettireceğiz. Sol raket `W` (yukarı) ve `S` (aşağı), sağ raket ok
tuşlarıyla (↑ ↓) oynayacak; tuşu basılı tuttuğun sürece raket kayacak ve sahadan dışarı çıkmayacak.

**Olay (event) nedir?** Tarayıcı, bir tuşa basıldığında ya da tuş bırakıldığında sana haber verebilir. Bu
haberlere **olay** denir. `addEventListener` ile "şu olay olunca şunu yap" dersin:

```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
```

Parça parça:

- `'keydown'` → "bir tuşa basıldığında". Bırakıldığında ise `'keyup'` olayı gelir.
- `(event) => { ... }` → adı olmayan küçük bir fonksiyon (ok fonksiyonu, **arrow function**). Olay olunca
  tarayıcı onu çağırır ve olayın bilgilerini `event` adıyla içine verir. Bir fonksiyonun parantez içinde aldığı
  bu bilgiye **parametre** denir.
- `event.key` → basılan tuşun adı: `'w'`, `'s'`, `'ArrowUp'`, `'ArrowDown'` gibi.

**Neden sadece `keydown` yetmez?** Bir tuşu basılı tutunca tarayıcı bir `keydown` gönderir, yarım saniye kadar
bekler, sonra klavye ayarına göre tekrar tekrar gönderir. Raketi buna bağlarsak kesik kesik gider. Çözüm:
olaylar sadece **"şu an hangi tuşlar basılı?"** bilgisini not etsin, raketi ise her karede bu nota bakarak
kaydıralım.

**Not defteri: `keys`.** Boş bir nesneyle (`{}`) başlarız. Köşeli parantezle, adı bir değişkenin içinde olan alana
yazabiliriz: `keys[event.key] = true`, `w`'ye basıldıysa `keys.w = true` ile aynıdır. `true` "doğru/evet",
`false` "yanlış/hayır" demektir.

**`if` ile karar vermek.** `if (koşul) iş` → koşul doğruysa işi yap, değilse atla:

```js
if (keys.w) left.y -= PADDLE_SPEED   // W basılıysa sol raketi 6 piksel yukarı al
```

`-=` çıkarıp geri yazar (`left.y = left.y - 6`). `y` yukarı gidince küçülür, o yüzden yukarı = eksi.

**Sahada tutmak (clamp).** Raketin `y`'si 0'dan küçük (tepeden taşmış) ya da 400 − 80 = 320'den büyük (dipten
taşmış) olmamalı. Bunu yapan küçük bir fonksiyon yazarız:

```js
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
```

- `value, min, max` → fonksiyonun üç parametresi; çağırırken verilen sayılar bu adlara girer.
- `Math.min(a, b)` iki sayıdan küçüğünü, `Math.max(a, b)` büyüğünü verir. İç içe kullanınca sayı alt ve üst
  sınır arasında kalır: `clamp(350, 0, 320)` → 320, `clamp(-6, 0, 320)` → 0.
- `return` → "sonuç budur", fonksiyon bu değeri geri verir ve biter.

**Oyun döngüsü.** Hareket için ekranı saniyede yaklaşık 60 kez yeniden çizmemiz gerekir. Her karede: durumu
güncelle (`update`), çiz (`draw`), bir sonraki kareyi iste. `requestAnimationFrame(loop)` tarayıcıya "ekranı
yenilemeden hemen önce `loop`'u çağır" der. `loop` en sonda kendini yeniden istediği için bu sonsuza kadar sürer.

# --task--

1. Add `const PADDLE_SPEED = 6` and `const keys = {}`. On `keydown` set `keys[event.key] = true`, on `keyup` set it
   to `false`.
2. Write `function update()`: move `left` up/down by `PADDLE_SPEED` while `'w'`/`'s'` are held, and `right` while
   `'ArrowUp'`/`'ArrowDown'` are held. Then clamp both `y` values between `0` and `canvas.height - PADDLE_H`.
3. Write `function loop()` that calls `update()`, `draw()` and `requestAnimationFrame(loop)`, and start it instead of
   calling `draw()` once.

# --task-tr--

1. `const PADDLE_H = 80` satırının hemen altına raket hızını ekle:

   ```js
   const PADDLE_SPEED = 6
   ```

2. `let right = ...` satırının hemen altına basılı tuşları tutan boş nesneyi yaz:

   ```js
   const keys = {}
   ```

3. Bir boş satır bırak ve tuşa basılınca ve bırakılınca notu güncelleyen iki olay dinleyicisini ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   ```

4. Bir boş satır bırak ve sınırlama fonksiyonunu yaz:

   ```js
   function clamp(value, min, max) {
     return Math.max(min, Math.min(max, value))
   }
   ```

5. Onun altına (hâlâ `function draw()`'un **üstünde**) raketleri hareket ettiren `update()` fonksiyonunu yaz:

   ```js
   function update() {
     if (keys.w) left.y -= PADDLE_SPEED
     if (keys.s) left.y += PADDLE_SPEED
     if (keys.ArrowUp) right.y -= PADDLE_SPEED
     if (keys.ArrowDown) right.y += PADDLE_SPEED
     left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
     right.y = clamp(right.y, 0, canvas.height - PADDLE_H)
   }
   ```

   Son iki satır, raketin yeni `y`'sini 0 ile 320 arasına sıkıştırıp geri yazar.

6. En alttaki `draw()` satırını **sil** ve yerine oyun döngüsünü yaz:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra `W`/`S` ve ↑/↓ tuşlarını basılı tut: raketler akıcı
   kaymalı, kenarda durmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa tuş adlarının büyük/küçük
   harfine bak: `keys.w` küçük, `keys.ArrowUp` büyük A ve U ile.

# --tests--

`keys` should track which keys are held.
tr: `keys` hangi tuşların basılı olduğunu izlemeli.

```js
$.press('w')
assert.isTrue(keys.w)
$.release('w')
assert.isFalse(keys.w)
```

Holding W should move the left paddle up 6 pixels per frame, and stop when released.
tr: W basılı tutulunca sol raket karede 6 piksel yukarı gitmeli, bırakınca durmalı.

```js
$.press('w')
$.tick(10)
assert.strictEqual(left.y, 100)
$.release('w')
$.tick(10)
assert.strictEqual(left.y, 100)
```

Both paddles should move at the same time.
tr: İki raket aynı anda hareket edebilmeli.

```js
$.press('s')
$.press('ArrowUp')
$.tick(5)
assert.strictEqual(left.y, 190)
assert.strictEqual(right.y, 130)
```

Paddles should stay on the court.
tr: Raketler sahada kalmalı.

```js
$.press('s')
$.press('ArrowUp')
$.run(2)
assert.strictEqual(left.y, 320)
assert.strictEqual(right.y, 0)
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80
const PADDLE_SPEED = 6

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function update() {
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
