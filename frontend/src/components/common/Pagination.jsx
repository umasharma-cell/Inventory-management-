import Button from './Button.jsx';

export default function Pagination({ meta, onPageChange }) {
  if (!meta) return null;

  const totalPages = Math.max(meta.total_pages || 0, 1);

  return (
    <div className="pagination">
      <span>
        Page {meta.page} of {totalPages}
      </span>
      <div>
        <Button
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
