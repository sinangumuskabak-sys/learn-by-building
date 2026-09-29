---
title: A list of secret words
title_tr: Gizli kelimelerin listesi
skills: [prog.arrays]
---

# --goal--

Hangman: the computer picks a secret word and shows only blanks; you guess letters, and every wrong guess draws a
bit more of a stick figure. First, the words the computer can pick from, kept in an array.

# --goal-tr--

**Adam asmaca** oyununu yapıyoruz: bilgisayar gizli bir kelime seçer ve sadece harf sayısı kadar boşluk gösterir.
Sen harf tahmin edersin; doğrular yerine oturur, her yanlış tahmin darağacına bir çöp adam parçası ekler.

İlk iş: bilgisayarın seçebileceği **kelimeler**. Onları tek bir **listede** (dizi) toplayacağız. Ekranda henüz bir
şey değişmeyecek; oyunun malzemesini hazırlıyoruz.

# --code--

```js
const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
```

# --meaning--

- `[` and `]` make an **array**: an ordered list. Items are separated by commas.
- Each word is text (a *string*) in quotes, all in capital letters A to Z.
- `const WORDS =` gives the list a name. The comma after the last item is allowed and keeps lines tidy.

# --meaning-tr--

- `[` ile `]` → bir **dizi** (array): **sıralı bir liste**. İçindeki elemanlar virgülle ayrılır.
- `'APPLE'` → tırnak içindeki şey bir **yazıdır** (metin, *string*). Bütün kelimeler **büyük harf** ve sadece
  A–Z harfleri; tahminleri de büyük harfle karşılaştıracağız.
- `const WORDS =` → listeye **WORDS** adını verir. `const` "bu ad hep aynı şeyi gösterecek" demek. Sabitlerin
  adını büyük harfle yazmak bir alışkanlık: "bu değişmeyen bir ayar" diye okunur.
- Liste uzun olduğu için satırlara bölündü; JavaScript için fark etmez. Son elemandan sonraki virgül de serbest.

# --task--

Write the list under the three comment lines, then press **Run**.

# --task-tr--

Listeyi editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz. Kelimeler çok olduğu için bu listeyi
kopyalayıp yapıştırabilirsin; ama köşeli parantezlere ve virgüllere bir göz at. Sonra **Çalıştır**'a bas. Ekran
değişmez, alttaki kontroller yeşil olmalı.

# --try--

Add a word of your own to the list (in capital letters, with a comma). Keep it; the game will pick it too.

# --try-tr--

Listeye kendi kelimeni ekle (büyük harfle, virgülüyle). Kalsın; oyun onu da seçebilecek.

# --tests--

`WORDS` should be a list of at least 40 words.
tr: `WORDS` en az 40 kelimelik bir liste olmalı.

```js
assert.isArray(WORDS)
assert.isAtLeast(WORDS.length, 40)
```

Every word should be capital letters A to Z only.
tr: Her kelime yalnız A–Z büyük harflerinden oluşmalı.

```js
for (const w of WORDS) assert.match(w, /^[A-Z]+$/, 'capital letters only: ' + w)
```

# --seed--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
```
