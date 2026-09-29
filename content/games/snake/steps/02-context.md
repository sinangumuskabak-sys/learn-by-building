---
title: Get the pen
title_tr: Kalemi al
skills: [game.canvas]
---

# --goal--

The canvas itself cannot draw. We ask it for a **2D context**: the object with all the drawing commands.

# --goal-tr--

Canvas tek başına çizim yapamaz; ona çizim yapacak bir **kalem** lazım. Bu kaleme "2D bağlam" (2D context)
denir: kare çizmek, boyamak, yazı yazmak gibi bütün çizim komutları onun içinde.

Bu adımda da ekran değişmeyecek; kalemi elimize alıyoruz.

# --code--

```js
const ctx = canvas.getContext('2d')
```

# --meaning--

- `canvas.getContext('2d')` asks the canvas for its 2D drawing tools.
- We call it `ctx` (short for context); every drawing line will start with `ctx.`

# --meaning-tr--

- `canvas.getContext('2d')` → canvas'tan **2 boyutlu çizim kalemini** ister.
- `const ctx =` → bu kaleme `ctx` adını verir (context'in kısaltması). Bundan sonraki bütün çizim satırları
  `ctx.` ile başlayacak: "kalemle şunu yap".

# --task--

Write the line under `const canvas = ...`, then press **Run**.

# --task-tr--

Bu satırı `const canvas = ...` satırının hemen **altına** yaz ve **Çalıştır**'a bas.

# --hint--

Use `canvas` (the name from the step before), then `.getContext('2d')`.

# --hint-tr--

Bir önceki adımdaki `canvas` adını kullan, sonra `.getContext('2d')` yaz.

# --tests--

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D çizim bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```
