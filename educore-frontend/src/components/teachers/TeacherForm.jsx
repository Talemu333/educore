import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { teacherSchema } from "@/validators/teacherSchema";

import { Button } from "@/components/ui/Button";

import { useCreateTeacher } from "@/hooks/useCreateTeacher";
import { useUpdateTeacher } from "@/hooks/useUpdateTeacher";

import PersonalInformation from "./PersonalInformation";
import EmploymentInformation from "./EmploymentInformation";
import ContactInformation from "./ContactInformation";
import EmergencyInformation from "./EmergencyInformation";
import AccountInformation from "./AccountInformation";

function TeacherForm({ teacher, onSuccess }) {
    const createTeacherMutation = useCreateTeacher();
    const updateTeacherMutation = useUpdateTeacher();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
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

    useEffect(() => {
        if (teacher) {
            reset({
                ...teacher,
                date_of_birth: teacher.date_of_birth ? teacher.date_of_birth.split("T")[0] : "",
                employment_date: teacher.employment_date ? teacher.employment_date.split("T")[0] : "",
                qualification_id: teacher.qualification_id?.toString() || "",
                department_id: teacher.department_id?.toString() || "",
                state_id: teacher.state_id?.toString() || "",
                nationality_id: teacher.nationality_id?.toString() || ""
            });
        }
    }, [teacher, reset]);

    const onSubmit = values => {
        const payload = {
            ...values,
            qualification_id: Number(values.qualification_id),
            department_id: Number(values.department_id),
            state_id: Number(values.state_id),
            nationality_id: Number(values.nationality_id)
        };

        if (teacher) {
            updateTeacherMutation.mutate(
                { id: teacher.id, data: payload },
                { onSuccess: () => onSuccess?.() }
            );
        } else {
            createTeacherMutation.mutate(
                payload,
                {
                    onSuccess: result => {
                        reset();
                        onSuccess?.(result);
                    }
                }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <PersonalInformation register={register} control={control} errors={errors} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <EmploymentInformation control={control} register={register} errors={errors} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <ContactInformation register={register} errors={errors} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <EmergencyInformation register={register} errors={errors} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <AccountInformation register={register} errors={errors} editing={!!teacher} />
            </div>
            <div className="sticky bottom-0 z-30 -mx-1 border-t border-slate-200 bg-white/95 px-1 pt-4 backdrop-blur sm:pt-5">
                <Button type="submit" className="h-11 w-full rounded-xl text-sm font-bold shadow-sm">
                    {teacher ? "Update Teacher" : "Create Teacher"}
                </Button>
            </div>
        </form>
    );
}

export default TeacherForm;
