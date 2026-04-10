export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-2 border-slate-700 absolute`} />
        <div
          className={`${sizes[size]} rounded-full border-2 border-transparent border-t-cyan-400 animate-spin absolute`}
        />
      </div>
    </div>
  );
}
