---
title: A function that moves
title_tr: Hareket ettiren bir fonksiyon
skills: [game.state, prog.functions]
---

# --goal--

Every game has two jobs: **update** (change the state) and **draw** (show it). `update` moves the bird 2 pixels down.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (durumu göster). Çizeni yazdık; şimdi
güncelleyeni yazıyoruz. `update` fonksiyonu kuşu **2 piksel aşağı** indirecek.

Tahmin et: bu adımdan sonra kuş hareket edecek mi? (Aşağıda sorusu var.)

# --code--

```js
function update() {
  bird.y += 2
}
```

# --meaning--

- `bird.y += 2` means "add 2 to `bird.y`": 300 becomes 302. y grows downwards, so the bird goes down.
- Defining `update` does not call it, so nothing moves yet.

# --meaning-tr--

- `function update() {` → ikinci fonksiyonumuz: güncelleme tarifi.
- `bird.y += 2` → `+=` "üstüne ekle" demek: "kuşun y'sine 2 ekle", 300 → 302. Canvas'ta y aşağı doğru büyüdüğü için
  kuş **aşağı** iner.
- Dikkat: fonksiyonu **tanımladık ama çağırmadık**. Tarif yazıldı, kimse pişirmedi.

# --task--

Write `update` above `function draw() {`, with an empty line between them. Press **Run**.

# --task-tr--

`update` fonksiyonunu `function draw() {` satırının **üstüne** yaz; ikisinin arasında bir boş satır kalsın. **Çalıştır**.

# --predict--

Will the bird move after Run?
- [ ] Yes, it slides down
  Only if something calls `update()`, and nothing does yet.
- [x] No, nothing calls `update()` yet
- [ ] Yes, it jumps 2 pixels once

# --predict-tr--

Çalıştır'a basınca kuş hareket edecek mi?
- [ ] Evet, aşağı kayar
  Ancak biri `update()`'i çağırırsa. Henüz kimse çağırmıyor.
- [x] Hayır, `update()`'i henüz kimse çağırmıyor
- [ ] Evet, bir kez 2 piksel zıplar

# --tests--

`update()` should move the bird 2 pixels down.
tr: `update()` kuşu 2 piksel aşağı indirmeli.

```js
update()
assert.strictEqual(bird.y, 302)
update()
assert.strictEqual(bird.y, 304)
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let bird = { x: 100, y: 300, r: 14 }

function update() {
  bird.y += 2
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

draw()
```
