---
title: Type with the keyboard
title_tr: Klavyeyle yaz
skills: [game.input]
---

# --goal--

Each key press sends a `keydown` event. The keyboard sends all kinds of keys (`'Shift'`, `'F5'`, `'1'`...), so we keep
only single letters from a to z, tested with a **regular expression**. Capitals become lower case first.

# --goal-tr--

Şimdi klavyeyi bağlıyoruz. Tarayıcıya "bir tuşa basılınca bana haber ver" deriz: buna **olay dinlemek** (event
listener) denir; kapı zili gibi, çalınca ne yapılacağını önceden söylersin.

Ama klavye her türlü tuşu gönderir: `'Shift'`, `'F5'`, `'1'`... Sadece **tek harfleri** (a'dan z'ye) kabul edeceğiz.
Bunu sormanın kısa bir yolu var: **düzenli ifade** (regular expression), yazılar için küçük bir kalıp.

# --code--

```js
document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (/^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})
```

# --meaning--

- `event.key` is the key's name: `'a'`, `'A'` (with Shift or Caps Lock), `'Shift'`, `'Enter'`...
- One-character keys are turned into lower case; longer names stay as they are.
- `/^[a-z]$/` is a pattern: exactly one character from a to z. `.test(key)` says whether `key` matches it.
- `event.preventDefault()` stops the browser from doing its own thing with the key.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → sayfada bir tuşa **basıldığında** süslü parantez içini
  çalıştır. `event` basılan tuşun bilgilerini taşır; `event.key` tuşun adı.
- `event.key.length === 1 ? event.key.toLowerCase() : event.key` → kısa bir **if** (`koşul ? a : b`): ad tek
  karakterse **küçük harfe** çevir (`'A'` → `'a'`; Shift ya da Caps Lock açıkken büyük gelir), değilse (`'Shift'`)
  olduğu gibi bırak.
- `/^[a-z]$/` → bir **düzenli ifade**: `[a-z]` "a'dan z'ye bir harf", `^` "başı", `$` "sonu". Yani yazının **tamamı**
  tek bir harf olmalı; `'Shift'` ya da `'F5'` araya sızamaz.
- `.test(key)` → `key` bu kalıba **uyuyor mu**? `true` ya da `false`.
- `event.preventDefault()` → tarayıcının o tuşla yapacağı **kendi işini engeller** (örneğin sayfada aramaya başlamak).

# --task--

Under the `type` function, leave an empty line and write the listener. Press **Run**, click the game and type.

# --task-tr--

Dinleyiciyi `type` fonksiyonunun altına, bir boş satır bırakarak yaz. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna
gitsin). Harfleri henüz çizmiyoruz; kontroller yazılanı okuyor.

# --hint--

The pattern is `/^[a-z]$/`: slashes around it, `^` at the start and `$` at the end.

# --hint-tr--

Kalıp `/^[a-z]$/`: iki yanında eğik çizgi, başta `^`, sonda `$`.

# --tests--

Letter keys should type, in lower case.
tr: Harf tuşları küçük harf olarak yazmalı.

```js
$.press('c')
$.press('R')
$.press('a')
assert.strictEqual(current, 'cra')
```

Other keys should be ignored.
tr: Diğer tuşlar yok sayılmalı.

```js
for (const k of ['q', '1', 'Shift', 'w', 'e', 'F5', 'r', 't', 'y']) $.press(k)
assert.strictEqual(current, 'qwert')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (/^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
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
