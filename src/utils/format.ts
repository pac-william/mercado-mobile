import { MarketOperatingHoursResponse } from '../services/marketService';

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) {
    return 'R$ 0,00';
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const formatOrderDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  return dateObj.toLocaleDateString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCardNumber = (text: string): string => {
  const cleaned = text.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ').substring(0, 19);
};

export const formatExpiryDate = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

export const formatPhone = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned.length > 0 ? `(${cleaned}` : '';
  }
  
  if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const formatOpeningHours = (openingHours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }> | undefined): string => {
  if (!openingHours || openingHours.length === 0) {
    return 'Horário não disponível';
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Agrupa dias consecutivos com o mesmo horário
  const grouped: Array<{ days: string; time: string }> = [];
  let currentGroup: { days: string[]; time: string } | null = null;

  openingHours.forEach((hour, index) => {
    const dayName = days[hour.dayOfWeek];
    const time = hour.isClosed ? 'Fechado' : `${hour.openTime} - ${hour.closeTime}`;

    if (!currentGroup || currentGroup.time !== time) {
      if (currentGroup) {
        grouped.push({
          days: currentGroup.days.length > 1 
            ? `${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`
            : currentGroup.days[0],
          time: currentGroup.time,
        });
      }
      currentGroup = { days: [dayName], time };
    } else {
      currentGroup.days.push(dayName);
    }

    // Se for o último item, adiciona o grupo atual
    if (index === openingHours.length - 1 && currentGroup) {
      grouped.push({
        days: currentGroup.days.length > 1 
          ? `${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`
          : currentGroup.days[0],
        time: currentGroup.time,
      });
    }
  });

  return grouped.map(g => `${g.days}: ${g.time}`).join(' | ');
};

export const calculateMarketStatus = (
  openingHours: MarketOperatingHoursResponse | null
): { isOpen: boolean; statusText: string } => {
  if (!openingHours) {
    return { isOpen: false, statusText: 'Status não disponível' };
  }

  if (openingHours.is24Hours) {
    return { isOpen: true, statusText: 'Aberto 24 horas' };
  }

  if (openingHours.isOpen !== undefined) {
    return {
      isOpen: openingHours.isOpen,
      statusText: openingHours.isOpen ? 'Aberto agora' : 'Fechado',
    };
  }

  // Se não tiver isOpen na resposta, calcula baseado no horário atual
  if (!openingHours.hours || openingHours.hours.length === 0) {
    return { isOpen: false, statusText: 'Horário não disponível' };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm

  // Busca horários para o dia atual (não feriados)
  const todayHours = openingHours.hours.filter(
    (hour) => hour.dayOfWeek === currentDay && !hour.isHoliday
  );

  if (todayHours.length === 0) {
    return { isOpen: false, statusText: 'Fechado hoje' };
  }

  // Primeiro, verifica se algum horário tem isOpen explícito
  const hasOpenHour = todayHours.some((hour) => {
    // Se o horário tem isOpen definido, usa esse valor
    if ('isOpen' in hour && hour.isOpen !== undefined) {
      return hour.isOpen === true;
    }
    return false;
  });

  if (hasOpenHour) {
    return { isOpen: true, statusText: 'Aberto agora' };
  }

  // Se não tiver isOpen, calcula baseado no horário atual
  const isCurrentlyOpen = todayHours.some((hour) => {
    if (hour.isClosed) return false;
    if (!hour.openTime || !hour.closeTime) return false;

    const openTime = hour.openTime;
    const closeTime = hour.closeTime;

    // Se o horário de fechamento é menor que o de abertura, significa que fecha no dia seguinte
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  });

  return {
    isOpen: isCurrentlyOpen,
    statusText: isCurrentlyOpen ? 'Aberto agora' : 'Fechado',
  };
};