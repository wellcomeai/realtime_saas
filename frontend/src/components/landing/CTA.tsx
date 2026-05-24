import Link from "next/link";
import { Github, BookOpen } from "lucide-react";

export function CTA() {
  return (
    <section
      style={{
        background: 'white',
        padding: '120px 0',
      }}
    >
      <div
        style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}
      >
        <h2
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
            color: '#171717',
            marginBottom: '16px',
          }}
        >
          Начни прямо сейчас
        </h2>

        <p
          style={{
            fontSize: '18px',
            color: '#616161',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          Открытый исходный код. MIT лицензия. Без ограничений.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-primary-new">
            <Github size={18} />
            Клонировать на GitHub
          </Link>
          <Link href="/docs" className="btn-secondary-new">
            <BookOpen size={16} />
            Читать документацию
          </Link>
        </div>

        <p style={{ fontSize: '13px', color: '#8e8e93' }}>
          Бесплатно навсегда · Без регистрации · Без кредитной карты
        </p>
      </div>
    </section>
  );
}
