import { CEPDTO } from "../dtos/cepDTO";

export const searchAddressByCEP = async (zipCode: string): Promise<CEPDTO> => {
    try {
        const cleanZipCode = zipCode.replace(/\D/g, '');

        if (cleanZipCode.length !== 8) {
            throw new Error("CEP deve ter 8 dígitos");
        }

        const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);

        if (!response.ok) {
            throw new Error("Erro ao consultar CEP");
        }

        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado");
        }

        return {
            zipCode: data.cep,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            complement: data.complemento || null,
        };
    } catch (error: unknown) {
        console.error("Erro ao buscar CEP:", error);
        throw error;
    }
};

export const formatCEP = (cep: string): string => {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length === 8) {
        return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
    }

    return cleanCEP;
};

export const validateCEP = (cep: string): boolean => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
};

