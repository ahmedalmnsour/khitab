// scripts/validate-json.js
//
// فحص محلي لسلامة كل ملفات src/data/ قبل CI.
// يعكس قواعد القسم 5 من الخطة v6، ومستقل عن إطار الاختبار (يُشغَّل بـ `npm run validate`).
//
// لماذا نقرأ النص الخام؟
//   JSON.parse('{"a":1,"a":2}') يُرجع {a:2} بصمت — التكرار يُطوى قبل أي فحص.
//   لذا نكتشف المفاتيح المكرّرة عبر ماسح نصي واعٍ بحالة السلسلة وعمق الأقواس، ثم نُحلِّل للبنية.
//
// منذ توزيع القاموس على ملفات (نواة ar.json + عشر فئات) نفحص الملفات جميعاً،
// ونضيف فحص التكرار العابر للملفات: index.ts يدمجها في قاموس مسطّح واحد،
// فمفتاح مكرّر بين ملفين يُدمَج بصمت ويضيع أحدهما — لذا نمنعه هنا.
//
// ESM لأن package.json فيه "type": "module".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// النواة أولاً ثم الفئات (الترتيب لا يؤثّر على الفحص، لكنه يطابق index.ts).
const FILES = [
  'ar.json',
  'communication.json',
  'delivery.json',
  'ecommerce.json',
  'education.json',
  'finance.json',
  'games.json',
  'government.json',
  'health.json',
  'jobs.json',
  'travel.json',
];

const ALLOWED_FIELDS = ['male', 'female', 'neutral'];

/** يجمع كل الأخطاء بدل التوقف عند أول واحد، لتُطبع دفعة واحدة. */
const errors = [];
const err = (msg) => errors.push(msg);

// ── كاشف التكرار النصي داخل ملف واحد ───────────────────────────────────
// يتتبّع: داخل سلسلة؟ مهروب؟ عمق الأقواس؟ ويسجّل مفاتيح كل كائن في Set على مكدس.
function detectDuplicateKeys(text) {
  let inString = false;
  let escaped = false;
  let current = '';
  let lastString = null;
  let expectingKey = false;
  const stack = [];
  const dups = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        current += ch;
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
        lastString = current;
        expectingKey = true;
        current = '';
      } else {
        current += ch;
      }
      continue;
    }
    switch (ch) {
      case '"':
        inString = true;
        current = '';
        break;
      case '{':
        stack.push({ keys: new Set() });
        expectingKey = false;
        break;
      case '}':
        stack.pop();
        expectingKey = false;
        break;
      case ':': {
        if (expectingKey && lastString !== null && stack.length > 0) {
          const top = stack[stack.length - 1];
          if (top.keys.has(lastString)) dups.push(lastString);
          else top.keys.add(lastString);
        }
        expectingKey = false;
        break;
      }
      case ',':
        expectingKey = false;
        break;
      default:
        break;
    }
  }
  return dups;
}

// ── خريطة المفاتيح العالمية (لكشف التكرار العابر للملفات) ────────────────
const globalKeys = new Map(); // key -> اسم الملف الذي ظهر فيه أولاً
let grandTotal = 0;

for (const fileName of FILES) {
  const filePath = join(DATA_DIR, fileName);

  // 1) قراءة خام
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (e) {
    err(`${fileName}: cannot read — ${e.message}`);
    continue;
  }

  // 2) تكرار داخل الملف
  for (const d of detectDuplicateKeys(raw)) {
    err(`${fileName}: duplicate key "${d}"`);
  }

  // 3) تحليل
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    err(`${fileName}: invalid JSON — ${e.message}`);
    continue;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    err(`${fileName}: root must be a plain object`);
    continue;
  }

  const keys = Object.keys(data);
  grandTotal += keys.length;

  // 4) فحوص بنيوية لكل عبارة
  for (const key of keys) {
    const phrase = data[key];
    const where = `${fileName} → "${key}"`;

    if (phrase === null || typeof phrase !== 'object' || Array.isArray(phrase)) {
      err(`${where}: value must be an object with male/female/neutral`);
      continue;
    }

    for (const f of Object.keys(phrase)) {
      if (!ALLOWED_FIELDS.includes(f)) {
        err(`${where}: unexpected field "${f}" (only male/female/neutral allowed)`);
      }
      const v = phrase[f];
      if (typeof v !== 'string') {
        err(`${where}.${f}: must be a string`);
      } else if (v.trim() === '') {
        err(`${where}.${f}: must not be empty`);
      }
    }

    const hasMale = 'male' in phrase;
    const hasFemale = 'female' in phrase;
    const hasNeutral = 'neutral' in phrase;

    if (hasMale || hasFemale) {
      if (!hasMale) err(`${where}: gendered phrase missing "male"`);
      if (!hasFemale) err(`${where}: gendered phrase missing "female"`);
      if (hasMale && hasFemale && phrase.male === phrase.female) {
        err(`${where}: male and female must differ (got identical "${phrase.male}")`);
      }
      if (hasNeutral) {
        if (phrase.neutral === phrase.male) err(`${where}: neutral must differ from male`);
        if (phrase.neutral === phrase.female) err(`${where}: neutral must differ from female`);
      }
    } else if (!hasNeutral) {
      err(`${where}: must be either gendered (male+female) or neutral-only`);
    }
  }

  // 5) الترتيب الأبجدي التصاعدي داخل الملف
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1] > keys[i]) {
      err(`${fileName}: keys not ascending — "${keys[i - 1]}" should come after "${keys[i]}"`);
    }
  }

  // 6) التكرار العابر للملفات
  for (const key of keys) {
    if (globalKeys.has(key)) {
      err(`cross-file duplicate key "${key}" in ${fileName} and ${globalKeys.get(key)}`);
    } else {
      globalKeys.set(key, fileName);
    }
  }
}

// ── النتيجة ────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`✗ data validation failed (${errors.length} error(s)):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.log(
  `✓ valid — ${FILES.length} files, ${grandTotal} phrase(s), ${globalKeys.size} unique key(s)`,
);
process.exit(0);