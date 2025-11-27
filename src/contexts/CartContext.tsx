import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  id: string; // productId
  name: string;
  price: number;
  image: string;
  marketName: string;
  quantity: number;
  marketId: string;
  cartItemId?: string; // ID do item no carrinho da API (opcional)
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { initialQuantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

export const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadId = String(action.payload.id);
      const existingItem = state.items.find(item => String(item.id) === payloadId);
      const quantityToAdd = action.payload.initialQuantity || 1;
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          String(item.id) === payloadId
            ? { 
                ...item, 
                quantity: item.quantity + quantityToAdd,
                cartItemId: action.payload.cartItemId || item.cartItemId
              }
            : item
        );
        
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          items: updatedItems,
          total,
          itemCount,
        };
      } else {
        const { initialQuantity, ...itemData } = action.payload;
        const newItem = { ...itemData, quantity: quantityToAdd, id: payloadId };
        const updatedItems = [...state.items, newItem];
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          items: updatedItems,
          total,
          itemCount,
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const payloadId = String(action.payload);
      const updatedItems = state.items.filter(item => String(item.id) !== payloadId);
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: updatedItems,
        total,
        itemCount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const payloadId = String(action.payload.id);
      const updatedItems = state.items.map(item =>
        String(item.id) === payloadId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: updatedItems,
        total,
        itemCount,
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'> & { initialQuantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
