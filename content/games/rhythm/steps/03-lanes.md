---
title: Four lanes with a loop
title_tr: Döngüyle dört şerit
skills: [prog.loops]
---

# --goal--

Four lanes are the same drawing four times, each 70 pixels further right. A `for` loop repeats it for lane 0, 1, 2
and 3.

# --goal-tr--

Dört şerit, **aynı çizimin dört kez** tekrarı; her biri öncekinden 70 piksel sağda. Aynı satırları dört kez yazmak
yerine bilgisayara "bunu dört kez yap" deriz. Buna **döngü** denir.

# --code--

```js
for (let lane = 0; lane < LANES; lane++) {
  const x = LEFT + lane * LANE_W
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
}
```

# --meaning--

- `for (let lane = 0; lane < LANES; lane++)` runs its body with `lane` = 0, 1, 2, 3.
- `x` is where the lane starts: 60, 130, 200, 270.
- The body draws that lane, like before but at `x`.

# --meaning-tr--

- `for (let lane = 0; lane < LANES; lane++) {` → **döngü**. Üç parçası `;` ile ayrılır:
  - `let lane = 0` → sayaç `lane` 0'dan başlar. (`let`, değeri değişebilen bir ad açar.)
  - `lane < LANES` → `lane` 4'ten **küçük** olduğu sürece `{ }` içini yap.
  - `lane++` → her turdan sonra `lane`'e 1 ekle.
  Yani içerisi `lane` = 0, 1, 2, 3 için **dört kez** çalışır. Sayma 0'dan başlar: ilk şerit 0. şerittir.
- `const x = LEFT + lane * LANE_W` → bu şeridin sol kenarı: 60, 130, 200, 270.
- Son iki satır önceki adımdaki çizim; yalnız `LEFT` yerine `x` kullanıyor.

# --task--

Replace the two lane lines at the end with the loop.

# --task-tr--

1. En sondaki iki şerit satırını **sil**.
2. Yerine döngüyü yaz. İçerideki satırlar iki boşluk içeriden yazılır; döngü `}` ile kapanır.
3. **Çalıştır**: dört şerit yan yana görünmeli.

# --predict--

What will you see after Run?
- [ ] One wide lane
- [x] Four lanes side by side, with thin gaps
  The loop draws the same strip four times, each 70 pixels further right.
- [ ] Four lanes on top of each other

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] Tek bir geniş şerit
- [x] Aralarında ince boşluk olan yan yana dört şerit
  Döngü aynı şeridi dört kez, her seferinde 70 piksel sağa çizer.
- [ ] Üst üste dört şerit

# --try--

Change `LANES` to `5` and run: a fifth lane appears and `LEFT` centres all five by itself. Put `4` back.

# --try-tr--

`LANES`'i `5` yap ve çalıştır: beşinci şerit çıkar ve `LEFT` beşini kendiliğinden ortalar. Sonra `4`'e geri al.

# --tests--

Four lanes should be drawn, 70 pixels apart.
tr: Aralarında 70 piksel olan dört şerit çizilmeli.

```js
assert.deepEqual($.rects('#1e293b').map((r) => r.x), [62, 132, 202, 272])
for (const r of $.rects('#1e293b')) assert.deepEqual([r.y, r.w, r.h], [0, 66, 560])
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
for (let lane = 0; lane < LANES; lane++) {
  const x = LEFT + lane * LANE_W
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
}
```
