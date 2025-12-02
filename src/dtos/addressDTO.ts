import { z } from "zod";

export const AddressDTO = z.object({
    name: z.string().min(1, { message: "Nome do endereço é obrigatório" }),
    street: z.string().min(3, { message: "Rua deve ter pelo menos 3 caracteres" }),
    number: z.string().min(1, { message: "Número é obrigatório" }),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, { message: "Bairro deve ter pelo menos 2 caracteres" }),
    city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }),
    state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, { message: "CEP deve ter formato válido (00000-000)" }),
    isFavorite: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type AddressDTO = z.infer<typeof AddressDTO>;

export const AddressCreateDTO = z.object({
    name: z.string().min(1, { message: "Nome do endereço é obrigatório" }),
    street: z.string().min(3, { message: "Rua deve ter pelo menos 3 caracteres" }),
    number: z.string().min(1, { message: "Número é obrigatório" }),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, { message: "Bairro deve ter pelo menos 2 caracteres" }),
    city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }),
    state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, { message: "CEP deve ter formato válido (00000-000)" }),
    isFavorite: z.boolean().default(false),
});

export type AddressCreateDTO = z.infer<typeof AddressCreateDTO>;

export const AddressUpdateDTO = z.object({
    name: z.string().min(1, { message: "Nome do endereço é obrigatório" }).optional(),
    street: z.string().min(3, { message: "Rua deve ter pelo menos 3 caracteres" }).optional(),
    number: z.string().min(1, { message: "Número é obrigatório" }).optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, { message: "Bairro deve ter pelo menos 2 caracteres" }).optional(),
    city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }).optional(),
    state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }).optional(),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, { message: "CEP deve ter formato válido (00000-000)" }).optional(),
    isFavorite: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type AddressUpdateDTO = z.infer<typeof AddressUpdateDTO>;

export const AddressResponseDTO = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    isFavorite: z.boolean(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AddressResponseDTO = z.infer<typeof AddressResponseDTO>;

interface AddressInput {
    id: string | number;
    userId: string | number;
    name: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isFavorite: boolean;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export const toAddressResponseDTO = (address: AddressInput): AddressResponseDTO => ({
    id: String(address.id),
    userId: String(address.userId),
    name: address.name,
    street: address.street,
    number: address.number,
    complement: address.complement ?? null,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    isFavorite: address.isFavorite,
    isActive: address.isActive,
    createdAt: address.createdAt instanceof Date ? address.createdAt.toISOString() : String(address.createdAt),
    updatedAt: address.updatedAt instanceof Date ? address.updatedAt.toISOString() : String(address.updatedAt),
});

export const AddressListResponseDTO = z.object({
    addresses: z.array(AddressResponseDTO),
    total: z.number(),
    favorites: z.number(),
    active: z.number(),
});

export type AddressListResponseDTO = z.infer<typeof AddressListResponseDTO>;

export const toAddressListResponseDTO = (addresses: AddressInput[], total: number, favorites: number, active: number): AddressListResponseDTO => ({
    addresses: addresses.map(toAddressResponseDTO),
    total,
    favorites,
    active,
});

export const AddressFavoriteDTO = z.object({
    isFavorite: z.boolean(),
});

export type AddressFavoriteDTO = z.infer<typeof AddressFavoriteDTO>;

