import { useSearchParams } from "react-router-dom";

function CreateParentPage() {

    // 👇 Put this at the top of the component
    const [searchParams] = useSearchParams();

    const studentId = searchParams.get("studentId");

    console.log(studentId);

    return (

        <div>

            <h1>Create Parent</h1>

            <p>Student ID: {studentId}</p>

        </div>

    );

}

export default CreateParentPage;