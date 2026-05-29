import type {
  Gender,
  Mode,
  MissingNeutralBehavior,
  KhitabOptions,
  Phrase,
} from './types';
import { isNeutralOnly } from './types';
import { phrases } from './data/index';

function isGender(value: unknown): value is Gender {
  return value === 'male' || value === 'female' || value === 'neutral';
}

/**
 * يحلّ المُدخل إلى جنس صالح ثم يتحقق منه (resolve أولاً ثم validate).
 * - undefined: لم يُمرَّر → defaultGender ثم 'male'
 * - null / '' / أي قيمة أخرى: غير صالحة → خطأ صريح
 */
export function resolveAndValidateGender(
  inputGender: Gender | undefined,
  defaultGender: Gender | undefined,
): Gender {
  // undefined وحده يعني "لم يُمرَّر" → fallback. أي قيمة أخرى (بما فيها null) تُتحقَّق.
  const resolved: unknown =
    inputGender === undefined ? defaultGender ?? 'male' : inputGender;

  if (!isGender(resolved)) {
    throw new Error(
      `khitab: invalid gender "${String(resolved)}". ` +
        `Expected 'male' | 'female' | 'neutral'.`,
    );
  }
  return resolved;
}

/** البحث الأساسي عن نص العبارة بعد حل الجنس. دالة داخلية تتشاركها الواجهتان. */
function lookup(
  key: string,
  gender: Gender,
  mode: Mode,
  onMissingNeutral: MissingNeutralBehavior,
): string {
  const phrase: Phrase | undefined = phrases[key];

  // مفتاح مفقود → خطأ صريح
  if (phrase === undefined) {
    throw new Error(`khitab: unknown phrase key "${key}".`);
  }

  // النوع الثاني (محايد طبيعياً): صالح لأي مخاطَب دون تحذير
  if (isNeutralOnly(phrase)) {
    return phrase.neutral;
  }

  // النوع الأول (جندري)
  if (gender === 'male') {
    return phrase.male;
  }
  if (gender === 'female') {
    return phrase.female;
  }

  // gender === 'neutral'
  if (phrase.neutral !== undefined) {
    return phrase.neutral;
  }

  // عبارة جندرية طُلبت لها neutral وهي غير موجودة
  if (mode === 'strict') {
    throw new Error(`khitab: phrase "${key}" has no neutral form (strict mode).`);
  }
  if (onMissingNeutral === 'throw') {
    throw new Error(`khitab: phrase "${key}" has no neutral form.`);
  }
  // onMissingNeutral === 'male'
  console.warn(`khitab: phrase "${key}" has no neutral form; falling back to male.`);
  return phrase.male;
}

/**
 * الواجهة البسيطة (الموصى بها للسيرفرات): stateless، gender إلزامي.
 * إعدادات افتراضية: mode='lenient', onMissingNeutral='male'.
 */
export function khitab(key: string, gender: Gender): string {
  const resolved = resolveAndValidateGender(gender, undefined);
  return lookup(key, resolved, 'lenient', 'male');
}

/**
 * الواجهة المتقدمة (Factory): scope محلي فقط.
 * gender اختياري يتجاوز defaultGender؛ undefined يستخدم defaultGender.
 */
export function createKhitab(
  options: KhitabOptions = {},
): (key: string, gender?: Gender) => string {
  const { defaultGender } = options;
  const mode: Mode = options.mode ?? 'lenient';
  const onMissingNeutral: MissingNeutralBehavior =
    options.onMissingNeutral ?? 'male';

  return (key: string, gender?: Gender): string => {
    const resolved = resolveAndValidateGender(gender, defaultGender);
    return lookup(key, resolved, mode, onMissingNeutral);
  };
}