import { z } from "zod";

export const signInSchema = z.object(
    {
        useraname : z.string(),
        password : z.string(),
    }
)