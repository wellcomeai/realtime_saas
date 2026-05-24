const techs = [
  'FastAPI',
  'SQLAlchemy',
  'Next.js 14',
  'PostgreSQL',
  'Redis',
  'JWT',
  'Alembic',
  'Docker',
  'TypeScript',
  'Tailwind CSS',
];

export function LogoStrip() {
  // Duplicate array for seamless marquee
  const items = [...techs, ...techs];

  return (
    <div style={{ background: '#f5f5f7', padding: '20px 0', overflow: 'hidden', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '8px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          Построен на проверенных технологиях
        </span>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          className="animate-marquee"
          style={{
            display: 'flex',
            gap: '0',
            width: 'max-content',
          }}
        >
          {items.map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#8e8e93',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0 32px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '32px',
                whiteSpace: 'nowrap',
              }}
            >
              {tech}
              <span style={{ color: '#d1d1d6' }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
