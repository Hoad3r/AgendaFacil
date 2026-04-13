const styles = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-rose-100 text-rose-700',
  SALON: 'bg-pink-100 text-pink-700',
  PETSHOP: 'bg-orange-100 text-orange-700',
  CLINIC: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

const labels = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  SALON: 'Salão',
  PETSHOP: 'Pet Shop',
  CLINIC: 'Clínica',
  OTHER: 'Outro',
};

export default function Badge({ value, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[value] || 'bg-slate-100 text-slate-600'} ${className}`}
    >
      {labels[value] || value}
    </span>
  );
}
