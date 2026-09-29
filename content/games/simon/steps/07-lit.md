---
title: Light a pad
title_tr: Bir tuşu yak
skills: [game.state]
---

# --goal--

One variable, `lit`, says which pad is lit (`-1` for none). Each pad picks its bright color if it is the lit pad, and
its dim color otherwise. Whatever lights a pad later only has to change `lit`.

# --goal-tr--

Hangi tuşun yandığını **tek bir değişken** söyleyecek: `lit`. Değeri tuşun numarası (0–3) ya da `-1`: "hiçbiri"
(`-1` numaralı tuş yok).

Çizerken her tuş kendine sorar: "Yanan tuş ben miyim? Evetse parlak rengimi, değilse sönük rengimi kullanırım."
İleride tuşu kim yakarsa yaksın (bilgisayar ya da sen), sadece `lit`'i değiştirmesi yetecek.

# --code--

```js
let lit = -1 // the pad lit right now, or -1

    ctx.fillStyle = i === lit ? pad.lit : pad.dim
```

# --meaning--

- `let` makes a variable whose value can change later.
- `i === lit ? pad.lit : pad.dim` is a short question: if this pad is the lit one, the bright color, otherwise the dim
  one.

# --meaning-tr--

- `let lit = -1` → `let` bir **değişken** tanımlar: `const`'tan farkı, değeri **sonradan değişebilir**. Başta `-1`:
  hiçbir tuş yanmıyor.
- `i === lit ? pad.lit : pad.dim` → **kısa soru**: soru işaretinden önce soru, iki noktanın iki yanında iki cevap.
  `===` "tam olarak eşit mi?" diye sorar. "Bu tuşun numarası `lit` mi? Evetse `pad.lit` (parlak), değilse `pad.dim`
  (sönük)."
- Dikkat: `lit` (değişken) ile `pad.lit` (tuşun parlak rengi) farklı şeyler; biri numara, biri renk.

# --task--

1. Under `PADS`, leave an empty line and write the `lit` line.
2. In `draw`, change `ctx.fillStyle = pad.dim` as shown.

# --task-tr--

1. `PADS` listesinin kapanan `]` işaretinin altına bir boş satır bırakıp `lit` satırını yaz.
2. `draw` içindeki `ctx.fillStyle = pad.dim` satırını `ctx.fillStyle = i === lit ? pad.lit : pad.dim` yap.
3. **Çalıştır**: ekran aynı (hiçbir tuş yanmıyor).

# --try--

Change `let lit = -1` to `let lit = 0` and run: the green pad shines. Put `-1` back.

# --try-tr--

`let lit = -1` satırını `let lit = 0` yap ve çalıştır: yeşil tuş parlar. Sonra `-1`'e geri al.

# --tests--

`lit` should start at -1: no pad lit.
tr: `lit` -1 ile başlamalı: yanan tuş yok.

```js
assert.strictEqual(lit, -1)
```

The lit pad should be drawn bright, the others dim.
tr: Yanan tuş parlak, diğerleri sönük çizilmeli.

```js
lit = 3
draw()
assert.lengthOf($.rects('#60a5fa'), 1)
assert.lengthOf($.rects('#1e3a8a'), 0)
assert.lengthOf($.rects('#14532d'), 1)
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

let lit = -1 // the pad lit right now, or -1

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

draw()
```
