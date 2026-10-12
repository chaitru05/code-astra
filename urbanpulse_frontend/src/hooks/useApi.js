import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic hook for fetching data with loading/error states.
 * @param {Function} fetcher - async function that returns data
 * @param {Array} deps - dependency array
 * @param {Object} options - { immediate, onError }
 */
export function useApi(fetcher, deps = [], options = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(...args);
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute().catch(() => {});
    }
    return () => {
      mountedRef.current = false;
    };
  }, [execute, immediate]);

  const retry = useCallback(() => {
    return execute().catch(() => {});
  }, [execute]);

  return { data, loading, error, retry, execute };
}
