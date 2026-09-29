---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop runs again and again: update, draw, and ask the browser to run it again before the next screen refresh
(`requestAnimationFrame`, about 60 times a second). The words start to fall.

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: güncelle → çiz → tekrar... Bir çizgi filmin kareleri gibi, her turda resim biraz
değişir ve hareket görünür.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Döngü kendini her seferinde yeniden istediği için hiç durmaz.

# --code--

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` runs one turn: move the words, then draw them.
- `requestAnimationFrame(loop)` inside it books the next turn, so it keeps going.
- The last line starts the loop. It replaces the old single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `update()` → kelimeleri indir. `draw()` → yeni durumu çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon kendi
  devamını istiyor; böylece döngü hiç bitmez.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

At the bottom, write `loop` above `reset()` and replace `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `reset()` satırının **üstüne** `loop` fonksiyonunu yaz ve altında bir boş satır bırak.
2. En alttaki `draw()` satırını sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır** ve izle: iki kelime yavaşça aşağı süzülmeli (zemini geçip ekrandan çıkarlar; onu birazdan
   düzelteceğiz).

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

The words should fall a little every frame, and be drawn where they are.
tr: Kelimeler her karede biraz düşmeli ve bulundukları yerde çizilmeli.

```js
$.tick(10)
assert.closeTo(words[0].y, 123.5, 1e-9)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'rocket')
assert.closeTo(call.args[2], 123.5, 1e-9)
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

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
