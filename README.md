# MindForge

> Forge understanding from first principles.

[![Deploy to GitHub Pages](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/JiaXtian/MindForge/actions/workflows/deploy-pages.yml)

MindForge is a personal, bilingual learning space for documenting ideas, notes, and reflections from an ongoing journey through artificial intelligence. It connects mathematical foundations, model mechanics, paper reading, and practical experiments in one evolving knowledge map.

**Live site:** [https://jiaxtian.github.io/MindForge/](https://jiaxtian.github.io/MindForge/)

## Highlights

- Modern responsive interface for desktop, tablet, and mobile
- Light and dark themes with saved browser preference
- English-first bilingual interface with one-click Chinese switching
- Long-form article layout with a sticky table of contents and reading progress
- MathJax rendering for rigorous mathematical notation
- Zero-build static architecture: no package installation or framework lock-in
- Automated parity checks keep the long-form English and Chinese editions structurally synchronized
- Automatic deployment to GitHub Pages on every push to `main`

## Pages

| Page | Description | Link |
| --- | --- | --- |
| Home | Site introduction, learning collections, principles, and roadmap | [Open home](https://jiaxtian.github.io/MindForge/) |
| Linear Algebra for Machine Learning | An 11-chapter guide covering foundations, machine-learning applications, geometry, and physical meaning | [Read the chapter](https://jiaxtian.github.io/MindForge/linear-algebra.html) |
| Large Language Models Explained | A 12-chapter guide covering Transformer architecture, GPT/BERT, pre-training, alignment, RAG, agents, multimodality, efficiency, safety, and frontier mechanisms | [Read the chapter](https://jiaxtian.github.io/MindForge/llm.html) |

## Knowledge Map

1. **Mathematical Foundations** — linear algebra, probability, calculus, and optimization.
2. **Machine Learning Models** — large language models, loss functions, optimization, generalization, and classical models.
3. **Paper Notes** — distilled arguments, diagrams, questions, and lasting insights.
4. **Lab Notebook** — experiments, implementation decisions, failed assumptions, and lessons learned.

The first two long-form chapters are live. The remaining collections are intentionally reserved as the site grows.

## Linear Algebra Chapter

The first long-form chapter contains more than 17,000 Chinese characters and a complete English edition. Its 11 sections cover:

1. Scalars, vectors, vector spaces, basis, and coordinates
2. Matrices as linear transformations
3. Linear systems, column spaces, null spaces, rank, and least squares
4. Inner products, norms, orthogonality, projections, and similarity
5. Eigenvalues, eigenvectors, spectral theory, and dynamical systems
6. Singular value decomposition, conditioning, low-rank approximation, and PCA
7. Gradients, Jacobians, Hessians, backpropagation, and optimization geometry
8. Linear regression, regularization, kernels, and probabilistic models
9. Embeddings, tensors, convolutions, and attention
10. Connections among algebra, geometry, physics, and machine learning
11. Numerical stability, implementation habits, and a continued learning map

## LLM Chapter

The second long-form chapter contains more than 12,000 Chinese characters and a synchronized English edition. Its 12 sections cover:

1. Tokenization, next-token prediction, embeddings, perplexity, and compression
2. Transformer self-attention, multi-head routing, and positional information
3. Residual streams, normalization, MLPs, optimization, and training flow
4. Encoder-only, decoder-only, and encoder-decoder architectures including BERT and GPT
5. Large-scale pre-training, data quality, scaling laws, and base-model behavior
6. Instruction tuning, RLHF, DPO, refusals, and preference alignment
7. Decoding, sampling, context windows, KV cache, and serving constraints
8. Prompting, reasoning traces, verification, tool use, and agents
9. Retrieval-Augmented Generation, vector search, grounding, and memory
10. LoRA, QLoRA, quantization, distillation, and Mixture-of-Experts systems
11. Multimodal models, long-context mechanisms, and perception-action interfaces
12. Evaluation, hallucination, security, privacy, and a durable frontier map

## Project Structure

```text
MindForge/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── assets/
│   └── favicon.svg
├── scripts/
│   └── check-content-parity.mjs
├── index.html
├── linear-algebra.html
├── llm.html
├── styles.css
├── article.css
├── app.js
├── 404.html
├── robots.txt
├── sitemap.xml
└── README.md
```

## Run Locally

The site has no build step. Start any static file server from the repository root:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Opening the HTML files directly also works, but a local server better matches GitHub Pages behavior.

Before publishing article changes, verify that both language editions still contain matching sections,
subsections, paragraphs, tables, and equations:

```bash
node scripts/check-content-parity.mjs
```

## Add a New Article

1. Duplicate `linear-algebra.html` and rename it with a concise URL-safe filename.
2. Keep the shared header, theme controls, language controls, and footer.
3. Add the new article to the home-page module grid in `index.html`.
4. Add English interface strings to the HTML and Chinese strings to `translations.zh` in `app.js`.
5. Add the public URL to `sitemap.xml` and to the Pages table above.
6. Push to `main`; GitHub Actions publishes the update automatically.

## Deployment

The workflow in `.github/workflows/deploy-pages.yml` first checks bilingual article parity, then uploads the repository as a static Pages artifact and deploys it to the `github-pages` environment. It runs automatically on pushes to `main` and can also be started manually from the Actions tab.

Repository Pages settings must use **GitHub Actions** as the publishing source. Once enabled, successful deployments are available at:

```text
https://jiaxtian.github.io/MindForge/
```

## Design Notes

MindForge uses a warm editorial visual system rather than a generic dashboard layout. The interface combines:

- A restrained neutral palette with a high-contrast orange accent
- Serif display typography for long-form ideas and sans-serif body typography for clarity
- Fine grid lines, large whitespace, and geometric details
- Persistent theme and language preferences through `localStorage`
- Progressive enhancement: all essential content remains readable without JavaScript

## External Resources

- [Google Fonts](https://fonts.google.com/) for Manrope, Newsreader, and DM Mono
- [MathJax](https://www.mathjax.org/) for mathematical typesetting
- [GitHub Pages](https://pages.github.com/) for hosting

## License

The writing and source code are currently maintained as part of this personal learning project. Unless a separate license is added, all rights are reserved.
