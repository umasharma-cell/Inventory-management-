export default function Button({
  children,
  className = '',
  disabled = false,
  variant = 'primary',
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const componentProps =
    Component === 'button'
      ? { disabled, type }
      : { 'aria-disabled': disabled ? 'true' : undefined };

  return (
    <Component
      className={`btn btn-${variant} ${className}`.trim()}
      {...componentProps}
      {...props}
    >
      {children}
    </Component>
  );
}
