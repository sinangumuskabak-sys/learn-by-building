---
title: Flap
title_tr: Kanat çırp
skills: [game.input, game.physics]
---

# --explanation--

A flap does not push the bird up by some pixels. It **sets the velocity** to a fixed upward speed:

```js
bird.vy = FLAP   // FLAP = -8: negative means up, because y grows downwards
```

Gravity then takes over as usual: `-8, -7.5, -7, ...` The bird rises fast, slows down, stops for a moment at the top
and falls again. That smooth arc comes for free from the two lines you wrote in the last step. You never have to
program "go up, then slow down".

Why *set* instead of *add*? If a flap added `-8`, flapping while falling fast would barely help, and flapping twice
would launch the bird into space. Setting it makes every flap feel the same, which is what makes the game fair.

Players will flap with Space, the Up arrow, or by clicking/tapping the game. Put the flap in one function and call it
from every input. One behavior, many triggers.

# --explanation-tr--

**Bu adımda:** kuşu uçuracağız. Boşluk tuşuna, Yukarı ok tuşuna basınca ya da oyuna tıklayınca kuş yukarı
sıçrayacak, sonra yerçekimiyle yavaşlayıp yine düşecek.

**Kanat çırpmak hızı ayarlar.** Kanat çırpış kuşu birkaç piksel yukarı itmez; hızını sabit bir **yukarı** hıza
**ayarlar**:

```js
bird.vy = FLAP   // FLAP = -8
```

Neden eksi? Çünkü canvas'ta `y` aşağı doğru büyür; yukarı gitmek için `y` **küçülmeli**, yani hız eksi olmalı.

Burada `=` işareti "eşittir" değil, "**içine koy**" demektir: `bird.vy`'nin eski değeri ne olursa olsun, artık
`-8` olur. (Geçen adımdaki `+=` ise "üstüne ekle" idi.)

Sonrasını yerçekimi halleder: hız her karede 0,5 artar: `-8, -7.5, -7, ...` Kuş hızla yükselir, yavaşlar, tepede
bir an durur ve yine düşer. Bu güzel yay geçen adımda yazdığın iki satırdan kendiliğinden çıkıyor.

Neden eklemek değil de ayarlamak? Eğer çırpış hıza `-8` **ekleseydi**, hızla düşerken çırpmak pek işe yaramazdı,
art arda iki kez çırpmak ise kuşu uzaya fırlatırdı. Ayarlamak her çırpışı aynı hissettirir; oyunu adil yapan budur.

**Olaylar (events): "şu olunca şunu yap".** Tarayıcı, bir tuşa basıldığında ya da ekrana tıklandığında bir **olay**
yayınlar. Biz de o olayı dinleyip ne yapılacağını söyleriz:

```js
canvas.addEventListener('pointerdown', flap)
```

- `addEventListener` → "bir olay dinleyicisi ekle", yani "şu olunca haber ver".
- `'pointerdown'` → olayın adı: canvas'a fareyle tıklanması ya da parmakla dokunulması.
- `flap` → o olay olunca çalışacak fonksiyon. Parantezsiz yazılır: "şimdi çalıştır" değil, "olunca sen
  çalıştır" diyoruz.

Tuşlar için olay `'keydown'` (bir tuşa basıldı) ve onu sadece canvas'ı değil bütün sayfayı (`document`) dinleriz:

```js
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
```

Parça parça:

- `(event) => { ... }` → adı olmayan, oracıkta yazılmış kısa bir fonksiyon (**ok fonksiyonu**, arrow function).
  Tarayıcı onu çağırırken içine olayla ilgili bilgileri `event` adıyla verir. Parantez içindeki bu ada
  **parametre** denir.
- `event.key` → basılan tuşun adı. Boşluk tuşu için `' '` (tırnak içinde bir boşluk), Yukarı ok için `'ArrowUp'`.
- `if (koşul) komut` → "**eğer** koşul doğruysa komutu yap, değilse atla".
- `===` → "birbirine eşit mi?" diye sorar. (Tek `=` "içine koy" demekti; soru sormak için üç eşittir kullanılır.)
- `||` → "**veya**". Solundaki ya da sağındaki doğruysa bütün koşul doğru olur.

Yani: "bir tuşa basıldığında, eğer basılan tuş Boşluk veya Yukarı ok ise `flap()`'i çalıştır."

Çırpma işini tek bir `flap()` fonksiyonuna koyup her girişten onu çağırıyoruz: bir davranış, birçok tetikleyici.
Böylece çırpmayı değiştirmek istediğinde tek bir yeri değiştirirsin.

# --task--

1. Add `const FLAP = -8`.
2. Write `function flap()` that sets `bird.vy` to `FLAP`.
3. Call `flap()` on `keydown` when the key is `' '` (Space) or `'ArrowUp'`, and on `pointerdown` on the canvas.

# --task-tr--

1. `const GRAVITY = 0.5 ...` satırının hemen altına kanat çırpma hızını ekle:

   ```js
   const FLAP = -8 // the bird's speed right after a flap (negative = up)
   ```

2. `let bird = ...` satırının altına bir boş satır bırak ve `flap()` fonksiyonunu yaz:

   ```js
   function flap() {
     bird.vy = FLAP
   }
   ```

3. `flap()` fonksiyonunun kapanış `}`'inden sonra, `function update()`'ten **önce**, girişleri dinleyen satırları
   ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === ' ' || event.key === 'ArrowUp') flap()
   })
   canvas.addEventListener('pointerdown', flap)
   ```

   Parantezleri say: ilk komut `})` ile biter.

4. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla, sonra Boşluk'a bas: kuş yukarı
   sıçramalı, sonra yeniden düşmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa: `' '` tırnaklarının
   arasında tam bir boşluk olduğundan ve `'ArrowUp'`'ın büyük harflerinden emin ol.

# --tests--

`flap()` should set the bird's velocity to `FLAP` (-8), even while falling fast.
tr: `flap()` kuşun hızını, hızla düşerken bile `FLAP` (-8) yapmalı.

```js
assert.strictEqual(FLAP, -8)
bird.vy = 12
flap()
assert.strictEqual(bird.vy, -8)
```

Space and the Up arrow should flap.
tr: Boşluk ve Yukarı ok kanat çırpmalı.

```js
bird.vy = 5
$.press(' ')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowUp')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowDown')
assert.strictEqual(bird.vy, 5)
```

Clicking or tapping the game should flap.
tr: Oyuna tıklamak ya da dokunmak kanat çırpmalı.

```js
bird.vy = 5
$.click(200, 300)
assert.strictEqual(bird.vy, -8)
```

After a flap the bird should rise, then fall again.
tr: Kanat çırptıktan sonra kuş yükselmeli, sonra yeniden düşmeli.

```js
$.tick(5)
const before = bird.y
flap()
$.tick(8)
assert.isBelow(bird.y, before, 'the bird should be higher after flapping')
$.tick(30)
assert.isAbove(bird.vy, 0, 'gravity should win again')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function flap() {
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
