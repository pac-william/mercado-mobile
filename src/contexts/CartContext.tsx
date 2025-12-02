import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  marketName: string;
  quantity: number;
  marketId: string;
  cartItemId?: string;
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
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

export const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const CART_STORAGE_KEY = '@cart_items';

const calculateCartTotals = (items: CartItem[]): { total: number; itemCount: number } => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadId = String(action.payload.id);
      const existingItem = state.items.find(item => String(item.id) === payloadId);
      const quantityToAdd = action.payload.initialQuantity || 1;
      
      let updatedItems: CartItem[];
      
      if (existingItem) {
        updatedItems = state.items.map(item =>
          String(item.id) === payloadId
            ? { 
                ...item, 
                quantity: item.quantity + quantityToAdd,
                cartItemId: action.payload.cartItemId || item.cartItemId
              }
            : item
        );
      } else {
        const { initialQuantity, ...itemData } = action.payload;
        const newItem = { ...itemData, quantity: quantityToAdd, id: payloadId };
        updatedItems = [...state.items, newItem];
      }
      
      const { total, itemCount } = calculateCartTotals(updatedItems);
      
      return {
        items: updatedItems,
        total,
        itemCount,
      };
    }
    
    case 'REMOVE_ITEM': {
      const payloadId = String(action.payload);
      const updatedItems = state.items.filter(item => String(item.id) !== payloadId);
      const { total, itemCount } = calculateCartTotals(updatedItems);
      
      return {
        items: updatedItems,
        total,
        itemCount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const payloadId = String(action.payload.id);
      const updatedItems = state.items
        .map(item =>
          String(item.id) === payloadId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0);
      
      const { total, itemCount } = calculateCartTotals(updatedItems);
      
      return {
        items: updatedItems,
        total,
        itemCount,
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART':
      return action.payload;
    
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
  const isInitialLoadRef = useRef(true);

  const saveCartToStorage = useCallback(async (cartState: CartState) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }, []);

  const loadCartFromStorage = useCallback(async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData) as CartState;
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          const { total, itemCount } = calculateCartTotals(parsedCart.items);
          dispatch({
            type: 'LOAD_CART',
            payload: {
              items: parsedCart.items,
              total,
              itemCount,
            },
          });
        }
      }
      isInitialLoadRef.current = false;
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      isInitialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  useEffect(() => {
    if (!isInitialLoadRef.current) {
      saveCartToStorage(state);
    }
  }, [state, saveCartToStorage]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { initialQuantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar carrinho do storage:', error);
    }
  }, []);

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
