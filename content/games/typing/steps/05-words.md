---
title: A list of words
title_tr: Kelime listesi
skills: [prog.arrays]
---

# --goal--

Many words will fall at once. Each word is an object `{ text, x, y }`, and all of them live in an array `words`.
`draw` writes every word where it is.

# --goal-tr--

Aynı anda birçok kelime düşecek. Her kelimenin üç bilgisi var: **yazısı**, **yatay yeri** (`x`) ve **yüksekliği**
(`y`). Bunları bir **nesnede** (object) paketleriz: `{ text: 'cat', x: 300, y: 60 }`.

Bütün kelimeleri de bir **dizide** (array) tutarız: sıralı bir liste, alışveriş listesi gibi. `draw` listedeki her
kelimeyi kendi yerine yazacak. Şimdilik listeye elle iki kelime koyuyoruz.

# --code--

```js
let words // { text, x, y }

function reset() {
  words = [
    { text: 'rocket', x: 40, y: 120 },
    { text: 'cat', x: 300, y: 60 },
  ]
}

  for (const w of words) ctx.fillText(w.text, w.x, w.y)

reset()
draw()
```

# --meaning--

- `let words` makes a variable whose value can change later; `reset` fills it.
- `[ ... ]` is an array; each `{ text, x, y }` inside is an object, three named values in one package.
- `for (const w of words)` runs the line once for each word, calling it `w`; `w.text` reads the `text` inside it.
- `reset()` sets up the words once, before the first `draw()`.

# --meaning-tr--

- `let words` → bir **değişken**: adı `words` olan bir kutu. `const`'tan farkı: `let` ile açılan kutunun içi
  **sonradan değiştirilebilir**. İçini `reset` dolduracak.
- `// { text, x, y }` → kendimize not: listedeki her kelimenin biçimi.
- `words = [ ... ]` → köşeli parantez bir **dizi** açar; içinde virgülle ayrılmış iki **nesne** var.
- `{ text: 'rocket', x: 40, y: 120 }` → süslü parantez bir nesne açar: `ad: değer` çiftleri.
- `for (const w of words) ...` → **döngü**: "listedeki her kelime için, ona `w` de ve satırı çalıştır". İki kelime,
  iki tur.
- `w.text`, `w.x`, `w.y` → nokta, paketin içinden bir bilgiyi okur.
- En altta `reset()` → çizmeden önce kelimeleri hazırla.

# --task--

1. Under `FONT`, after an empty line, write `let words` and `reset`.
2. In `draw`, replace the `fillText('rocket', ...)` line with the `for` line.
3. At the bottom, write `reset()` above `draw()`.

# --task-tr--

1. `const FONT = ...` satırının altında bir boş satır bırak; `let words` satırını, bir boş satır daha ve `reset`
   fonksiyonunu yaz.
2. `draw` içindeki `ctx.fillText('rocket', 40, 120)` satırını sil; yerine `for` satırını yaz.
3. En alttaki `draw()` satırının **üstüne** `reset()` yaz.
4. **Çalıştır**: iki kelime görmelisin.

# --try--

Add a third word to the list in `reset`, like `{ text: 'moon', x: 200, y: 250 },`, and run. Then remove it.

# --try-tr--

`reset` içindeki listeye üçüncü bir kelime ekle, örneğin `{ text: 'moon', x: 200, y: 250 },`, ve çalıştır. Sonra sil.

# --tests--

`words` should hold the two words.
tr: `words` iki kelimeyi tutmalı.

```js
assert.deepEqual(words, [{ text: 'rocket', x: 40, y: 120 }, { text: 'cat', x: 300, y: 60 }])
```

Every word should be drawn where it is.
tr: Her kelime bulunduğu yere çizilmeli.

```js
words = [{ text: 'sun', x: 10, y: 200 }, { text: 'moon', x: 100, y: 50 }, { text: 'star', x: 300, y: 300 }]
draw()
const drawn = $.screen().filter((c) => c.op === 'fillText').map((c) => c.args.slice(0, 3))
assert.deepEqual(drawn, [['sun', 10, 200], ['moon', 100, 50], ['star', 300, 300]])
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 330 // words that fall past this line are gone
const FONT = 'bold 20px monospace'

let words // { text, x, y }

function reset() {
  words = [
    { text: 'rocket', x: 40, y: 120 },
    { text: 'cat', x: 300, y: 60 },
  ]
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  for (const w of words) ctx.fillText(w.text, w.x, w.y)
}

reset()
draw()
```
