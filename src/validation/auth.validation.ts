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
      .min(8)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
    phone: z
      .string()
      .trim()
      .refine(
        (phone) => !phone || phone.length >= 7,
        "Phone number must be at least 7 characters.",
      )
      .max(20)
      .transform((phone) => phone || undefined)
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
