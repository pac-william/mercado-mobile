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
  onError?: (error: any) => void;
}

export const useAddToCart = (options: UseAddToCartOptions = {}) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useSession();
  const { loading: isAdding, execute } = useLoading();

  const addToCart = async (params: AddToCartParams) => {
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
          } catch (apiError: any) {
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
      } catch (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }
    });
  };

  return {
    addToCart,
    isAdding,
  };
};

