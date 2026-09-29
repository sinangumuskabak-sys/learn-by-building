---
title: Remember held keys
title_tr: Basılı tuşları hatırla
skills: [game.input]
---

# --goal--

A paddle should move while its key is **held**, and two players press keys at the same time. So we keep a note of
every key that is down: `keydown` writes `true`, `keyup` writes `false`.

# --goal-tr--

Raket, tuş **basılı tutulduğu sürece** hareket etmeli. Üstelik iki oyuncu aynı anda tuşa basabilir. Bu yüzden her tuş
için bir **not** tutacağız: basıldı mı, bırakıldı mı?

Tarayıcı bir tuşa basılınca `keydown`, bırakılınca `keyup` **olayını** duyurur. İkisini dinleyip notu güncelleyeceğiz.
Bir yoklama defteri gibi: gelen "var", giden "yok".

# --code--

```js
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
```

# --meaning--

- `keys` is an empty object that will hold one entry per key: `keys.w` is `true` while W is down.
- `addEventListener('keydown', ...)` runs the function whenever a key goes down; `event.key` is its name.
- `keys[event.key] = true` writes into the entry whose name is in `event.key`.

# --meaning-tr--

- `const keys = {}` → `{}` **boş bir nesne**. İçine tuş adlarıyla bilgi yazacağız: `keys.w` W basılıyken `true` olacak.
- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** içini çalıştır".
  `(event) => { }` adı olmayan kısa bir fonksiyon (ok fonksiyonu); `event` basılan tuşun bilgilerini taşır.
- `event.key` → tuşun adı: `'w'`, `'s'`, `'ArrowUp'`...
- `keys[event.key] = true` → **köşeli parantezle** yazma: adı bir değişkende duran alana değer ver. W basıldıysa
  `keys['w'] = true`, yani `keys.w = true`.
- `keyup` → tuş **bırakıldığında**: aynı alanı `false` yap.

# --task--

Under the `right` line, write `keys` and, after an empty line, the two listeners. Press **Run**.

# --task-tr--

1. `let right = ...` satırının altına `const keys = {}` yaz.
2. Bir boş satır bırak ve iki dinleyiciyi yaz.
3. **Çalıştır**. Ekran değişmez; kontroller tuş notlarına bakacak.

# --hint--

`keydown` writes `true`, `keyup` writes `false`. Check the event names.

# --hint-tr--

`keydown` `true` yazar, `keyup` `false` yazar. Olay adlarını kontrol et.

# --tests--

`keys` should track which keys are held.
tr: `keys` hangi tuşların basılı olduğunu izlemeli.

```js
$.press('w')
assert.isTrue(keys.w)
$.press('ArrowDown')
assert.isTrue(keys.ArrowDown)
$.release('w')
assert.isFalse(keys.w)
assert.isTrue(keys.ArrowDown, 'W going up should not change the other key')
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
