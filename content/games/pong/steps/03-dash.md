---
title: One dash of the net
title_tr: Filenin bir parçası
skills: [game.canvas]
---

# --goal--

The net in the middle is a dashed line. We draw its first dash: a white rectangle 4 pixels wide and 15 tall, centered
on the middle of the court.

# --goal-tr--

Sahanın ortasında **kesikli** bir çizgi olacak: file. Önce ilk parçasını çiziyoruz: 4 piksel eninde, 15 piksel boyunda
beyaz bir dikdörtgen, tam ortada.

# --code--

```js
ctx.fillStyle = 'white'
ctx.fillRect(canvas.width / 2 - 2, 0, 4, 15)
```

# --meaning--

- `canvas.width / 2` is the middle (300); `- 2` centers a 4 pixel wide dash on it.
- `0` is the top; the dash is 15 pixels tall.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → beyaz.
- `canvas.width / 2 - 2` → `/` bölme: 600 / 2 = 300, sahanın ortası. 4 piksellik parçanın ortası tam 300'e gelsin
  diye 2 piksel erken başlarız: **298**.
- `0` → en tepeden başlar. `4, 15` → 4 piksel en, 15 piksel boy.
- Satırlar siyah boyamanın **altında**: sonra çizilen, öncekinin üstüne gelir.

# --task--

At the very end, leave an empty line and write the two white lines. Press **Run**.

# --task-tr--

Dosyanın **en sonuna**, bir boş satırdan sonra iki beyaz satırı yaz. **Çalıştır**: tepenin ortasında küçük beyaz bir çizgi görmelisin.

# --tests--

One white dash should be drawn at the top middle.
tr: Tepenin ortasına tek bir beyaz parça çizilmeli.

```js
assert.deepEqual($.rects('white'), [{ x: 298, y: 0, w: 4, h: 15, color: 'white' }])
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'white'
ctx.fillRect(canvas.width / 2 - 2, 0, 4, 15)
```
