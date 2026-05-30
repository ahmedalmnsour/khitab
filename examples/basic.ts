/**
 * khitab — basic usage example
 *
 * Run with a TypeScript runner, e.g.:
 *   npx tsx examples/basic.ts
 *
 * Every asserted output below is taken verbatim from the v0.1 dictionary.
 */
import { khitab, createKhitab } from '../src/khitab';

// 1) Simple, stateless interface — recommended for servers.
//    `gender` is required here, and nothing leaks between calls.
console.log(khitab('save', 'male')); //    احفظ
console.log(khitab('save', 'female')); //  احفظي
console.log(khitab('login', 'male')); //   سجّل الدخول
console.log(khitab('login', 'female')); // سجّلي الدخول

// 2) A naturally-neutral phrase returns the same text for every gender,
//    with no warning, because the neutral wording is valid for all.
console.log(khitab('tryLater', 'male')); //   يرجى المحاولة لاحقاً
console.log(khitab('tryLater', 'female')); // يرجى المحاولة لاحقاً

// 3) Asking for `neutral` on a gendered phrase (none of the gendered phrases
//    ship a neutral form in v0.1) falls back to `male` and emits a
//    console.warn — a practical, not ideal, default. Prefer a real gender,
//    or contribute a neutral wording.
console.log(khitab('save', 'neutral')); // احفظ  (+ warning on stderr)

// 4) Factory — for LOCAL scope only (inside a component or request handler).
//    Never create a Factory in global scope on a server: it leaks between
//    requests. See the SSR warning in the README.
const k = createKhitab({ defaultGender: 'female' });
console.log(k('delete')); //         uses defaultGender → احذفي
console.log(k('delete', 'male')); // explicit gender overrides default → احذف

// 5) Strict mode surfaces a missing neutral as an explicit error instead of
//    falling back. Useful in development and tests to catch gaps early.
const strict = createKhitab({ mode: 'strict' });
try {
  strict('save', 'neutral');
} catch (err) {
  console.error((err as Error).message);
  // khitab: phrase "save" has no neutral form (strict mode).
}

// 6) Unknown keys throw an explicit error rather than failing silently.
try {
  khitab('nonexistent', 'male');
} catch (err) {
  console.error((err as Error).message);
  // khitab: unknown phrase key "nonexistent".
}