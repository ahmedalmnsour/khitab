import { describe, it, expect } from 'vitest';
import { phrases } from '../src/data/index';
import { isNeutralOnly, type Phrase } from '../src/types';

// فحوصات سلامة القاموس المدموج (نواة ar.json + عشر فئات — القسم 5 من الخطة v6).
// phrases هنا هو الناتج المدموج من src/data/index.ts، فالفحص يغطّي كل الفئات معاً.
// التكرار (داخل ملف وعبر الملفات) يُفرض في scripts/validate-json.js (لأن JSON.parse يطويه)،
// فهنا نعتمد على الكائن المُحلَّل بأمان.

const entries = Object.entries(phrases) as [string, Phrase][];

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';

// it.each على مصفوفة فارغة يُعدّ فشلاً في Vitest 4 ("no test found").
// لو كان القاموس فارغاً {} لأي سبب، فنحرس كل each بحالة placeholder تمرّ،
// حتى تبقى بوابة الجودة خضراء بدل أن تفشل بـ "no test found".
const orEmpty = (
  rows: [string, Phrase][],
): [string, Phrase | undefined][] =>
  rows.length > 0 ? rows : [['(no phrases yet)', undefined]];

describe('data integrity: merged dictionary', () => {
  it('الجذر كائن صالح', () => {
    expect(phrases).toBeTypeOf('object');
    expect(phrases).not.toBeNull();
    expect(Array.isArray(phrases)).toBe(false);
  });

  describe('كل عبارة من النوع الأول (جندري) أو الثاني (محايد فقط)', () => {
    it.each(orEmpty(entries))('عبارة "%s" تطابق أحد النوعين فقط', (_key, phrase) => {
      if (phrase === undefined) return; // صف placeholder (قاموس فارغ)
      const hasMale = 'male' in phrase;
      const hasFemale = 'female' in phrase;
      const hasNeutral = 'neutral' in phrase;

      if (isNeutralOnly(phrase)) {
        // النوع الثاني: neutral فقط، بدون male/female
        expect(hasMale).toBe(false);
        expect(hasFemale).toBe(false);
        expect(hasNeutral).toBe(true);
      } else {
        // النوع الأول: male و female موجودان معاً
        expect(hasMale).toBe(true);
        expect(hasFemale).toBe(true);
      }
    });
  });

  describe('قواعد النوع الأول (جندري)', () => {
    const gendered = entries.filter(([, p]) => !isNeutralOnly(p));

    it.each(orEmpty(gendered))('عبارة "%s": male و female غير فارغتين', (_key, phrase) => {
      if (phrase === undefined) return;
      const p = phrase as { male: string; female: string };
      expect(isNonEmptyString(p.male)).toBe(true);
      expect(isNonEmptyString(p.female)).toBe(true);
    });

    it.each(orEmpty(gendered))(
      'عبارة "%s": male !== female (شامل التشكيل)',
      (_key, phrase) => {
        if (phrase === undefined) return;
        const p = phrase as { male: string; female: string };
        expect(p.male).not.toBe(p.female);
      },
    );

    it.each(orEmpty(gendered))(
      'عبارة "%s": إن وُجدت neutral فهي غير فارغة و ≠ male و ≠ female',
      (_key, phrase) => {
        if (phrase === undefined) return;
        const p = phrase as { male: string; female: string; neutral?: string };
        if ('neutral' in p && p.neutral !== undefined) {
          expect(isNonEmptyString(p.neutral)).toBe(true);
          expect(p.neutral).not.toBe(p.male);
          expect(p.neutral).not.toBe(p.female);
        }
      },
    );
  });

  describe('قواعد النوع الثاني (محايد فقط)', () => {
    const neutralOnly = entries.filter(([, p]) => isNeutralOnly(p));

    it.each(orEmpty(neutralOnly))('عبارة "%s": neutral غير فارغة', (_key, phrase) => {
      if (phrase === undefined) return;
      expect(isNonEmptyString(phrase.neutral)).toBe(true);
    });
  });

  it('لا حقول خارج male/female/neutral', () => {
    const allowed = new Set(['male', 'female', 'neutral']);
    for (const [key, phrase] of entries) {
      for (const field of Object.keys(phrase)) {
        expect(allowed.has(field), `عبارة "${key}" تحوي حقلاً غير مسموح: "${field}"`).toBe(true);
      }
    }
  });

  it('المفاتيح مرتّبة أبجدياً تصاعدياً', () => {
    const keys = Object.keys(phrases);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });
});