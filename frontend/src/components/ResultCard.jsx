export const LABEL = { APPROVED: 'Approved', REVIEW: 'Manual review', DECLINED: 'Declined' }
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')

export default function ResultCard({ rec }) {
  if (!rec) {
    return (
      <div className="panel res" aria-live="polite">
        <h3>Result</h3>
        <p className="muted">Fill in the details and select Assess applicant to see the decision.</p>
      </div>
    )
  }
  const r = rec.result
  const approve = r.good_probability * 100
  const t = r.thresholds
  const color = { APPROVED: 'var(--lo)', REVIEW: 'var(--me)', DECLINED: 'var(--hi)' }[r.decision]
  const CIRC = Math.PI * 90
  const ang = Math.PI * (1 - approve / 100) // 0 (full right) .. PI (full left)
  const nx = 100 + 76 * Math.cos(ang)
  const ny = 100 - 76 * Math.sin(ang)

  return (
    <div className="panel res" aria-live="polite">
      <h3>Result for {rec.name}</h3>
      <div className="dec">
        <h4>Approval probability</h4>
        <span className={`tag ${r.decision}`}>{LABEL[r.decision]}</span>
      </div>
      <div className="gauge-wrap" role="img" aria-label={`Approval probability ${approve.toFixed(0)} percent, ${LABEL[r.decision]}`}>
        <svg viewBox="0 0 200 112" className="gauge">
          <path d="M10,100 A90,90 0 0 1 190,100" className="gauge-bg" />
          <path
            d="M10,100 A90,90 0 0 1 190,100"
            className="gauge-fill"
            style={{ stroke: color, strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - approve / 100) }}
          />
          <line x1="100" y1="100" x2={nx} y2={ny} className="gauge-needle" />
          <circle cx="100" cy="100" r="6" className="gauge-hub" />
        </svg>
        <div className="gauge-center">
          <div className="big">{approve.toFixed(1)}%</div>
        </div>
        <div className="gauge-scale"><span>0%</span><span>100%</span></div>
      </div>
      {r.extrapolated && (
        <div className="caution" role="note">
          <b>Use with caution</b>
          {r.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      )}
      <div className="kv"><span>Probability of default</span><b>{(r.bad_probability * 100).toFixed(1)}%</b></div>
      <div className="kv"><span>Loan requested</span><b>{inr(rec.inputs.loan_amnt)}</b></div>
      <div className="kv"><span>Loan as % of income</span><b>{(r.loan_percent_income * 100).toFixed(1)}%</b></div>
      <p className="sect">Key factors</p>
      {r.factors.map((f, i) => (
        <div className="dr" key={i}>
          <span>{f.text}</span>
          <b className={f.type === 'risk' ? 'up' : 'dn'}>{f.type === 'risk' ? 'Raises risk' : 'Lowers risk'}</b>
        </div>
      ))}
      <p className="muted note">
        Approved below {t.approve_below * 100}% default probability, manual review up to {t.decline_from * 100}%, declined above that.
      </p>
    </div>
  )
}
