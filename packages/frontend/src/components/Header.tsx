const MARQUEE_ITEMS = [
  "AI JOB SCRAPER",
  "MULTI-PLATFORM",
  "REAL-TIME DATA",
  "CV MATCHING",
  "REMOTE JOBS",
  "COVER LETTER AI",
  "INSTANT ANALYSIS",
  "INFOJOBS · LINKEDIN · INDEED",
];

function MarqueeContent() {
  // Render twice so the loop is seamless
  return (
    <>
      {[0, 1].map((i) => (
        <span key={i} className="marquee-item">
          {MARQUEE_ITEMS.map((item, j) => (
            <span key={j}>
              {item}
              <span className="dot"> ●</span>
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="header-navbar">
        {/* Logo */}
        <div className="logo">
          <div className="logo-mark">JF</div>
          <h1>JobFy</h1>
        </div>

        {/* Status */}
        <div className="header-status">
          <span className="status-dot" />
          <span>System Online</span>
          <span style={{ color: "var(--border-mid)" }}>●</span>
          <span>v2.0</span>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="header-marquee">
        <div className="marquee-inner">
          <div className="marquee-track">
            <MarqueeContent />
          </div>
        </div>
      </div>
    </header>
  );
}
