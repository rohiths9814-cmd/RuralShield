export default function Badge({ children, variant = 'cyan', className = '' }) {
  const variants = {
    cyan: 'badge-cyan',
    green: 'badge-green',
    red: 'badge-red',
    yellow: 'badge-yellow',
  };

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
