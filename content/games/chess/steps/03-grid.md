---
title: All 64 squares
title_tr: 64 karenin hepsi
skills: [game.canvas, prog.loops]
---

# --goal--

Put the row loop inside a second loop that counts the rows: a loop inside a loop visits all 64 squares. The color now
depends on `r + c`, so every row starts with the opposite color.

# --goal-tr--

Bir sırayı çizebiliyoruz; şimdi **8 sırayı**. Sıra döngüsünü, sıraları sayan ikinci bir döngünün **içine** koyacağız:
dıştaki döngü sırayı (`r`, row), içteki sütunu (`c`) sayar. 8 × 8 = **64 tur**.

Renk için tek başına `c` artık yetmez: her sıra bir öncekinin **tersi** renkle başlamalı. Bunun için satır ve sütunu
toplayacağız.

# --code--

```js
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
    }
  }
```

# --meaning--

- The outer loop counts the row `r`, the inner one the column `c`; for each row the whole inner loop runs.
- `y = TOP + r * SQ` moves each row 56 pixels down.
- `(r + c) % 2`: moving one square in any direction changes the sum by one, so neighbours always differ.

# --meaning-tr--

- `for (let r = 0; r < 8; r++) {` → dış döngü: **sıra** numarası `r`, 0'dan 7'ye. Her sıra için içteki döngünün
  tamamı (8 tur) çalışır. Buna **iç içe döngü** denir.
- `const y = TOP + r * SQ` → `r` bir artınca kare 56 piksel **aşağı** iner.
- `(r + c) % 2` → satır ve sütunun toplamı çiftse açık, tekse koyu. Sağa ya da aşağı bir kare gidince toplam 1
  değişir; bu yüzden yan yana iki kare hiç aynı renk olmaz. Sol üst köşe (0 + 0 = 0) açık kalır.
- İçteki satırlar iki boşluk daha içeri kaydı; okunaklı olsun diye.

# --task--

Wrap the loop in `for (let r = 0; r < 8; r++) { ... }`, indent it, and change the `y` and color lines.

# --task-tr--

1. `for (let c = 0; ...)` satırının **üstüne** `for (let r = 0; r < 8; r++) {` yaz.
2. Eski döngünün satırlarını iki boşluk içeri al ve altına kapanan `}` ekle.
3. `const y = TOP` satırını `const y = TOP + r * SQ` yap; renk satırında `c % 2` yerine `(r + c) % 2` yaz.
4. **Çalıştır**: dama gibi 8 × 8 bir tahta görmelisin, sol üst köşesi açık renk.

# --hint--

If all rows look the same, the color still uses only `c`: it must be `(r + c) % 2`.

# --hint-tr--

Bütün sıralar aynı görünüyorsa renk satırı hâlâ yalnız `c`'ye bakıyor: `(r + c) % 2` olmalı. Parantezi unutma;
yoksa önce `c % 2` hesaplanır.

# --tests--

There should be 32 light and 32 dark squares, with a light one in the top left corner.
tr: 32 açık ve 32 koyu kare olmalı, sol üst köşede açık bir kare.

```js
const light = $.rects('#e7d8b8')
assert.lengthOf(light, 32)
assert.lengthOf($.rects('#b58863'), 32)
assert.deepEqual([light[0].x, light[0].y, light[0].w], [16, 56, 56])
```

The second row should start with a dark square.
tr: İkinci sıra koyu bir kareyle başlamalı.

```js
const second = $.rects('#b58863').find((r) => r.y === 112)
assert.strictEqual(second.x, 16)
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
    }
  }
}

draw()
```
