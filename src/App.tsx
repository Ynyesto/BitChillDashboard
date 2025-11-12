import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getAllTvl, type TvlResult } from './lib/tvl'
import {
  getOperationalBalances,
  type OperationalBalancesResult,
} from './lib/balances'
import { ADDRESSES, TOKENS } from './lib/config'

function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatToken(amount: number, decimals = 4): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function App() {
  const [tvlData, setTvlData] = useState<TvlResult[]>([])
  const [operationalBalances, setOperationalBalances] = useState<OperationalBalancesResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalTvl = tvlData.reduce((sum, item) => sum + item.tvlUsd, 0)
  const totalOperationalUsd = useMemo(
    () => operationalBalances?.feeCollectorTotalUsd ?? 0,
    [operationalBalances],
  )

  const loadDashboardData = async () => {
    setError(null)
    try {
      const [tvl, balances] = await Promise.all([
        getAllTvl(),
        getOperationalBalances({
          swapperAddress: ADDRESSES.Swapper,
          feeCollectorAddress: ADDRESSES.FeeCollector,
          docToken: TOKENS.DOC,
          usdrifToken: TOKENS.USDRIF,
          btcOracleAddress: ADDRESSES.BtcOracle,
        }),
      ])
      setTvlData(tvl)
      setOperationalBalances(balances)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(String(error))
      }
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <>
      <h1>BitChill Dashboard</h1>
      
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>TVL</h2>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="value-large">${formatNumber(totalTvl)}</div>
        </div>
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
                  <div className="value-medium">${formatNumber(item.tvlUsd)}</div>
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
                      ${formatNumber(item.interestGenerated)}
                    </div>
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
      </div>

      {operationalBalances && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3>Swapper RBTC Balance</h3>
            <div className="value-medium" style={{ marginTop: '1rem' }}>
              {formatToken(operationalBalances.swapper.balanceRbtc, 6)} RBTC
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              ≈ ${formatNumber(operationalBalances.swapper.balanceUsd)}
            </div>
          </div>
          <div className="card">
            <h3>Fee Collector Balances</h3>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div className="value-medium">
                    {formatToken(operationalBalances.feeCollector.docBalance, 2)} DOC
                  </div>
                </div>
                <div>
                  <div className="value-medium">
                    {formatToken(operationalBalances.feeCollector.usdrifBalance, 2)} USDRIF
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Total Income
                </div>
                <div className="value-medium">
                  ~${formatNumber(totalOperationalUsd)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
