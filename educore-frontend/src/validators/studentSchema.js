import { z } from "zod";

export const studentSchema = z.object({

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

    date_of_birth: z.string(),

    admission_date: z
        .string()
        .min(1, "Admission date is required."),

    residential_address: z
        .string()
        .min(5, "Residential address is required."),

    session_id: z.string().min(1, "Academic session is required"),

    class_id: z.string(),

    arm_id: z.string(),

    state_id: z.string(),

    nationality_id: z.string(),

    blood_group: z
        .string()
        .optional(),

    genotype: z
        .string()
        .optional()

});