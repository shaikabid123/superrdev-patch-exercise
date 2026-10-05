import { useEffect, useState } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTasks({
          query,
          status,
          page,
          pageSize,
          signal: controller.signal,
        });

        /*
         * Ignore the result if this request was cancelled because
         * a newer request has already started.
         */
        if (!controller.signal.aborted) {
          setTasks(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        /*
         * Abort is expected when the user changes the search/filter
         * before the previous request finishes.
         */
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load tasks.');
          setTasks([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    /*
     * Cancel the previous request when dependencies change or the
     * component is unmounted.
     */
    return () => {
      controller.abort();
    };
  }, [query, status, page, pageSize]);

  return {
    tasks,
    total,
    loading,
    error,
  };
}