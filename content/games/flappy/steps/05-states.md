---
title: Ready, playing, over
title_tr: Hazır, oyunda, bitti
skills: [game.state]
---

# --explanation--

Right now the bird starts falling the moment the page loads, and nothing happens when it hits the ground. A real game
has **phases**, and the same input means different things in each:

| state | what happens | a flap... |
|---|---|---|
| `'ready'` | the bird waits in the middle | starts the game |
| `'playing'` | gravity, pipes, score | flaps |
| `'over'` | everything is frozen | (later: restarts) |

Instead of a pile of booleans (`started`, `gameOver`, `paused`...) that can contradict each other, keep **one**
variable that is always exactly one of these values. This is called a **state machine**, and it is one of the most
useful patterns you will learn: menus, enemies, network requests and checkout pages are all state machines.

```js
let state = 'ready'
function update() {
  if (state !== 'playing') return   // nothing moves unless we are playing
  ...
}
```

The ground is at `canvas.height`. The bird touches it when its *bottom edge*, `bird.y + bird.r`, reaches that line.

# --explanation-tr--

**Bu adımda:** oyuna üç aşama ekleyeceğiz: başta kuş ortada bekleyecek ve ekranda `Press Space to start` yazacak;
ilk çırpışta oyun başlayacak; kuş yere ya da tavana değince her şey donacak ve `Game Over` yazısı çıkacak.

**Şu anki sorun.** Sayfa açılır açılmaz kuş düşmeye başlıyor ve yere çarpınca hiçbir şey olmuyor. Gerçek bir oyunun
**aşamaları** vardır ve aynı tuş her aşamada başka bir anlama gelir:

| durum | ne olur | bir çırpış... |
|---|---|---|
| `'ready'` (hazır) | kuş ortada bekler | oyunu başlatır |
| `'playing'` (oyunda) | yerçekimi, borular, skor | kanat çırpar |
| `'over'` (bitti) | her şey donar | (sonra: yeniden başlatır) |

Bunun için "başladı mı?", "bitti mi?" gibi birbiriyle çelişebilecek bir sürü değişken yerine, her an bu üç
değerden **tam olarak birini** tutan **tek** bir değişken kullanırız:

```js
let state = 'ready' // 'ready', 'playing' or 'over'
```

Buna **durum makinesi** (state machine) denir. Çok işe yarayan bir fikirdir: menüler, düşmanlar, bir alışveriş
sitesinin ödeme sayfası hep böyle çalışır.

**`return`: "burada dur, fonksiyondan çık".** Bir fonksiyonun içinde `return`'e gelindiğinde fonksiyonun geri
kalanı çalışmaz:

```js
function update() {
  if (state !== 'playing') return   // oyunda değilsek hiçbir şey hareket etmesin
  ...
}
```

`!==` "eşit **değil** mi?" diye sorar (`===`'in tersi). Yani: "durum `'playing'` değilse hemen çık."

**Yere değdi mi?** Zemin, canvas'ın en alt çizgisi, yani `y = canvas.height` (600). `bird.y` dairenin
**merkezidir**; kuşun alt kenarı merkezden bir yarıçap aşağıda: `bird.y + bird.r`. Üst kenarı da `bird.y - bird.r`.

```js
const hitGround = bird.y + bird.r >= canvas.height
const hitSky = bird.y - bird.r <= 0
if (hitGround || hitSky) state = 'over'
```

- `>=` "büyük veya eşit mi?", `<=` "küçük veya eşit mi?" diye sorar.
- Böyle bir sorunun cevabı bir sayı değil, **doğru** (`true`) ya da **yanlış** (`false`)'tur. Cevabı bir ada
  koyabiliriz: `hitGround` (yere çarptı) ve `hitSky` (gökyüzüne çarptı). Kod böyle daha kolay okunur.
- Bunlar `update()`'in içinde yazılan sabitlerdir; her karede yeniden hesaplanırlar.

**Ekrana yazı yazmak.** Fırçayla yazı da boyanabilir:

```js
ctx.font = 'bold 36px sans-serif'   // yazı tipi: kalın, 36 piksel
ctx.textAlign = 'center'            // verilen noktayı yazının ortası say
ctx.fillText('Game Over', 200, 300) // yazıyı (200, 300) noktasına boya
```

`canvas.width / 2` canvas'ın eninin yarısı, yani yatayda tam orta (`/` bölme işaretidir).

**Süslü parantezli `if`.** Koşul doğruysa birden fazla satır çalışacaksa onları `{ }` içine alırız:

```js
if (state === 'ready') {
  // bu satırların hepsi sadece durum 'ready' iken çalışır
}
```

# --task--

1. Add `let state = 'ready'`.
2. In `flap()`: if the state is `'over'`, do nothing. Otherwise set the state to `'playing'` and flap.
3. In `update()`: return right away unless the state is `'playing'`. After moving, if the bird's bottom edge
   (`bird.y + bird.r`) reaches `canvas.height`, or its top edge (`bird.y - bird.r`) reaches `0`, set the state to
   `'over'`.
4. In `draw()`, after the bird, in white centered text: show `Press Space to start` while `'ready'`, and `Game Over`
   when `'over'`.

# --task-tr--

1. `let bird = ...` satırının hemen altına durum değişkenini ekle:

   ```js
   let state = 'ready' // 'ready', 'playing' or 'over'
   ```

2. `flap()` fonksiyonunu şöyle değiştir:

   ```js
   function flap() {
     if (state === 'over') return   // ← yeni
     state = 'playing'              // ← yeni
     bird.vy = FLAP
   }
   ```

   Oyun bittiyse çırpış hiçbir şey yapmaz; değilse oyunu başlatır (ya da sürdürür) ve kuşu sıçratır.

3. `update()` fonksiyonunu şöyle değiştir:

   ```js
   function update() {
     if (state !== 'playing') return   // ← yeni
     bird.vy += GRAVITY
     bird.y += bird.vy

     const hitGround = bird.y + bird.r >= canvas.height   // ← yeni
     const hitSky = bird.y - bird.r <= 0                  // ← yeni
     if (hitGround || hitSky) state = 'over'              // ← yeni
   }
   ```

4. `draw()` fonksiyonunda, kuşu çizen `ctx.fill()` satırının altına (fonksiyonun kapanış `}`'inden önce) yazıları
   ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.textAlign = 'center'
     if (state === 'ready') {
       ctx.font = '22px sans-serif'
       ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
     }
     if (state === 'over') {
       ctx.font = 'bold 36px sans-serif'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
     }
   ```

   Başlangıç yazısı ortanın 80 piksel altına konuyor ki kuşun üstüne binmesin.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Kuş ortada beklemeli ve `Press Space to start` yazmalı. Oynamak için
   önce oyuna tıkla, sonra Boşluk'a bas; kuşu düşürürsen `Game Over` çıkmalı ve kuş donmalı. Alttaki kontrollerin
   hepsi yeşil olmalı. Kırmızı kalırsa yazıları harf harf karşılaştır: `Press Space to start` ve `Game Over`
   birebir aynı olmalı.

# --tests--

The bird should wait in the `'ready'` state until the first flap.
tr: Kuş ilk kanat çırpışa kadar `'ready'` durumunda beklemeli.

```js
assert.strictEqual(state, 'ready')
$.tick(60)
assert.strictEqual(bird.y, 300)
assert.include($.texts(), 'Press Space to start')
```

The first flap should start the game.
tr: İlk kanat çırpış oyunu başlatmalı.

```js
$.press(' ')
assert.strictEqual(state, 'playing')
$.tick(5)
assert.isBelow(bird.y, 300)
assert.notInclude($.texts(), 'Press Space to start')
```

Hitting the ground should end the game and freeze the bird.
tr: Yere çarpmak oyunu bitirmeli ve kuşu dondurmalı.

```js
flap()
$.run(3)
assert.strictEqual(state, 'over')
assert.isAtLeast(bird.y + bird.r, 600)
const frozen = bird.y
$.tick(30)
assert.strictEqual(bird.y, frozen)
assert.include($.texts(), 'Game Over')
```

Flying into the top should end the game too.
tr: Tepeye uçmak da oyunu bitirmeli.

```js
state = 'playing'
bird.y = 20
bird.vy = -8
update()
assert.strictEqual(state, 'over')
```

Flapping after game over should do nothing (for now).
tr: Oyun bittikten sonra kanat çırpmak (şimdilik) hiçbir şey yapmamalı.

```js
state = 'over'
bird.vy = 3
flap()
assert.strictEqual(state, 'over')
assert.strictEqual(bird.vy, 3)
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
let state = 'ready' // 'ready', 'playing' or 'over'

function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
