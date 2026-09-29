---
title: Sky and ground
title_tr: Gökyüzü ve zemin
skills: [game.canvas]
---

# --goal--

Behind the sling we paint a light blue sky over the whole canvas, then a green strip of ground from `GROUND` down.

# --goal-tr--

Sapanın arkasına bir dünya lazım: bütün canvas'a açık mavi bir **gökyüzü**, altına da `GROUND`'dan başlayan yeşil bir
**zemin** şeridi.

Canvas'ta **sonra çizilen öncekinin üstüne gelir**, tıpkı üst üste yapıştırılan kâğıtlar gibi. O yüzden gökyüzü ve
zemin direkten **önce** çizilmeli; yoksa direği örterler.

# --code--

```js
ctx.fillStyle = '#bae6fd'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#65a30d'
ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

// The sling and, while aiming, the pulled-back bird and the path it will take.
ctx.fillStyle = '#78350f'
```

# --meaning--

- The sky: a rectangle from `(0, 0)` as big as the canvas (`canvas.width` × `canvas.height`).
- The ground: from `x = 0, y = GROUND`, the full width and `canvas.height - GROUND` (30) tall.
- The comment names everything this part of the drawing will show by the end of the game.

# --meaning-tr--

- `ctx.fillStyle = '#bae6fd'` → açık mavi.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst köşeden başlayıp canvas'ın tam boyu kadar
  (560 × 320) bir dikdörtgen: **bütün tuval** gökyüzü olur.
- `ctx.fillStyle = '#65a30d'` → çimen yeşili.
- `ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)` → `y = 290`'dan başlayan, tam genişlikte,
  320 − 290 = **30 piksel** boyunda şerit: zemin.
- `// The sling and, ...` → bir **yorum**: bilgisayar okumaz, insan için not. Bu bölümün oyun bitince neler
  çizeceğini söylüyor: sapan, nişan alırken geri çekilmiş kuş ve kuşun gideceği yol. Onları adım adım ekleyeceğiz.

# --task--

Write the lines **above** `ctx.fillStyle = '#78350f'` (the sling post stays last), then press **Run**.

# --task-tr--

1. `ctx.fillStyle = '#78350f'` satırının **üstüne** gökyüzü ve zeminin dört satırını yaz.
2. Bir boş satır bırak, yorum satırını yaz. Direğin iki satırı en altta kalsın.
3. **Çalıştır**: mavi gökyüzü, altta yeşil zemin ve zeminin üstünde duran kahverengi direk görmelisin.

# --predict--

What happens if the sky is painted **after** the post instead?
- [ ] Nothing changes
- [x] The post disappears under the sky
  Whatever is drawn later covers what was drawn before.
- [ ] The sky turns brown

# --predict-tr--

Gökyüzünü direkten **sonra** boyasaydık ne olurdu?
- [ ] Hiçbir şey değişmezdi
- [x] Direk gökyüzünün altında kaybolurdu
  Sonra çizilen, önce çizileni örter.
- [ ] Gökyüzü kahverengi olurdu

# --tests--

The ground should be a green strip from `GROUND` to the bottom.
tr: Zemin, `GROUND`'dan en alta uzanan yeşil bir şerit olmalı.

```js
assert.deepInclude($.rects('#65a30d'), { x: 0, y: 290, w: 560, h: 30, color: '#65a30d' })
```

The sky should be painted first, and the sling post after the ground.
tr: Önce gökyüzü, zeminden sonra da sapan direği boyanmalı.

```js
const order = $.screen().filter((c) => c.op === 'fillRect').map((c) => c.fill)
assert.deepEqual(order, ['#bae6fd', '#65a30d', '#78350f'])
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched

ctx.fillStyle = '#bae6fd'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#65a30d'
ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

// The sling and, while aiming, the pulled-back bird and the path it will take.
ctx.fillStyle = '#78350f'
ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
```
