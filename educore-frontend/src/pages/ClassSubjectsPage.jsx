import { useState } from "react";

import { Card } from "@/components/ui/Card";

import ClassSubjectForm from "@/components/classSubjects/ClassSubjectForm";

function ClassSubjectsPage() {

    const [

        selectedClass,

        setSelectedClass

    ] = useState("");

    return (

        <Card className="p-6">

            <h2 className="text-2xl font-bold mb-6">

                Class Subject Management

            </h2>

            <ClassSubjectForm

                selectedClass={selectedClass}

                setSelectedClass={setSelectedClass}

            />

        </Card>

    );

}

export default ClassSubjectsPage;