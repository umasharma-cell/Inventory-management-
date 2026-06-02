export default function ErrorBanner({ error }) {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      {error.message || 'Something went wrong'}
    </div>
  );
}
