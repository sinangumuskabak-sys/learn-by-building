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
| G | Game Workshop: step-by-step games with a live game next to the editor ✅ |

## Curriculum categories

Programming Fundamentals · Software Engineering · Software Architecture · AI Engineering · Agent Engineering ·
Testing & Evaluation · Cybersecurity · Databases · Backend / APIs · Frontend / Mobile · DevOps / Cloud ·
Performance · Product Engineering · Data & Analytics

## Game Workshop

Build real games step by step: the code editor on the left, the game running on the right. Every step explains one
idea, has its own checks, and ends with a playable game.

<!-- games:en:start -->
44 games, 307 steps:

- **Beginner:** Tic-tac-toe · Simon Says Colors · Connect Four · Memory · Wordle-style Word Guess · Whack-a-Mole · 15 Puzzle · Endless Runner · Blackjack · Hangman · Conway's Game of Life · Typing Rain · Sokoban · Rhythm Lanes · Snake · Pong · Flappy-style Bird
- **Intermediate:** Candy Crush-style Match 3 · Sudoku · Puzzle Bobble-style Bubble Shooter · Klondike Solitaire · Breakout · Frogger-style Crossing · Doodle Jump-style Climber · Lunar Lander · 2048 · Minesweeper · Tetris-style Blocks · Tower Defense · Space Invaders-style · Battleship · Missile Command-style Defense · Bomberman-style Arena · Asteroids · Pool · Pinball
- **Advanced:** Mario-style Platformer · Pac-Man-style Maze Chase · Wolfenstein-style 3D Maze · Chess · OutRun-style Racer · Zelda-style Dungeon · Scorched Earth-style Artillery · Angry Birds-style Slingshot
<!-- games:en:end -->

Games named “…-style” are original code built around well-known game mechanics; they are not affiliated with the
owners of those names. The game format is described in [docs/game-format.md](docs/game-format.md).

## Maymun, the cat tutor

An orange cat peeks out of the panel under your pointer. Click it to ask about what you are looking at: the lesson,
your code and the check results go along with the question, and you can add a picture of any part of the screen.
Maymun teaches rather than hands out answers; its instructions are in
[src/maymun/prompt.md](src/maymun/prompt.md). Each game or challenge has its own conversation, shared by all its
panels and steps and kept in your browser (IndexedDB), so Maymun remembers what you asked earlier in the project;
**New topic** starts a clean one.

### The memory vault

Maymun also keeps a **memory vault**: a Markdown note for every category, module, challenge, game, step and skill,
plus your current status and a learner profile, built in your browser the first time you open the app (nothing to
install). The app writes the status parts as you progress; Maymun fills in what you learned, what was hard and what
comes next as you talk (a hidden block at the end of its answers, checked before anything is written); sessions are
summed up when you come back after a break or start a new topic; **My notes** in every note is yours alone. Browse it
on the **Memory** page, or download it as a folder: it opens as is in [Obsidian](https://obsidian.md) ("Open folder as
vault"), which is optional. With the bridge started with `--vault <your Obsidian vault>`, the Memory page can keep a
live copy in that vault's `Learn Platform` folder, and what you write under **My notes** in Obsidian comes back. **Reset
all data** in Settings turns it back into the empty skeleton.

Maymun answers through AI you choose, and your key never leaves the browser:

- **Your own API key:** OpenRouter, Anthropic (Claude), OpenAI or DeepSeek, called straight from the browser.
- **An OpenAI-compatible server on your computer:** [OmniRoute](https://github.com/diegosouzapw/OmniRoute) (connects your
  subscriptions), Ollama, LM Studio.
- **The Maymun bridge** ([public/maymun-bridge.mjs](public/maymun-bridge.mjs), one file, no dependencies): uses the
  Claude Code subscription you are logged in with, or forwards to a gateway with `--upstream`. It listens on
  127.0.0.1 only, answers only allowed sites, and needs the key it prints at start.

  ```bash
  node maymun-bridge.mjs                                   # this site on localhost
  node maymun-bridge.mjs --origin https://your.site        # a deployed copy
  node maymun-bridge.mjs --upstream http://localhost:20128/v1   # also OmniRoute models
  node maymun-bridge.mjs --vault "~/Documents/Obsidian/My vault" # also a live copy of the memory vault
  ```

  Using a subscription this way is subject to its provider's terms.

## Development

```bash
npm install
npm run dev        # local dev server
npm run validate   # check content/ (see docs/challenge-format.md and docs/game-format.md)
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

**Oyun Atölyesi:** Gerçek oyunları adım adım yap; kod solda, oyun sağda çalışır.

<!-- games:tr:start -->
44 oyun, 307 adım:

- **Başlangıç:** XOX · Renk Hafızası (Simon) · Dört Bağla · Hafıza Kartları · Wordle Tarzı Kelime Tahmini · Köstebek Vurmaca · 15 Bulmacası · Sonsuz Koşucu · Blackjack · Adam Asmaca · Conway'in Hayat Oyunu · Yazı Yağmuru · Sokoban · Ritim Şeritleri · Yılan · Pong · Flappy tarzı kuş
- **Orta:** Candy Crush Tarzı Üçlü Eşleştirme · Sudoku · Puzzle Bobble Tarzı Balon Atıcı · Klondike Solitaire · Tuğla Kırma · Frogger Tarzı Karşıya Geçiş · Doodle Jump Tarzı Tırmanış · Ay'a İniş · 2048 · Mayın Tarlası · Tetris Tarzı Bloklar · Kule Savunması · Space Invaders Tarzı · Amiral Battı · Missile Command Tarzı Savunma · Bomberman Tarzı Arena · Asteroids · Bilardo · Pinball
- **İleri:** Mario Tarzı Platform · Pac-Man Tarzı Labirent Kovalamaca · Wolfenstein Tarzı 3B Labirent · Satranç · OutRun Tarzı Yarış · Zelda Tarzı Zindan · Scorched Earth Tarzı Topçu · Angry Birds Tarzı Sapan
<!-- games:tr:end -->

Geliştirme komutları ve yol haritası için yukarıdaki İngilizce bölüme bak.
