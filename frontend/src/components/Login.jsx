import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || pw.length < 6) {
      setErr('Enter a valid email and a password of at least 6 characters.')
      return
    }
    onLogin(email.trim())
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="logo"><i>L</i>Ledgerline</div>
        <div>
          <h1>Sign in</h1>
          <p className="muted">Assess loan applicants and review past decisions.</p>
        </div>
        <div className="field">
          <label htmlFor="em">Email</label>
          <input id="em" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <small className="muted">Demo sign-in: any email and a password of 6+ characters. It is not real authentication.</small>
        </div>
        {err && <p className="err">{err}</p>}
        <button className="btn dk" type="submit">Sign in</button>
      </form>
    </div>
  )
}
