---
title: Cities that can fall
title_tr: Yıkılabilen şehirler
skills: [prog.arrays, game.state]
---

# --goal--

A city can be destroyed, so each city needs to remember whether it is still standing. `reset()` turns the list of x
positions into a list of city objects.

# --goal-tr--

Şehirler yıkılabilecek; her şehrin **hâlâ ayakta olup olmadığını** hatırlaması lazım. Sayı listesinden bir **nesne
listesi** yapacağız: her şehir `{ x, alive }` gibi küçük bir kart. `alive` (canlı) `true` ise ayakta, `false` ise
yıkık.

Bu işi `reset` (sıfırla) adlı bir fonksiyona koyuyoruz, çünkü her yeni oyunda şehirleri baştan kuracağız. Ekranda bir
şey değişmeyecek.

# --code--

```js
let cities

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
}

reset()
```

# --meaning--

- `map` makes a new list by passing every item through a function: each x becomes `{ x, alive: true }`.
- `{ x }` is shorthand for `{ x: x }`. The extra `( )` around the object are needed, or `{` would start a function body.
- `reset()` is called once, before the loop starts.

# --meaning-tr--

- `let cities` → şehir listesi. Değerini `reset()` verecek.
- `CITY_XS.map((x) => ({ x, alive: true }))` → `map` listedeki her elemanı küçük bir fonksiyondan geçirip **yeni bir
  liste** yapar. Her sayı `x` → bir nesne `{ x, alive: true }` olur. Altı sayı, altı şehir kartı.
- `{ x }` → kısaltma: `{ x: x }` ile aynı ("`x` alanına `x`'in değerini koy").
- Nesnenin etrafındaki `( )` şart: onlar olmasa JavaScript `{`'i fonksiyonun gövdesinin başlangıcı sanırdı.
- En alttaki `reset()` → oyun başlarken şehirleri bir kez kurar. Döngüden **önce** gelir.

# --task--

1. Under `const CITY_XS = ...` leave an empty line and write `let cities` and the `reset` function.
2. Write `reset()` just above the last `requestAnimationFrame(loop)`.

# --task-tr--

1. `const CITY_XS = ...` satırının altına bir boş satır bırak; `let cities` satırını ve `reset` fonksiyonunu yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **hemen üstüne** `reset()` yaz.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

Wrap the object in parentheses: `(x) => ({ x, alive: true })`.

# --hint-tr--

Nesneyi paranteze al: `(x) => ({ x, alive: true })`.

# --tests--

There should be six living cities.
tr: Altı yaşayan şehir olmalı.

```js
assert.deepEqual(cities.map((c) => c.x), [50, 110, 170, 310, 370, 430])
assert.isTrue(cities.every((c) => c.alive))
```

`reset()` should rebuild all six cities.
tr: `reset()` altı şehri de yeniden kurmalı.

```js
cities[2].alive = false
reset()
assert.deepEqual(cities[2], { x: 170, alive: true })
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

let cities

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  ctx.fillStyle = '#38bdf8'
  for (const x of CITY_XS) {
    ctx.fillRect(x - 16, GROUND - 14, 32, 14)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
