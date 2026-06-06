**English** | [العربية](./README.ar.md)

# khitab

[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmedalmnsour/khitab/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/ahmedalmnsour/khitab/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Alpha](https://img.shields.io/badge/status-alpha-orange?style=flat-square)](https://github.com/ahmedalmnsour/khitab)

> Ready-made, gender-aware Arabic phrases for UI text. Lightweight, TypeScript-first, framework-agnostic.

This English README is a short gateway. The full documentation, including philosophy, both interfaces, limits, and the inclusivity guide, lives in **[the Arabic README](./README.ar.md)**, the project's heart.

## What is khitab?

Arabic verbs and many sentences change form depending on whom you address: `احفظ` to a man, `احفظي` to a woman. Most UIs ignore this and default to the masculine. **khitab** is a small dictionary plus a tiny function that returns the correctly-addressed Arabic phrase for a given gender, so your interface speaks to each user properly.

It ships 1367 reviewed phrases (780 gendered, 587 naturally neutral) across a core set and ten domains, has zero runtime dependencies, and is fully typed.

<p align="center">
  <img src="https://raw.githubusercontent.com/ahmedalmnsour/khitab/main/assets/khitab-phrases-en.svg" alt="khitab dictionary: 1367 phrases — 780 gendered (57%), 587 neutral (43%)" width="380" />
</p>

## Install

```bash
npm install @khitab/core@alpha
```

> The `@alpha` tag is intentional: the library is currently in its alpha stage, and typing `alpha` yourself is a conscious acknowledgment of that. Once it reaches stability, the plain install will become the recommended one, in shaa' Allah.

## Quick start

```ts
import { khitab, createKhitab } from '@khitab/core';

// Simple, stateless — recommended for servers. `gender` is required.
khitab('save', 'male'); //   احفظ
khitab('save', 'female'); // احفظي

// Factory — for LOCAL scope only (a component or a request handler).
const k = createKhitab({ defaultGender: 'female' });
k('login'); // سجّلي الدخول
```

See [`examples/basic.ts`](./examples/basic.ts) for the neutral-fallback and error behaviors.

## ⚠️ Alpha

This is an alpha release (published to npm under the `alpha` tag): the phrase dictionary is complete and reviewed, but the library has not yet been tested in real-world projects. The API may change before a stable release.

## Full documentation

The complete guide is in the **[Arabic README](./README.ar.md)**. It covers the philosophy behind gender-aware addressing, the simple vs. factory interfaces in depth, an honest account of the library's limits, the SSR warning, and how to contribute toward full inclusivity.

## License

[MIT](./LICENSE) © 2026 Ahmed Almnsour
