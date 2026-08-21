import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStudentFormData } from "../../hooks/useStudentFormData";
import { useCreateStudent } from "../../hooks/useCreateStudent";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useArmsByClass } from "../../hooks/useArmsByClass";
import { useStudent } from "../../hooks/useStudent";
import { useUpdateStudent } from "../../hooks/useUpdateStudent";

import PersonalInformation from "./form/PersonalInformation";
import AcademicInformation from "./form/AcademicInformation";
import AdditionalInformation from "./form/AdditionalInformation";
import Loading from "../common/Loading";

import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema } from "@/validators/studentSchema";

function StudentForm({ isEditMode, studentId }) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: {}
    });

    const selectedClassId = watch("class_id");

    const {
        data: filteredArms = []
    } = useArmsByClass(selectedClassId);

    const {
        data,
        isLoading,
        error
    } = useStudentFormData();

    const {
        data: student,
        isLoading: isStudentLoading
    } = useStudent(studentId);

    const navigate = useNavigate();

    const createStudentMutation = useCreateStudent();

    const updateStudentMutation = useUpdateStudent();

    useEffect(() => {

        if (!isEditMode) {

            setValue("arm_id", "");

        }

    }, [
        selectedClassId,
        isEditMode,
        setValue
    ]);

    useEffect(() => {

        if (
            isEditMode &&
            student
        ) {

            reset({

                surname: student.surname,

                first_name: student.first_name,

                middle_name: student.middle_name || "",

                gender: student.gender,

                date_of_birth:
                    student.date_of_birth?.split("T")[0],

                residential_address:
                    student.residential_address,

                admission_date:
                    student.admission_date?.split("T")[0],

                class_id:
                    String(student.class_id),

                arm_id:
                    String(student.arm_id),

                state_id:
                    String(student.state_id),

                nationality_id:
                    String(student.nationality_id),

                blood_group:
                    student.blood_group,

                genotype:
                    student.genotype

            });

        }

    }, [
        student,
        isEditMode,
        reset
    ]);

    if (
        isLoading ||
        isStudentLoading
    ) {

        return (
            <Loading
                message="Loading student form..."
            />
        );

    }

    if (error) {

        return (
            <p className="text-sm text-destructive">
                Failed to load form data.
            </p>
        );

    }

    const onSubmit = async (formData) => {

        console.log("Submitted Data:", formData);

        try {

            if (isEditMode) {

                await updateStudentMutation.mutateAsync({

                    id: studentId,

                    data: formData

                });

                toast.success(
                    "Student updated successfully."
                );

            } else {

                await createStudentMutation.mutateAsync(
                    formData
                );

                toast.success(
                    "Student registered successfully."
                );

            }

            navigate("/students");

        }

        catch (err) {

            console.log(
                "Backend Response:",
                err.response?.data
            );

            toast.error(

                err.response?.data?.message ||

                "Failed to register student."

            );

        }

    };

    const isSubmitting =
        createStudentMutation.isPending ||
        updateStudentMutation.isPending;

    const buttonText = isSubmitting

        ? (
            isEditMode
                ? "Updating..."
                : "Registering..."
        )

        : (
            isEditMode
                ? "Update Student"
                : "Register Student"
        );

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-5 sm:space-y-6"
        >

            {/* Personal Information */}

            <div className="w-full">
                <PersonalInformation
                    register={register}
                    errors={errors}
                />
            </div>

            {/* Academic Information */}

            <div className="w-full">
                <AcademicInformation
                    register={register}
                    errors={errors}
                    sessions={data.sessions}
                    classes={data.classes}
                    arms={filteredArms}
                />
            </div>

            {/* Additional Information */}

            <div className="w-full">
                <AdditionalInformation
                    register={register}
                    errors={errors}
                    states={data.states}
                    nationalities={data.nationalities}
                />
            </div>

            {/* Submit Button */}

            <div className="flex w-full justify-end pt-2">

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                >

                    {buttonText}

                </Button>

            </div>

        </form>

    );

}

export default StudentForm;


// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { useStudentFormData } from "../../hooks/useStudentFormData";
// import { useCreateStudent } from "../../hooks/useCreateStudent";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { useArmsByClass } from "../../hooks/useArmsByClass";
// import { useStudent } from "../../hooks/useStudent";
// import { useUpdateStudent } from "../../hooks/useUpdateStudent";

// import PersonalInformation from "./form/PersonalInformation";
// import AcademicInformation from "./form/AcademicInformation";
// import AdditionalInformation from "./form/AdditionalInformation";
// import Loading from "../common/Loading";
// import { Button } from "@/components/ui/Button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { studentSchema } from "@/validators/studentSchema";




// function StudentForm({ isEditMode, studentId }) {

//     const {

//         register,

//         handleSubmit,

//         watch,

//         setValue,

//          reset,

//         formState: { errors }

//     } = useForm({

//         resolver: zodResolver(studentSchema),

//         defaultValues: {}

//     });

//     const selectedClassId = watch("class_id");

//     const {

//         data: filteredArms = []

//     } = useArmsByClass(selectedClassId);

//     const {

//         data,

//         isLoading,

//         error

//     } = useStudentFormData();

//     const {

//         data: student,

//         isLoading: isStudentLoading

//     } = useStudent(studentId);

//     const navigate = useNavigate();
//     const createStudentMutation = useCreateStudent();

//     const updateStudentMutation = useUpdateStudent();

//     useEffect(() => {

//         if (!isEditMode) {

//             setValue("arm_id", "");

//         }

//     }, [

//         selectedClassId,

//         isEditMode,

//         setValue

//     ]);

//     useEffect(() => {

//         if (

//             isEditMode &&

//             student

//         ) {

//             reset({

//                 surname: student.surname,

//                 first_name: student.first_name,

//                 middle_name: student.middle_name || "",

//                 gender: student.gender,

//                 date_of_birth: student.date_of_birth
//                     ?.split("T")[0],

//                 residential_address:
//                     student.residential_address,

//                 admission_date:
//                     student.admission_date
//                         ?.split("T")[0],

//                 class_id:
//                     String(student.class_id),

//                 arm_id:
//                     String(student.arm_id),

//                 state_id:
//                     String(student.state_id),

//                 nationality_id:
//                     String(student.nationality_id),

//                 blood_group: student.blood_group,

//                 genotype: student.genotype

//             });

//         }

//     }, [

//         student,

//         isEditMode,

//         reset

//     ]);

//     if (

//         isLoading ||

//         isStudentLoading

//     ) {

//         return (

//             <Loading

//                 message="Loading student form..."

//             />

//         );

//     }

//     if (error) {

//         return <p>Failed to load form data.</p>;

//     };

//     const onSubmit = async (formData) => {

//         console.log("Submitted Data:", formData);

//         try {

//             if (isEditMode) {

//                 await updateStudentMutation.mutateAsync({

//                     id: studentId,

//                     data: formData

//                 });

//                 toast.success("Student updated successfully.");

//             } else {

//                 await createStudentMutation.mutateAsync(formData);

//                 toast.success("Student registered successfully.");

//             }

//             navigate("/students");

//         }

//         catch (err) {

//              console.log("Backend Response:", err.response?.data);

//             toast.error(

//                 err.response?.data?.message ||

//                 "Failed to register student."

//             );

//         }

//     };

//     const isSubmitting =createStudentMutation.isPending || updateStudentMutation.isPending
//     const buttonText = isSubmitting

//     ? (

//         isEditMode

//             ? "Updating..."

//             : "Registering..."

//     )

//     : (

//         isEditMode

//             ? "Update Student"

//             : "Register Student"

//     );

//     return (

//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="space-y-6"
//         >

//             <PersonalInformation

//                 register={register}

//                 errors={errors}

//             />

//             <AcademicInformation

//                 register={register}

//                 errors={errors}

//                 sessions={data.sessions}

//                 classes={data.classes}

//                 arms={filteredArms}

//             />

//             <AdditionalInformation

//                 register={register}

//                 errors={errors}

//                 states={data.states}

//                 nationalities={data.nationalities}

//             />

//             <Button

//                 type="submit"

//                 disabled={isSubmitting}

//             >

//                 {buttonText}

//             </Button>

//         </form>

//     );

// }


// export default StudentForm;