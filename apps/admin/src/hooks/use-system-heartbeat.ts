import { useState, useEffect, useCallback } from 'react';
import { systemMonitoringService } from '../services/system-monitoring';

export function useSystemHeartbeat() {
  const [data, setData] = useState<{status: string, timestamp: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHeartbeat = useCallback(async () => {
    try {
      const status = await systemMonitoringService.checkGatewayHeartbeat();
      setData({
        ...status,
        timestamp: new Date().toLocaleTimeString()
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeartbeat();
    const interval = setInterval(fetchHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [fetchHeartbeat]);

  return {
    heartbeat: data,
    isLoading,
    isError: !!error,
    lastUpdated: data?.timestamp || null,
    refresh: fetchHeartbeat
  };
}
