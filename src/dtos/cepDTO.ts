import { z } from "zod";

export const CEPDTO = z.object({
    zipCode: z.string(),
    street: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    complement: z.string().nullable(),
});

export type CEPDTO = z.infer<typeof CEPDTO>;

export const CEPErrorDTO = z.object({
    error: z.string(),
});

export type CEPErrorDTO = z.infer<typeof CEPErrorDTO>;
