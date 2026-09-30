import { useState } from 'react'

export const INTENT_LABEL = {
  PERSONAL: 'Personal', EDUCATION: 'Education', MEDICAL: 'Medical', VENTURE: 'Business venture',
  DEBTCONSOLIDATION: 'Debt consolidation', HOMEIMPROVEMENT: 'Home improvement',
}
const HOME = { RENT: 'Rent', MORTGAGE: 'Mortgage', OWN: 'Own', OTHER: 'Other' }

// key, label, min, max, step. Income and loan amount can be any positive rupee amount.
const NUM = [
  ['person_age', 'Age', 18, 100, 1],
  ['person_income', 'Annual income (₹)', 1, Infinity, 10000],
  ['person_emp_length', 'Years in current job', 0, 60, 0.5],
  ['loan_amnt', 'Loan amount (₹)', 1, Infinity, 10000],
  ['loan_int_rate', 'Interest rate (%)', 5, 24, 0.1],
  ['cb_person_cred_hist_length', 'Credit history (years)', 0, 40, 1],
]
const EMPTY = {
  name: '', person_age: '', person_income: '', person_home_ownership: 'RENT', person_emp_length: '',
  loan_intent: 'PERSONAL', loan_amnt: '', loan_int_rate: '', cb_person_default_on_file: 'N',
  cb_person_cred_hist_length: '',
}

export default function ScoreForm({ initial, busy, error, onSubmit }) {
  const [v, setV] = useState(initial || EMPTY)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }))
  const lpi = Number(v.person_income) > 0 ? Number(v.loan_amnt) / Number(v.person_income) : 0

  function submit(e) {
    e.preventDefault()
    if (!v.name.trim()) return setErr('Enter the applicant name.')
    const out = { ...v, name: v.name.trim() }
    for (const [k, label, lo, hi] of NUM) {
      const n = parseFloat(v[k])
      if (v[k] === '' || Number.isNaN(n) || n < lo || n > hi)
        return setErr(hi === Infinity ? `${label}: enter an amount greater than 0.` : `${label}: enter a number from ${lo.toLocaleString()} to ${hi.toLocaleString()}.`)
      out[k] = n
    }
    setErr('')
    onSubmit(out)
  }

  return (
    <form className="panel" onSubmit={submit} noValidate>
      <h3>Applicant details</h3>
      <div className="grid">
        <div className="field wide">
          <label htmlFor="name">Applicant name</label>
          <input id="name" value={v.name} onChange={set('name')} placeholder="Full name" />
        </div>
        {NUM.slice(0, 3).map(([k, l, lo, hi, st]) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{l}</label>
            <input id={k} type="number" inputMode="decimal" min={lo} max={hi === Infinity ? undefined : hi} step={st} value={v[k]} onChange={set(k)} />
          </div>
        ))}
        <div className="field">
          <label htmlFor="home">Home ownership</label>
          <select id="home" value={v.person_home_ownership} onChange={set('person_home_ownership')}>
            {Object.entries(HOME).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="intent">Loan purpose</label>
          <select id="intent" value={v.loan_intent} onChange={set('loan_intent')}>
            {Object.entries(INTENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {NUM.slice(3).map(([k, l, lo, hi, st]) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{l}</label>
            <input id={k} type="number" inputMode="decimal" min={lo} max={hi === Infinity ? undefined : hi} step={st} value={v[k]} onChange={set(k)} />
          </div>
        ))}
        <div className="field">
          <label htmlFor="def">Past default on credit file</label>
          <select id="def" value={v.cb_person_default_on_file} onChange={set('cb_person_default_on_file')}>
            <option value="N">No</option>
            <option value="Y">Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Loan as % of income</label>
          <div className="calc">{(lpi * 100).toFixed(1)}% (calculated)</div>
        </div>
      </div>
      <p className="muted note">Amounts are in rupees and can be any size. The model learned from loans of about ₹11,000 to ₹7.7 lakh, so results outside that range come with a caution.</p>
      {(err || error) && <p className="err">{err || error}</p>}
      <div className="foot">
        <button type="button" className="btn" onClick={() => { setV(EMPTY); setErr('') }}>Clear</button>
        <button type="submit" className="btn dk" disabled={busy}>{busy ? 'Assessing…' : 'Assess applicant'}</button>
      </div>
    </form>
  )
}
