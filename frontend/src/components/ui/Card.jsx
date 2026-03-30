export default function Card({ children, className = '', onClick }) {
  const base = 'bg-white rounded-xl shadow-sm border border-gray-100';
  const interactive = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
