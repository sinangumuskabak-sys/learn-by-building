---
title: The world is a flat map
title_tr: Dünya düz bir harita
skills: [game.canvas]
---

# --explanation--

The first 3D shooters had a secret: their worlds were not really 3D. The level is a **flat grid**, seen from above, and
the 3D picture is computed from it every frame. So we start where the game really lives: a map.

```
'#....#.....#'      # stone wall   2 brick wall   E exit   . floor
```

The player has a position **inside** a tile, not just a tile: `{ x: 1.5, y: 1.5 }` is the middle of tile (1, 1). And the
player faces a direction, an **angle** in radians: `0` looks right (+x), `Math.PI / 2` looks down (+y, because y grows
downwards on a screen), `Math.PI` looks left.

To draw where the player looks, go 1 tile along the angle:

```js
x + Math.cos(angle), y + Math.sin(angle)
```

`cos` and `sin` turn an angle into a step of length 1: how much across and how much down. Every movement and every ray
in this game comes from these two numbers.

# --explanation-tr--

İlk 3B nişancı oyunlarının bir sırrı vardı: dünyaları aslında 3B değildi. Bölüm yukarıdan görülen **düz bir ızgaradır** ve
3B resim her karede ondan hesaplanır. Bu yüzden oyunun gerçekten yaşadığı yerden başlıyoruz: bir harita.

```
'#....#.....#'      # taş duvar   2 tuğla duvar   E çıkış   . zemin
```

Oyuncunun yalnızca bir döşemesi değil, döşemenin **içinde** bir konumu vardır: `{ x: 1.5, y: 1.5 }` (1, 1) döşemesinin
ortasıdır. Ve oyuncu bir yöne, radyan cinsinden bir **açıya** bakar: `0` sağa (+x) bakar, `Math.PI / 2` aşağı bakar (+y,
çünkü ekranda y aşağı doğru büyür), `Math.PI` sola bakar.

Oyuncunun nereye baktığını çizmek için açı boyunca 1 döşeme git:

```js
x + Math.cos(angle), y + Math.sin(angle)
```

`cos` ve `sin` bir açıyı 1 uzunluğunda bir adıma çevirir: ne kadar yana ve ne kadar aşağı. Bu oyundaki her hareket ve her
ışın bu iki sayıdan gelir.

# --task--

1. Add the `MAP` from the solution and `MINI = 24` (map pixels per tile). `reset()` puts the player at
   `{ x: 1.5, y: 1.5, angle: 0 }`.
2. Draw every frame: a `'#0f172a'` background, then every tile of the map as a `MINI` square: floor
   `'rgba(15, 23, 42, 0.6)'`, exit `'#22c55e'`, any wall `'rgba(226, 232, 240, 0.8)'`.
3. Draw the player as a `'#facc15'` square half a tile wide, centered on its position, and a `'#facc15'` line from the
   player to 1 tile ahead in the direction of `angle`.

# --task-tr--

1. Çözümdeki `MAP`'i ve `MINI = 24`'ü (döşeme başına harita pikseli) ekle. `reset()` oyuncuyu
   `{ x: 1.5, y: 1.5, angle: 0 }`'a koyar.
2. Her karede çiz: `'#0f172a'` bir arka plan, sonra haritanın her döşemesini bir `MINI` karesi olarak: zemin
   `'rgba(15, 23, 42, 0.6)'`, çıkış `'#22c55e'`, her duvar `'rgba(226, 232, 240, 0.8)'`.
3. Oyuncuyu konumunda ortalanmış, yarım döşeme genişliğinde `'#facc15'` bir kare olarak ve oyuncudan `angle` yönünde 1
   döşeme öteye `'#facc15'` bir çizgi olarak çiz.

# --tests--

The map should be drawn tile by tile.
tr: Harita döşeme döşeme çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('rgba(226, 232, 240, 0.8)'), 82)
assert.lengthOf($.rects('rgba(15, 23, 42, 0.6)'), 61)
assert.deepEqual($.rects('#22c55e'), [{ x: 240, y: 240, w: 24, h: 24, color: '#22c55e' }])
```

The player should be drawn at its position, looking along its angle.
tr: Oyuncu konumunda, açısı boyunca bakarak çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#facc15'), [{ x: 30, y: 30, w: 12, h: 12, color: '#facc15' }])
const line = $.screen().filter((c) => c.op === 'lineTo').pop()
assert.deepEqual(line.args, [60, 36])
player.angle = Math.PI / 2
$.tick(1)
const down = $.screen().filter((c) => c.op === 'lineTo').pop()
assert.closeTo(down.args[0], 36, 1e-9)
assert.closeTo(down.args[1], 60, 1e-9)
```

# --seed--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MINI = 24 // map pixels per tile

let player

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The map, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
