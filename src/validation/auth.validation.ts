import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Enter your password."),
});

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password Must Minimum 8 Characters Long.")
      .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
      .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
      .regex(/[0-9]/, "Password must contain atleast 1 Number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain atleast 1 Special Character",
      ),
    confirmPassword: z.string(),
    phone: z
      .string()
      .trim()
      .refine((val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
        message: "Please provide valid Bangladeshi number",
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
