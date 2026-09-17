import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function CreateParentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const studentId = searchParams.get("studentId");

    useEffect(() => {
        navigate(studentId ? `/students/${studentId}` : "/students", { replace: true });
    }, [navigate, studentId]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
            Opening student profile...
        </div>
    );
}

export default CreateParentPage;
