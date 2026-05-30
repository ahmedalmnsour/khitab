import { useState, type FormEvent } from 'react';
import { khitab } from '../../../src/khitab';
import './styles.css';

type Gender = 'male' | 'female';

const REPO = 'https://github.com/ahmedalmnsour/khitab';
const SUGGEST_URL = `${REPO}/issues/new?template=add-phrase.md`;

export function App() {
  const [gender, setGender] = useState<Gender>('male');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // الواجهة البسيطة الموصى بها: نمرّر الجنس مع كل مفتاح.
  const t = (key: string) => khitab(key, gender);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>khitab · خِطاب</h1>
        <p className="tagline">صيغ المخاطبة العربية للواجهات | عرض حيّ</p>
        <span className="badge">⚠️ Experimental v0.1</span>
      </header>

      <section className="switch" aria-label="اختيار الجنس">
        <span>خاطبني بصفتي:</span>
        <button type="button" className={gender === 'male' ? 'on' : ''} onClick={() => setGender('male')}>ذكر</button>
        <button type="button" className={gender === 'female' ? 'on' : ''} onClick={() => setGender('female')}>أنثى</button>
      </section>

      {!submitted ? (
        <form className="card" onSubmit={handleSubmit}>
          <h2>{t('register')}</h2>
          <label className="field">
            <span>{t('enterEmail')}</span>
            <input type="email" required dir="ltr" value={email}
                   onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </label>
          <button className="primary" type="submit">{t('register')}</button>
          <p className="muted">{t('areYouSure')} — {t('wantContinue')}</p>
        </form>
      ) : (
        <div className="card success">
          <h2>{t('welcomeBack')}</h2>
          <p>{t('registered')}</p>
          <button className="primary" type="button" onClick={() => setSubmitted(false)}>{t('logout')}</button>
        </div>
      )}

      <section className="card neutral">
        <h3>عبارة محايدة طبيعياً</h3>
        <p>لا تتغيّر مع الجنس لأنها من النوع المحايد:
          <strong> «{khitab('tryLater', gender)}»</strong></p>
      </section>

      <footer className="foot">
        <a className="suggest" href={SUGGEST_URL} target="_blank" rel="noreferrer">✍️ اقتراح عبارة جديدة</a>
        <a href={REPO} target="_blank" rel="noreferrer">المستودع على GitHub</a>
      </footer>
    </div>
  );
}