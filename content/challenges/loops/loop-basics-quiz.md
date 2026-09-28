---
id: loop-basics-quiz
title: Loop basics
title_tr: Döngü temelleri
type: quiz
skills: [prog.loops]
level: 1
---

# --description--

Check your understanding of how `for` loops step through values.

# --description-tr--

`for` döngüsünün sayacı nasıl ilerlettiğini anladığını kontrol et. İpucu: sayacın değerlerini bir kâğıda
sırayla yaz (başlangıç, sonra her turda adımı ekle) ve koşul yanlış olunca dur.

# --questions--

## How many times does `for (let i = 0; i < 10; i += 3)` run its body?

- [ ] 3
- [x] 4
- [ ] 10
> Write down the values of `i`: it starts at 0 and grows by 3 each time. Count how many are still below 10.

## Which final expression visits only even numbers when starting from 0?

- [ ] `i++`
- [x] `i += 2`
- [ ] `i *= 2`
> Start at 0 and apply each option a few times. Which one gives 0, 2, 4, 6...? (Careful: 0 times 2 is still 0.)

# --questions-tr--

## `for (let i = 0; i < 10; i += 3)` döngüsünün içi kaç kez çalışır?

- [ ] 3
- [x] 4
- [ ] 10
> `i`'nin değerlerini sırayla yaz: 0'dan başlar, her turda 3 artar. Kaç tanesi hâlâ 10'dan küçük, say.

## 0'dan başlayınca yalnızca çift sayılardan geçen adım ifadesi hangisi?

- [ ] `i++`
- [x] `i += 2`
- [ ] `i *= 2`
> 0'dan başla ve her seçeneği birkaç kez uygula. Hangisi 0, 2, 4, 6... verir? (Dikkat: 0 çarpı 2 yine 0'dır.)
