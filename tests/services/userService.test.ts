import { getUserMe, updateUserMe } from '../../src/services/userService';
import { User } from '../../src/types/user';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserMe', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      const mockUser: User = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11999999999',
        address: 'Rua Teste, 123',
        profilePicture: 'https://example.com/photo.jpg',
        auth0Id: 'auth0|123',
        birthDate: '1990-01-01',
        gender: 'M',
        role: 'CUSTOMER',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockUser } as any);

      const result = await getUserMe();

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('1');
      expect(result.name).toBe('João Silva');
      expect(result.email).toBe('joao@example.com');
      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('deve retornar usuário com campos opcionais', async () => {
      const mockUser: User = {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@example.com',
      };

      mockApi.get.mockResolvedValue({ data: mockUser } as any);

      const result = await getUserMe();

      expect(result).toEqual(mockUser);
      expect(result.phone).toBeUndefined();
      expect(result.profilePicture).toBeUndefined();
    });

    it('deve retornar usuário com mercado associado', async () => {
      const mockUser: User = {
        id: '3',
        name: 'Admin Mercado',
        email: 'admin@example.com',
        role: 'MARKET_ADMIN',
        marketId: 'm1',
        market: {
          id: 'm1',
          name: 'Supermercado Teste',
          address: 'Endereço do Mercado',
          profilePicture: 'market.jpg',
        },
      };

      mockApi.get.mockResolvedValue({ data: mockUser } as any);

      const result = await getUserMe();

      expect(result.market).toBeDefined();
      expect(result.market?.id).toBe('m1');
      expect(result.market?.name).toBe('Supermercado Teste');
    });

    it('deve lançar erro quando não autenticado', async () => {
      const error = { response: { status: 401 }, message: 'Não autenticado' };
      mockApi.get.mockRejectedValue(error);

      await expect(getUserMe()).rejects.toEqual(error);
      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getUserMe()).rejects.toThrow('Erro de rede');
    });
  });

  describe('updateUserMe', () => {
    it('deve atualizar dados do usuário', async () => {
      const updateData = {
        name: 'João Silva Atualizado',
        phone: '11888888888',
      };

      const mockUpdatedUser: User = {
        id: '1',
        name: 'João Silva Atualizado',
        email: 'joao@example.com',
        phone: '11888888888',
      };

      mockApi.patch.mockResolvedValue({ data: mockUpdatedUser } as any);

      const result = await updateUserMe(updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(result.name).toBe('João Silva Atualizado');
      expect(result.phone).toBe('11888888888');
      expect(mockApi.patch).toHaveBeenCalledWith('/users/me', updateData);
      expect(mockApi.patch).toHaveBeenCalledTimes(1);
    });

    it('deve atualizar apenas nome', async () => {
      const updateData = {
        name: 'Novo Nome',
      };

      const mockUpdatedUser: User = {
        id: '1',
        name: 'Novo Nome',
        email: 'joao@example.com',
      };

      mockApi.patch.mockResolvedValue({ data: mockUpdatedUser } as any);

      const result = await updateUserMe(updateData);

      expect(result.name).toBe('Novo Nome');
    });

    it('deve atualizar apenas email', async () => {
      const updateData = {
        email: 'novoemail@example.com',
      };

      const mockUpdatedUser: User = {
        id: '1',
        name: 'João Silva',
        email: 'novoemail@example.com',
      };

      mockApi.patch.mockResolvedValue({ data: mockUpdatedUser } as any);

      const result = await updateUserMe(updateData);

      expect(result.email).toBe('novoemail@example.com');
    });

    it('deve atualizar foto de perfil', async () => {
      const updateData = {
        profilePicture: 'https://example.com/newphoto.jpg',
      };

      const mockUpdatedUser: User = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        profilePicture: 'https://example.com/newphoto.jpg',
      };

      mockApi.patch.mockResolvedValue({ data: mockUpdatedUser } as any);

      const result = await updateUserMe(updateData);

      expect(result.profilePicture).toBe('https://example.com/newphoto.jpg');
    });

    it('deve atualizar múltiplos campos', async () => {
      const updateData = {
        name: 'João Atualizado',
        phone: '11777777777',
        birthDate: '1995-05-15',
        gender: 'M',
      };

      const mockUpdatedUser: User = {
        id: '1',
        name: 'João Atualizado',
        email: 'joao@example.com',
        phone: '11777777777',
        birthDate: '1995-05-15',
        gender: 'M',
      };

      mockApi.patch.mockResolvedValue({ data: mockUpdatedUser } as any);

      const result = await updateUserMe(updateData);

      expect(result.name).toBe('João Atualizado');
      expect(result.phone).toBe('11777777777');
      expect(result.birthDate).toBe('1995-05-15');
      expect(result.gender).toBe('M');
    });

    it('deve lançar erro quando não autenticado', async () => {
      const updateData = { name: 'Teste' };
      const error = { response: { status: 401 }, message: 'Não autenticado' };
      mockApi.patch.mockRejectedValue(error);

      await expect(updateUserMe(updateData)).rejects.toEqual(error);
    });

    it('deve lançar erro quando dados inválidos', async () => {
      const updateData = { email: 'email-invalido' };
      const error = { response: { status: 400 }, message: 'Email inválido' };
      mockApi.patch.mockRejectedValue(error);

      await expect(updateUserMe(updateData)).rejects.toEqual(error);
    });

    it('deve lançar erro quando API falha', async () => {
      const updateData = { name: 'Teste' };
      const error = new Error('Erro de rede');
      mockApi.patch.mockRejectedValue(error);

      await expect(updateUserMe(updateData)).rejects.toThrow('Erro de rede');
    });
  });
});

