"use client";
const rupees = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0});
export default function GoldRateSection({ rates, live, rateStatus, loading, fetchRates, standalone = false }) {
 const Heading = standalone ? "h1" : "h2";
 return (
    <section className="rate-strip" id="rates">
      <div className="container rate-grid">
        <div className="rate-intro">
          <Heading>{live ? "Today’s Gold Rate" : "Indicative Gold Rate"}</Heading>
          <p>Know the market before you sell.</p>
        </div>
        <div className="rate-values rate-rotation" aria-label="24K and 22K gold rates per gram">
          {[24, 22].map((karat) => (
            <div className="rate-card" key={karat}>
              <span>{karat}K Gold</span>
              <strong id={`rate-${karat}`}>{rupees.format(rates[karat])}</strong>
              <small>per gram</small>
            </div>
          ))}
        </div>
        <div className="rate-meta">
          <span><b>Note:</b> Online rates are indicative. Final purchase value is determined after physical evaluation and verification.</span>
          <span id="rate-status">{rateStatus}</span>
          <button id="refresh-rates" disabled={loading} onClick={() => fetchRates()} className="text-button" type="button">Refresh rates</button>
        </div>
      </div>
    </section>
 );
}
