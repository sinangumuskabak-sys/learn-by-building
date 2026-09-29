---
title: Paint the board
title_tr: Tahtayı boya
skills: [game.canvas]
---

# --goal--

Now we draw for the first time: the whole canvas gets a dark background, the board the snake will move on.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün canvas'ı koyu renge boyayacağız. Burası yılanın dolaşacağı **oyun tahtası**
olacak.

Çizim hep iki adımdır: önce kalemin **rengini** seçersin, sonra o renkle bir şekil **doldurursun**.

# --code--

```js
ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#111'` picks the fill color: `#111` is almost black.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner; `canvas.width` and
  `canvas.height` (400 and 400) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#111'` → kalemin **dolgu rengini** seçer. `#111` siyaha çok yakın bir gri.
  (Renkler `'red'` gibi adla ya da `#` ile başlayan kodla yazılabilir.)
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer. Dört sayı sırayla:
  - `0, 0` → dikdörtgenin sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür.
  - `canvas.width, canvas.height` → genişlik ve yükseklik: canvas'ın kendi boyu (400 ve 400). Yani bütün tuval.

# --task--

Leave an empty line under `const ctx = ...`, write the two lines, then press **Run**.

# --task-tr--

`const ctx = ...` satırının altında bir satır boşluk bırak, iki satırı yaz ve **Çalıştır**'a bas.

# --predict--

What will you see after Run?
- [x] The whole game area turns dark
- [ ] A small dark square in the corner
  `canvas.width` and `canvas.height` are the full size, so it covers everything.
- [ ] Nothing changes

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [x] Oyun alanının tamamı koyu renge boyanır
- [ ] Köşede küçük koyu bir kare
  `canvas.width` ve `canvas.height` tuvalin tam boyu; dikdörtgen her yeri kaplar.
- [ ] Hiçbir şey değişmez

# --try--

Change `'#111'` to `'navy'` and run: the board turns dark blue. Put `'#111'` back before moving on.

# --try-tr--

`'#111'` yerine `'navy'` yaz ve çalıştır: tahta lacivert olur. Devam etmeden önce `'#111'`'e geri al.

# --tests--

The whole 400×400 board should be filled with `#111`.
tr: 400×400'lük tahtanın tamamı `#111` ile boyanmalı.

```js
const full = $.rects('#111').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 400)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #111')
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
