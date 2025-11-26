import { User } from "../types/user";
import { UserUpdateDTO } from "../dtos/userDTO";
import api from "./api";

export const getUserMe = async (): Promise<User> => {
    try {
        const response = await api.get<User>("/users/me");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar usuário atual:", error);
        throw error;
    }
};

export const updateUserMe = async (updateData: UserUpdateDTO): Promise<User> => {
    try {
        const response = await api.patch<User>("/users/me", updateData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw error;
    }
};