import { ArrowUp, ArrowUpRight, Check } from 'lucide-react'

const methodologyRows = [
  {
    title: 'Predefined calculation methodology',
    text: 'A defined screening method turns project parameters into a consistent three-stage assessment indicator.',
  },
  {
    title: 'Research foundation',
    text: 'Built on the “Anergie Leicht Gemacht” research project and its approach to making local energy potential actionable.',
  },
  {
    title: 'Predefined project scenarios',
    text: 'Scenario-based testing supports methodology checks, usability and practical screening applicability.',
  },
  {
    title: 'Flexible output',
    text: 'Results can be communicated through a PDF, online view or another output document without losing the reasoning.',
  },
]

export function Closing() {
  return (
    <>
      <section className="methodology-section" id="methodology" data-chapter aria-labelledby="methodology-title">
        <div className="methodology-section__inner">
          <div className="methodology-heading" data-reveal>
            <p className="section-kicker">Methodology &amp; credibility</p>
            <h2 className="section-title" id="methodology-title">Built to be checked.<br /><em>Not just believed.</em></h2>
            <p className="section-body">
              The experience is designed around methodological correctness, usability, clarity of results
              and practical screening applicability—not visual certainty alone.
            </p>
          </div>

          <div className="methodology-ledger" data-reveal>
            {methodologyRows.map((row) => (
              <article key={row.title}>
                <Check size={20} strokeWidth={1.6} aria-hidden="true" />
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>

          <div className="screening-boundary" data-reveal>
            <span>Explicit boundary</span>
            <p>Fast initial screening <strong>—not a full feasibility study.</strong></p>
          </div>
        </div>
      </section>

      <section className="get-started-section" id="get-started" data-chapter aria-labelledby="get-started-title">
        <div className="get-started-section__inner" data-reveal>
          <p className="section-kicker">Your project area is the starting point</p>
          <h2 id="get-started-title">Make the first<br /><em>move count.</em></h2>
          <p>Start with a Quick Check. Turn a promising direction into a viable business model.</p>
          <div className="get-started-actions">
            <a className="primary-action" href="#quick-inputs">Get Started<ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" /></a>
            <a className="text-link" href="#business-use-cases">Explore Business Models<ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#overview" aria-label="5GDHC Operating System — back to top">5GDHC <span>OS</span></a>
        <p><i aria-hidden="true" />Open source</p>
        <nav aria-label="Footer navigation">
          <a href="#quick-inputs">Quick Check</a>
          <a href="#business-use-cases">Business Models</a>
          <a href="#methodology">Methodology</a>
        </nav>
        <a className="back-to-top" href="#overview">Back to top<ArrowUp size={15} strokeWidth={1.6} aria-hidden="true" /></a>
      </footer>
    </>
  )
}
