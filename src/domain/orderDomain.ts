export interface Order {
  id: string;
  status: string;
  totalPrice: number;
  userId: string;
  marketId: string;
  delivererId?: string;
  createdAt: string;
  updatedAt: string;
  // adicione outros campos conforme o backend
}

export interface OrderPaginatedResponse {
  orders: Order[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderCreateDTO {
  userId: string;
  marketId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrderUpdateDTO {
  status?: string;
}

export interface AssignDelivererDTO {
  delivererId: string;
}

export interface OrderItemDTO {
  productId: string;
  quantity: number;
}
