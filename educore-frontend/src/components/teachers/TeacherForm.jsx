import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { teacherSchema } from "@/validators/teacherSchema";

import { Button } from "@/components/ui/button";

import { useCreateTeacher } from "@/hooks/useCreateTeacher";
import { useUpdateTeacher } from "@/hooks/useUpdateTeacher";

import PersonalInformation from "./PersonalInformation";
import EmploymentInformation from "./EmploymentInformation";
import ContactInformation from "./ContactInformation";
import EmergencyInformation from "./EmergencyInformation";
import AccountInformation from "./AccountInformation";

function TeacherForm({

    teacher,

    onSuccess

}) {

    const createTeacherMutation = useCreateTeacher();

    const updateTeacherMutation = useUpdateTeacher();

    const {

        register,

        handleSubmit,

        control,

        reset,

        formState: {

            errors

        }

    } = useForm({

        resolver: zodResolver(teacherSchema),

        defaultValues: teacher ?? {

            surname: "",

            first_name: "",

            middle_name: "",

            gender: "",

            date_of_birth: "",

            phone_number: "",

            email: "",

            address: "",

            marital_status: "",

            qualification_id: "",

            department_id: "",

            employment_date: "",

            state_id: "",

            nationality_id: "",

            next_of_kin_name: "",

            next_of_kin_phone: "",

            emergency_contact_name: "",

            emergency_contact_phone: "",

            username: ""

        }

    });

    // console.log("Teacher:", teacher);
    // console.log("Errors:", errors);

    useEffect(() => {

        if (teacher) {

            reset({

                ...teacher,

                date_of_birth:
                    teacher.date_of_birth
                        ? teacher.date_of_birth.split("T")[0]
                        : "",

                employment_date:
                    teacher.employment_date
                        ? teacher.employment_date.split("T")[0]
                        : "",

                qualification_id:
                    teacher.qualification_id?.toString() || "",

                department_id:
                    teacher.department_id?.toString() || "",

                state_id:
                    teacher.state_id?.toString() || "",

                nationality_id:
                    teacher.nationality_id?.toString() || ""

            });

        }

    }, [

        teacher,

        reset

    ]);

    const onSubmit = (values) => {

        // console.log("onSubmit fired!");
        // console.log(values);

        const payload = {

            ...values,

            qualification_id: Number(values.qualification_id),

            department_id: Number(values.department_id),

            state_id: Number(values.state_id),

            nationality_id: Number(values.nationality_id)

        };

        if (teacher) {

            updateTeacherMutation.mutate(

                {

                    id: teacher.id,

                    data: payload

                },

                {

                    onSuccess: () => {

                        onSuccess?.();

                    }

                }

            );

        }

        else {

            createTeacherMutation.mutate(

                payload,

                {

                    onSuccess: () => {

                        reset();

                        onSuccess?.();

                    }

                }

            );

        }

    };

    return (

        <form

            onSubmit={handleSubmit(onSubmit)}

            className="space-y-8"

        >

            <PersonalInformation

                register={register}

                control={control}

                errors={errors}

            />

            <EmploymentInformation

                control={control}

                register={register}

                errors={errors}

            />

            <ContactInformation

                register={register}

                errors={errors}

            />

            <EmergencyInformation

                register={register}

                errors={errors}

            />

            <AccountInformation

                register={register}

                errors={errors}

                editing={!!teacher}

            />

            <Button

                type="submit"

                className="w-full"

            >

                {

                    teacher

                        ? "Update Teacher"

                        : "Create Teacher"

                }

            </Button>

        </form>

    );

}

export default TeacherForm;