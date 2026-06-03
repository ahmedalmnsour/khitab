import type { Phrase } from '../types';

import ar from './ar.json';
import communication from './communication.json';
import delivery from './delivery.json';
import ecommerce from './ecommerce.json';
import education from './education.json';
import finance from './finance.json';
import games from './games.json';
import government from './government.json';
import health from './health.json';
import jobs from './jobs.json';
import travel from './travel.json';

/**
 * القاموس العربي: نواة عامّة (ar.json) + عشر فئات، تُدمَج في قاموس مسطّح واحد.
 * المفاتيح فريدة عبر كل الملفات (يفرضه scripts/validate-json.js)، فالدمج آمن بلا تعارض.
 * النتيجة مرتّبة أبجدياً عالمياً ليبقى الترتيب ثابتاً ومتوافقاً مع الاختبارات.
 * الفحص الفعلي لسلامة البيانات في tests/data-integrity.test.ts و scripts/validate-json.js.
 */
const sources: Record<string, Phrase>[] = [
  ar as Record<string, Phrase>,
  communication as Record<string, Phrase>,
  delivery as Record<string, Phrase>,
  ecommerce as Record<string, Phrase>,
  education as Record<string, Phrase>,
  finance as Record<string, Phrase>,
  games as Record<string, Phrase>,
  government as Record<string, Phrase>,
  health as Record<string, Phrase>,
  jobs as Record<string, Phrase>,
  travel as Record<string, Phrase>,
];

const merged: Record<string, Phrase> = {};
for (const source of sources) {
  for (const key of Object.keys(source)) {
    merged[key] = source[key];
  }
}

export const phrases: Record<string, Phrase> = Object.fromEntries(
  Object.keys(merged)
    .sort()
    .map((key) => [key, merged[key]]),
);