import { z } from "zod";

export const UserDTO = z.object({
    name: z.string({ message: "Nome do usuário é obrigatório" }),
    email: z.string().email({ message: "Email deve ter um formato válido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
});

export type UserDTO = z.infer<typeof UserDTO>;

export const UserUpdateDTO = UserDTO.partial();
export type UserUpdateDTO = z.infer<typeof UserUpdateDTO>;