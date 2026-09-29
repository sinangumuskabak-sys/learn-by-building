---
title: A level written as text
title_tr: Yazıyla çizilmiş bir bölüm
skills: [prog.arrays]
---

# --goal--

Sokoban: a warehouse worker pushes boxes onto goals. Its levels have been shared for decades in a tiny text format,
one character per tile. We write the first level that way.

# --goal-tr--

**Sokoban** bir bulmaca: bir depo işçisi kutuları **iterek** hedef noktalara yerleştirir. Kutuyu itebilir ama
çekemez; yanlış bir itiş kutuyu köşeye sıkıştırır.

Sokoban bölümleri onlarca yıldır **yazıyla** paylaşılır: her kare bir harf. İlk bölümü bu şekilde yazacağız. Ekranda
henüz bir şey değişmeyecek; önce oyunun haritası.

```
#  duvar      .  hedef      $  kutu      @  oyuncu
*  hedefin üstündeki kutu   +  hedefin üstündeki oyuncu
```

# --code--

```js
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]
```

# --meaning--

- The comment explains the six characters.
- A level is an array of strings, one string per row: here a corridor with the player, a box and a goal.
- `LEVELS` is an array of levels (so an array of arrays). For now it has one.

# --meaning-tr--

- İlk satır bir **yorum** (`//` ile başlar): bilgisayar atlar, bize altı harfin anlamını hatırlatır.
- `'#@$.#'` → tırnak içindeki şey bir **yazıdır** (metin). Her harf bir kare: duvar, oyuncu, kutu, hedef, duvar.
- Bir bölüm, satırlardan oluşan bir **dizidir** (array): köşeli parantez içinde, virgülle ayrılmış sıralı bir liste.
  Üç satır alt alta yazılınca bölümün resmi gibi görünür: üstte ve altta duvar, ortada bir koridor.
- `LEVELS` → **bölümlerin listesi**; yani listelerden oluşan bir liste. Şimdilik tek bölüm var, sonra ekleyeceğiz.
- `const LEVELS =` → listeye bir ad verir. `const` "bu ad hep aynı şeyi gösterecek" demek.

# --task--

Write the comment and the list under the three comment lines, then press **Run**.

# --task-tr--

Yorum satırını ve listeyi editördeki üç yorum satırının **altına** yaz. Satırların içindeki harfleri dikkatle
karşılaştır. **Çalıştır**'a bas: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`LEVELS` should be a list holding the first level.
tr: `LEVELS` ilk bölümü tutan bir liste olmalı.

```js
assert.isArray(LEVELS)
assert.deepEqual(LEVELS[0], ['#####', '#@$.#', '#####'])
```

# --seed--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]
```
