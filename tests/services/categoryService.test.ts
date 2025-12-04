import { getCategories, getCategoryById, getProductsByCategory } from '../../src/services/categoryService';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('deve retornar categorias com paginação', async () => {
      const mockResponse = {
        category: [
          {
            id: '1',
            name: 'Frutas',
            slug: 'frutas',
            description: 'Frutas frescas',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Verduras',
            slug: 'verduras',
            description: 'Verduras frescas',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        meta: {
          page: 1,
          size: 20,
          total: 2,
          totalPages: 1,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getCategories();

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/categories', {
        params: { page: 1, size: 20 },
      });
    });

    it('deve usar parâmetros de paginação customizados', async () => {
      const mockResponse = {
        category: [],
        meta: {
          page: 2,
          size: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getCategories(2, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/categories', {
        params: { page: 2, size: 10 },
      });
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getCategories()).rejects.toThrow('Erro de rede');
    });
  });

  describe('getCategoryById', () => {
    it('deve retornar categoria por ID', async () => {
      const mockResponse = {
        id: '1',
        name: 'Frutas',
        slug: 'frutas',
        description: 'Frutas frescas',
        subCategories: [
          {
            id: '1-1',
            name: 'Frutas Cítricas',
            slug: 'frutas-citricas',
            description: 'Limão, laranja, etc',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getCategoryById('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/categories/1');
    });

    it('deve retornar categoria sem subcategorias', async () => {
      const mockResponse = {
        id: '1',
        name: 'Frutas',
        slug: 'frutas',
        description: 'Frutas frescas',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getCategoryById('1');

      expect(result).toEqual(mockResponse);
      expect(result.subCategories).toBeUndefined();
    });

    it('deve lançar erro quando categoria não existe', async () => {
      const error = new Error('Categoria não encontrada');
      mockApi.get.mockRejectedValue(error);

      await expect(getCategoryById('999')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('getProductsByCategory', () => {
    it('deve retornar produtos da categoria', async () => {
      const categoryId = '1';
      const mockResponse = {
        products: [
          {
            id: 'p1',
            name: 'Maçã',
            price: 5.50,
            marketId: 'm1',
            image: 'img1.jpg',
            unit: 'kg',
          },
          {
            id: 'p2',
            name: 'Banana',
            price: 4.00,
            marketId: 'm1',
            image: 'img2.jpg',
            unit: 'kg',
          },
        ],
        meta: {
          page: 1,
          size: 20,
          total: 2,
          totalPages: 1,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProductsByCategory(categoryId);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: { page: 1, size: 20, categoryId },
      });
    });

    it('deve usar parâmetros de paginação customizados', async () => {
      const categoryId = '1';
      const mockResponse = {
        products: [],
        meta: {
          page: 2,
          size: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getProductsByCategory(categoryId, 2, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: { page: 2, size: 10, categoryId },
      });
    });

    it('deve retornar array vazio quando categoria não tem produtos', async () => {
      const categoryId = '1';
      const mockResponse = {
        products: [],
        meta: {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getProductsByCategory(categoryId);

      expect(result.products).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('deve lançar erro quando API falha', async () => {
      const categoryId = '1';
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getProductsByCategory(categoryId)).rejects.toThrow('Erro de rede');
    });
  });
});

