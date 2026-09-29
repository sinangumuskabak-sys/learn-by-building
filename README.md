# Learn Platform

Learn to code by **building things you can see, in your browser**: web pages and real games, one small step at a time.
Every step goes the same way: **what we are doing → the code → what it means → your turn**. You write the code yourself,
the result shows up right next to it, and checks tell you when the step is done. Progress is saved locally. No server,
no account.

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
| F3 | UI: workspace, skill map, settings ✅ |
| G | Workshop: step-by-step games with a live game next to the editor ✅ |
| W | Four-part steps, locked finished code, guesses before running, build projects (web pages) ✅ |
| F4 | More build projects (Python in the browser, SQL, drawing), GitHub Pages release |

## Curriculum categories

Programming Fundamentals · Software Engineering · Software Architecture · AI Engineering · Agent Engineering ·
Testing & Evaluation · Cybersecurity · Databases · Backend / APIs · Frontend / Mobile · DevOps / Cloud ·
Performance · Product Engineering · Data & Analytics

## Workshop

Build web pages and real games step by step: the code editor on the left, the page or game running on the right.
Every step teaches one idea in four parts, opened one after another: **what we are doing**, **the code** you will write,
**what it means** line by line, and **your turn**. The finished parts of the code are locked (greyed out) so you only
write where this step's work goes; a guess before running and a hint box when a check fails help along the way. The
finished project can be opened from any step.

<!-- games:en:start -->
3 build projects and 44 games, 1421 steps:

- **Build projects:** My business card · Traffic light · Text detective
- **Beginner games:** Tic-tac-toe · Simon Says Colors · Connect Four · Memory · Wordle-style Word Guess · Whack-a-Mole · 15 Puzzle · Endless Runner · Blackjack · Hangman · Conway's Game of Life · Typing Rain · Sokoban · Rhythm Lanes · Snake · Pong · Flappy-style Bird
- **Intermediate games:** Candy Crush-style Match 3 · Sudoku · Puzzle Bobble-style Bubble Shooter · Klondike Solitaire · Breakout · Frogger-style Crossing · Doodle Jump-style Climber · Lunar Lander · 2048 · Minesweeper · Tetris-style Blocks · Tower Defense · Space Invaders-style · Battleship · Missile Command-style Defense · Bomberman-style Arena · Asteroids · Pool · Pinball
- **Advanced games:** Mario-style Platformer · Pac-Man-style Maze Chase · Wolfenstein-style 3D Maze · Chess · OutRun-style Racer · Zelda-style Dungeon · Scorched Earth-style Artillery · Angry Birds-style Slingshot
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

Maymun also keeps a **memory vault**: a Markdown note for every project, game, step and skill,
plus your current status and a learner profile, built in your browser the first time you open the app (nothing to
install). The app writes the status parts as you progress; Maymun fills in what you learned, what was hard and what
comes next as you talk (a hidden block at the end of its answers, checked before anything is written); sessions are
summed up when you come back after a break or start a new topic; **My notes** in every note is yours alone. Browse it
on the **Memory** page, or download it as a folder: it opens as is in [Obsidian](https://obsidian.md) ("Open folder as
vault"), which is optional. With the Maymun bridge (below) started with `--vault <your Obsidian vault>`, the Memory page can keep a
live copy in that vault's `Learn Platform` folder, and what you write under **My notes** in Obsidian comes back. **Reset
all data** in Settings turns it back into the empty skeleton.

Maymun answers through AI you choose, and your key never leaves the browser:

- **[OmniRoute](https://github.com/diegosouzapw/OmniRoute) on your computer:** connect your subscriptions and keys
  there (Claude, Gemini, Codex, free providers…), turn on the models Maymun may use, and the best one answers while the
  next takes over when it fails.
- **Your own API key:** OpenRouter, Anthropic (Claude), OpenAI or DeepSeek, called straight from the browser.
- **Another OpenAI-compatible server on your computer:** Ollama, LM Studio.

The live Obsidian copy of the memory vault goes through **the Maymun bridge**
([public/maymun-bridge.mjs](public/maymun-bridge.mjs), one file, no dependencies; also downloadable from the Memory
page). It listens on 127.0.0.1 only, answers only allowed sites, and needs the key it prints at start (paste it on the
Memory page).

```bash
node maymun-bridge.mjs --vault "~/Documents/Obsidian/My vault"                            # this site on localhost
node maymun-bridge.mjs --vault "~/Documents/Obsidian/My vault" --origin https://your.site  # a deployed copy
```

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

Kodlamayı **tarayıcıda, sonucunu gördüğün şeyler yaparak** öğren: web sayfaları ve gerçek oyunlar, küçük adımlarla.
Her adım aynı sırayla ilerler: **ne yapıyoruz → kod → ne işe yarıyor → sıra sende**. Kodu sen yazarsın, sonuç hemen
yanında görünür, kontroller adımın bittiğini söyler. İlerlemen tarayıcında saklanır. Sunucu yok, hesap yok.

[freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp)'in yaparak öğrenme modelinden esinlenmiştir;
bağımsız bir projedir, freeCodeCamp kodu içermez.

**Atölye:** Web sayfalarını ve gerçek oyunları adım adım yap; kod solda, sayfa ya da oyun sağda çalışır. Bitmiş
kısımlar kilitlidir; yalnız o adımın kodunu yazarsın.

<!-- games:tr:start -->
3 yapım atölyesi ve 44 oyun, 1421 adım:

- **Yapım atölyeleri:** Kartvizitim · Trafik lambası · Metin dedektifi
- **Başlangıç oyunları:** XOX · Renk Hafızası (Simon) · Dört Bağla · Hafıza Kartları · Wordle Tarzı Kelime Tahmini · Köstebek Vurmaca · 15 Bulmacası · Sonsuz Koşucu · Blackjack · Adam Asmaca · Conway'in Hayat Oyunu · Yazı Yağmuru · Sokoban · Ritim Şeritleri · Yılan · Pong · Flappy tarzı kuş
- **Orta oyunlar:** Candy Crush Tarzı Üçlü Eşleştirme · Sudoku · Puzzle Bobble Tarzı Balon Atıcı · Klondike Solitaire · Tuğla Kırma · Frogger Tarzı Karşıya Geçiş · Doodle Jump Tarzı Tırmanış · Ay'a İniş · 2048 · Mayın Tarlası · Tetris Tarzı Bloklar · Kule Savunması · Space Invaders Tarzı · Amiral Battı · Missile Command Tarzı Savunma · Bomberman Tarzı Arena · Asteroids · Bilardo · Pinball
- **İleri oyunlar:** Mario Tarzı Platform · Pac-Man Tarzı Labirent Kovalamaca · Wolfenstein Tarzı 3B Labirent · Satranç · OutRun Tarzı Yarış · Zelda Tarzı Zindan · Scorched Earth Tarzı Topçu · Angry Birds Tarzı Sapan
<!-- games:tr:end -->

Geliştirme komutları ve yol haritası için yukarıdaki İngilizce bölüme bak.
