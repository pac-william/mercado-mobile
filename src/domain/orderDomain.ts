export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: string;
  total?: number;
  totalPrice?: number;
  userId: string;
  marketId: string;
  delivererId?: string | null;
  couponId?: string | null;
  addressId?: string;
  paymentMethod?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
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
