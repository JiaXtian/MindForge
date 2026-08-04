# MindForge

[![Deploy to GitHub Pages](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml)

MindForge is a bilingual reinforcement learning notebook and interactive laboratory. It is designed for learning
by changing an environment, advancing an algorithm one update at a time, and recording what the experiment
reveals.

## Live Site

- Home: [https://jiaxtian.github.io/MindForge/](https://jiaxtian.github.io/MindForge/)
- Gridworld Control Lab: [gridworld.html](https://jiaxtian.github.io/MindForge/gridworld.html)
- Multi-Armed Bandit Lab: [bandit.html](https://jiaxtian.github.io/MindForge/bandit.html)
- Notes: [notes.html](https://jiaxtian.github.io/MindForge/notes.html)
- Reusable note template: [note-template.html](https://jiaxtian.github.io/MindForge/note-template.html)

## Interactive Laboratories

### Gridworld Control Lab

The Gridworld lab places model-based planning and model-free learning in one visual interface.

Algorithms:

1. Value iteration
2. Policy iteration
3. Q-learning
4. SARSA
5. Expected SARSA

Environment presets:

1. Classic Gridworld
2. Cliff Walking
3. Windy Gridworld
4. Maze

The user can adjust the discount factor, learning rate, exploration rate, and playback speed. The lab supports
single updates, automatic execution, pause, reset, 50-episode training batches, clickable obstacle editing,
value heatmaps, policy arrows, an animated agent, update signals, and return history.

### Multi-Armed Bandit Lab

The bandit lab focuses on the exploration-exploitation tradeoff.

Strategies:

1. Epsilon-greedy
2. UCB1
3. Thompson sampling

Each arm's true expected reward can be changed while the experiment is running. Bernoulli and Gaussian rewards
are supported. The interface shows sample-average estimates, visit counts, cumulative reward, pseudo-regret,
best-arm selection rate, and regret curves. A comparison mode advances all three strategies together.

The interaction model was informed by Andrej Karpathy's
[REINFORCEjs](https://cs.stanford.edu/people/karpathy/reinforcejs/), while MindForge uses its own implementation,
adds multiple environment presets and algorithms, and makes control, comparison, bilingual explanation, and
mobile use first-class parts of the interface.

## Notes Workflow

The notes library is intentionally empty. New chapters should be created from `note-template.html` only after
the corresponding topic has been studied.

The template provides six paired English and Chinese sections:

1. The question
2. Definitions, notation, and assumptions
3. Derivation
4. Plain-language intuition
5. Reproducible experiment
6. Mistakes, revisions, and open questions

To add a note:

1. Duplicate `note-template.html` and give the copy a URL-safe filename.
2. Search the copy for `EDIT HERE`.
3. Keep the English and Chinese section order identical.
4. Add the new page to `notes.html`, `sitemap.xml`, and `scripts/check-site.mjs`.
5. Run the validation command before publishing.

## Design and Accessibility

- Responsive static pages suitable for GitHub Pages
- English by default with persistent Chinese switching
- Persistent light and dark themes
- Keyboard-accessible native controls
- Reduced-motion support
- No backend, account, analytics, or remote training service
- All reinforcement learning simulations run locally in the browser

## Project Structure

```text
MindForge/
├── index.html
├── notes.html
├── note-template.html
├── gridworld.html
├── gridworld.js
├── bandit.html
├── bandit.js
├── app.js
├── styles.css
├── rl.css
├── 404.html
├── sitemap.xml
├── robots.txt
├── assets/
│   └── favicon.svg
├── scripts/
│   └── check-site.mjs
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

## Local Development

No installation or build step is required.

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Run the same structural and syntax checks used by the deployment workflow:

```bash
node scripts/check-site.mjs
node --check app.js
node --check gridworld.js
node --check bandit.js
node scripts/smoke-labs.mjs
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`. The workflow validates the page graph,
bilingual controls, note template pairing, available algorithms and environments, JavaScript syntax, and removal
of the previous long-form chapters before deploying the repository to GitHub Pages.
