import type { CustomMD3Colors } from "../types/theme";

export const getOrderStatusColor = (status: string, colors: CustomMD3Colors): string => {
  switch (status?.toUpperCase()) {
    case 'PENDENTE':
    case 'PENDING':
      return colors.statusPending;
    case 'CONFIRMADO':
    case 'CONFIRMED':
      return colors.statusConfirmed;
    case 'PREPARANDO':
    case 'PREPARING':
      return colors.statusPreparing;
    case 'SAIU_PARA_ENTREGA':
    case 'OUT_FOR_DELIVERY':
      return colors.statusOutForDelivery;
    case 'ENTREGUE':
    case 'DELIVERED':
      return colors.statusDelivered;
    case 'CANCELADO':
    case 'CANCELLED':
      return colors.statusCancelled;
    default:
      return colors.statusDefault;
  }
};

export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDENTE': 'Pendente',
    'PENDING': 'Pendente',
    'CONFIRMADO': 'Confirmado',
    'CONFIRMED': 'Confirmado',
    'PREPARANDO': 'Preparando',
    'PREPARING': 'Preparando',
    'SAIU_PARA_ENTREGA': 'Saiu para entrega',
    'OUT_FOR_DELIVERY': 'Saiu para entrega',
    'ENTREGUE': 'Entregue',
    'DELIVERED': 'Entregue',
    'CANCELADO': 'Cancelado',
    'CANCELLED': 'Cancelado',
  };
  return statusMap[status?.toUpperCase()] || status || 'Pendente';
};

