import { z } from "zod";

export const teacherSchema = z.object({

    surname: z.string().min(1, "Surname is required"),

    first_name: z.string().min(1, "First name is required"),

    middle_name: z.string().optional(),

    username: z.string().min(3, "Username is required"),

    gender: z.string().min(1, "Gender is required"),

    date_of_birth: z.string().min(1, "Date of birth is required"),

    phone_number: z.string().min(1, "Phone number is required"),

    email: z

        .string()

        .email("Invalid email address")

        .optional()

        .or(z.literal("")),

    address: z.string().min(1, "Address is required"),

    marital_status: z.string().min(1, "Marital status is required"),

    qualification_id: z.string().min(1, "Qualification is required"),

    department_id: z.string().min(1, "Department is required"),

    employment_date: z.string().min(1, "Employment date is required"),

    state_id: z.string().min(1, "State is required"),

    nationality_id: z.string().min(1, "Nationality is required"),

    next_of_kin_name: z.string().min(1, "Next of kin name is required"),

    next_of_kin_phone: z.string().min(1, "Next of kin phone is required"),

    emergency_contact_name: z.string().min(1, "Emergency contact name is required"),

    emergency_contact_phone: z.string().min(1, "Emergency contact phone is required")

});