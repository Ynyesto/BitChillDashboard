import { useEffect, useState } from 'react'
import './App.css'
import { getAllTvl, type TvlResult } from './lib/tvl'

function App() {
  const [tvlData, setTvlData] = useState<TvlResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalTvl = tvlData.reduce((sum, item) => sum + item.tvlUsd, 0)

  const loadTvl = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await getAllTvl()
      setTvlData(data)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTvl()
  }, [])

  return (
    <>
      <h1>BitChill Dashboard</h1>
      
      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2>Total TVL</h2>
        <div className="value-large">${totalTvl.toFixed(2)}</div>
        <button onClick={loadTvl} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      <div className="dashboard-grid">
        {tvlData.map((item) => (
          <div key={item.handler} className="card">
            <h3>{item.name}</h3>
            <div className="metrics-grid">
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Protocol
                </div>
                <span className={`protocol-badge protocol-${item.protocol}`}>
                  {item.protocol}
                </span>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Total TVL
                </div>
                <div className="value-medium">${item.tvlUsd.toFixed(2)}</div>
              </div>
              {item.interestGenerated !== undefined && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    All-time generated interest
                  </div>
                  <div
                    className="value-medium"
                    style={{ color: item.interestGenerated >= 0 ? '#51cf66' : '#ff6b6b' }}
                  >
                    ${item.interestGenerated.toFixed(2)}
                  </div>
                  {item.protocol === 'tropykus' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {item.interestGenerated > 0
                        ? 'Deposit this amount to match snapshot balance'
                        : 'Snapshot already reflects current balance'}
                    </div>
                  )}
                </div>
              )}
            </div>
            <details>
              <summary>Contract Addresses</summary>
              <div>
                <div><strong>Handler:</strong> {item.handler}</div>
                <div><strong>Stablecoin:</strong> {item.stablecoin}</div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
