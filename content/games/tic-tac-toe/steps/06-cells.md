---
title: The board as a list
title_tr: Liste olarak tahta
skills: [prog.arrays, game.state]
---

# --goal--

The picture is only the look. The game also has to remember what is in each of the 9 cells. We keep that in an
array of 9 strings: `''` for empty, later `'X'` or `'O'`.

# --goal-tr--

Çizgiler tahtanın **görüntüsü**. Oyun ayrıca hangi kutuda ne olduğunu **hatırlamalı**: X mi, O mu, boş mu? Bu
bilgiye oyunun **durumu** denir.

9 kutunun içeriğini sırayla tutmak için bir **dizi** (array) kullanırız: numaralı bir alışveriş listesi gibi. Şimdilik
bütün kutular boş. Ekranda bir şey değişmeyecek.

# --code--

```js
let board = ['', '', '', '', '', '', '', '', '']
```

# --meaning--

- `[ ... ]` is an array: a list in order, items separated by commas.
- `''` is an empty string: an empty cell. A filled cell will hold `'X'` or `'O'`.
- Items are numbered from **0**: `board[0]` is the top-left cell, `board[8]` the bottom-right one.
- `let`, because the board will change during the game.

# --meaning-tr--

- `[ ... ]` → köşeli parantez bir **dizi** açar ve kapatır; elemanlar virgülle ayrılır.
- `''` → iki tırnak arasında hiçbir şey yok: **boş yazı**. Boş kutu demek. Dolu bir kutuda `'X'` ya da `'O'` olacak.
- 9 tane `''` var: 9 kutu.
- Elemanlara **sıra numarasıyla** (index) ulaşılır ve sayma **0'dan başlar**. Kutular soldan sağa, yukarıdan aşağı
  numaralanır:

  ```
  0 1 2
  3 4 5
  6 7 8
  ```

  `board[0]` sol üst kutu, `board[4]` orta, `board[8]` sağ alt.
- `let` → tahta oyun boyunca değişeceği için.

# --task--

Under `const CELL = 100`, leave an empty line and write the `board` line. Press **Run**.

# --task-tr--

`const CELL = 100` satırının altına bir boş satır bırak ve `board` satırını yaz (tırnak çiftlerini say: 9 tane). **Çalıştır**: ekran aynı kalmalı, kontrol yeşil olmalı.

# --hint--

Count the pairs of quotes: there must be exactly nine `''`, separated by commas.

# --hint-tr--

Tırnak çiftlerini say: virgüllerle ayrılmış tam dokuz tane `''` olmalı.

# --tests--

`board` should hold 9 empty cells.
tr: `board` 9 boş hücre tutmalı.

```js
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
  ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
}
```
