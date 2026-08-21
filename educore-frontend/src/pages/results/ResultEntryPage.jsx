import { useState } from "react";

import AssignmentSelector from "@/components/results/AssignmentSelector";
import ResultTable from "@/components/results/ResultTable";

function ResultEntryPage() {

    const [

        selectedAssignment,

        setSelectedAssignment

    ] = useState(null);

    return (

        <div className="space-y-6">

            <h1 className="text-2xl font-bold">

                Result Entry

            </h1>

            <AssignmentSelector

                // teacherId={2} // later replace with logged-in teacher

                value={selectedAssignment}

                onChange={setSelectedAssignment}

            />

            {

                selectedAssignment && (

                    <ResultTable

                        assignment={selectedAssignment}

                    />

                )

            }

        </div>

    );

}

export default ResultEntryPage;