import { z } from "zod";

const minUserNameLength = 3;
const minPasswordLength = 4;
export const loginSchema = z.object({
     userName: z
          .string()
          .trim()
          .min(
               minUserNameLength,
               `نام کاربری باید حداقل ${minUserNameLength} حرف باشد.`,
          ),
     password: z
          .string()
          .min(
               minPasswordLength,
               `رمز عبور باید حداقل ${minPasswordLength}  باشد.`,
          ),
});

export const registerSchema = loginSchema.extend({
     role: z.enum(["Employee", "Manager", "Finance"]),
});
