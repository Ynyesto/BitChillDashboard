import { useState, useEffect } from 'react';
import { getTotalPurchases, type TotalPurchasesResult } from '../lib/api';
import { formatNumber } from '../lib/utils';

export function TotalPurchasesCard() {
  const [data, setData] = useState<TotalPurchasesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const purchases = await getTotalPurchases();
      setData(purchases);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3>Total rBTC Purchases</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>Total rBTC Purchases</h3>
        <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
        <button onClick={loadData} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const lastPurchaseDate = data.lastPurchaseTimestamp
    ? new Date(data.lastPurchaseTimestamp * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <div className="card">
      <h3>Total rBTC Purchases</h3>
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Total Spent (USD)
          </div>
          <div className="value-large" style={{ color: '#4ecdc4' }}>
            ${formatNumber(data.totalUsd)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Transactions
            </div>
            <div className="value-medium">
              {data.totalTransactions.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Last Purchase
            </div>
            <div className="value-medium" style={{ fontSize: '0.875rem' }}>
              {lastPurchaseDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

