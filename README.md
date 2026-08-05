# MindForge

**English** | [简体中文](README.zh-CN.md)

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
- Blackjack Monte Carlo Lab: [blackjack.html](https://jiaxtian.github.io/MindForge/blackjack.html)
- CartPole Control Lab: [cartpole.html](https://jiaxtian.github.io/MindForge/cartpole.html)

## Laboratory Coverage

| Laboratory | Core question | Algorithms and mechanisms |
| --- | --- | --- |
| Gridworld | How do planning and sampled control produce a policy? | Value iteration, policy iteration, Q-learning, SARSA, Expected SARSA, Dyna-Q, Double Q-learning |
| Multi-Armed Bandit | How should an agent balance exploration and exploitation? | Epsilon-greedy, UCB1, Thompson sampling, Softmax exploration, Gradient Bandit |
| Random Walk | When should a value estimate be updated? | Every-visit Monte Carlo, TD(0), n-step TD, TD(lambda) |
| Mountain Car | How can tabular control handle continuous state? | Q-learning, SARSA, Expected SARSA, SARSA(lambda), state aggregation |
| Blackjack | How can complete episodic returns support prediction and control? | First-visit MC prediction, epsilon-soft on-policy MC control, weighted importance sampling |
| CartPole | How can TD control balance unstable continuous dynamics? | Q-learning, SARSA, Expected SARSA, Double Q-learning, four-dimensional state discretization |

Together, the laboratories cover bandit feedback, value prediction, dynamic programming, model-free control,
model-based replay, maximization bias, stochastic transitions, eligibility traces, episodic sampling, importance
sampling, delayed reward, and continuous state discretization.

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

## Blackjack Monte Carlo Lab

Blackjack uses an infinite deck sampled with replacement and exposes two dealer rules: stand on soft 17 or hit
soft 17. A complete state is the player's sum, the dealer's visible card, and whether the player has a usable ace.

The laboratory compares first-visit Monte Carlo prediction under a fixed policy, epsilon-soft on-policy Monte
Carlo control, and off-policy control with weighted importance sampling. It shows each hand one decision at a
time, the sampled return, importance weight, exact estimate update, episode trajectory, win rate, and separate
state-value or policy maps for hands with and without a usable ace.

## CartPole Control Lab

CartPole implements the standard nonlinear position, velocity, pole-angle, and angular-velocity dynamics. In
addition to the standard task, strong-gravity and weak-actuator variants expose how a policy depends on the
environment transition model.

Q-learning, SARSA, Expected SARSA, and Double Q-learning operate on selectable four-dimensional discretizations.
The page renders the physical motion, continuous and discrete state, current action values, exact TD update,
episode-length curve, 500-step balance rate, and an angle-by-angular-velocity policy slice.

## Notes Workflow

Notes are maintained as source files rather than empty public pages. Copy [`NOTE_TEMPLATE.md`](NOTE_TEMPLATE.md)
into a `notes/` directory after studying a topic, rename the copy, and replace its bracketed placeholders. The
template contains six paired English and Chinese sections:

1. The question
2. Definitions, notation, and assumptions
3. Derivation
4. Plain-language intuition
5. Reproducible experiment
6. Mistakes, revisions, and open questions

Keep the two language sections in the same order. It is fine to finish one language first, but translate the
complete meaning into the paired section without shortening the technical content.

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
├── blackjack.html
├── blackjack.js
├── cartpole.html
├── cartpole.js
├── NOTE_TEMPLATE.md
├── app.js
├── styles.css
├── rl.css
├── 404.html
├── sitemap.xml
├── robots.txt
├── README.md
├── README.zh-CN.md
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
node --check blackjack.js
node --check cartpole.js
node scripts/smoke-labs.mjs
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`. The workflow validates the page graph, bilingual
translation keys, laboratory coverage, JavaScript syntax, and simulated interactions before deploying the static
site to GitHub Pages.
