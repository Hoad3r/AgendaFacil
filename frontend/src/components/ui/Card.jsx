const accentMap = {
  indigo: 'border-l-4 border-indigo-500',
  amber: 'border-l-4 border-amber-500',
  emerald: 'border-l-4 border-emerald-500',
  blue: 'border-l-4 border-blue-500',
};

export default function Card({ children, className = '', onClick, accent }) {
  const base = 'bg-white rounded-xl shadow-sm border border-gray-100';
  const interactive = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  const accentClass = accent ? accentMap[accent] || '' : '';
  return (
    <div className={`${base} ${interactive} ${accentClass} ${className}`} onClick={onClick}>
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
