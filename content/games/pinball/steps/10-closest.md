---
title: Does the ball touch a wall?
title_tr: Top duvara değiyor mu?
skills: [game.collision, prog.functions]
---

# --goal--

To stop the ball at a wall we must first know whether it touches one. We find the point of the wall closest to the
ball's centre; if that point is nearer than `R`, they touch. This works for any slanted line.

# --goal-tr--

Duvarların topu durdurması için önce şunu bilmeliyiz: top bir duvara **değiyor mu?** Duvarlarımız eğik de olabilen
çizgi parçaları; yuvarlak bir topun eğik bir çizgiye değmesini nasıl anlarız?

Fikir şu: çizginin üstünde topun merkezine **en yakın noktayı** buluruz. O noktayla merkez arasındaki uzaklık
yarıçaptan (`R`) küçükse, top çizgiye **girmiş** demektir. Bir ipe en yakın yerinden dokunmak gibi.

Bu adımda yalnız "değiyor mu?" sorusunu cevaplayan fonksiyonu yazıyoruz: `hitSegment`. Adındaki "hit" çarpmak demek.
Yorum satırı, fonksiyonun birkaç adım sonra ne yapacağını anlatıyor: topu dışarı itmek ve sektirmek.

# --code--

```js
// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  return true
}
```

# --meaning--

- `dx`, `dy` is the step from one end of the segment to the other.
- `t` says where the closest point is: 0 at the start, 1 at the end, 0.5 in the middle. It is the projection of the
  ball onto the line (a dot product divided by the length squared), clamped between 0 and 1 with `Math.max` and
  `Math.min` so the point stays on the segment.
- `(px, py)` is that closest point; `Math.hypot` gives its distance `d` to the ball's centre.
- It returns `true` when `d` is less than `R`. `bounce` (how springy the wall is) is used in two steps.

# --meaning-tr--

- `dx`, `dy` → çizginin bir ucundan öbür ucuna gitmek için ne kadar sağa ve aşağı gidilir.
- `t` → en yakın noktanın çizginin **neresinde** olduğu: `0` baş, `1` son, `0.5` tam orta.
  - Uzun kesir, topun merkezini çizginin üstüne **dik olarak yansıtır** (izdüşüm). Pay, "top çizgi yönünde ne kadar
    ilerde" sorusunun cevabı (buna **nokta çarpımı** denir: `ax * bx + ay * by`); payda çizginin uzunluğunun karesi.
  - `Math.min(1, ...)` iki sayıdan **küçüğünü**, `Math.max(0, ...)` **büyüğünü** seçer. Birlikte `t`'yi 0 ile 1
    arasına **sıkıştırırlar**: nokta çizginin dışına taşmaz, gerekirse bir uçta kalır.
- `px`, `py` → en yakın noktanın kendisi: başlangıçtan `t` kadar yol almış nokta.
- `Math.hypot(a, b)` → `a` ve `b` kenarlı dik üçgenin uzun kenarı (Pisagor): iki nokta arasındaki **uzaklık**. `d`
  en yakın nokta ile topun merkezi arasındaki uzaklık.
- `if (d >= R || d === 0) return false` → uzaklık yarıçaptan küçük değilse top değmiyor: `false` (hayır) döndür ve
  bitir. `d === 0` (merkez tam çizginin üstünde) garip bir durum; yönü bilinemediği için onu da atlarız.
- `return true` → buraya geldiysek top çizgiye değiyor: `true` (evet).
- `bounce` → duvarın ne kadar **esnek** olduğu. Şimdilik kullanılmıyor; iki adım sonra sekmede kullanacağız.

# --task--

Write the comment and `hitSegment` above `function update() {`, with an empty line after it.

# --task-tr--

1. Yorum satırını ve `hitSegment` fonksiyonunu `function update() {` satırının **üstüne** yaz; altında bir boş satır
   kalsın.
2. Uzun `t` satırını dikkatle yaz: her açılan parantezin bir kapanışı olmalı.
3. **Çalıştır**. Ekran değişmez; fonksiyonu henüz kimse çağırmıyor. Kontroller onu kendileri deniyor.

# --hint--

Count the parentheses in the `t` line: `Math.max(0, Math.min(1, ( ... ) / ( ... )))` closes three at the end.

# --hint-tr--

`t` satırındaki parantezleri say: `Math.max(0, Math.min(1, ( ... ) / ( ... )))` sonda üç parantez kapatır.

# --tests--

A ball closer than `R` to a wall should touch it; a far one should not.
tr: Bir duvara `R`'den yakın top ona değmeli; uzaktaki değmemeli.

```js
ball = { x: 25, y: 300, vx: 0, vy: 0 }
assert.isTrue(hitSegment(20, 470, 20, 120, 0.5), '5 pixels from the left wall')
ball = { x: 200, y: 300, vx: 0, vy: 0 }
assert.isFalse(hitSegment(20, 470, 20, 120, 0.5), 'far away')
```

Slanted walls should work too.
tr: Eğik duvarlarda da çalışmalı.

```js
ball = { x: 100 + 3, y: 38.5 + 7, vx: 0, vy: 0 }
assert.isTrue(hitSegment(60, 55, 140, 22, 0.5), 'just under the slanted top')
ball = { x: 100 + 9, y: 38.5 + 21, vx: 0, vy: 0 }
assert.isFalse(hitSegment(60, 55, 140, 22, 0.5), 'further under it')
```

The closest point should stay on the segment, at an end if need be.
tr: En yakın nokta parçanın üstünde, gerekirse bir ucunda kalmalı.

```js
ball = { x: 20, y: 114, vx: 0, vy: 0 }
assert.isTrue(hitSegment(20, 470, 20, 120, 0.5), '6 pixels past the end still touches')
ball = { x: 25, y: 100, vx: 0, vy: 0 }
assert.isFalse(hitSegment(20, 470, 20, 120, 0.5), 'beyond the end of the wall, not on its long line')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  return true
}

function update() {
  ball.vy += GRAVITY
  ball.x += ball.vx
  ball.y += ball.vy
}

function launch() {
  ball.vy = -16
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
