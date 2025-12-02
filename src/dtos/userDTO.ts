import { z } from "zod";

export const UserDTO = z.object({
    name: z.string().min(1, { message: "Nome do usuário é obrigatório" }),
    email: z.string().email({ message: "Email deve ter um formato válido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
    phone: z.string().refine((val) => {
      if (!val || val === '') return true;
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 10 || cleaned.length === 11;
    }, { message: "Telefone deve ter 10 ou 11 dígitos" }).optional().or(z.literal('')),
    birthDate: z.string().optional(),
    profilePicture: z.string().optional(),
});

export type UserDTO = z.infer<typeof UserDTO>;

export const UserUpdateDTO = UserDTO.partial();
export type UserUpdateDTO = z.infer<typeof UserUpdateDTO>;