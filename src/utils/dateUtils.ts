const formatDatePart = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    return 'Data inválida';
  }
  return formatDatePart(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    return 'Data inválida';
  }
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${formatDatePart(date)} às ${hours}:${minutes}`;
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    return 'Data inválida';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `há ${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'}`;
};
