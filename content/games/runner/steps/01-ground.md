---
title: The ground
title_tr: Zemin
skills: [game.canvas]
---

# --goal--

We are building an endless runner: a runner jumps over cacti while the world rushes by, faster and faster. First the
scene: a light sky and a thin ground line.

# --goal-tr--

**Sonsuz koşucu** yapıyoruz: bir koşucu, dünya giderek hızlanarak akarken kaktüslerin üstünden atlıyor. İnternet
kesilince tarayıcıda çıkan dinozor oyununu hatırla. Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

İlk iş sahne: açık renkli bir gökyüzü ve ince bir **zemin çizgisi**.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line

ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#475569'
ctx.fillRect(0, GROUND, canvas.width, 2)
```

# --meaning--

- `canvas` is the drawing area, `ctx` its drawing pen.
- `GROUND` names the height of the ground once: 180 pixels from the top (y grows downward).
- The first rectangle paints the whole sky; the second is a 2-pixel line across at the ground's height.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki canvas'ı (tuvali) bul; `getContext('2d')` → çizim **kalemi**.
- `const GROUND = 180` → zeminin yüksekliği, yukarıdan 180 piksel. Canvas'ta y **aşağı** doğru büyür. Sayıya bir ad
  veriyoruz ki her yerde aynısını kullanalım.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → bütün tuvali açık gri-beyaza boya (gökyüzü).
- `ctx.fillRect(0, GROUND, canvas.width, 2)` → soldan sağa, 2 piksel kalınlığında bir çizgi: zemin.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: açık bir zemin üstünde ince bir çizgi görmelisin.

# --tests--

The sky and a 2-pixel ground line at y = 180 should be drawn.
tr: Gökyüzü ve y = 180'de 2 piksellik bir zemin çizgisi çizilmeli.

```js
assert.strictEqual(GROUND, 180)
assert.isTrue($.rects('#f8fafc').some((r) => r.w === 600 && r.h === 220))
assert.deepEqual($.rects('#475569'), [{ x: 0, y: 180, w: 600, h: 2, color: '#475569' }])
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

ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#475569'
ctx.fillRect(0, GROUND, canvas.width, 2)
```
