---
title: A drawing function
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The picture will change as discs drop, so we need to be able to draw it again and again. We put the drawing lines into a
**function** called `draw`, and call it.

# --goal-tr--

Diskler düştükçe resim değişecek; o yüzden resmi **tekrar tekrar** çizebilmeliyiz. Bunun yolu çizim satırlarını bir
**fonksiyon**un içine koymak.

Fonksiyon bir **tarif** gibidir: önce tarifi yazarsın (tanımlama), sonra adıyla uygularsın (çağırma). Ekranda bir şey
değişmeyecek; ama artık çizim bir adla çağrılabiliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The lines between `{` and `}` are its body, indented by two spaces.
- `draw()` with parentheses runs it.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. Okunaklı olsun diye iki boşluk içeriden yazılır.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Put `function draw() {` above the two painting lines, indent them, close with `}`, and call `draw()` below.

# --task-tr--

1. İki boyama satırının **üstüne** `function draw() {` yaz.
2. İki satırı iki boşluk içeri al (satır başında `Tab` da olur); altlarına kapanan `}` koy.
3. Bir boş satırdan sonra `draw()` yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen is empty, you probably forgot the `draw()` call at the very end.

# --hint-tr--

Ekran boşsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`draw` should be a function that paints the background.
tr: `draw`, arka planı boyayan bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
assert.lengthOf($.rects('#0f172a'), 1)
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
