export default function TaskTable({ tasks, loading, error }) {
  if (loading) {
    return (
      <div
        className="state-message"
        role="status"
        aria-live="polite"
      >
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="state-message error"
        role="alert"
      >
        Error: {error}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="state-message">
        No tasks found.
      </div>
    );
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Title</th>
          <th scope="col">Status</th>
          <th scope="col">Priority</th>
          <th scope="col">Assignee</th>
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.id}</td>

            <td>
              <div className="task-title">
                {task.title}
              </div>

              <div className="task-desc">
                {task.description || '—'}
              </div>
            </td>

            <td>
              <span
                className={`status-badge ${task.status.toLowerCase()}`}
              >
                {task.status}
              </span>
            </td>

            <td>
              {task.priority || '—'}
            </td>

            <td>
              {task.assignee || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}