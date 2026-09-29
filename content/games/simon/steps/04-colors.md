---
title: Two colors for every pad
title_tr: Her tuşa iki renk
skills: [prog.arrays]
---

# --goal--

Each pad has two colors: a dim one for "off" and a bright one for "lit". We keep both in an object, and the four pads
in an array, `PADS`.

# --goal-tr--

Her tuşun **iki rengi** var: sönükken koyu (`dim`), yanarken parlak (`lit`). Bir lamba gibi: kapalıyken mat, açıkken
ışıl ışıl.

İki rengi bir **nesnede**, dört tuşu da sıralı bir **listede** (dizi) tutacağız. Ekranda bu adımda bir şey değişmeyecek;
listeyi bir sonraki adımda kullanacağız.

# --code--

```js
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]
```

# --meaning--

- `{ dim: ..., lit: ... }` is an object: two named colors in one package.
- `[ ... ]` is an array of four such objects: green, red, yellow, blue.
- Items are numbered from 0: `PADS[0]` is green (top left), `PADS[3]` blue (bottom right).

# --meaning-tr--

- `{ dim: '#14532d', lit: '#4ade80' }` → bir **nesne**: `ad: değer` çiftlerinden oluşan bir paket. `dim` sönük renk,
  `lit` parlak renk. Nokta ile okunur: `PADS[0].lit` "ilk tuşun parlak rengi".
- `[ ... ]` → köşeli parantez bir **dizi** açar: sıralı bir liste. Elemanlar virgülle ayrılır; burada dört nesne var:
  yeşil, kırmızı, sarı, mavi.
- Elemanlar **0'dan** numaralanır: `PADS[0]` yeşil (sol üst), `PADS[1]` kırmızı (sağ üst), `PADS[2]` sarı (sol alt),
  `PADS[3]` mavi (sağ alt).
- En üstteki yorum satırı bunu hatırlatıyor.

# --task--

Under `HALF`, write the comment and `PADS`. Copy the color codes carefully. Press **Run**.

# --task-tr--

`const HALF = ...` satırının altına yorum satırını ve `PADS` listesini yaz. Renk kodlarını dikkatle yaz; kontroller bu renklere bakıyor. **Çalıştır**: ekran aynı kalmalı.

# --hint--

Each object has `dim` first, then `lit`, and the objects are separated by commas.

# --hint-tr--

Her nesnede önce `dim`, sonra `lit` var; nesneler birbirinden virgülle ayrılır.

# --tests--

`PADS` should list the four pads' dim and lit colors in order.
tr: `PADS` dört tuşun sönük ve parlak renklerini sırayla listelemeli.

```js
assert.deepEqual(PADS, [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
])
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

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#14532d'
ctx.fillRect(6, TOP + 6, HALF - 12, HALF - 12)
```
