import { getProducts, getProductById, Product } from '../../src/services/productService';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('deve retornar produtos sem filtros', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Produto 1',
            price: 10.50,
            marketId: 'm1',
            image: 'img1.jpg',
            unit: 'un',
          },
          {
            id: '2',
            name: 'Produto 2',
            price: 20.00,
            marketId: 'm1',
            unit: 'kg',
          },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts();

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 20,
          marketId: undefined,
          name: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve retornar produtos com paginação', async () => {
      const mockResponse = {
        products: [],
        total: 0,
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(2, 10);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 2,
          size: 10,
          marketId: undefined,
          name: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve retornar produtos filtrados por mercado', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Produto 1',
            price: 10.50,
            marketId: 'm1',
          },
        ],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(1, 20, 'm1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 20,
          marketId: 'm1',
          name: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve retornar produtos filtrados por nome', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Arroz',
            price: 15.00,
            marketId: 'm1',
          },
        ],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(1, 20, undefined, 'Arroz');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 20,
          marketId: undefined,
          name: 'Arroz',
          minPrice: undefined,
          maxPrice: undefined,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve retornar produtos filtrados por preço', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Produto 1',
            price: 15.00,
            marketId: 'm1',
          },
        ],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(1, 20, undefined, undefined, 10, 20);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 20,
          marketId: undefined,
          name: undefined,
          minPrice: 10,
          maxPrice: 20,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve retornar produtos filtrados por categoria única', async () => {
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Produto 1',
            price: 10.00,
            marketId: 'm1',
          },
        ],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(1, 20, undefined, undefined, undefined, undefined, 'cat1');

      expect(result).toEqual(mockResponse);
    });

    it('deve retornar produtos filtrados por múltiplas categorias', async () => {
      const mockResponse = {
        products: [],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProducts(1, 20, undefined, undefined, undefined, undefined, ['cat1', 'cat2']);

      expect(result).toEqual(mockResponse);
    });

    it('deve normalizar categoryIds vazios', async () => {
      const mockResponse = {
        products: [],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getProducts(1, 20, undefined, undefined, undefined, undefined, []);

      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 20,
          marketId: undefined,
          name: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          categoryId: undefined,
        },
        paramsSerializer: expect.any(Object),
      });
    });

    it('deve filtrar categoryIds falsy', async () => {
      const mockResponse = {
        products: [],
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getProducts(1, 20, undefined, undefined, undefined, undefined, ['cat1', '', null as any, 'cat2']);

      expect(mockApi.get).toHaveBeenCalled();
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getProducts()).rejects.toThrow('Erro de rede');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductById', () => {
    it('deve retornar produto por ID', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Produto 1',
        price: 10.50,
        marketId: 'm1',
        image: 'img1.jpg',
        unit: 'un',
      };

      mockApi.get.mockResolvedValue({ data: mockProduct } as any);

      const result = await getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(mockApi.get).toHaveBeenCalledWith('/products/1');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('deve retornar produto sem imagem e unidade', async () => {
      const mockProduct: Product = {
        id: '2',
        name: 'Produto 2',
        price: 20.00,
        marketId: 'm1',
      };

      mockApi.get.mockResolvedValue({ data: mockProduct } as any);

      const result = await getProductById('2');

      expect(result).toEqual(mockProduct);
      expect(result.image).toBeUndefined();
      expect(result.unit).toBeUndefined();
    });

    it('deve lançar erro quando produto não existe', async () => {
      const error = new Error('Produto não encontrado');
      mockApi.get.mockRejectedValue(error);

      await expect(getProductById('999')).rejects.toThrow('Produto não encontrado');
      expect(mockApi.get).toHaveBeenCalledWith('/products/999');
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getProductById('1')).rejects.toThrow('Erro de rede');
    });
  });
});

