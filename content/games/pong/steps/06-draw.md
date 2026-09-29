---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

A game redraws its picture many times a second. We put the drawing lines in a function named `draw`, so one word
repaints everything.

# --goal-tr--

Bir oyun, ekranı **saniyede onlarca kez** yeniden çizer. Her seferinde bu satırları tekrar yazamayız. Bu yüzden çizim
satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The body is indented by two spaces.
- `draw()` with parentheses runs it. It paints the court black first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. İki boşluk içeriden yazılır; döngünün içi dört boşluk
  içeride kalır.
- Gövdenin ilk iki satırı sahayı siyaha boyar: bu, **eski resmi siler**. Raket hareket edince eski yerinde iz kalmaz.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap all the drawing lines in `function draw() { ... }` (indent them by two spaces) and call `draw()` after it.

# --task-tr--

1. Siyah boyayan `ctx.fillStyle = 'black'` satırının **üstüne** `function draw() {` yaz.
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

`draw()` should draw the paddles wherever they are, over the court.
tr: `draw()` raketleri nerede olurlarsa orada, sahanın üstüne çizmeli.

```js
left.y = 0
right.y = 320
draw()
const paddles = $.rects('white').filter((r) => r.w === 10 && r.h === 80)
assert.sameDeepMembers(paddles.map((p) => p.y), [0, 320])
assert.lengthOf($.rects('white').filter((r) => r.w === 4), 14, 'the net is still drawn')
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

draw()
```
