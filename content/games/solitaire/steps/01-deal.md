---
title: The deal
title_tr: Dağıtım
skills: [prog.arrays, game.canvas]
---

# --explanation--

Klondike, the solitaire everyone knows, is a game of **piles**. Thirteen of them:

- the **stock**, face down, and the **waste** next to it;
- four **foundations**, where you build each suit up from the ace;
- seven **tableau** columns: column 1 gets one card, column 2 two, up to seven, and only the last card of each is face up.

We keep them all in one object, `piles`, with short names as keys: `stock`, `waste`, `f0` to `f3`, `t0` to `t6`. Each is an array
of cards, `{ rank, suit, up }`. The key's first letter says what kind of pile it is, which the rules will use a lot:
`key[0] === 't'` means "a tableau column".

`deck.splice(0, i + 1)` cuts the first `i + 1` cards off the shuffled deck for column `i`; after the seven columns, whatever is
left (24 cards) is the stock.

In a tableau column, cards overlap: a face-down card only shows a thin edge (8 pixels), a face-up one enough to read it (22
pixels). So the y of a card depends on the cards above it, which `cardY` adds up. Empty places are drawn as faint outlines, so the
table shows where cards can go.

# --explanation-tr--

**Bu adımda:** kartları karıştırıp masaya dağıtacağız. Sağda yeşil bir masa, üstte boş yerlerin soluk çerçeveleri ve
kapalı bir deste, altta soldan sağa 1'den 7'ye kadar kartlık yedi sütun göreceksin; her sütunun sadece en alttaki
kartı açık olacak.

Bu ilk adım uzun, çünkü birçok temel şeyi birlikte öğreneceğiz. Acele etme; kodu parça parça yazacaksın.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×560 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Onu bulur, sonra çizim
aracını (**context**) alırız: `const canvas = document.getElementById('game')` ve
`const ctx = canvas.getContext('2d')`. `const ad = ...` bir şeye ad (etiket) verir; buna **sabit** denir. Nokta (`.`)
"bunun içindeki" demektir. Tırnak içindekiler **yazıdır**. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y`
**aşağı** doğru büyür.

**Klondike'ın yığınları.** Herkesin bildiği bu kâğıt oyunu 13 **yığından** oluşur:

- **deste** (`stock`, kapalı) ve yanındaki **açık kartlar** (`waste`);
- dört **temel** (`f0`–`f3`, foundation): her renk as'tan papaza burada dizilir;
- yedi **sütun** (`t0`–`t6`, tableau): 1. sütuna bir kart, 2.'ye iki, ... 7.'ye yedi; her sütunda sadece son kart açık.

**Dizi (array) ve nesne (object).** Bir **dizi** köşeli parantez içinde sıralı bir listedir:
`['♠', '♥', '♦', '♣']`. Elemanlara sıra numarasıyla ulaşılır ve sayma **0'dan başlar**: `SUITS[1]` → `'♥'`.
`pile.length` listenin eleman sayısıdır. Bir **nesne** ise birbirine ait bilgileri `ad: değer` çiftleriyle tutar. Her
kart bir nesnedir: `{ rank: 12, suit: 1, up: true }` → kupa kızı, açık. `rank` 1 (as) ile 13 (papaz) arasıdır;
`RANKS[12]` → `'Q'`. `RANKS`'ın başındaki boş yazı (`''`) sadece 0. sırayı doldurur ki numaralar kartlarla uyuşsun.

Bütün yığınları tek nesnede, `piles`'ta tutarız; her yığın bir kart dizisidir. `piles['t' + 3]` → `piles.t3` (yazıları
`+` ile uç uca eklemek). Adın ilk harfi yığının türünü söyler: `key[0] === 't'` "bu bir sütun mu?" demektir (`===`
"eşit mi", `key[0]` yazının ilk harfi). `let piles` ise sonra değişebilen bir **değişkendir**.

**Küçük yardımcılar.** `(card) => ...` tek satırlık bir fonksiyondur (ok fonksiyonu): `card` alır, `=>`'dan sonraki
değeri geri verir.

- `isRed` → kupa (1) **veya** (`||`) karo (2) ise kırmızı.
- `last(pile)` → yığının son (en üstteki) kartı: `pile[pile.length - 1]`.
- `colX(i)` → `i`. sütunun `x`'i: 16'dan başlayıp her sütunda 64 piksel sağa.

**Deste yapmak ve karıştırmak.** `function newDeck() { ... }` bir iş listesine ad verir; `newDeck()` diye
**çağırınca** çalışır ve `return` ile sonucu geri verir. İçeride:

- İç içe iki **döngü**: `for (let suit = 0; suit < 4; suit++)` → `suit`'i 0'dan başlat, 4'ten küçükken tekrar et, her
  turda bir artır (`++`). Her renk için 1'den 13'e kadar (`<=` "küçük veya eşit") her kartı `deck.push(...)` ile listeye
  ekleriz: 52 kart.
- Karıştırma: sondan başa doğru (`i--` bir azaltır) her kartı, kendinden önceki rastgele bir kartla yer değiştiririz.
  `Math.random()` 0 ile 1 arası rastgele sayı, `Math.floor` küsuratı atar; sonuç 0 ile `i` arası rastgele bir sıra.
  `[deck[i], deck[j]] = [deck[j], deck[i]]` iki kartın yerini değiştirir. Baştaki `;`, satır `[` ile başladığı için
  "önceki satır burada bitti" demektir.

**Dağıtmak.** `deck.splice(0, i + 1)` destenin başından `i + 1` kartı **kesip** alır (deste kısalır). Yedi sütundan sonra
kalan 24 kart destedir. `last(...).up = true` son kartı açar.

**Kart nerede duruyor?** `pileX(key)` yığının `x`'ini verir. `if (koşul) return ...` → koşul doğruysa bu değeri ver ve
bitir. `Number(key[1])` yazıdaki rakamı sayıya çevirir (`'3'` → 3). Sütunlarda kartlar üst üste biner: kapalı kartın
sadece 8 piksellik kenarı, açık kartın okunacak kadar 22 pikseli görünür. `cardY` üstteki kartları sayarak `y`'yi
toplar. `pile[i].up ? UP_STEP : DOWN_STEP` → `koşul ? evetse : hayırsa`: açıksa 22, kapalıysa 8. `!==` "eşit değil".

**Kart çizmek.** `fillRect` dolu, `strokeRect` sadece çerçeve dikdörtgen çizer (`strokeStyle` çerçeve rengi,
`lineWidth` kalınlığı). `fillText(yazı, x, y)` yazı yazar; `ctx.font` boyu, `ctx.textAlign` hizayı seçer. `!card.up`
→ `!` "değil": kart kapalıysa `return` ile orada dur, yazı yazma.

**Bütün yığınları gezmek.** `Object.entries(piles)` nesneyi `[ad, değer]` çiftlerinin listesine çevirir;
`for (const [key, pile] of ...)` her çift için bir kez çalışır, adı `key`'e, yığını `pile`'a koyar. Boş yerler
yarı saydam beyaz (`rgba(255, 255, 255, 0.35)`: kırmızı, yeşil, mavi, saydamlık) çerçeveyle gösterilir. Deste, açık
kartlar ve temellerde sadece en üstteki kart çizilir.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der; `loop` kendini
yeniden istediği için saniyede ~60 kez çizilir.

# --task--

1. Add `SUITS`, `RANKS` (`['', 'A', '2', ..., '10', 'J', 'Q', 'K']`), `CW = 56`, `CH = 78`, `LEFT = 16`, `COL = 64`, `TOP_Y = 40`,
   `TAB_Y = 136`, `DOWN_STEP = 8`, `UP_STEP = 22`, and `isRed`, `last(pile)` and `colX(i) = LEFT + i * COL`.
2. Write `newDeck()` (52 cards face down, shuffled) and `deal()` as described.
3. Write `pileX(key)` (stock column 0, waste column 1, foundations columns 3 to 6, tableau column `i`) and `cardY(key, index)`.
4. Draw the green table (`'#166534'`), an outline (`'rgba(255, 255, 255, 0.35)'`, width 2) for every pile, every tableau card,
   and only the top card of the other piles. A card is white with its rank and suit (`'bold 14px sans-serif'` at `x + 4, y + 16`)
   and a big suit (`'28px sans-serif'`, centered at `y + 54`), red for ♥ and ♦; face down it is `'#1d4ed8'`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırak ve ayarları yaz. Renk işaretlerini (`♠ ♥ ♦ ♣`) klavyeden yazmak zorsa **Çözümü göster** ile
   kopyalayabilirsin:

   ```js
   const SUITS = ['♠', '♥', '♦', '♣']
   const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
   const CW = 56 // card width
   const CH = 78
   const LEFT = 16
   const COL = 64 // distance between columns
   const TOP_Y = 40 // the stock, the waste and the foundations
   const TAB_Y = 136 // the seven tableau columns
   const DOWN_STEP = 8 // how much of a face-down card shows under the next one
   const UP_STEP = 22
   ```

3. Bir boş satır bırak, yığınların değişkenini aç; bir boş satır daha bırak ve üç yardımcıyı yaz:

   ```js
   let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

   const isRed = (card) => card.suit === 1 || card.suit === 2
   const last = (pile) => pile[pile.length - 1]
   const colX = (i) => LEFT + i * COL
   ```

4. Bir boş satır bırak ve desteyi kuran, karıştıran fonksiyonu yaz:

   ```js
   function newDeck() {
     const deck = []
     for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
     for (let i = deck.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1))
       ;[deck[i], deck[j]] = [deck[j], deck[i]]
     }
     return deck
   }
   ```

   `{ rank, suit, up: false }` içindeki `rank`, `rank: rank` yazmanın kısasıdır.

5. Bir boş satır bırak ve dağıtan fonksiyonu yaz:

   ```js
   // Column i gets i + 1 cards, the last one face up; the rest is the stock.
   function deal() {
     const deck = newDeck()
     piles = { stock: [], waste: [] }
     for (let f = 0; f < 4; f++) piles['f' + f] = []
     for (let i = 0; i < 7; i++) {
       piles['t' + i] = deck.splice(0, i + 1)
       last(piles['t' + i]).up = true
     }
     piles.stock = deck
   }
   ```

6. Bir boş satır bırak ve yer hesaplayan iki fonksiyonu yaz:

   ```js
   // Where each pile sits on the table.
   function pileX(key) {
     if (key === 'stock') return colX(0)
     if (key === 'waste') return colX(1)
     if (key[0] === 'f') return colX(3 + Number(key[1]))
     return colX(Number(key[1]))
   }

   // The y of card `index` in a tableau column: face-down cards overlap more than face-up ones.
   function cardY(key, index) {
     if (key[0] !== 't') return TOP_Y
     let y = TAB_Y
     const pile = piles[key]
     for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP
     return y
   }
   ```

7. Bir boş satır bırak ve tek kart çizen fonksiyonu yaz:

   ```js
   function drawCardAt(card, x, y) {
     ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
     ctx.fillRect(x, y, CW, CH)
     ctx.strokeStyle = '#0f172a'
     ctx.lineWidth = 1
     ctx.strokeRect(x, y, CW, CH)
     if (!card.up) return
     ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
     ctx.font = 'bold 14px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
     ctx.font = '28px sans-serif'
     ctx.textAlign = 'center'
     ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
   }
   ```

8. Bir boş satır bırak ve masayı çizen fonksiyonu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#166534'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (const [key, pile] of Object.entries(piles)) {
       const x = pileX(key)
       // An empty place shows as an outline.
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
       ctx.lineWidth = 2
       ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
       // The stock, the waste and the foundations only need their top card.
       const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
       for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, cardY(key, i))
     }
   }
   ```

9. Bir boş satır bırak ve oyun döngüsünü yazıp kartları dağıt:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   deal()
   requestAnimationFrame(loop)
   ```

10. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Yeşil masada sol üstte mavi (kapalı) bir deste, altta 1'den 7'ye kartlık
    yedi sütun görmelisin; her sütunun son kartı beyaz ve açık olmalı. Alttaki kontrollerin hepsi yeşil olmalı.
    Kırmızı kalırsa renk kodlarını (`'#ffffff'`, `'#1d4ed8'`) ve parantezleri harf harf karşılaştır.

# --tests--

The deal should give columns of 1 to 7 cards with only the last face up, and 24 to the stock.
tr: Dağıtım yalnızca sonuncusu açık 1'den 7'ye kartlık sütunlar ve desteye 24 kart vermeli.

```js
const deck = newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((card) => card.rank + '/' + card.suit)), 52, 'every card once')
for (let i = 0; i < 7; i++) {
  const pile = piles['t' + i]
  assert.lengthOf(pile, i + 1)
  assert.deepEqual(pile.map((card) => card.up), [...Array(i).fill(false), true], 'only the last card face up')
}
assert.lengthOf(piles.stock, 24)
assert.lengthOf(piles.waste, 0)
for (let f = 0; f < 4; f++) assert.lengthOf(piles['f' + f], 0)
```

Face-down cards should overlap more than face-up ones, and the piles should sit in their columns.
tr: Kapalı kartlar açıklardan daha çok üst üste binmeli ve yığınlar kendi sütunlarında durmalı.

```js
assert.strictEqual(cardY('t3', 3), 136 + 3 * 8, 'three face-down cards above it')
assert.strictEqual(cardY('f2', 0), 40)
piles.t3[3].up = true
piles.t3.push({ rank: 5, suit: 1, up: true })
assert.strictEqual(cardY('t3', 4), 136 + 3 * 8 + 22, 'face-up cards show more')
assert.deepEqual([pileX('stock'), pileX('waste'), pileX('f0'), pileX('f3'), pileX('t6')], [16, 80, 208, 400, 400])
```

The face-down cards, the face-up cards and their names should be drawn.
tr: Kapalı kartlar, açık kartlar ve adları çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 21 + 1, 'the face-down cards and the top of the stock')
assert.lengthOf($.rects('#ffffff'), 7, 'seven face-up cards')
const card = piles.t0[0]
assert.include($.texts(), RANKS[card.rank] + SUITS[card.suit])
assert.deepInclude($.rects('#ffffff'), { x: 16, y: 136, w: 56, h: 78, color: '#ffffff' })
```

# --seed--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CW = 56 // card width
const CH = 78
const LEFT = 16
const COL = 64 // distance between columns
const TOP_Y = 40 // the stock, the waste and the foundations
const TAB_Y = 136 // the seven tableau columns
const DOWN_STEP = 8 // how much of a face-down card shows under the next one
const UP_STEP = 22

let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

const isRed = (card) => card.suit === 1 || card.suit === 2
const last = (pile) => pile[pile.length - 1]
const colX = (i) => LEFT + i * COL

function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Column i gets i + 1 cards, the last one face up; the rest is the stock.
function deal() {
  const deck = newDeck()
  piles = { stock: [], waste: [] }
  for (let f = 0; f < 4; f++) piles['f' + f] = []
  for (let i = 0; i < 7; i++) {
    piles['t' + i] = deck.splice(0, i + 1)
    last(piles['t' + i]).up = true
  }
  piles.stock = deck
}

// Where each pile sits on the table.
function pileX(key) {
  if (key === 'stock') return colX(0)
  if (key === 'waste') return colX(1)
  if (key[0] === 'f') return colX(3 + Number(key[1]))
  return colX(Number(key[1]))
}

// The y of card `index` in a tableau column: face-down cards overlap more than face-up ones.
function cardY(key, index) {
  if (key[0] !== 't') return TOP_Y
  let y = TAB_Y
  const pile = piles[key]
  for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP
  return y
}

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
  if (!card.up) return
  ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const [key, pile] of Object.entries(piles)) {
    const x = pileX(key)
    // An empty place shows as an outline.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, cardY(key, i))
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
