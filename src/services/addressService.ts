import api from "./api";
import { AddressCreateDTO, AddressUpdateDTO, AddressResponseDTO, AddressListResponseDTO, AddressFavoriteDTO } from "../dtos/addressDTO";

export interface Address {
    id: string;
    userId: string;
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isFavorite: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getUserAddresses = async (
    page: number = 1,
    size: number = 10
): Promise<AddressListResponseDTO> => {
    try {
        const response = await api.get<AddressListResponseDTO>("/addresses", {
            params: { page, size },
        });
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar endereços:", error);
        throw error;
    }
};

export const createAddress = async (addressData: AddressCreateDTO): Promise<AddressResponseDTO> => {
    try {
        const response = await api.post<AddressResponseDTO>("/addresses", addressData);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao criar endereço:", error);
        throw error;
    }
};

export const getAddressById = async (id: string): Promise<AddressResponseDTO> => {
    try {
        const response = await api.get<AddressResponseDTO>(`/addresses/${id}`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar endereço:", error);
        throw error;
    }
};

export const updateAddress = async (id: string, addressData: AddressCreateDTO): Promise<AddressResponseDTO> => {
    try {
        const response = await api.put<AddressResponseDTO>(`/addresses/${id}`, addressData);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao atualizar endereço:", error);
        throw error;
    }
};

export const updateAddressPartial = async (id: string, addressData: AddressUpdateDTO): Promise<AddressResponseDTO> => {
    try {
        const response = await api.patch<AddressResponseDTO>(`/addresses/${id}`, addressData);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao atualizar endereço parcialmente:", error);
        throw error;
    }
};

export const deleteAddress = async (id: string): Promise<AddressResponseDTO> => {
    try {
        const response = await api.delete<AddressResponseDTO>(`/addresses/${id}`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao deletar endereço:", error);
        throw error;
    }
};

export const setAddressFavorite = async (id: string, isFavorite: boolean): Promise<AddressResponseDTO> => {
    try {
        const favoriteData: AddressFavoriteDTO = { isFavorite };
        const response = await api.patch<AddressResponseDTO>(`/addresses/${id}/favorite`, favoriteData);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao definir endereço como favorito:", error);
        throw error;
    }
};

export const getFavoriteAddress = async (): Promise<AddressResponseDTO | null> => {
    try {
        const response = await api.get<AddressResponseDTO | null>("/addresses/favorite");
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar endereço favorito:", error);
        throw error;
    }
};

export const getActiveAddresses = async (): Promise<AddressResponseDTO[]> => {
    try {
        const response = await api.get<AddressResponseDTO[]>("/addresses/active");
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar endereços ativos:", error);
        throw error;
    }
};

export const searchAddressesByZipCode = async (zipCode: string): Promise<AddressResponseDTO[]> => {
    try {
        const response = await api.get<AddressResponseDTO[]>(`/addresses/search/${zipCode}`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar endereços por CEP:", error);
        throw error;
    }
};

interface AddressSuggestion {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

interface ValidateAddressResponse {
    isValid: boolean;
    suggestedData?: AddressSuggestion;
}

export const validateAddress = async (addressData: Partial<AddressCreateDTO>): Promise<ValidateAddressResponse> => {
    try {
        const response = await api.post<ValidateAddressResponse>("/addresses/validate", addressData);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao validar endereço:", error);
        throw error;
    }
};

interface AddressHistoryEntry {
    id: string;
    addressId: string;
    changes: Record<string, { old: unknown; new: unknown }>;
    changedAt: string;
    changedBy?: string;
}

export const getAddressHistory = async (id: string): Promise<AddressHistoryEntry[]> => {
    try {
        const response = await api.get<AddressHistoryEntry[]>(`/addresses/${id}/history`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar histórico do endereço:", error);
        throw error;
    }
};

export const softDeleteAddress = async (id: string): Promise<AddressResponseDTO> => {
    try {
        const response = await api.patch<AddressResponseDTO>(`/addresses/${id}/soft-delete`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao desativar endereço:", error);
        throw error;
    }
};

export const restoreAddress = async (id: string): Promise<AddressResponseDTO> => {
    try {
        const response = await api.patch<AddressResponseDTO>(`/addresses/${id}/restore`);
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao restaurar endereço:", error);
        throw error;
    }
};

