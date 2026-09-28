---
id: typed-sum
title: Sum an array of numbers
title_tr: Bir sayı listesini topla
type: code-ts
skills: [prog.types]
level: 3
---

# --description--

TypeScript lets you describe what a function accepts and returns. A typed `sum` makes it impossible to pass a
list of strings by mistake.

# --description-tr--

**TypeScript**, JavaScript'e **tür (type)** bilgisi ekler: bir fonksiyonun ne tür veri aldığını ve ne
döndürdüğünü yazarsın, yanlış türde veri verirsen kod çalışmadan hata alırsın.

```ts
function double(n: number): number {   // n bir sayı, sonuç da sayı
  return n * 2
}
```

`values: number[]` "values, sayılardan oluşan bir liste" demektir. Böylece `sum` fonksiyonuna yanlışlıkla yazılardan
oluşan bir liste verilemez.

# --instructions--

Complete `sum` so it returns the total of `values`. An empty array sums to `0`.

# --instructions-tr--

`sum` fonksiyonunu tamamla:

1. Parametreye tür ekle: `values` yerine `values: number[]` yaz.
2. İsteğe bağlı: dönüş türünü de yaz: `function sum(values: number[]): number`.
3. Fonksiyon listedeki sayıların **toplamını** döndürsün. Bunun için bir `toplam` değişkenini 0'dan başlat,
   bir döngüyle her sayıyı ona ekle ve sonunda `return` ile geri ver.
4. Boş liste (`[]`) verilince sonuç `0` olmalı (toplamı 0'dan başlatırsan bu kendiliğinden olur).

# --hints--

`sum([1, 2, 3])` should return `6`.
tr: `sum([1, 2, 3])` sonucu `6` olmalı.

```js
assert.strictEqual(sum([1, 2, 3]), 6)
```

`sum([])` should return `0`.
tr: `sum([])` sonucu `0` olmalı.

```js
assert.strictEqual(sum([]), 0)
```

`sum` should declare its parameter as `number[]`.
tr: `sum` parametresini `number[]` olarak tanımlamalı.

```js
assert.match(code, /values\s*:\s*(number\[\]|Array<number>)/)
```

# --seed--

```ts
function sum(values) {
  // your code here
}
```

# --solutions--

```ts
function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
```
