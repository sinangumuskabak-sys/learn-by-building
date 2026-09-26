---
id: filter-active-users
title: Select only active users
type: sql
skills: [db.sql-select]
level: 3
---

# --description--

`WHERE` keeps only the rows that match a condition, and `ORDER BY` makes the result order predictable.

# --instructions--

Return the `name` of every active user from `users`, sorted alphabetically.

# --hints--

The result should have a single `name` column.

```js
assert.deepEqual(columns, ['name'])
```

The result should be `Ada`, `Grace`, `Linus` in that order.

```js
assert.deepEqual(rows.map((r) => r.name), ['Ada', 'Grace', 'Linus'])
```

The `users` table should be unchanged.

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
