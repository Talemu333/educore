import { z } from "zod";

export const parentSchema = z.object({

    username: z
    .string()
    .min(4, "Username is required."),

    surname: z
        .string()
        .min(2, "Surname is required."),

    first_name: z
        .string()
        .min(2, "First name is required."),

    middle_name: z
        .string()
        .optional(),

    gender: z
        .string()
        .min(1, "Select gender."),

    relationship_id: z
        .string()
        .min(1, "Relationship is required."),

    phone_number: z
        .string()
        .min(11, "Phone number is required."),

    alternate_phone: z
        .string()
        .optional(),

    email: z
        .string()
        .email("Invalid email.")
        .optional()
        .or(z.literal("")),

    occupation: z
        .string()
        .optional(),

    residential_address: z
        .string()
        .min(5, "Residential address is required."),

    username: z
    .string()
    .min(4, "Username is required."),

    is_primary_contact: z.boolean().default(false)

});