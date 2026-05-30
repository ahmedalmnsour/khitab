import { describe, it, expect, vi, afterEach } from 'vitest';
import { khitab } from '../src/khitab';
import type { Gender } from '../src/types';

// اختبارات الواجهة البسيطة khitab(key, gender).
// stateless، gender إلزامي، الإعداد الضمني: mode='lenient', onMissingNeutral='male'.
// تعتمد على عبارات حقيقية معتمدة من القاموس.

afterEach(() => {
  vi.restoreAllMocks();
});

describe('khitab(): الواجهة البسيطة', () => {
  describe('عبارة جندرية', () => {
    it('تُرجع صيغة male', () => {
      expect(khitab('save', 'male')).toBe('احفظ');
    });

    it('تُرجع صيغة female', () => {
      expect(khitab('save', 'female')).toBe('احفظي');
    });

    it('تحترم التشكيل في female (أهلاً بعودتكِ)', () => {
      expect(khitab('welcomeBack', 'female')).toBe('أهلاً بعودتكِ');
    });
  });

  describe('عبارة محايدة طبيعياً (tryLater)', () => {
    const expected = 'يُرجى المحاولة لاحقاً';

    it('تُرجع neutral عند طلب neutral', () => {
      expect(khitab('tryLater', 'neutral')).toBe(expected);
    });

    it('تُرجع neutral عند طلب male دون تحذير', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(khitab('tryLater', 'male')).toBe(expected);
      expect(warn).not.toHaveBeenCalled();
    });

    it('تُرجع neutral عند طلب female دون تحذير', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(khitab('tryLater', 'female')).toBe(expected);
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('طلب neutral لعبارة جندرية بلا neutral (fallback)', () => {
    it('تُرجع male مع console.warn (افتراض lenient + male)', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(khitab('save', 'neutral')).toBe('احفظ');
      expect(warn).toHaveBeenCalledOnce();
    });
  });

  describe('الأخطاء', () => {
    it('مفتاح مفقود → خطأ صريح', () => {
      expect(() => khitab('nonexistent', 'male')).toThrow(
        'khitab: unknown phrase key "nonexistent".',
      );
    });

    it('جنس غير صالح (null) → خطأ صريح', () => {
      // gender إلزامي نوعياً؛ نتجاوز النوع لاختبار حارس وقت التشغيل.
      expect(() => khitab('save', null as unknown as Gender)).toThrow(
        'khitab: invalid gender "null".',
      );
    });

    it('جنس غير صالح (نص فارغ) → خطأ صريح', () => {
      expect(() => khitab('save', '' as unknown as Gender)).toThrow(
        'khitab: invalid gender "".',
      );
    });

    it('جنس غير صالح (قيمة عشوائية) → خطأ صريح', () => {
      expect(() => khitab('save', 'x' as unknown as Gender)).toThrow(
        'khitab: invalid gender "x".',
      );
    });
  });
});