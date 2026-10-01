// Currency and Date Formatters for Bangladeshi Taka (BDT ৳) and Fintech

export const formatBDT = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '৳0';
  return `৳${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatPercentage = (percent: number | null | undefined): string => {
  if (percent === null || percent === undefined || isNaN(percent)) return '0%';
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
