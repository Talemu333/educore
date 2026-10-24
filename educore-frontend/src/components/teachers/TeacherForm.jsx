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
            username: "",
            profile_image_url: "",
            nin: "",
            degree_certificate_url: "",
            other_certificates_url: "",
            birth_certificate_url: ""
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
                nationality_id: teacher.nationality_id?.toString() || "",
                nin: teacher.nin || "",
                degree_certificate_url: teacher.degree_certificate_url || "",
                other_certificates_url: teacher.other_certificates_url || "",
                birth_certificate_url: teacher.birth_certificate_url || ""
            });
        }
    }, [teacher, reset]);

    const onSubmit = values => {
        const payload = {
            ...values,
            qualification_id: Number(values.qualification_id),
            department_id: Number(values.department_id),
            state_id: Number(values.state_id),
            nationality_id: Number(values.nationality_id),
            nin: values.nin?.trim() || null,
            degree_certificate_url: values.degree_certificate_url?.trim() || null,
            other_certificates_url: values.other_certificates_url?.trim() || null,
            birth_certificate_url: values.birth_certificate_url?.trim() || null
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
                <div className="mt-4">
                    <label htmlFor="profile_image_url" className="mb-1.5 block text-sm font-medium text-slate-700">Profile picture URL (Cloudinary, optional)</label>
                    <input id="profile_image_url" type="url" placeholder="https://res.cloudinary.com/..." {...register("profile_image_url")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                    <p className="mt-1 text-xs text-slate-500">Paste the secure Cloudinary image link. EduProw stores the link only.</p>
                    {errors.profile_image_url && <p className="mt-1 text-xs text-red-600">{errors.profile_image_url.message}</p>}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Identification & Certificates</h3>
                <p className="mb-4 text-sm text-slate-500">All fields in this section are optional. For certificates, paste secure document links from your approved document storage.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="nin" className="mb-1.5 block text-sm font-medium text-slate-700">National Identification Number (NIN) <span className="font-normal text-slate-400">— Optional</span></label>
                        <input id="nin" type="text" inputMode="numeric" autoComplete="off" maxLength={11} placeholder="Enter 11-digit NIN" {...register("nin")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                        <p className="mt-1 text-xs text-slate-500">Sensitive information; only authorized school staff should access it.</p>
                    </div>
                    <div>
                        <label htmlFor="degree_certificate_url" className="mb-1.5 block text-sm font-medium text-slate-700">Degree Certificate URL <span className="font-normal text-slate-400">— Optional</span></label>
                        <input id="degree_certificate_url" type="url" placeholder="https://..." {...register("degree_certificate_url")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                        {errors.degree_certificate_url && <p className="mt-1 text-xs text-red-600">{errors.degree_certificate_url.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="other_certificates_url" className="mb-1.5 block text-sm font-medium text-slate-700">Other Certificates URL <span className="font-normal text-slate-400">— Optional</span></label>
                        <input id="other_certificates_url" type="url" placeholder="https://..." {...register("other_certificates_url")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                        {errors.other_certificates_url && <p className="mt-1 text-xs text-red-600">{errors.other_certificates_url.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="birth_certificate_url" className="mb-1.5 block text-sm font-medium text-slate-700">Birth Certificate URL <span className="font-normal text-slate-400">— Optional</span></label>
                        <input id="birth_certificate_url" type="url" placeholder="https://..." {...register("birth_certificate_url")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                        {errors.birth_certificate_url && <p className="mt-1 text-xs text-red-600">{errors.birth_certificate_url.message}</p>}
                    </div>
                </div>
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
