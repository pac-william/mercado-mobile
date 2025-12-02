import { useState, useCallback, useRef } from 'react';

interface UseLoadingOptions {
  initialValue?: boolean;
  preventConcurrent?: boolean;
}

interface UseLoadingReturn {
  loading: boolean;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T extends (...args: any[]) => Promise<any>>(
    fn: T
  ) => T;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const { initialValue = false, preventConcurrent = true } = options;
  const [loading, setLoadingState] = useState(initialValue);
  const isExecutingRef = useRef(false);

  const setLoading = useCallback((value: boolean) => {
    setLoadingState(value);
  }, []);

  const startLoading = useCallback(() => {
    setLoadingState(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(false);
  }, []);

  const withLoading = useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
      return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (preventConcurrent && isExecutingRef.current) {
          return Promise.reject(new Error('Operation already in progress'));
        }

        try {
          isExecutingRef.current = true;
          setLoadingState(true);
          const result = await fn(...args);
          return result;
        } finally {
          setLoadingState(false);
          isExecutingRef.current = false;
        }
      }) as T;
    },
    [preventConcurrent]
  );

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      if (preventConcurrent && isExecutingRef.current) {
        throw new Error('Operation already in progress');
      }

      try {
        isExecutingRef.current = true;
        setLoadingState(true);
        const result = await asyncFn();
        return result;
      } finally {
        setLoadingState(false);
        isExecutingRef.current = false;
      }
    },
    [preventConcurrent]
  );

  return {
    loading,
    isLoading: loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
    execute,
  };
};

