export type Gender = 'male' | 'female' | 'neutral';

// النوع الأول: عبارة جندرية (male و female معاً، neutral اختيارية)
export interface GenderedPhrase {
  male: string;
  female: string;
  neutral?: string;
}

// النوع الثاني: عبارة محايدة طبيعياً (neutral فقط)
export interface NeutralOnlyPhrase {
  neutral: string;
}

export type Phrase = GenderedPhrase | NeutralOnlyPhrase;

// Type guard للتمييز بين النوعين
export function isNeutralOnly(p: Phrase): p is NeutralOnlyPhrase {
  return !('male' in p);
}

export type Mode = 'strict' | 'lenient';
export type MissingNeutralBehavior = 'male' | 'throw';

export interface KhitabOptions {
  defaultGender?: Gender;
  mode?: Mode; // الافتراضي: 'lenient'
  onMissingNeutral?: MissingNeutralBehavior;
}