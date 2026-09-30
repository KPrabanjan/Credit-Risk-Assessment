import { useState } from 'react'
import { LABEL, inr } from './ResultCard.jsx'

function exportCsv(items) {
  const head = ['id', 'date', 'name', 'age', 'income', 'home', 'emp_years', 'purpose', 'loan', 'rate', 'default_on_file', 'hist_years', 'default_probability', 'decision']
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`
  const rows = items.map((h) => {
    const i = h.inputs
    return [h.id, new Date(h.t).toISOString(), h.name, i.person_age, i.person_income, i.person_home_ownership, i.person_emp_length, i.loan_intent, i.loan_amnt, i.loan_int_rate, i.cb_person_default_on_file, i.cb_person_cred_hist_length, h.result.bad_probability.toFixed(4), h.result.decision].map(q).join(',')
  })
  const url = URL.createObjectURL(new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'assessments.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function History({ items, onView, onClear }) {
  const [q, setQ] = useState('')
  const n = (d) => items.filter((h) => h.result.decision === d).length
  const shown = items.filter((h) => !q || h.name.toLowerCase().includes(q.toLowerCase()) || h.id.toLowerCase().includes(q.toLowerCase()))
  return (
    <section>
      <h2>History</h2>
      <p className="sub">Every assessment made in this browser.</p>
      <div className="stats">
        {[['Assessments', items.length], ['Approved', n('APPROVED')], ['Manual review', n('REVIEW')], ['Declined', n('DECLINED')]].map(([l, c]) => (
          <div className="stat" key={l}><small className="muted">{l}</small><b>{c}</b></div>
        ))}
      </div>
      <div className="row">
        <input aria-label="Search history" placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div>
          <button className="btn" disabled={!items.length} onClick={() => exportCsv(items)}>Export CSV</button>{' '}
          <button className="btn" disabled={!items.length} onClick={() => window.confirm('Delete all saved assessments?') && onClear()}>Clear history</button>
        </div>
      </div>
      <div className="tw">
        <table>
          <thead><tr><th>Date</th><th>Applicant</th><th>Income</th><th>Loan</th><th>Default probability</th><th>Decision</th><th /></tr></thead>
          <tbody>
            {shown.length ? shown.map((h) => (
              <tr key={h.id}>
                <td>{new Date(h.t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<small>{new Date(h.t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small></td>
                <td>{h.name}<small>#{h.id}</small></td>
                <td>{inr(h.inputs.person_income)}</td>
                <td>{inr(h.inputs.loan_amnt)}</td>
                <td>{(h.result.bad_probability * 100).toFixed(1)}%</td>
                <td><span className={`tag ${h.result.decision}`}>{LABEL[h.result.decision]}</span></td>
                <td><button className="lk" onClick={() => onView(h)}>View</button></td>
              </tr>
            )) : <tr><td colSpan="7" className="muted">{items.length ? 'No matches.' : 'No assessments yet. Run one from New assessment.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
