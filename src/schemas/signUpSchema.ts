import { z } from "zod";


export const usernameValidation = z
            .string()
            .min(2,"Username must be contain atleast 2 character")
            .max(20,"Username must not be more than 20 character")
            .regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character")

            
export const signUpSchema =z.object(
    {
        username : usernameValidation,
        email : z.string().email({message : 'Invalid Email Address'}),
        password : z.string().min(6,{message : 'Password must be atleast 6 characters'}),
    }
)            

