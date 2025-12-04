import { getMarkets, getMarketById } from '../../src/services/marketService';
import { Market, MarketPaginatedResponse } from '../../src/domain/marketDomain';
import { Meta } from '../../src/domain/metaDomain';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('marketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMarkets', () => {
    it('deve retornar mercados sem filtros', async () => {
      const mockMarkets = [
        new Market('1', 'Mercado 1', 'Endereço 1', 'img1.jpg'),
        new Market('2', 'Mercado 2', 'Endereço 2', 'img2.jpg'),
      ];
      const mockMeta = new Meta(1, 20, 2, 1, 2);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getMarkets();

      expect(result).toEqual(mockResponse);
      expect(result.markets).toHaveLength(2);
      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
        },
      });
    });

    it('deve retornar mercados com paginação', async () => {
      const mockMarkets = [new Market('1', 'Mercado 1', 'Endereço 1')];
      const mockMeta = new Meta(2, 10, 15, 2, 15);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getMarkets(2, 10);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 2,
          size: 10,
        },
      });
    });

    it('deve retornar mercados filtrados por nome', async () => {
      const mockMarkets = [new Market('1', 'Supermercado', 'Endereço 1')];
      const mockMeta = new Meta(1, 20, 1, 1, 1);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getMarkets(1, 20, 'Supermercado');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
          name: 'Supermercado',
        },
      });
    });

    it('deve retornar mercados com localização do usuário', async () => {
      const mockMarket = new Market('1', 'Mercado 1', 'Endereço 1');
      mockMarket.latitude = -23.5505;
      mockMarket.longitude = -46.6333;
      mockMarket.distance = 2.5;
      const mockMarkets = [mockMarket];
      const mockMeta = new Meta(1, 20, 1, 1, 1);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getMarkets(1, 20, undefined, -23.5505, -46.6333);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
          userLatitude: -23.5505,
          userLongitude: -46.6333,
        },
      });
    });

    it('deve retornar mercados com todos os filtros', async () => {
      const mockMarkets = [new Market('1', 'Mercado 1', 'Endereço 1')];
      const mockMeta = new Meta(1, 20, 1, 1, 1);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getMarkets(1, 20, 'Mercado', -23.5505, -46.6333);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
          name: 'Mercado',
          userLatitude: -23.5505,
          userLongitude: -46.6333,
        },
      });
    });

    it('não deve incluir coordenadas quando não fornecidas', async () => {
      const mockMarkets = [new Market('1', 'Mercado 1', 'Endereço 1')];
      const mockMeta = new Meta(1, 20, 1, 1, 1);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getMarkets(1, 20, undefined, undefined, undefined);

      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
        },
      });
    });

    it('deve incluir NaN quando fornecido como number', async () => {
      const mockMarkets = [new Market('1', 'Mercado 1', 'Endereço 1')];
      const mockMeta = new Meta(1, 20, 1, 1, 1);
      const mockResponse = new MarketPaginatedResponse(mockMarkets, mockMeta);

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getMarkets(1, 20, undefined, NaN, NaN);

      expect(mockApi.get).toHaveBeenCalledWith('/markets', {
        params: {
          page: 1,
          size: 20,
          userLatitude: NaN,
          userLongitude: NaN,
        },
      });
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getMarkets()).rejects.toThrow('Erro de rede');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMarketById', () => {
    it('deve retornar mercado por ID', async () => {
      const mockMarket = new Market('1', 'Mercado 1', 'Endereço 1', 'img1.jpg', 'banner.jpg', 'owner1', ['manager1'], '2024-01-01', '2024-01-01', -23.5505, -46.6333, 2.5);

      mockApi.get.mockResolvedValue({ data: mockMarket } as any);

      const result = await getMarketById('1');

      expect(result).toEqual(mockMarket);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Mercado 1');
      expect(mockApi.get).toHaveBeenCalledWith('/markets/1');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('deve retornar mercado com campos opcionais', async () => {
      const mockMarket = new Market('2', 'Mercado 2', 'Endereço 2');

      mockApi.get.mockResolvedValue({ data: mockMarket } as any);

      const result = await getMarketById('2');

      expect(result).toEqual(mockMarket);
      expect(result.profilePicture).toBeUndefined();
      expect(result.latitude).toBeUndefined();
    });

    it('deve retornar mercado com distância', async () => {
      const mockMarket = new Market('3', 'Mercado 3', 'Endereço 3');
      mockMarket.latitude = -23.5505;
      mockMarket.longitude = -46.6333;
      mockMarket.distance = 5.2;

      mockApi.get.mockResolvedValue({ data: mockMarket } as any);

      const result = await getMarketById('3');

      expect(result.distance).toBe(5.2);
      expect(result.latitude).toBe(-23.5505);
      expect(result.longitude).toBe(-46.6333);
    });

    it('deve lançar erro quando mercado não existe', async () => {
      const error = new Error('Mercado não encontrado');
      mockApi.get.mockRejectedValue(error);

      await expect(getMarketById('999')).rejects.toThrow('Mercado não encontrado');
      expect(mockApi.get).toHaveBeenCalledWith('/markets/999');
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getMarketById('1')).rejects.toThrow('Erro de rede');
    });
  });
});

