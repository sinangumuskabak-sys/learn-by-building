---
title: Make them fall
title_tr: Düşür
skills: [game.state]
---

# --goal--

`update` moves every word down by `SPEED` pixels. Nothing calls it yet.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (göster). Çizeni yazdık; şimdi güncelleyeni
yazıyoruz. `update` her kelimeyi biraz **aşağı** indirecek: `SPEED` kadar piksel.

# --code--

```js
const SPEED = 0.35

function update() {
  for (const w of words) w.y += SPEED
}
```

# --meaning--

- `w.y += SPEED` adds 0.35 to each word's height: a bigger `y` is lower on the canvas.
- Defining `update` does not call it, so nothing moves yet.

# --meaning-tr--

- `const SPEED = 0.35` → her seferde 0.35 piksel. Küçük görünüyor, ama saniyede 60 kez olunca saniyede 21 piksel eder.
- `for (const w of words) w.y += SPEED` → her kelimenin `y`'sine `SPEED` ekle. `+=` "üstüne ekle" demek. `y` büyüdükçe
  kelime **aşağı** iner.
- Dikkat: fonksiyonu **tanımladık ama çağırmadık**. Tarif yazıldı, kimse pişirmedi.

# --task--

1. Under `GROUND` write `SPEED`.
2. Above `function draw() {` write `update`, with an empty line between them.

# --task-tr--

1. `const GROUND = ...` satırının altına `SPEED` satırını yaz.
2. `update` fonksiyonunu `function draw() {` satırının **üstüne** yaz; aralarında bir boş satır kalsın.
3. **Çalıştır**.

# --predict--

Will the words fall after Run?
- [ ] Yes, slowly
- [x] No, nothing calls `update()` yet

# --predict-tr--

Çalıştır'a basınca kelimeler düşecek mi?
- [ ] Evet, yavaşça
- [x] Hayır, `update()`'i henüz kimse çağırmıyor

# --tests--

`update()` should move every word down by `SPEED`.
tr: `update()` her kelimeyi `SPEED` kadar aşağı indirmeli.

```js
assert.strictEqual(SPEED, 0.35)
update()
update()
assert.closeTo(words[0].y, 120.7, 1e-9)
assert.closeTo(words[1].y, 60.7, 1e-9)
assert.strictEqual(words[0].x, 40, 'x does not change')
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 330 // words that fall past this line are gone
const SPEED = 0.35
const FONT = 'bold 20px monospace'

let words // { text, x, y }

function reset() {
  words = [
    { text: 'rocket', x: 40, y: 120 },
    { text: 'cat', x: 300, y: 60 },
  ]
}

function update() {
  for (const w of words) w.y += SPEED
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  for (const w of words) ctx.fillText(w.text, w.x, w.y)
}

reset()
draw()
```
