import { cartReducer, initialState, CartItem } from '../../src/contexts/CartContext';

const createMockItem = (id: string, price: number = 10, quantity: number = 1, cartItemId?: string): CartItem => ({
  id,
  name: `Produto ${id}`,
  price,
  image: `img-${id}.jpg`,
  marketName: 'Mercado Teste',
  marketId: 'm1',
  quantity,
  cartItemId,
});

describe('cartReducer', () => {
  describe('ADD_ITEM', () => {
    it('deve adicionar item ao carrinho vazio', () => {
      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto Teste',
          price: 10.50,
          image: 'img.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
        },
      };

      const result = cartReducer(initialState, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('1');
      expect(result.items[0].quantity).toBe(1);
      expect(result.items[0].price).toBe(10.50);
      expect(result.total).toBe(10.50);
      expect(result.itemCount).toBe(1);
    });

    it('deve incrementar quantidade se item já existe', () => {
      const state = {
        items: [createMockItem('1', 10, 1)],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto Teste',
          price: 10,
          image: 'img.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
        },
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(2);
      expect(result.total).toBe(20);
      expect(result.itemCount).toBe(2);
    });

    it('deve preservar cartItemId existente ao incrementar', () => {
      const state = {
        items: [createMockItem('1', 10, 1, 'cart-item-123')],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto Teste',
          price: 10,
          image: 'img.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
        },
      };

      const result = cartReducer(state, action);

      expect(result.items[0].cartItemId).toBe('cart-item-123');
      expect(result.items[0].quantity).toBe(2);
    });

    it('deve usar novo cartItemId se fornecido ao incrementar', () => {
      const state = {
        items: [createMockItem('1', 10, 1, 'cart-item-123')],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto Teste',
          price: 10,
          image: 'img.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
          cartItemId: 'cart-item-456',
        },
      };

      const result = cartReducer(state, action);

      expect(result.items[0].cartItemId).toBe('cart-item-456');
    });

    it('deve calcular total corretamente com múltiplos itens', () => {
      const state = {
        items: [
          createMockItem('1', 10, 2),
          createMockItem('2', 15, 1),
        ],
        total: 35,
        itemCount: 3,
      };

      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto 1',
          price: 10,
          image: 'img1.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
        },
      };

      const result = cartReducer(state, action);

      expect(result.total).toBe(45);
      expect(result.itemCount).toBe(4);
      expect(result.items[0].quantity).toBe(3);
    });

    it('deve normalizar IDs para string ao comparar', () => {
      const state = {
        items: [createMockItem('1', 10, 1)],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: 1 as any,
          name: 'Produto Teste',
          price: 10,
          image: 'img.jpg',
          marketName: 'Mercado Teste',
          marketId: 'm1',
        },
      };

      const result = cartReducer(state, action);

      expect(result.items[0].quantity).toBe(2);
    });
  });

  describe('REMOVE_ITEM', () => {
    it('deve remover item do carrinho', () => {
      const state = {
        items: [
          createMockItem('1', 10, 2),
          createMockItem('2', 15, 1),
        ],
        total: 35,
        itemCount: 3,
      };

      const action = {
        type: 'REMOVE_ITEM' as const,
        payload: '1',
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('2');
      expect(result.total).toBe(15);
      expect(result.itemCount).toBe(1);
    });

    it('deve recalcular total após remoção', () => {
      const state = {
        items: [
          createMockItem('1', 10, 3),
          createMockItem('2', 20, 2),
        ],
        total: 70,
        itemCount: 5,
      };

      const action = {
        type: 'REMOVE_ITEM' as const,
        payload: '2',
      };

      const result = cartReducer(state, action);

      expect(result.total).toBe(30);
      expect(result.itemCount).toBe(3);
    });

    it('deve retornar estado inicial se remover último item', () => {
      const state = {
        items: [createMockItem('1', 10, 1)],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'REMOVE_ITEM' as const,
        payload: '1',
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('deve normalizar ID para string ao remover', () => {
      const state = {
        items: [createMockItem('1', 10, 1)],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'REMOVE_ITEM' as const,
        payload: 1 as any,
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(0);
    });
  });

  describe('UPDATE_QUANTITY', () => {
    it('deve atualizar quantidade do item', () => {
      const state = {
        items: [createMockItem('1', 10, 2)],
        total: 20,
        itemCount: 2,
      };

      const action = {
        type: 'UPDATE_QUANTITY' as const,
        payload: { id: '1', quantity: 5 },
      };

      const result = cartReducer(state, action);

      expect(result.items[0].quantity).toBe(5);
      expect(result.total).toBe(50);
      expect(result.itemCount).toBe(5);
    });

    it('deve remover item se quantidade for 0', () => {
      const state = {
        items: [
          createMockItem('1', 10, 2),
          createMockItem('2', 15, 1),
        ],
        total: 35,
        itemCount: 3,
      };

      const action = {
        type: 'UPDATE_QUANTITY' as const,
        payload: { id: '1', quantity: 0 },
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('2');
      expect(result.total).toBe(15);
      expect(result.itemCount).toBe(1);
    });

    it('deve remover item se quantidade for negativa', () => {
      const state = {
        items: [createMockItem('1', 10, 2)],
        total: 20,
        itemCount: 2,
      };

      const action = {
        type: 'UPDATE_QUANTITY' as const,
        payload: { id: '1', quantity: -1 },
      };

      const result = cartReducer(state, action);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('deve recalcular total corretamente', () => {
      const state = {
        items: [
          createMockItem('1', 10, 2),
          createMockItem('2', 20, 3),
        ],
        total: 80,
        itemCount: 5,
      };

      const action = {
        type: 'UPDATE_QUANTITY' as const,
        payload: { id: '1', quantity: 4 },
      };

      const result = cartReducer(state, action);

      expect(result.total).toBe(100);
      expect(result.itemCount).toBe(7);
    });

    it('deve normalizar ID para string ao atualizar', () => {
      const state = {
        items: [createMockItem('1', 10, 2)],
        total: 20,
        itemCount: 2,
      };

      const action = {
        type: 'UPDATE_QUANTITY' as const,
        payload: { id: 1 as any, quantity: 5 },
      };

      const result = cartReducer(state, action);

      expect(result.items[0].quantity).toBe(5);
    });
  });

  describe('CLEAR_CART', () => {
    it('deve limpar todos os itens do carrinho', () => {
      const state = {
        items: [
          createMockItem('1', 10, 2),
          createMockItem('2', 15, 3),
        ],
        total: 65,
        itemCount: 5,
      };

      const action = {
        type: 'CLEAR_CART' as const,
      };

      const result = cartReducer(state, action);

      expect(result).toEqual(initialState);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('deve retornar estado inicial mesmo com carrinho vazio', () => {
      const action = {
        type: 'CLEAR_CART' as const,
      };

      const result = cartReducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('casos de borda', () => {
    it('deve retornar estado atual para ação desconhecida', () => {
      const state = {
        items: [createMockItem('1', 10, 1)],
        total: 10,
        itemCount: 1,
      };

      const action = {
        type: 'UNKNOWN_ACTION' as any,
      };

      const result = cartReducer(state, action);

      expect(result).toEqual(state);
    });

    it('deve lidar com preços decimais corretamente', () => {
      const action = {
        type: 'ADD_ITEM' as const,
        payload: {
          id: '1',
          name: 'Produto',
          price: 9.99,
          image: 'img.jpg',
          marketName: 'Mercado',
          marketId: 'm1',
        },
      };

      const result = cartReducer(initialState, action);

      expect(result.total).toBe(9.99);
    });

    it('deve lidar com múltiplos itens e calcular corretamente', () => {
      let state = initialState;

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: {
          id: '1',
          name: 'Produto 1',
          price: 10,
          image: 'img1.jpg',
          marketName: 'Mercado',
          marketId: 'm1',
        },
      });

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: {
          id: '2',
          name: 'Produto 2',
          price: 20,
          image: 'img2.jpg',
          marketName: 'Mercado',
          marketId: 'm1',
        },
      });

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: {
          id: '1',
          name: 'Produto 1',
          price: 10,
          image: 'img1.jpg',
          marketName: 'Mercado',
          marketId: 'm1',
        },
      });

      expect(state.items).toHaveLength(2);
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[1].quantity).toBe(1);
      expect(state.total).toBe(40);
      expect(state.itemCount).toBe(3);
    });
  });
});


