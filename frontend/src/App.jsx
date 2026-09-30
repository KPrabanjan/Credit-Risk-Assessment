import { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import ScoreForm from './components/ScoreForm.jsx'
import ResultCard from './components/ResultCard.jsx'
import History from './components/History.jsx'
import { predict } from './api.js'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }

export default function App() {
  const [user, setUser] = useState(() => load('cr_user', null))
  const [view, setView] = useState('new')
  const [history, setHistory] = useState(() => load('cr_history_v4', []))
  const [current, setCurrent] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => save('cr_history_v4', history.slice(0, 300)), [history])

  if (!user) return <Login onLogin={(e) => { save('cr_user', e); setUser(e) }} />

  async function score(inputs) {
    setBusy(true)
    setError('')
    try {
      const { name, ...features } = inputs
      const result = await predict(features)
      const rec = { id: 'LR-' + String(Date.now()).slice(-6), t: Date.now(), name, inputs, result }
      setHistory((h) => [rec, ...h])
      setCurrent(rec)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function signOut() { localStorage.removeItem('cr_user'); setUser(null) }
  function view_(h) { setCurrent(h); setView('new') }

  return (
    <div className="app">
      <aside>
        <div className="logo"><i>L</i>Ledgerline</div>
        <button className={view === 'new' ? 'on' : ''} onClick={() => setView('new')}>New assessment</button>
        <button className={view === 'history' ? 'on' : ''} onClick={() => setView('history')}>History</button>
        <div className="sp" />
        <div className="me">{user}</div>
        <button onClick={signOut}>Sign out</button>
      </aside>
      <main className="wrap">
        {view === 'new' ? (
          <section>
            <h2>New assessment</h2>
            <p className="sub">Enter the applicant's details. The model returns a decision and the probability of default.</p>
            <div className="split">
              <ScoreForm key={current ? current.id : 'blank'} initial={current ? { name: current.name, ...current.inputs } : null} busy={busy} error={error} onSubmit={score} />
              <ResultCard rec={current} />
            </div>
          </section>
        ) : (
          <History items={history} onView={view_} onClear={() => setHistory([])} />
        )}
      </main>
    </div>
  )
}
