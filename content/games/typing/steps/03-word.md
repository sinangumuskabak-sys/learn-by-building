---
title: A word on the canvas
title_tr: Canvas'ta bir kelime
skills: [game.canvas]
---

# --goal--

Text is drawn like a rectangle: set the pen (font, alignment, color), then `fillText`. We write one word, `rocket`.

# --goal-tr--

Canvas'a yazı da tıpkı dikdörtgen gibi çizilir: önce kalemi ayarla (yazı tipi, hiza, renk), sonra yaz. İlk
kelimemizi yazıyoruz: `rocket`.

Yazı tipi olarak **monospace** (eş aralıklı) seçiyoruz: her harf aynı genişlikte, eski daktilolardaki gibi. İleride
bir kelimenin yarısını başka renkte çizerken bunun faydasını göreceğiz.

# --code--

```js
const FONT = 'bold 20px monospace'

ctx.font = FONT
ctx.textAlign = 'left'
ctx.fillStyle = '#cbd5e1'
ctx.fillText('rocket', 40, 120)
```

# --meaning--

- `FONT` is the words' font: bold, 20 pixels, monospace (every letter equally wide).
- `textAlign = 'left'` puts the start of the text at `x`.
- `fillText(text, x, y)` paints the text; `y` is its **baseline**, the line the letters sit on.

# --meaning-tr--

- `const FONT = 'bold 20px monospace'` → yazı tipi: kalın (`bold`), 20 piksel boyunda, eş aralıklı (`monospace`).
- `ctx.font = FONT` → kaleme bu yazı tipini ver.
- `ctx.textAlign = 'left'` → yazının **başı** verdiğimiz `x`'e gelsin.
- `ctx.fillStyle = '#cbd5e1'` → açık gri.
- `ctx.fillText('rocket', 40, 120)` → yazıyı çizer. Tırnak içindeki yazı, sonra `x` ve `y`. Dikkat: `y` yazının üstü
  değil, harflerin **oturduğu çizgidir** (taban çizgisi, baseline); defter çizgisi gibi.

# --task--

1. Under `GROUND` write `FONT`.
2. At the very end, leave an empty line and write the four text lines.

# --task-tr--

1. `const GROUND = ...` satırının altına `FONT` satırını yaz.
2. Dosyanın **en sonuna** bir boş satır bırak ve dört yazı satırını yaz.
3. **Çalıştır**: sol üst tarafta `rocket` yazısını görmelisin.

# --try--

Change `20px` to `40px` in `FONT` and run: a bigger word. Put `20px` back.

# --try-tr--

`FONT` içindeki `20px`'i `40px` yap ve çalıştır: daha büyük bir kelime. Sonra `20px`'e geri al.

# --tests--

`rocket` should be written at (40, 120) in `FONT`, light grey.
tr: `rocket` (40, 120)'ye `FONT` ile, açık gri yazılmalı.

```js
assert.strictEqual(FONT, 'bold 20px monospace')
const call = $.screen().find((c) => c.op === 'fillText')
assert.deepEqual(call.args.slice(0, 3), ['rocket', 40, 120])
assert.strictEqual(call.font, FONT)
assert.strictEqual(call.fill, '#cbd5e1')
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 330 // words that fall past this line are gone
const FONT = 'bold 20px monospace'

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#7f1d1d'
ctx.fillRect(0, GROUND + 4, canvas.width, 3)

ctx.font = FONT
ctx.textAlign = 'left'
ctx.fillStyle = '#cbd5e1'
ctx.fillText('rocket', 40, 120)
```
