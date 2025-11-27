import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useSession } from './useSession';
import { addItemToCart } from '../services/cartService';

interface AddToCartParams {
  productId: string;
  productName: string;
  price: number;
  image: string;
  marketName: string;
  marketId: string;
}

interface UseAddToCartOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useAddToCart = (options: UseAddToCartOptions = {}) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useSession();
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (params: AddToCartParams) => {
    if (isAdding) return;

    try {
      setIsAdding(true);

      if (isAuthenticated) {
        try {
          const cartResponse = await addItemToCart({
            productId: params.productId,
            quantity: 1,
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
          });
        } catch (apiError: any) {
          console.error('Erro ao adicionar item ao carrinho na API:', apiError);
          addItem({
            id: params.productId,
            name: params.productName,
            price: params.price,
            image: params.image,
            marketName: params.marketName,
            marketId: params.marketId,
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
        });
      }

      if (options.onSuccess) {
        options.onSuccess();
      }
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addToCart,
    isAdding,
  };
};

