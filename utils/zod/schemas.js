import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (value) =>
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
    {
      message:
        "Password must include at least one uppercase letter, one number, and one special character",
    }
  );

export const registerPayloadSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Your username must be at least 2 characters long")
    .max(14, "Your username must be less than 15 characters long"),

  email: z.string().email("Invalid email format"),

  password: passwordSchema,
});

export const loginPayloadSchema = registerPayloadSchema.omit({ email: true });

export const changePasswordSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

const objectIdSchema = z.string().min(1, "Invalid ObjectId");

export const carPayloadSchema = z.object({
  basicInfo: z.object({
    brand: objectIdSchema,
    model: objectIdSchema,
    year: z.number().int().min(1950, "Invalid year"),
    price: z.number().nonnegative("Price must be positive"),
    mileage: z.number().optional(),
    description: z.string().optional(),
  }),

  mechanics: z.object({
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    engine: z
      .object({
        capacityCC: z.number().optional(),
        power: z
          .object({
            hp: z.number().optional(),
            kw: z.number().optional(),
          })
          .optional(),
        cylinders: z.number().optional(),
        turbo: z.boolean().optional(),
      })
      .optional(),
    drivetrain: z.string().optional(),
    emissions: z
      .object({
        co2: z.number().optional(),
        euroStandard: z.string().optional(),
      })
      .optional(),
  }),

  appearance: z.object({
    color: z.string().optional(),
    bodyType: z.string().optional(),
    doors: z.number().optional(),
    seats: z.number().optional(),
    wheels: z
      .object({
        sizeInches: z.number().optional(),
        wheelType: z.string().optional(),
      })
      .optional(),
  }),

  features: z.object({
    airConditioning: z.boolean(),
    navigationSystem: z.boolean(),
    heatedSeats: z.boolean(),
    bluetooth: z.boolean(),
    parkingSensors: z.boolean(),
    cruiseControl: z.boolean(),
    sunroof: z.boolean(),
    airbags: z.number(),
    abs: z.boolean(),
    tractionControl: z.boolean(),
  }),

  ownership: z.object({
    numberOfOwners: z.number().optional(),
    registrationDate: z.string().datetime().optional(),
    inspectionValidUntil: z.string().datetime().optional(),
    warranty: z.boolean().optional(),
  }),

  location: z.object({
    city: z.string(),
    region: z.string(),
  }),

  images: z.array(z.string()).optional(),

  store: objectIdSchema.optional(),
});
