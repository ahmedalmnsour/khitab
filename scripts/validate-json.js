// scripts/validate-json.js
//
// فحص محلي لسلامة src/data/ar.json قبل CI.
// يعكس قواعد القسم 5 من الخطة v6، ومستقل عن إطار الاختبار (يُشغَّل بـ `npm run validate`).
//
// لماذا نقرأ النص الخام؟
//   JSON.parse('{"a":1,"a":2}') يُرجع {a:2} بصمت — التكرار يُطوى قبل أي فحص.
//   لذا نكتشف المفاتيح المكرّرة (المستوى 1 = مفاتيح العبارات، المستوى 2 = male/female/neutral)
//   عبر ماسح نصي واعٍ بحالة السلسلة وعمق الأقواس، ثم نُحلِّل للفحوصات البنيوية.
//
// ESM لأن package.json فيه "type": "module".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'src', 'data', 'ar.json');

const ALLOWED_FIELDS = ['male', 'female', 'neutral'];

/** يجمع كل الأخطاء بدل التوقف عند أول واحد، لتُطبع دفعة واحدة. */
const errors = [];
const err = (msg) => errors.push(msg);

// ── 1) قراءة الملف الخام ───────────────────────────────────────────────
let raw;
try {
  raw = readFileSync(DATA_PATH, 'utf8');
} catch (e) {
  console.error(`✗ cannot read ${DATA_PATH}: ${e.message}`);
  process.exit(1);
}

// ── كاشف التكرار النصي ─────────────────────────────────────────────────
// يمرّ على النص حرفاً حرفاً. يتتبّع:
//   inString  : هل نحن داخل سلسلة "..." (فلا نحسب الأقواس)
//   escaped   : هل الحرف الحالي مهروب بـ \ (فنتخطّاه حرفياً)
//   braceDepth: عمق الأقواس المعقوفة خارج السلاسل
// عند رؤية سلسلة يتبعها ':' فهي مفتاح؛ نسجّله في خريطة المستوى الموافق لعمقه.
// التكرار = مفتاح ظهر مرتين داخل نفس الكائن (نفس العمق ونفس مسار الأب).
function detectDuplicateKeys(text) {
  let inString = false;
  let escaped = false;
  let braceDepth = 0;
  let current = ''; // حروف السلسلة الجارية
  let lastString = null; // آخر سلسلة اكتملت (مرشّح مفتاح)
  let expectingKey = false; // هل آخر سلسلة قد تكون مفتاحاً؟

  // لكل كائن (يُعرَّف بعمقه + معرّف فتح فريد) نحفظ مجموعة مفاتيحه.
  // نستخدم مكدساً من Set، واحد لكل كائن مفتوح حالياً.
  const stack = []; // كل عنصر: { keys: Set, depth }
  const dups = []; // { key, depth }

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
        expectingKey = true; // قد يتبعها ':' فتكون مفتاحاً
        current = '';
      } else {
        current += ch;
      }
      continue;
    }

    // خارج السلسلة
    switch (ch) {
      case '"':
        inString = true;
        current = '';
        break;
      case '{':
        braceDepth++;
        stack.push({ keys: new Set(), depth: braceDepth });
        expectingKey = false;
        break;
      case '}':
        stack.pop();
        braceDepth--;
        expectingKey = false;
        break;
      case ':': {
        // آخر سلسلة كانت مفتاحاً للكائن الموجود على قمة المكدس
        if (expectingKey && lastString !== null && stack.length > 0) {
          const top = stack[stack.length - 1];
          if (top.keys.has(lastString)) {
            dups.push({ key: lastString, depth: top.depth });
          } else {
            top.keys.add(lastString);
          }
        }
        expectingKey = false;
        break;
      }
      case ',':
        expectingKey = false;
        break;
      default:
        // مسافة بيضاء أو رقم/حرف قيمة — لا يؤثر على كشف المفاتيح
        break;
    }
  }

  return dups;
}

const dups = detectDuplicateKeys(raw);
for (const d of dups) {
  const level = d.depth === 1 ? 'phrase key (level 1)' : `field (level ${d.depth})`;
  err(`duplicate ${level}: "${d.key}"`);
}

// ── 2) تحليل JSON ──────────────────────────────────────────────────────
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`✗ invalid JSON in ${DATA_PATH}: ${e.message}`);
  process.exit(1);
}

if (data === null || typeof data !== 'object' || Array.isArray(data)) {
  console.error('✗ root of ar.json must be a plain object');
  process.exit(1);
}

const keys = Object.keys(data);

// ── الفحوصات البنيوية لكل عبارة ────────────────────────────────────────
for (const key of keys) {
  const phrase = data[key];
  const where = `phrase "${key}"`;

  // الشكل: قيمة العبارة كائن بسيط
  if (phrase === null || typeof phrase !== 'object' || Array.isArray(phrase)) {
    err(`${where}: value must be an object with male/female/neutral fields`);
    continue;
  }

  const fields = Object.keys(phrase);

  // الشكل مسطّح: لا حقول خارج male/female/neutral، ولا كائنات فرعية
  for (const f of fields) {
    if (!ALLOWED_FIELDS.includes(f)) {
      err(`${where}: unexpected field "${f}" (only male/female/neutral allowed)`);
    }
    const v = phrase[f];
    if (typeof v !== 'string') {
      err(`${where}.${f}: must be a string (no nested objects/arrays)`);
    } else if (v.trim() === '') {
      err(`${where}.${f}: must not be empty`);
    }
  }

  const hasMale = 'male' in phrase;
  const hasFemale = 'female' in phrase;
  const hasNeutral = 'neutral' in phrase;

  if (hasMale || hasFemale) {
    // النوع الأول: عبارة جندرية → male و female معاً إلزاميان
    if (!hasMale) err(`${where}: gendered phrase missing "male"`);
    if (!hasFemale) err(`${where}: gendered phrase missing "female"`);

    // male !== female كنص كامل (شاملاً التشكيل) — يفرض قاعدة التشكيل الإلزامي تلقائياً
    if (hasMale && hasFemale && phrase.male === phrase.female) {
      err(`${where}: male and female must differ (got identical "${phrase.male}")`);
    }
    // إن وُجدت neutral فهي ≠ male و ≠ female
    if (hasNeutral) {
      if (phrase.neutral === phrase.male) {
        err(`${where}: neutral must differ from male`);
      }
      if (phrase.neutral === phrase.female) {
        err(`${where}: neutral must differ from female`);
      }
    }
  } else {
    // النوع الثاني: محايدة طبيعياً → neutral وحدها
    if (!hasNeutral) {
      err(`${where}: must be either gendered (male+female) or neutral-only`);
    }
    // (وجود male/female هنا مستحيل لأننا في فرع else)
  }
}

// ── الترتيب الأبجدي التصاعدي حسب اسم المفتاح ────────────────────────────
// مفروض آلياً (الخطة: سطر 258) — Prettier لا يرتّب مفاتيح JSON.
for (let i = 1; i < keys.length; i++) {
  // مقارنة ثابتة مستقلة عن locale لنتيجة قابلة للتكرار في CI
  if (keys[i - 1] > keys[i]) {
    err(`keys not in ascending order: "${keys[i - 1]}" should come after "${keys[i]}"`);
  }
}

// ── النتيجة ────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`✗ ar.json validation failed (${errors.length} error(s)):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.log(`✓ ar.json valid — ${keys.length} phrase(s)`);
process.exit(0);