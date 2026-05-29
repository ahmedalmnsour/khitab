import type { Phrase } from '../types';
import ar from './ar.json';

/**
 * القاموس العربي: يُستورَد من ar.json ويُصدَّر بنوع محدد.
 * الفحص الفعلي لسلامة البيانات في tests/data-integrity.test.ts و scripts/validate-json.js.
 */
export const phrases: Record<string, Phrase> = ar as Record<string, Phrase>;