import { describe, it, expect, vi, afterEach } from 'vitest';
import { createKhitab } from '../src/khitab';
import type { Gender } from '../src/types';

// اختبارات الواجهة المتقدمة createKhitab().
// gender اختياري يتجاوز defaultGender؛ undefined يستخدم defaultGender.
// الإعداد الافتراضي: mode='lenient', onMissingNeutral='male'.

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createKhitab(): الواجهة المتقدمة', () => {
  describe('defaultGender', () => {
    it('يُستخدم عند عدم تمرير gender', () => {
      const k = createKhitab({ defaultGender: 'female' });
      expect(k('save')).toBe('احفظي');
    });

    it('يُتجاوز عند تمرير gender صريح', () => {
      const k = createKhitab({ defaultGender: 'female' });
      expect(k('save', 'male')).toBe('احفظ');
    });

    it('تمرير undefined صراحةً = عدم التمرير (يستخدم default)', () => {
      const k = createKhitab({ defaultGender: 'female' });
      expect(k('save', undefined)).toBe('احفظي');
    });

    it('بلا defaultGender: يسقط إلى male', () => {
      const k = createKhitab();
      expect(k('save')).toBe('احفظ');
    });
  });

  describe('عبارة محايدة طبيعياً (tryLater)', () => {
    const expected = 'يرجى المحاولة لاحقاً';

    it('تُرجع neutral دون تحذير بصرف النظر عن الإعدادات', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const k = createKhitab({ defaultGender: 'male', onMissingNeutral: 'throw' });
      expect(k('tryLater')).toBe(expected);
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe("mode: 'lenient' (الافتراضي) + onMissingNeutral", () => {
    it("الافتراضي 'male': طلب neutral لعبارة جندرية → male + warn", () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const k = createKhitab({ defaultGender: 'neutral' });
      expect(k('save')).toBe('احفظ');
      expect(warn).toHaveBeenCalledOnce();
    });

    it("'throw': طلب neutral لعبارة جندرية → خطأ بلا 'strict mode'", () => {
      const k = createKhitab({ onMissingNeutral: 'throw' });
      expect(() => k('save', 'neutral')).toThrow(
        'khitab: phrase "save" has no neutral form.',
      );
    });
  });

  describe("mode: 'strict'", () => {
    it('طلب neutral لعبارة جندرية بلا neutral → خطأ strict', () => {
      const k = createKhitab({ mode: 'strict' });
      expect(() => k('save', 'neutral')).toThrow(
        'khitab: phrase "save" has no neutral form (strict mode).',
      );
    });

    it('strict يسبق onMissingNeutral: يرمي حتى مع onMissingNeutral=male', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const k = createKhitab({ mode: 'strict', onMissingNeutral: 'male' });
      expect(() => k('save', 'neutral')).toThrow('(strict mode)');
      expect(warn).not.toHaveBeenCalled();
    });

    it('strict لا يؤثر على عبارة جندرية تُطلب male/female', () => {
      const k = createKhitab({ mode: 'strict' });
      expect(k('save', 'male')).toBe('احفظ');
      expect(k('save', 'female')).toBe('احفظي');
    });
  });

  describe('الأخطاء', () => {
    it('مفتاح مفقود → خطأ صريح', () => {
      const k = createKhitab({ defaultGender: 'male' });
      expect(() => k('nonexistent')).toThrow(
        'khitab: unknown phrase key "nonexistent".',
      );
    });

    it('جنس غير صالح صريح (null) → خطأ', () => {
      const k = createKhitab({ defaultGender: 'male' });
      expect(() => k('save', null as unknown as Gender)).toThrow(
        'khitab: invalid gender "null".',
      );
    });

    it('defaultGender غير صالح يظهر فقط عند استخدامه (lazy)', () => {
      // التحقق يحدث وقت الاستدعاء لا وقت الإنشاء؛ القيمة تُفحص بعد الحل.
      const k = createKhitab({ defaultGender: 'x' as unknown as Gender });
      expect(() => k('save')).toThrow('khitab: invalid gender "x".');
    });
  });

  describe('عزل النسخ (لا تسرّب بين factories)', () => {
    it('factory مختلفة بإعدادات مختلفة لا تتأثر ببعضها', () => {
      const kFemale = createKhitab({ defaultGender: 'female' });
      const kMale = createKhitab({ defaultGender: 'male' });
      expect(kFemale('save')).toBe('احفظي');
      expect(kMale('save')).toBe('احفظ');
      // إعادة الاستدعاء لا تحمل حالة من النداء السابق
      expect(kFemale('save')).toBe('احفظي');
    });
  });
});