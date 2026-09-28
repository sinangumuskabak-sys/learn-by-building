---
id: filter-active-users
title: Select only active users
title_tr: Yalnızca aktif kullanıcıları seç
type: sql
skills: [db.sql-select]
level: 3
---

# --description--

`WHERE` keeps only the rows that match a condition, and `ORDER BY` makes the result order predictable.

# --description-tr--

**SQL**, veritabanındaki tablolardan veri istemek için kullanılan dildir. `users` (kullanıcılar) tablosunda
her satır bir kullanıcıdır; sütunları `id`, `name` (ad) ve `active` (aktif mi: doğru/yanlış).

- `SELECT name FROM users` → tablodaki herkesin yalnızca `name` sütununu getirir.
- `WHERE active` → yalnızca `active` değeri doğru olan satırları bırakır (filtre).
- `ORDER BY name` → sonucu ada göre alfabetik sıralar (sıralamazsan sıra her seferinde aynı olmayabilir).

# --instructions--

Return the `name` of every active user from `users`, sorted alphabetically.

# --instructions-tr--

Editördeki `select * from users;` sorgusunu değiştir:

1. `*` (tüm sütunlar) yerine yalnızca `name` sütununu seç.
2. Yalnızca aktif kullanıcıları bırakan bir `where` ekle.
3. Sonucu ada göre alfabetik sırala (`order by`).

Beklenen sonuç: `Ada`, `Grace`, `Linus`.

# --hints--

The result should have a single `name` column.
tr: Sonuçta yalnızca tek bir `name` sütunu olmalı.

```js
assert.deepEqual(columns, ['name'])
```

The result should be `Ada`, `Grace`, `Linus` in that order.
tr: Sonuç sırasıyla `Ada`, `Grace`, `Linus` olmalı.

```js
assert.deepEqual(rows.map((r) => r.name), ['Ada', 'Grace', 'Linus'])
```

The `users` table should be unchanged.
tr: `users` tablosu değişmemeli.

```js
const [{ count }] = await query('select count(*)::int as count from users')
assert.strictEqual(count, 4)
```

# --setup--

```sql
create table users (id serial primary key, name text not null, active boolean not null);
insert into users (name, active) values ('Linus', true), ('Ada', true), ('Bob', false), ('Grace', true);
```

# --seed--

```sql
select * from users;
```

# --solutions--

```sql
select name from users where active order by name;
```
