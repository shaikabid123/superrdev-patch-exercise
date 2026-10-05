import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusFilter from './components/StatusFilter';
import TaskTable from './components/TaskTable';
import { useTasks } from './hooks/useTasks';

const PAGE_SIZE = 10;

export default function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const {
    tasks,
    total,
    loading,
    error,
  } = useTasks(query, status, page, PAGE_SIZE);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  /*
   * Search and status changes should start from the first page.
   *
   * Without this, a user could be on page 5 and then apply a filter
   * that only has one page of results.
   */
  useEffect(() => {
    setPage(1);
  }, [query, status]);

  /*
   * If the current page becomes invalid because the result count
   * decreased, move back to the last available page.
   */
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Tracker</h1>
        <p className="subtitle">Internal task management</p>
      </header>

      <div className="controls">
        <SearchBar
          value={query}
          onChange={setQuery}
        />

        <StatusFilter
          value={status}
          onChange={setStatus}
        />
      </div>

      <TaskTable
        tasks={tasks}
        loading={loading}
        error={error}
      />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}