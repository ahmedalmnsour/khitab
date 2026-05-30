# سجل التغييرات

جميع التغييرات الملحوظة في مشروع `@khitab/core` تُوثَّق في هذا الملف.

تتبع الصيغة نموذج [Keep a Changelog](https://keepachangelog.com/)، ويلتزم المشروع بـ [الإصدار الدلالي (SemVer)](https://semver.org/lang/ar/).

> ⚠️ المشروع لا يزال في مرحلة **v0.1 (تجريبي)**. قبل الإصدار المستقر `1.0.0`، قد تتضمّن الإصدارات الأدنى تغييرات غير متوافقة مع سابقاتها.

---

## [Unreleased]

### Added
- (لا تغييرات بعد)

---

<!-- التاريخ أدناه تقديري ليوم إعداد التوثيق؛ حدّثه إلى تاريخ إنشاء وسم v0.1.0 الفعلي عند الإصدار. -->
## [0.1.0] - 2026-05-30

### Added
- أول إصدار تجريبي.
- 33 عبارة عربية (32 جندرية، 1 محايدة طبيعياً).
- الواجهة البسيطة عديمة الحالة: `khitab(key, gender)`.
- الواجهة المتقدمة (Factory): `createKhitab(options)` بدعم `defaultGender` و`mode` و`onMissingNeutral`.
- وضعا التشغيل `strict` و`lenient`.
- تعريفات أنواع TypeScript كاملة (ESM + CJS).
- مجموعة اختبارات شاملة مع فحوصات سلامة البيانات، وتكامل مستمر (CI).

[Unreleased]: https://github.com/ahmedalmnsour/khitab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ahmedalmnsour/khitab/releases/tag/v0.1.0
