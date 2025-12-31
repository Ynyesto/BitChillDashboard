// Default to localhost:3000 for local development
// For production, set VITE_API_URL in GitHub secrets
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface TvlDataPoint {
  timestamp: number;
  tvl: number;
}

export interface TotalPurchasesResult {
  totalUsd: number;
  totalTransactions: number;
  lastPurchaseTimestamp?: number;
}

export type Granularity = 'day' | 'week' | 'month';

/**
 * Get total purchases statistics
 */
export async function getTotalPurchases(): Promise<TotalPurchasesResult> {
  const response = await fetch(`${API_BASE_URL}/api/total-purchases`);
  if (!response.ok) {
    throw new Error(`Failed to fetch total purchases: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get TVL evolution data
 */
export async function getTvlEvolution(
  granularity: Granularity = 'day',
  startDate?: number,
  endDate?: number,
  currentTvl?: number
): Promise<TvlDataPoint[]> {
  const params = new URLSearchParams({
    granularity,
  });
  if (startDate) {
    params.append('startDate', startDate.toString());
  }
  if (endDate) {
    params.append('endDate', endDate.toString());
  }
  if (currentTvl !== undefined) {
    params.append('currentTvl', currentTvl.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/tvl-evolution?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TVL evolution: ${response.statusText}`);
  }
  return response.json();
}

