import { z } from "zod";

export const MarketDTO = z.object({
    name: z.string().min(1, { message: "Nome do mercado é obrigatório" }),
    address: z.string().min(1, { message: "Endereço do mercado é obrigatório" }),
    logo: z.string().min(1, { message: "Logo do mercado é obrigatório" }),
});

export type MarketDTO = z.infer<typeof MarketDTO>;

export const MarketUpdateDTO = MarketDTO.partial();
export type MarketUpdateDTO = z.infer<typeof MarketUpdateDTO>;