import { z } from "zod";

export const verifySchema = z.object(
    {
        code : z.string().length(6,'Verifiication code must contain 6 digits')
    }
)