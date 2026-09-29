---
title: Walking by distance
title_tr: Mesafeyle yürümek
skills: [prog.functions]
---

# --goal--

How do you move something along a road with corners? Steering it gets messy. Much simpler: give each enemy **one
number**, `d`, the distance walked along the road, and write a function that turns a distance into a point.

# --goal-tr--

Köşeli bir yolda bir şeyi nasıl yürütürsün? "Köşeye kadar sağa git, sonra aşağı dön" diye yönlendirmek çabucak
karışır. Çok daha basit bir fikir var: her düşmana **tek bir sayı** ver: `d`, yol boyunca yürüdüğü mesafe (kare
olarak). Yürümek sadece `d`'yi büyütmek olur.

`pointAt(d)` bu mesafeyi haritada bir **noktaya** çevirir: yolun düz parçalarını sırayla dener; `d` o parçaya
sığıyorsa oradaki noktayı verir, sığmıyorsa parçanın boyunu düşüp sonrakine geçer. Yolun sonunu geçtiyse `null`.

Bu fikre yolu **parametrelemek** denir ve çok işe yarar: "geçmeye en yakın düşman hangisi?" en büyük `d`'dir; "geçip
gitti mi?" ise `pointAt(d) === null`.

# --code--

```js
// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}
```

# --meaning--

- A piece from corner `a` to corner `b` is `|bx - ax| + |by - ay|` tiles long (one of the two is 0).
- If `d` fits, the point is `d` tiles from `a` towards `b`; `Math.sign` gives the direction.
- Otherwise the piece is used up: `d -= length`, and the next piece is tried. Past the last piece: `null`.

# --meaning-tr--

- `for (let i = 1; i < PATH.length; i++)` → yolun her düz parçası: `a` köşesinden (`PATH[i - 1]`) `b` köşesine.
- `const length = Math.abs(bx - ax) + Math.abs(by - ay)` → parçanın boyu. Farklardan biri hep 0; `Math.abs` eksiyi
  atar.
- `if (d <= length) return { ... }` → `d` bu parçaya sığıyorsa: `a`'dan `b`'ye doğru `d` kare ötesi.
  `ax + Math.sign(bx - ax) * d` → yatayda (parça dikeyse `Math.sign` 0 verir, `x` sabit kalır).
- `d -= length` → sığmıyorsa bu parçayı "yürümüş say" ve kalan mesafeyle sonrakini dene.
- `return null` → bütün parçalar bitti: düşman yolun sonunu geçti.

# --task--

Under `reset`, after an empty line, write the comment and `pointAt`.

# --task-tr--

1. `reset` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırakıp yorumu ve `pointAt`'i yaz.
2. **Çalıştır**: ekranda fark yok; kontroller yeşil olmalı.

# --predict--

Where is `pointAt(15)`? (The first pieces are 4, 5 and 4 tiles long.)
- [ ] `{ x: 7, y: 6 }`
- [x] `{ x: 7, y: 4 }`
  4 + 5 + 4 = 13 tiles bring you to the corner (7, 6); 2 more tiles go up the next piece.
- [ ] `null`

# --predict-tr--

`pointAt(15)` nerede? (İlk parçalar 4, 5 ve 4 kare uzunluğunda.)
- [ ] `{ x: 7, y: 6 }`
- [x] `{ x: 7, y: 4 }`
  4 + 5 + 4 = 13 kare seni (7, 6) köşesine getirir; kalan 2 kare sonraki parçada yukarı çıkar.
- [ ] `null`

# --tests--

A distance along the road should turn into a point on it.
tr: Yol boyunca bir mesafe, üstünde bir noktaya dönüşmeli.

```js
assert.deepEqual(pointAt(0), { x: -1, y: 1 })
assert.deepEqual(pointAt(4), { x: 3, y: 1 })
assert.deepEqual(pointAt(4.5), { x: 3, y: 1.5 })
assert.deepEqual(pointAt(9), { x: 3, y: 6 })
assert.deepEqual(pointAt(15), { x: 7, y: 4 })
assert.deepEqual(pointAt(27), { x: 12, y: 7 })
```

Past the end of the road it should give `null`.
tr: Yolun sonunu geçince `null` vermeli.

```js
assert.isNull(pointAt(27.01))
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]

let road // keys of the tiles the road covers

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
