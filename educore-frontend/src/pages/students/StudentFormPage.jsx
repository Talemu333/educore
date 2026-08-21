import { useParams } from "react-router-dom";
import {useStudentFormData} from "../../hooks/useStudentFormData";
import PageHeader from "@/components/common/PageHeader";
import StudentForm from "@/components/students/StudentForm";

function StudentFormPage() {

    const { id } = useParams();

    const isEditMode = Boolean(id);

    return (

        <>

            <PageHeader

                title={
                    isEditMode
                        ? "Edit Student"
                        : "Add Student"
                }

                description={
                    isEditMode
                        ? "Update student information."
                        : "Register a new student."
                }

            />

            <StudentForm 
                isEditMode={isEditMode} 
                studentId={id}
            />

        </>

    );

}

export default StudentFormPage;