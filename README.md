**English** | [العربية](./README.ar.md)

# khitab

[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmedalmnsour/khitab/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/ahmedalmnsour/khitab/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Experimental](https://img.shields.io/badge/experimental-v0.1-orange?style=flat-square)](https://github.com/ahmedalmnsour/khitab)

> Ready-made, gender-aware Arabic phrases for UI text. Lightweight, TypeScript-first, framework-agnostic.

> 📖 This English README is a short gateway. The full documentation — philosophy, both interfaces, limits, and the inclusivity guide — lives in **[the Arabic README](./README.ar.md)**, the project's heart.

## What is khitab?

Arabic verbs and many sentences change form depending on whom you address: `احفظ` to a man, `احفظي` to a woman. Most UIs ignore this and default to the masculine. **khitab** is a small dictionary plus a tiny function that returns the correctly-addressed Arabic phrase for a given gender, so your interface speaks to each user properly.

It ships 33 reviewed phrases for v0.1, has zero runtime dependencies, and is fully typed.

## Install

```bash
npm install @khitab/core
```

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

## ⚠️ Experimental (v0.1)

This is an early, experimental release. The API and the phrase dictionary may change in backward-incompatible ways before `1.0.0`. Pin your version if you depend on it.

## Full documentation

The complete guide — the philosophy behind gender-aware addressing, the simple vs. factory interfaces in depth, an honest account of the library's limits, the SSR warning, and how to contribute toward full inclusivity — is in the **[Arabic README](./README.ar.md)**.

## License

[MIT](./LICENSE) © 2026 Ahmed Almnsour
