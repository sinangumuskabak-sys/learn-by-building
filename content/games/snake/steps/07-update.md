---
title: A function that moves
title_tr: Hareket ettiren bir fonksiyon
skills: [game.state, prog.functions]
---

# --goal--

Every game has two jobs: **update** (change the state) and **draw** (show it). `update` moves the head one cell
to the right.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (durumu göster). Çizeni yazdık; şimdi
güncelleyeni yazıyoruz. `update` fonksiyonu başı **bir hücre sağa** kaydıracak.

Tahmin et: bu adımdan sonra kare hareket edecek mi? (Aşağıda sorusu var.)

# --code--

```js
function update() {
  head.x += 1
}
```

# --meaning--

- `head.x += 1` means "add 1 to `head.x`": column 5 becomes 6.
- Defining `update` does not call it, so nothing moves yet.

# --meaning-tr--

- `function update() {` → ikinci fonksiyonumuz: güncelleme tarifi.
- `head.x += 1` → "head.x'e 1 ekle". `+=` "üstüne ekle" demek: 5 → 6. Sütun bir artınca kare bir hücre sağa gider.
- Dikkat: fonksiyonu **tanımladık ama çağırmadık**. Tarif yazıldı, kimse pişirmedi.

# --task--

Write `update` above `function draw() {`, with an empty line between them.

# --task-tr--

`update` fonksiyonunu `function draw() {` satırının **üstüne** yaz; ikisinin arasında bir boş satır kalsın. **Çalıştır**.

# --predict--

Will the square move after Run?
- [ ] Yes, one cell to the right
  Only if something calls `update()`, and nothing does yet.
- [x] No, nothing calls `update()` yet
- [ ] Yes, it slides off the board

# --predict-tr--

Çalıştır'a basınca kare hareket edecek mi?
- [ ] Evet, bir hücre sağa
  Ancak biri `update()`'i çağırırsa. Henüz kimse çağırmıyor.
- [x] Hayır, `update()`'i henüz kimse çağırmıyor
- [ ] Evet, kayarak tahtadan çıkar

# --tests--

`update()` should move the head one cell to the right.
tr: `update()` başı bir hücre sağa taşımalı.

```js
head = { x: 3, y: 4 }
update()
assert.deepEqual(head, { x: 4, y: 4 })
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
let head = { x: 5, y: 5 }

function update() {
  head.x += 1
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

draw()
```
