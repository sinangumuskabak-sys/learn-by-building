---
title: "The aim: an angle and a pull"
title_tr: "Nişan: bir açı ve bir çekiş"
skills: [game.state]
---

# --goal--

The shot is decided by two numbers: an `angle` (where the bird will fly) and a `pull` (how far the band is
stretched). We keep them in `aim`, set up by a `reset` function.

# --goal-tr--

Bir sapan atışını iki sayı belirler:

- **açı** (`angle`): kuşun uçacağı yön,
- **çekiş** (`pull`): lastiğin ne kadar gerildiği. Ne kadar çok çekersen kuş o kadar hızlı uçar.

İkisini `aim` (nişan) adlı bir nesnede tutacağız. Oyunun başlangıç hâlini kuran bir `reset` (sıfırla) fonksiyonu da
yazıyoruz; ileride oyunun bütün değişkenleri orada başlayacak. Ekran bu adımda değişmez.

# --code--

```js
let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `let aim` declares a variable whose value will change; the comment says what it will hold.
- Angles are in **radians**: half a turn is `Math.PI` (about 3.14). `0` points right; because `y` grows downwards,
  **negative** angles point up. `-0.6` (about 34°) aims up and to the right.
- `reset()` is called once before the loop starts.

# --meaning-tr--

- `let aim` → bir **değişken** açar. `const`'tan farkı: değeri sonradan değişebilir. Nişan oyun boyunca değişecek.
  Şimdilik boş; yanındaki yorum içine ne konacağını söylüyor.
- `function reset() {` → oyunu başlangıç hâline getiren fonksiyon.
- `aim = { angle: -0.6, pull: 50 }` → nişanı kurar: açı −0.6, çekiş 50 piksel.
- Bilgisayar açıları derece yerine **radyan** ile tutar: yarım tur `Math.PI` (≈ 3.14) radyandır, tam tur
  `Math.PI * 2`. `0` **düz sağa** bakar. Canvas'ta `y` aşağı büyüdüğü için **eksi** açılar **yukarı** bakar:
  −0.6 radyan (≈ 34°) sağa ve yukarı nişan alır.
- En alttaki `reset()` → döngü başlamadan önce oyunu bir kez kurar.

# --task--

1. Under the `SLING` line leave an empty line and write `let aim` and the `reset` function.
2. At the end, write `reset()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `const SLING = ...` satırının altında bir boş satır bırak; `let aim` satırını ve `reset` fonksiyonunu yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**: ekran değişmez ama kontroller yeşil olmalı.

# --hint--

If `aim` is `undefined`, you probably forgot to call `reset()` at the end.

# --hint-tr--

`aim` `undefined` çıkıyorsa en alttaki `reset()` çağrısını unutmuş olabilirsin.

# --tests--

`aim` should start as `{ angle: -0.6, pull: 50 }`.
tr: `aim` başlangıçta `{ angle: -0.6, pull: 50 }` olmalı.

```js
assert.deepEqual(aim, { angle: -0.6, pull: 50 })
```

`reset()` should set the aim again.
tr: `reset()` nişanı yeniden kurmalı.

```js
aim = { angle: 1, pull: 10 }
reset()
assert.deepEqual(aim, { angle: -0.6, pull: 50 })
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
