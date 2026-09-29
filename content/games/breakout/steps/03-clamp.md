---
title: Keep a number inside limits
title_tr: Sayıyı sınırlar içinde tut
skills: [prog.functions]
---

# --goal--

The paddle must never leave the screen. We write a small helper, `clamp`, that squeezes any number between a minimum
and a maximum. We will use it again and again.

# --goal-tr--

Raket fareyi izleyecek ama **ekrandan asla taşmamalı**. Bunun için küçük bir yardımcı fonksiyon yazıyoruz: `clamp`
(sıkıştır). Ona bir sayı ve iki sınır verirsin; sayı sınırların dışındaysa en yakın sınırı, içindeyse sayının
kendisini geri verir.

Bir bardağa su doldurmak gibi: ne kadar dökersen dök, bardak en fazla kendi hacmi kadar alır. Ekranda bir şey
değişmeyecek; bu fonksiyonu sonraki adımlarda sık sık kullanacağız.

# --code--

```js
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
```

# --meaning--

- `value, min, max` are the parameters: the three numbers you pass in.
- `Math.min(max, value)` cuts off anything above `max`; `Math.max(min, ...)` lifts anything below `min`.
- `return` hands the result back to whoever called the function.

# --meaning-tr--

- `function clamp(value, min, max)` → parantezdeki üç ad **parametre**: fonksiyon çağrılırken verilen sayılar bu
  adları alır. `clamp(500, 0, 400)` dersen `value` 500, `min` 0, `max` 400 olur.
- `Math.min(max, value)` → iki sayıdan **küçüğünü** verir. `max`'tan büyük olan her şeyi `max`'a indirir.
- `Math.max(min, ...)` → iki sayıdan **büyüğünü** verir. `min`'den küçük olan her şeyi `min`'e çıkarır.
- `return` → "bu değeri **cevap olarak geri ver**". Çağıran yer bu cevabı kullanır.
- Örnekler: `clamp(500, 0, 400)` → `400`, `clamp(-3, 0, 400)` → `0`, `clamp(50, 0, 400)` → `50`.

# --task--

Leave an empty line under `let paddle = { x: 200 }` and write `clamp` there.

# --task-tr--

`let paddle = { x: 200 }` satırının altına bir boş satır bırak ve `clamp` fonksiyonunu yaz. **Çalıştır**: ekran
değişmez, kontroller yeşil olmalı.

# --predict--

What is `clamp(450, 0, 400)`?
- [ ] 450
- [x] 400
  450 is above the maximum, so it is cut down to 400.
- [ ] 0

# --predict-tr--

`clamp(450, 0, 400)` kaç verir?
- [ ] 450
- [x] 400
  450 üst sınırın üstünde, o yüzden 400'e indirilir.
- [ ] 0

# --hint--

Do not forget `return`: without it the function gives back `undefined`.

# --hint-tr--

`return` yazmayı unutma: o olmadan fonksiyon cevap olarak `undefined` (hiçbir şey) verir.

# --tests--

`clamp()` should return the number itself when it is inside the limits.
tr: `clamp()` sayı sınırların içindeyse sayının kendisini vermeli.

```js
assert.strictEqual(clamp(50, 0, 400), 50)
```

`clamp()` should cut numbers that are too big or too small.
tr: `clamp()` çok büyük ya da çok küçük sayıları sınıra çekmeli.

```js
assert.strictEqual(clamp(500, 0, 400), 400)
assert.strictEqual(clamp(-3, 0, 400), 0)
assert.strictEqual(clamp(7, 10, 20), 10)
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

let paddle = { x: 200 }

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
