# Changelog

## [Unreleased]

### Added
### Added
- أول إصدار (alpha، غير منشور على npm بعد).
- 1367 عبارة عربية (780 جندرية، 587 محايدة طبيعياً)، موزّعة على نواة عامّة (`ar.json`) وعشر فئات: تجارة، توصيل، مالية، تعليم، حكومة، صحة، تواصل، توظيف، سفر، ألعاب.
- تُدمَج الفئات في قاموس مسطّح واحد عند التحميل؛ المفاتيح فريدة عالمياً ويفرض ذلك فحص السلامة.
- الواجهة البسيطة عديمة الحالة: `khitab(key, gender)`.
- الواجهة المتقدمة (Factory): `createKhitab(options)` بدعم `defaultGender` و`mode` و`onMissingNeutral`.
- وضعا التشغيل `strict` و`lenient`.
- تعريفات أنواع TypeScript كاملة (ESM + CJS).
- مجموعة اختبارات شاملة مع فحوصات سلامة البيانات، وتكامل مستمر (CI).

<!-- سيُضاف روابط المقارنة عند أول إصدار حقيقي على npm -->
[Unreleased]: https://github.com/ahmedalmnsour/khitab/compare/main...HEAD