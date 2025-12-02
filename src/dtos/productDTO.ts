import { z } from "zod";

export const ProductDTO = z.object({
    name: z.string().min(1, { message: "Nome do produto é obrigatório" }),
    price: z.number().positive({ message: "Preço deve ser maior que zero" }),
    marketId: z.string().min(1, { message: "ID do mercado é obrigatório" }),
    image: z.string().optional(),
});

export type ProductDTO = z.infer<typeof ProductDTO>;

export const ProductUpdateDTO = ProductDTO.partial();
export type ProductUpdateDTO = z.infer<typeof ProductUpdateDTO>; 