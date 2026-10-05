export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      className="search-input"
      placeholder="Search tasks..."
      aria-label="Search tasks"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}