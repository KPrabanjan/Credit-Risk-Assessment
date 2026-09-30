export async function predict(payload) {
  let res
  try {
    res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Cannot reach the scoring API. Start it with: python backend/api.py')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data.errors || ['The scoring API returned an error.']).join(' '))
  return data
}
