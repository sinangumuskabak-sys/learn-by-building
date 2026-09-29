---
title: Draw again and again
title_tr: Durmadan çiz
skills: [game.loop]
---

# --goal--

For pads to light up and go dark, the board must be redrawn all the time. A loop draws and asks the browser to run it
again before the next screen refresh (`requestAnimationFrame`, about 60 times a second).

# --goal-tr--

Şu an tahta bir kez çiziliyor. Tuş yanıp sönebilsin diye tahtanın **sürekli** yeniden çizilmesi lazım: çizgi film
kareleri gibi. Her resme **kare** (frame) denir.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz. Ekran aynı görünecek, ama artık
`lit` her değiştiğinde ekran da hemen değişecek.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws once, then `requestAnimationFrame(loop)` books the next turn, so it keeps going.
- The last line starts the loop. It replaces the old single `draw()` call.
- `loop` has no parentheses there: we hand over the function, the browser calls it later.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır".
- Dikkat: burada `loop` **parantezsiz**. `loop()` "şimdi çalıştır" olurdu; `loop` ise "bu tarifi al, sırası gelince sen
  çalıştır" demek.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Replace the `draw()` call at the bottom with the `loop` function and `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `draw()` satırını **sil**.
2. Yerine `loop` fonksiyonunu ve altına, bir boş satırdan sonra, `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**: ekran aynı görünür; kontroller döngünün döndüğüne bakacak.

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

A change to `lit` should show on the next frame.
tr: `lit`'teki bir değişiklik bir sonraki karede görünmeli.

```js
lit = 1
$.tick(1)
assert.lengthOf($.rects('#f87171'), 1)
lit = -1
$.tick(1)
assert.lengthOf($.rects('#f87171'), 0)
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

let lit = -1 // the pad lit right now, or -1

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
