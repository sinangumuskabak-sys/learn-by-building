# Learn Platform

Learn software engineering by **writing code in your browser**. Every challenge ships with starter code and hidden
tests; you write the solution, the tests run instantly, and your progress is saved locally. No server, no account.

> Inspired by [freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp)'s learn-by-doing model.
> This is an independent project; no freeCodeCamp code is included.

**Türkçe:** [aşağıda](#türkçe)

## Status

Early development. Roadmap:

| Phase | Scope |
|---|---|
| F0 | Project skeleton, CI, docs ✅ |
| F1 | Content engine: Markdown challenge format, schema validation, `validate` script ✅ |
| F2 | Runners: JS/TS (Web Worker), HTML/CSS (sandboxed iframe), SQL (PGlite), quizzes ✅ |
| F3 | UI: catalog, category, challenge workspace, skill map, settings ✅ |
| F4 | All 14 curriculum categories as a template + sample challenges, GitHub Pages release |

## Curriculum categories

Programming Fundamentals · Software Engineering · Software Architecture · AI Engineering · Agent Engineering ·
Testing & Evaluation · Cybersecurity · Databases · Backend / APIs · Frontend / Mobile · DevOps / Cloud ·
Performance · Product Engineering · Data & Analytics

## Development

```bash
npm install
npm run dev        # local dev server
npm run validate   # check content/ (see docs/challenge-format.md)
npm test           # unit tests (Vitest)
npm run e2e        # end-to-end tests (Playwright, runs against the production build)
npm run typecheck
npm run lint
npm run build      # static build in dist/
```

Requires Node.js 22+.

## License

[MIT](LICENSE)

---

## Türkçe

Yazılım mühendisliğini **tarayıcıda kod yazarak** öğren. Her görevde başlangıç kodu ve gizli testler var; çözümü
yazarsın, testler anında çalışır, ilerlemen tarayıcında saklanır. Sunucu yok, hesap yok.

[freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp)'in yaparak öğrenme modelinden esinlenmiştir;
bağımsız bir projedir, freeCodeCamp kodu içermez.

Geliştirme komutları ve yol haritası için yukarıdaki İngilizce bölüme bak.
