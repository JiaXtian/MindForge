# MindForge

[![Deploy to GitHub Pages](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml)

MindForge is a bilingual reinforcement learning notebook and interactive laboratory. It slows learning loops
down so that state transitions, value estimates, action selection, Bellman targets, TD errors, eligibility
traces, and policy changes can be inspected rather than hidden inside a training script.

## Live Site

- Home: [https://jiaxtian.github.io/MindForge/](https://jiaxtian.github.io/MindForge/)
- Gridworld Control Lab: [gridworld.html](https://jiaxtian.github.io/MindForge/gridworld.html)
- Multi-Armed Bandit Lab: [bandit.html](https://jiaxtian.github.io/MindForge/bandit.html)
- Random Walk Prediction Lab: [prediction.html](https://jiaxtian.github.io/MindForge/prediction.html)
- Mountain Car Control Lab: [mountain-car.html](https://jiaxtian.github.io/MindForge/mountain-car.html)
- Notes: [notes.html](https://jiaxtian.github.io/MindForge/notes.html)
- Reusable note template: [note-template.html](https://jiaxtian.github.io/MindForge/note-template.html)

## Laboratory Coverage

| Laboratory | Core question | Algorithms and mechanisms |
| --- | --- | --- |
| Gridworld | How do planning and sampled control produce a policy? | Value iteration, policy iteration, Q-learning, SARSA, Expected SARSA, Dyna-Q, Double Q-learning |
| Multi-Armed Bandit | How should an agent balance exploration and exploitation? | Epsilon-greedy, UCB1, Thompson sampling, Softmax exploration, Gradient Bandit |
| Random Walk | When should a value estimate be updated? | Every-visit Monte Carlo, TD(0), n-step TD, TD(lambda) |
| Mountain Car | How can tabular control handle continuous state? | Q-learning, SARSA, Expected SARSA, SARSA(lambda), state aggregation |

Together, the laboratories cover bandit feedback, value prediction, dynamic programming, model-free control,
model-based replay, maximization bias, stochastic transitions, eligibility traces, delayed reward, and continuous
state discretization.

## Gridworld Control Lab

Environment presets:

1. Classic Gridworld
2. Cliff Walking
3. Windy Gridworld
4. Dyna Maze
5. Frozen Lake with stochastic slipping
6. Four Rooms

The lab supports single updates, automatic execution, pause, reset, 50-episode batches, adjustable hyperparameters,
and optional obstacle editing. Clicking a state opens its four action values. A complete live table exposes each
state's visit count, value, learned Q-values or Bellman backups, greedy action, latest updated action, sampled
transition, numerical target, error, and resulting estimate.

Dyna-Q stores sampled one-step transitions and performs a configurable number of model backups after every real
interaction. Double Q-learning keeps two estimators and separates maximizing-action selection from evaluation.

## Multi-Armed Bandit Lab

The reward model can be Bernoulli or Gaussian, while the underlying means can remain stationary or drift through
a random walk. Each arm's true mean is editable during an experiment.

The lab records sample-average estimates, pulls, reward, pseudo-regret, best-arm rate, action probabilities,
confidence bounds, posterior samples, learned preferences, and the exact evidence behind the latest choice.
Optimistic initial estimates, Softmax temperature, epsilon, and Gradient Bandit step size are adjustable. A
comparison mode advances all five strategies against the same reward landscape.

## Random Walk Prediction Lab

The prediction lab uses a symmetric Markov reward process with selectable chain length. It computes the true
discounted value function and compares it with the current estimate after every episode.

- Monte Carlo waits for termination and propagates sampled returns backward.
- TD(0) bootstraps after every transition.
- n-step TD exposes the bias, variance, and delay introduced by the chosen backup horizon.
- TD(lambda) displays the complete eligibility trace and its backward credit assignment.

The interface shows the current path, estimate and truth for every state, the active bootstrap term, update
horizon, prediction error, trace magnitude, and per-episode RMSE.

## Mountain Car Control Lab

Mountain Car uses the standard deterministic position and velocity dynamics. The engine cannot climb directly,
so the policy must first move away from the goal to build momentum.

Continuous position and velocity are mapped into adjustable discrete bins. The resulting state-action map shows
the greedy engine action and maximum Q-value in every region. The lab also exposes the physical trajectory,
engine and velocity vectors, current continuous and discrete state, exact TD update, per-action Q-values,
episode length, return, and goal rate.

## Notes Workflow

The notes library remains intentionally empty. New chapters should be created from `note-template.html` after
the corresponding topic has been studied. The template contains six paired English and Chinese sections:

1. The question
2. Definitions, notation, and assumptions
3. Derivation
4. Plain-language intuition
5. Reproducible experiment
6. Mistakes, revisions, and open questions

## Design and Accessibility

- Responsive static pages suitable for GitHub Pages
- English by default with persistent Chinese switching
- Persistent light and dark themes
- Keyboard-accessible native controls
- Reduced-motion support
- No backend, account, analytics, or remote training service
- All simulations run locally in the browser

## Project Structure

```text
MindForge/
├── index.html
├── gridworld.html
├── gridworld.js
├── bandit.html
├── bandit.js
├── prediction.html
├── prediction.js
├── mountain-car.html
├── mountain-car.js
├── notes.html
├── note-template.html
├── app.js
├── styles.css
├── rl.css
├── 404.html
├── sitemap.xml
├── robots.txt
├── assets/
│   └── favicon.svg
├── scripts/
│   ├── check-site.mjs
│   └── smoke-labs.mjs
└── .github/workflows/deploy-pages.yml
```

## Local Development

No installation or build step is required.

```bash
python3 -m http.server 8000
```

Run the same checks used by the deployment workflow:

```bash
node scripts/check-site.mjs
node --check app.js
node --check gridworld.js
node --check bandit.js
node --check prediction.js
node --check mountain-car.js
node scripts/smoke-labs.mjs
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`. The workflow validates the page graph, bilingual
translation keys, laboratory coverage, JavaScript syntax, and simulated interactions before deploying the static
site to GitHub Pages.
