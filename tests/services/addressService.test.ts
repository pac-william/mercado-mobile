import {
  getUserAddresses,
  createAddress,
  getAddressById,
  updateAddress,
  updateAddressPartial,
  deleteAddress,
  setAddressFavorite,
  getFavoriteAddress,
  getActiveAddresses,
  searchAddressesByZipCode,
  validateAddress,
  getAddressHistory,
  softDeleteAddress,
  restoreAddress,
} from '../../src/services/addressService';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('addressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAddresses', () => {
    it('deve retornar lista de endereços com paginação', async () => {
      const mockResponse = {
        addresses: [
          {
            id: '1',
            userId: 'u1',
            name: 'Casa',
            street: 'Rua A',
            number: '123',
            complement: null,
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            isFavorite: true,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        favorites: 1,
        active: 1,
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getUserAddresses(1, 10);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses', {
        params: { page: 1, size: 10 },
      });
    });

    it('deve usar valores padrão de paginação', async () => {
      const mockResponse = {
        addresses: [],
        total: 0,
        favorites: 0,
        active: 0,
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await getUserAddresses();

      expect(mockApi.get).toHaveBeenCalledWith('/addresses', {
        params: { page: 1, size: 10 },
      });
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getUserAddresses()).rejects.toThrow('Erro de rede');
    });
  });

  describe('createAddress', () => {
    it('deve criar novo endereço', async () => {
      const addressData = {
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
      };

      const mockResponse = {
        id: '1',
        userId: 'u1',
        ...addressData,
        complement: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await createAddress(addressData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/addresses', addressData);
    });

    it('deve lançar erro quando criação falha', async () => {
      const addressData = {
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
      };

      const error = new Error('Erro ao criar');
      mockApi.post.mockRejectedValue(error);

      await expect(createAddress(addressData)).rejects.toThrow('Erro ao criar');
    });
  });

  describe('getAddressById', () => {
    it('deve retornar endereço por ID', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getAddressById('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses/1');
    });

    it('deve lançar erro quando endereço não existe', async () => {
      const error = new Error('Endereço não encontrado');
      mockApi.get.mockRejectedValue(error);

      await expect(getAddressById('999')).rejects.toThrow('Endereço não encontrado');
    });
  });

  describe('updateAddress', () => {
    it('deve atualizar endereço completo', async () => {
      const addressData = {
        name: 'Casa Atualizada',
        street: 'Rua B',
        number: '456',
        neighborhood: 'Jardim',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        isFavorite: true,
      };

      const mockResponse = {
        id: '1',
        userId: 'u1',
        ...addressData,
        complement: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.put.mockResolvedValue({ data: mockResponse } as any);

      const result = await updateAddress('1', addressData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.put).toHaveBeenCalledWith('/addresses/1', addressData);
    });
  });

  describe('updateAddressPartial', () => {
    it('deve atualizar endereço parcialmente', async () => {
      const partialData = {
        name: 'Casa Nova',
        isFavorite: true,
      };

      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa Nova',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await updateAddressPartial('1', partialData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.patch).toHaveBeenCalledWith('/addresses/1', partialData);
    });
  });

  describe('deleteAddress', () => {
    it('deve deletar endereço', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.delete.mockResolvedValue({ data: mockResponse } as any);

      const result = await deleteAddress('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.delete).toHaveBeenCalledWith('/addresses/1');
    });
  });

  describe('setAddressFavorite', () => {
    it('deve marcar endereço como favorito', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await setAddressFavorite('1', true);

      expect(result).toEqual(mockResponse);
      expect(mockApi.patch).toHaveBeenCalledWith('/addresses/1/favorite', { isFavorite: true });
    });

    it('deve remover favorito do endereço', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await setAddressFavorite('1', false);

      expect(result).toEqual(mockResponse);
      expect(mockApi.patch).toHaveBeenCalledWith('/addresses/1/favorite', { isFavorite: false });
    });
  });

  describe('getFavoriteAddress', () => {
    it('deve retornar endereço favorito', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getFavoriteAddress();

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses/favorite');
    });

    it('deve retornar null quando não há favorito', async () => {
      mockApi.get.mockResolvedValue({ data: null } as any);

      const result = await getFavoriteAddress();

      expect(result).toBeNull();
    });
  });

  describe('getActiveAddresses', () => {
    it('deve retornar apenas endereços ativos', async () => {
      const mockResponse = [
        {
          id: '1',
          userId: 'u1',
          name: 'Casa',
          street: 'Rua A',
          number: '123',
          complement: null,
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          isFavorite: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getActiveAddresses();

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses/active');
    });
  });

  describe('searchAddressesByZipCode', () => {
    it('deve buscar endereços por CEP', async () => {
      const mockResponse = [
        {
          id: '1',
          userId: 'u1',
          name: 'Casa',
          street: 'Rua A',
          number: '123',
          complement: null,
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          isFavorite: false,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await searchAddressesByZipCode('01234-567');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses/search/01234-567');
    });
  });

  describe('validateAddress', () => {
    it('deve validar endereço válido', async () => {
      const addressData = {
        name: 'Endereço',
        street: 'Rua A',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
      };

      const mockResponse = {
        isValid: true,
      };

      mockApi.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await validateAddress(addressData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/addresses/validate', addressData);
    });

    it('deve retornar sugestões para endereço inválido', async () => {
      const addressData = {
        street: 'Rua A',
        number: '123',
      };

      const mockResponse = {
        isValid: false,
        suggestedData: {
          street: 'Rua A',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
      };

      mockApi.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await validateAddress(addressData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAddressHistory', () => {
    it('deve retornar histórico de alterações do endereço', async () => {
      const mockResponse = [
        {
          id: 'h1',
          addressId: '1',
          changes: {
            name: { old: 'Casa', new: 'Casa Nova' },
          },
          changedAt: '2024-01-02T00:00:00Z',
          changedBy: 'u1',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getAddressHistory('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/addresses/1/history');
    });
  });

  describe('softDeleteAddress', () => {
    it('deve desativar endereço', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await softDeleteAddress('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.patch).toHaveBeenCalledWith('/addresses/1/soft-delete');
    });
  });

  describe('restoreAddress', () => {
    it('deve restaurar endereço desativado', async () => {
      const mockResponse = {
        id: '1',
        userId: 'u1',
        name: 'Casa',
        street: 'Rua A',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isFavorite: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await restoreAddress('1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.patch).toHaveBeenCalledWith('/addresses/1/restore');
    });
  });
});

