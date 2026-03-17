import React from 'react';
import PublicNav from './components/PublicNav';
import SiteFooter from './components/SiteFooter';

export default function PolicyPage({ title, intro, effectiveDate, sections }) {
  return (
    <div className="landing-page page-shell">
      <PublicNav />
      <main className="page-content">
        <section className="page-hero page-hero-tight">
          <span className="support-pill">Policy</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="policy-date">Effective date: {effectiveDate}</div>
        </section>

        <section className="policy-grid">
          {sections.map((section) => (
            <article className="policy-card" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
