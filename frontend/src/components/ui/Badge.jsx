const styles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SALON: 'bg-pink-100 text-pink-800',
  PETSHOP: 'bg-orange-100 text-orange-800',
  CLINIC: 'bg-teal-100 text-teal-800',
  OTHER: 'bg-gray-100 text-gray-800',
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[value] || 'bg-gray-100 text-gray-800'} ${className}`}
    >
      {labels[value] || value}
    </span>
  );
}
