import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getTvlEvolution, type TvlDataPoint, type Granularity } from '../lib/api';
import { formatNumber } from '../lib/utils';

interface TvlEvolutionGraphProps {
  granularity?: Granularity;
  currentTvl?: number; // Current TVL from blockchain (for normalization)
}

export function TvlEvolutionGraph({ granularity: initialGranularity = 'day', currentTvl }: TvlEvolutionGraphProps) {
  const [granularity, setGranularity] = useState<Granularity>(initialGranularity);
  const [data, setData] = useState<TvlDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [granularity, currentTvl]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tvlData = await getTvlEvolution(granularity, undefined, undefined, currentTvl);
      setData(tvlData);
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

  // Format data for chart
  const chartData = data.map((point) => ({
    date: new Date(point.timestamp * 1000).toLocaleDateString(),
    timestamp: point.timestamp,
    tvl: point.tvl,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '8px',
          }}
        >
          <p style={{ margin: 0, marginBottom: '4px', fontWeight: 'bold' }}>
            {payload[0].payload.date}
          </p>
          <p style={{ margin: 0, color: 'var(--text-primary)' }}>
            TVL: ${formatNumber(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading TVL evolution data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
        <button onClick={loadData} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No TVL data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>TVL Evolution</h3>
        <select
          value={granularity}
          onChange={(e) => {
            setGranularity(e.target.value as Granularity);
          }}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={(value) => `$${formatNumber(value)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="tvl"
            stroke="#4ecdc4"
            strokeWidth={2}
            dot={false}
            name="TVL (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

