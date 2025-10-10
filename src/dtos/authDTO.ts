import { z } from "zod";

export const LoginDTO = z.object({
    email: z.string().email({ message: "Email deve ter um formato válido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

export type LoginDTO = z.infer<typeof LoginDTO>;

export const RegisterDTO = z.object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email deve ter um formato válido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export type RegisterDTO = z.infer<typeof RegisterDTO>;

export const LoginResponseDTO = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
    }),
});

export type LoginResponseDTO = z.infer<typeof LoginResponseDTO>;

