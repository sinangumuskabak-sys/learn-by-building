---
title: The whole net
title_tr: Bütün file
skills: [prog.loops]
---

# --goal--

A `for` loop repeats the dash every 30 pixels from the top to the bottom: 15 pixels of dash, 15 of gap.

# --goal-tr--

Parçayı elle 14 kez yazmak yerine bilgisayara "bunu **tekrarla**" diyeceğiz. Buna **döngü** (loop) denir.

Her parça bir öncekinin **30 piksel** altında: 15 piksel çizgi, 15 piksel boşluk. Tepeden dibe kadar.

# --code--

```js
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}
```

# --meaning--

- `let y = 0` starts a counter at 0; `y < canvas.height` keeps going while it is above the bottom; `y += 30` adds 30
  after each round.
- So dashes are drawn at y = 0, 30, 60, ... 390: 14 of them.

# --meaning-tr--

- `for ( ... ) { ... }` → "süslü parantezin içini tekrarla".
- `let y = 0` → `y` adında bir **sayaç**, 0'dan başlar. `let` de `const` gibi ad verir ama değeri **sonradan
  değişebilir**; böyle adlara **değişken** denir.
- `y < canvas.height` → "`y` 400'den küçük olduğu sürece devam et".
- `y += 30` → her turdan sonra `y`'ye 30 ekle. (`+=` "üstüne ekle".)
- İçerideki satır aynı parça, ama y artık sabit `0` değil, sayaç `y`: 0, 30, 60, ... 390. Toplam 14 parça.

# --task--

Replace the dash line with the loop (the `fillRect` inside uses `y`). Press **Run**.

# --task-tr--

En alttaki `ctx.fillRect(canvas.width / 2 - 2, 0, 4, 15)` satırını sil; yerine döngüyü yaz. İçerideki satırda `0` yerine `y` var. **Çalıştır**: ortada kesikli bir file görmelisin.

# --predict--

What changes if you write `y += 15` instead of `y += 30`?
- [ ] More gaps
- [x] A solid line: each dash starts where the last one ends
  The dashes are 15 tall, so stepping by 15 leaves no gap.
- [ ] Nothing

# --predict-tr--

`y += 30` yerine `y += 15` yazsan ne değişir?
- [ ] Daha çok boşluk olur
- [x] Düz bir çizgi olur: her parça bir öncekinin bittiği yerde başlar
  Parçalar 15 boyunda; 15'er ilerleyince arada boşluk kalmaz.
- [ ] Hiçbir şey

# --hint--

The three parts of `for` are separated by semicolons: `let y = 0; y < canvas.height; y += 30`.

# --hint-tr--

`for` parantezindeki üç parça noktalı virgülle (`;`) ayrılır: `let y = 0; y < canvas.height; y += 30`.

# --tests--

The net should be 14 white dashes, one every 30 pixels.
tr: File, her 30 pikselde bir olmak üzere 14 beyaz parçadan oluşmalı.

```js
const dashes = $.rects('white')
assert.lengthOf(dashes, 14)
dashes.forEach((dash, i) => assert.deepEqual(dash, { x: 298, y: i * 30, w: 4, h: 15, color: 'white' }))
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'white'
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}
```
