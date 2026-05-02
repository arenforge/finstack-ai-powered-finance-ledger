import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTransactions } from '../services/api';

export function useTransactions(params) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const paramsKey = JSON.stringify(params || {});
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getTransactions(stableParams);
    setTransactions(data);
    setLoading(false);
  }, [stableParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, refresh };
}
