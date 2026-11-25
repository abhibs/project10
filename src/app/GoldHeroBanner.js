import Image from "next/image";

export function HeroBenefitIcon({type}) {
  const paths = {
    diamond: <><path d="M4 16 12 5h24l8 11-20 27L4 16Z"/><path d="M4 16h40M12 5l6 11 6 27 6-27 6-11"/></>,
    shield: <><path d="M24 4 40 10v12c0 11-7 18-16 22C15 40 8 33 8 22V10L24 4Z"/><path d="m16 24 5 5 11-12"/></>,
    chart: <><path d="M5 41h38M10 35V26h7v9M21 35V19h7v16M32 35V12h7v23M10 20l11-8 8 5L41 5M35 5h6v6"/></>,
    payment: <><circle cx="24" cy="24" r="19"/><path d="M16 15h17M16 21h17M18 15c11 0 11 10 0 10l13 11"/></>,
    coins: <><ellipse cx="17" cy="13" rx="10" ry="4"/><path d="M7 13v8c0 2 4 4 10 4 2 0 4 0 6-1M7 20c1 2 5 4 10 4"/><ellipse cx="31" cy="25" rx="10" ry="4"/><path d="M21 25v12c0 2 4 4 10 4s10-2 10-4V25M21 31c0 2 4 4 10 4s10-2 10-4"/></>,
    support: <><circle cx="24" cy="15" r="6"/><path d="M12 37v-3c0-6 5-10 12-10s12 4 12 10v3H12Z"/><circle cx="9" cy="20" r="4"/><path d="M8 27c-4 0-6 3-6 8v2h7M39 27c4 0 7 3 7 8v2h-7"/><circle cx="39" cy="20" r="4"/></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function GoldHeroBanner({
  children, valuationHref, branchesHref, animateCopy = false,
  copy, portrait,
}) {
  return (
    <section className="hero section-shell" id="hero" aria-labelledby="hero-title">
      <div className="hero-gold-flow" aria-hidden="true">
        <Image className="hero-gold-pile" src="/hero-gold-cutout.webp" alt="Gold jewellery for valuation" width={600} height={400} sizes="40vw" />
        <div className="hero-gold-right">
          <Image src="/buy-gold-jewellery.webp" alt="Gold necklace and matching jewellery" width={1254} height={1254} sizes="(max-width: 1200px) 440px, 42vw" />
        </div>
      </div>
      <div className="container hero-grid">
        {copy ?? <div className={animateCopy ? "hero-copy reveal" : "hero-copy"}>
          <div className="eyebrow">Gold buyers in Bangalore &amp; Chennai</div>
          <h1 id="hero-title">Your Gold Deserves<br /><span>Its True Value.</span></h1>
          <p className="hero-lead">Sell your gold with confidence at Aryan Gold Buyers. Get your gold evaluated in front of you using advanced, non-destructive testing technology — without scratching, cutting or damaging your ornaments.</p>

          {(valuationHref || branchesHref) && (
            <div className="hero-actions">
              {valuationHref && <a className="btn btn-gold btn-lg" href={valuationHref}>Get Free Gold Valuation <span aria-hidden="true">→</span></a>}
              {branchesHref && <a className="btn btn-outline btn-lg" href={branchesHref}><span aria-hidden="true">⌖</span> Find Nearest Branch</a>}
            </div>
          )}

          <div className="trust-row" aria-label="Our service benefits">
            <div><HeroBenefitIcon type="diamond" /><span>Non-Destructive<br />Testing</span></div>
            <div><HeroBenefitIcon type="shield" /><span>Transparent<br />Evaluation</span></div>
            <div><HeroBenefitIcon type="chart" /><span>Competitive<br />Gold Rate</span></div>
            <div><HeroBenefitIcon type="payment" /><span>Quick<br />Payment</span></div>
          </div>
        </div>}

        <div className="hero-siddhi">
          <svg className="hero-mandala" viewBox="0 0 600 600" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
            <defs>
              <g id="hero-mandala-petal">
                <path d="M300 272C258 236 260 182 300 144C340 182 342 236 300 272Z" />
                <path d="M300 154C246 112 267 56 300 24C333 56 354 112 300 154Z" />
                <path d="M300 147C275 112 281 76 300 50C319 76 325 112 300 147Z" />
                <path d="M288 48L300 9L312 48" />
                <circle cx="300" cy="126" r="5" />
              </g>
            </defs>
            <g strokeWidth="1.3">
              {Array.from({ length: 24 }, (_, index) => <use key={index} href="#hero-mandala-petal" transform={`rotate(${index * 15} 300 300)`} />)}
              <circle cx="300" cy="300" r="58" />
              <circle cx="300" cy="300" r="150" />
              <circle cx="300" cy="300" r="158" />
              <circle cx="300" cy="300" r="270" />
              <circle cx="300" cy="300" r="280" strokeDasharray="2 7" />
            </g>
          </svg>
          {portrait ?? <Image src="/siddhi-banner.png" alt="Siddhi welcoming you to Aryan Gold" width={1087} height={1446} sizes="(max-width: 1200px) 80vw, 32vw" preload />}
        </div>

        {children}
      </div>
    </section>
  );
}
