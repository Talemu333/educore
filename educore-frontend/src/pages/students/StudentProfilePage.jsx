import { useParams } from "react-router-dom";

import PageHeader from "@/components/common/PageHeader";
import StudentProfile from "@/components/students/StudentProfile";

function StudentProfilePage() {

    const { id } = useParams();

    return (

        <>

            <PageHeader

                title="Student Profile"

                description="View complete student information."

            />

            <StudentProfile

                studentId={id}

            />

        </>

    );

}

export default StudentProfilePage;