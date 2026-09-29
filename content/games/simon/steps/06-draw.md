---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The pads will light up and go dark, so the board must be drawn again and again. We put the drawing lines in a function
named `draw`, so one word repaints everything.

# --goal-tr--

Tuşlar yanıp sönecek; yani tahtanın **tekrar tekrar** çizilmesi gerekecek. Her seferinde bu satırları yazamayız. Bu
yüzden çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The body is indented by two spaces.
- `draw()` with parentheses runs it. It paints the background first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. İki boşluk içeriden yazılır; `forEach`'in içi dört boşluk
  içeride kalır.
- Gövdenin ilk iki satırı arka planı boyar: bu, **eski resmi siler**.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap the drawing lines in `function draw() { ... }` (indent them by two spaces) and call `draw()` after it.

# --task-tr--

1. Arka planı boyayan `ctx.fillStyle = '#0f172a'` satırının **üstüne** `function draw() {` yaz.
2. Altındaki bütün çizim satırlarını iki boşluk içeri al (satırları seçip `Tab`'a basmak da olur).
3. En alta kapanan `}` yaz.
4. Bir boş satırdan sonra `draw()` yaz. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen stays empty you probably forgot the `draw()` call at the very end.

# --hint-tr--

Ekran boş kalıyorsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

Calling `draw()` again should repaint the board from scratch.
tr: `draw()`'u yeniden çağırmak tahtayı baştan çizmeli.

```js
draw()
assert.lengthOf($.rects('#0f172a'), 1)
assert.lengthOf($.rects().filter((r) => r.w === 188), 4)
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

draw()
```
