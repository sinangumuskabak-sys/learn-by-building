---
title: Repeat with a loop
title_tr: Döngüyle tekrarla
skills: [prog.loops]
---

# --goal--

The second vertical line sits at `x = 200`, which is `2 * CELL`. Instead of copying the line, we let a `for` loop
draw it for `i = 1` and `i = 2`.

# --goal-tr--

İkinci dikey çizgi `x = 200`'de, yani `2 * CELL`'de duracak. Satırı kopyalayıp sayıyı değiştirebilirdik, ama
bilgisayarlar tekrarı sever: **döngü** (loop) "şunu birkaç kez yap" demektir.

Döngü, `i` adında bir **sayaç** tutar: önce 1, sonra 2. Her turda çizgiyi `i * CELL` noktasına çizer.

# --code--

```js
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
}
```

# --meaning--

- `let i = 1` starts a counter at 1; `i < 3` keeps going while it is below 3; `i++` adds 1 after each round.
- So the body runs twice: `i = 1` draws at 98, `i = 2` draws at 198.
- `*` is multiplication.

# --meaning-tr--

- `for ( ... ) { ... }` → "süslü parantezin içini tekrarla". `{` ile `}` arasındaki satır tekrarlanan kısım;
  okunaklı olsun diye iki boşlukla içeri yazılır.
- `let i = 1` → `i` adında bir sayaç, 1'den başlar. `let` de `const` gibi ad verir ama değeri **sonradan
  değişebilir**. Böyle adlara **değişken** denir.
- `i < 3` → "`i` 3'ten küçük olduğu sürece devam et". `<` küçüktür demek.
- `i++` → her turdan sonra `i`'yi 1 artır.
- `i * CELL - 2` → `*` çarpma: 1. turda 1 × 100 − 2 = **98**, 2. turda 2 × 100 − 2 = **198**.

Yani döngü iki tur döner ve iki dikey çizgi çizer.

# --task--

Replace the line `ctx.fillRect(CELL - 2, 0, 4, canvas.height)` with the loop (the `fillRect` inside it uses
`i * CELL`). Press **Run**.

# --task-tr--

1. En alttaki `ctx.fillRect(CELL - 2, 0, 4, canvas.height)` satırını sil.
2. Yerine üç satırlık döngüyü yaz. Dikkat: içerideki satırda `CELL - 2` değil `i * CELL - 2` var.
3. **Çalıştır**: artık iki dikey çizgi görmelisin; tahta üç sütuna bölündü.

# --predict--

How many gray lines will you see?
- [ ] One
- [x] Two
  The loop runs for `i = 1` and `i = 2`, then stops because `3 < 3` is false.
- [ ] Three

# --predict-tr--

Kaç gri çizgi göreceksin?
- [ ] Bir
- [x] İki
  Döngü `i = 1` ve `i = 2` için çalışır; `3 < 3` yanlış olduğu için orada durur.
- [ ] Üç

# --hint--

If you still see one line, check that the line inside the loop uses `i * CELL`, not `CELL`.

# --hint-tr--

Hâlâ tek çizgi görüyorsan döngünün içindeki satırda `CELL` değil `i * CELL` yazdığından emin ol.

# --try--

Change `i < 3` to `i < 4` and run: a third line appears on the right edge. Put `3` back.

# --try-tr--

`i < 3` yerine `i < 4` yaz ve çalıştır: sağ kenarda üçüncü bir çizgi belirir. Sonra `3`'e geri al.

# --tests--

There should be two vertical lines, on `x = 100` and `x = 200`.
tr: `x = 100` ve `x = 200` üzerinde iki dikey çizgi olmalı.

```js
assert.sameDeepMembers($.rects('#585b70'), [
  { x: 98, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 198, y: 0, w: 4, h: 300, color: '#585b70' },
])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
}
```
