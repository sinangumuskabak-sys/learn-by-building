---
title: Paint the paper
title_tr: Kâğıdı boya
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas gets a light, paper-like color. The game will be drawn on it.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün tuvali açık, **kâğıt gibi** bir renge boyayacağız. Darağacı, kelime ve klavye bu
kâğıdın üstüne gelecek.

Çizim hep iki adımdır: önce kalemin **rengini** seçersin, sonra o renkle bir şekil **doldurursun**.

# --code--

```js
ctx.fillStyle = '#fefce8'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#fefce8'` picks the fill color, a very light yellow.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner; `canvas.width` and
  `canvas.height` (480 and 480) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#fefce8'` → kalemin **dolgu rengini** seçer. `#fefce8` çok açık, kâğıt gibi bir sarı.
  (Renkler `'red'` gibi adla ya da `#` ile başlayan bir kodla yazılabilir.)
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer. Dört sayı sırayla:
  - `0, 0` → sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür.
  - `canvas.width, canvas.height` → eni ve boyu: tuvalin kendi boyu (480 ve 480). Yani her yer.

# --task--

At the very end, after the list, leave an empty line and write the two lines. Press **Run**.

# --task-tr--

Dosyanın **en sonuna**, `]` satırından sonra bir boş satır bırakıp iki satırı yaz ve **Çalıştır**'a bas. Sağdaki
alan açık sarıya boyanmalı.

# --try--

Change `'#fefce8'` to `'lightblue'` and run. Put `'#fefce8'` back before moving on.

# --try-tr--

`'#fefce8'` yerine `'lightblue'` yaz ve çalıştır: kâğıt maviye döner. Devam etmeden önce `'#fefce8'`'e geri al.

# --tests--

The whole 480×480 canvas should be filled with `#fefce8`.
tr: 480×480'lik tuvalin tamamı `#fefce8` ile boyanmalı.

```js
const full = $.rects('#fefce8').filter((r) => r.x === 0 && r.y === 0 && r.w === 480 && r.h === 480)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #fefce8')
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]

ctx.fillStyle = '#fefce8'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
