---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics]
---

# --goal--

A real fall starts slowly and speeds up. We give the bird a **velocity** `vy`, and gravity adds a little to it every
frame. Then the bird moves by its velocity.

# --goal-tr--

Gerçek bir düşüş sabit hızda olmaz: **yavaş başlar, gittikçe hızlanır**. Elinden düşen bir top gibi.

Oyunlarda hareket iki sayıyla anlatılır:

- **konum**: kuş nerede? (`bird.y`)
- **hız**: her karede konum ne kadar değişiyor? (`bird.vy`, "y yönündeki hız"; İngilizce *velocity*)

Yerçekimi kuşu doğrudan itmez; **hızını** her karede biraz artırır. Buna **ivme** denir.

# --code--

```js
const GRAVITY = 0.5 // added to the bird's speed every frame

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}
```

# --meaning--

- `GRAVITY` is how much the speed grows each frame. Names in capitals are settings that never change.
- `vy: 0`: the bird starts still.
- First the speed grows, then the bird moves by the speed: 0.5 px, then 1, then 1.5... a smooth, speeding-up fall.

# --meaning-tr--

- `const GRAVITY = 0.5` → yerçekimi: hız her karede 0,5 artar. **Büyük harfli ad** bir alışkanlık: "bu oyun boyunca
  değişmeyen bir ayar" demek. Satır sonundaki `//` açıklaması bir yorum.
- `vy: 0` → kuşun nesnesine yeni bir bilgi: hızı. Başta 0, yani hareketsiz.
- `bird.vy += GRAVITY` → önce hız artar.
- `bird.y += bird.vy` → sonra kuş **o anki hızı kadar** iner.
- Sonuç: 1. karede 0,5 piksel, 2. karede 1, 3. karede 1,5 piksel... Yavaş başlar ve hızlanır. İki satır, ama gerçek
  bir düşüş gibi görünür. Sıra önemli: önce hız, sonra konum.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the `GRAVITY` line.
2. Add `vy: 0,` to `bird`, after `y: 300,`.
3. In `update`, replace `bird.y += 2` with the two new lines.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `GRAVITY` satırını yaz. `let bird` ile arasında bir boş satır kalsın.
2. `bird` nesnesinde `y: 300,` kısmından sonra `vy: 0,` ekle.
3. `update` içindeki `bird.y += 2` satırını sil; yerine iki yeni satırı yaz.
4. **Çalıştır**: kuş önce yavaşça, sonra hızlanarak düşüp ekrandan çıkmalı.

# --hint--

Order matters in `update`: first `bird.vy += GRAVITY`, then `bird.y += bird.vy`.

# --hint-tr--

`update` içinde sıra önemli: önce `bird.vy += GRAVITY`, sonra `bird.y += bird.vy`.

# --try--

Set `GRAVITY` to `0.1` (the Moon), then `1.5` (a heavy planet). Put `0.5` back.

# --try-tr--

`GRAVITY`'yi `0.1` (Ay), sonra `1.5` (ağır bir gezegen) yap ve izle. Sonra `0.5`'e geri al.

# --tests--

`GRAVITY` should be 0.5 and the bird should start still.
tr: `GRAVITY` 0.5 olmalı ve kuş hareketsiz başlamalı.

```js
assert.strictEqual(GRAVITY, 0.5)
assert.strictEqual(bird.vy, 0)
```

`update()` should speed the fall up, then move the bird.
tr: `update()` önce düşüşü hızlandırmalı, sonra kuşu hareket ettirmeli.

```js
update()
assert.strictEqual(bird.vy, 0.5)
assert.strictEqual(bird.y, 300.5)
update()
assert.strictEqual(bird.vy, 1)
assert.strictEqual(bird.y, 301.5)
```

The loop should make the bird fall faster and faster.
tr: Döngü kuşu gittikçe hızlanarak düşürmeli.

```js
$.tick(10)
assert.closeTo(bird.vy, 5, 0.001)
assert.closeTo(bird.y, 327.5, 0.001)
assert.closeTo($.arcs()[0].y, bird.y, 0.001)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame

let bird = { x: 100, y: 300, vy: 0, r: 14 }

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
