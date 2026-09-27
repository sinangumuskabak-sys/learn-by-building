---
title: The runner and the ground
title_tr: Koşucu ve zemin
skills: [game.canvas, game.state]
---

# --explanation--

The whole game happens along one line: the ground. Everything stands on it, so store its height once, as `GROUND`,
and place things relative to it.

A runner 44 pixels tall standing on the ground has its **top** at `GROUND - 44`, because rectangles are positioned by
their top-left corner and `y` grows downwards. You will write "`GROUND - height`" a lot in this game. Whenever you want
something to *stand on* a line, subtract its height from the line.

For now the runner is just a rectangle. Simple shapes let you get the game working and fun first; art can come later
and never changes the rules.

# --explanation-tr--

Oyunun tamamı tek bir çizgi boyunca geçer: zemin. Her şey onun üstünde durur; bu yüzden yüksekliğini bir kez `GROUND`
olarak sakla ve her şeyi ona göre yerleştir.

Zeminde duran 44 piksel boyundaki bir koşucunun **üstü** `GROUND - 44`'tedir; çünkü dikdörtgenler sol üst
köşelerinden konumlanır ve `y` aşağı doğru büyür. Bu oyunda "`GROUND - yükseklik`" çok yazacaksın. Bir şeyin bir
çizginin *üstünde durmasını* istediğinde yüksekliğini çizgiden çıkar.

Koşucu şimdilik yalnızca bir dikdörtgen. Basit şekiller önce oyunu çalışır ve eğlenceli hâle getirmeni sağlar; çizimler
sonra gelebilir ve kuralları asla değiştirmez.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const GROUND = 180`.
2. Add `let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }`.
3. Write `draw()`: fill the canvas with `'#f8fafc'`, draw the ground as a `'#475569'` line 2 pixels tall across the
   canvas at `y = GROUND`, and the runner as a `'#334155'` rectangle. Call `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut, `const GROUND = 180` ekle.
2. `let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }` ekle.
3. `draw()` yaz: canvas'ı `'#f8fafc'` ile doldur, zemini `y = GROUND`'da canvas boyunca 2 piksel kalınlığında
   `'#475569'` bir çizgi, koşucuyu da `'#334155'` bir dikdörtgen olarak çiz. `draw()`'u çağır.

# --tests--

The runner should stand on the ground.
tr: Koşucu zeminde durmalı.

```js
assert.strictEqual(GROUND, 180)
assert.deepEqual(runner, { x: 50, y: 136, w: 40, h: 44 })
assert.strictEqual(runner.y + runner.h, GROUND)
```

The ground line and the runner should be drawn.
tr: Zemin çizgisi ve koşucu çizilmeli.

```js
assert.deepEqual($.rects('#475569'), [{ x: 0, y: 180, w: 600, h: 2, color: '#475569' }])
assert.deepEqual($.rects('#334155'), [{ x: 50, y: 136, w: 40, h: 44, color: '#334155' }])
```

# --seed--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44 }

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

draw()
```
