import { z } from "zod";

export const MarketDTO = z.object({
    name: z.string({ error: "Nome do mercado é obrigatório" }),
    address: z.string({ error: "Endereço do mercado é obrigatório" }),
    logo: z.string({ error: "Logo do mercado é obrigatório" }),
});

export type MarketDTO = z.infer<typeof MarketDTO>;

export const MarketUpdateDTO = MarketDTO.partial();
export type MarketUpdateDTO = z.infer<typeof MarketUpdateDTO>;