export default function Button({
  children,
  className = '',
  disabled = false,
  variant = 'primary',
  type = 'button',
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
