import { useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useSession } from './useSession';
import { useLoading } from './useLoading';
import { addItemToCart } from '../services/cartService';

interface AddToCartParams {
  productId: string;
  productName: string;
  price: number;
  image: string;
  marketName: string;
  marketId: string;
  quantity?: number;
}

interface UseAddToCartOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useAddToCart = (options: UseAddToCartOptions = {}) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useSession();
  const { loading: isAdding, execute } = useLoading();

  const addToCart = useCallback(async (params: AddToCartParams) => {
    if (isAdding) return;

    return execute(async () => {
      const quantity = params.quantity || 1;

      try {
        if (isAuthenticated) {
          try {
            const cartResponse = await addItemToCart({
              productId: params.productId,
              quantity: quantity,
            });

            const addedItem = cartResponse.items.find(
              (item) => item.productId === params.productId
            );

            addItem({
              id: params.productId,
              name: params.productName,
              price: params.price,
              image: params.image,
              marketName: params.marketName,
              marketId: params.marketId,
              cartItemId: addedItem?.id,
              initialQuantity: quantity,
            });
          } catch (apiError: unknown) {
            console.error('Erro ao adicionar item ao carrinho na API:', apiError);
            addItem({
              id: params.productId,
              name: params.productName,
              price: params.price,
              image: params.image,
              marketName: params.marketName,
              marketId: params.marketId,
              initialQuantity: quantity,
            });

            if (options.onError) {
              options.onError(apiError);
            }
            return;
          }
        } else {
          addItem({
            id: params.productId,
            name: params.productName,
            price: params.price,
            image: params.image,
            marketName: params.marketName,
            marketId: params.marketId,
            initialQuantity: quantity,
          });
        }

        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (error: unknown) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }
    });
  }, [addItem, isAuthenticated, isAdding, execute, options.onSuccess, options.onError]);

  return {
    addToCart,
    isAdding,
  };
};

