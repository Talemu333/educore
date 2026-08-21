import { useEffect, useState } from "react";

import AppSelect from "@/components/common/AppSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useClassSubjects } from "@/hooks/useClassSubjects";
import { useSaveClassSubjects } from "@/hooks/useSaveClassSubjects";

function ClassSubjectForm() {

    const [selectedClass, setSelectedClass] = useState("");

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const { data: classes = [] } = useClasses();

    const { data: subjects = [] } = useSubjects();

    const {
        data: classSubjects = [],
        isSuccess
    } = useClassSubjects(selectedClass);

    const saveMutation = useSaveClassSubjects();


    useEffect(() => {

        if (!isSuccess) return;

        setSelectedSubjects(

            classSubjects.map(subject => ({

                subject_id: subject.subject_id,

                is_compulsory: subject.is_compulsory

            }))

        );

    }, [isSuccess, classSubjects]);


    const getSelectedSubject = (subjectId) =>

        selectedSubjects.find(

            subject =>
                subject.subject_id === subjectId

        );


    const handleSelectAll = () => {

        setSelectedSubjects(

            subjects.map(subject => ({

                subject_id: subject.id,

                is_compulsory: true

            }))

        );

    };


    const handleClearAll = () => {

        setSelectedSubjects([]);

    };


    const handleReset = () => {

        setSelectedSubjects(

            classSubjects.map(subject => ({

                subject_id: subject.subject_id,

                is_compulsory: subject.is_compulsory

            }))

        );

    };


    return (

        <div className="w-full space-y-5 sm:space-y-6">


            {/* ==================================================
                CLASS SELECT
            ================================================== */}

            <div className="w-full">

                <AppSelect

                    value={selectedClass}

                    onValueChange={setSelectedClass}

                    placeholder="Select Class"

                    options={classes}

                    labelKey="class_name"

                />

            </div>


            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="grid grid-cols-1 gap-2 xs:grid-cols-3 sm:flex sm:flex-wrap">

                <Button

                    type="button"

                    variant="outline"

                    onClick={handleSelectAll}

                    disabled={!selectedClass}

                    className="w-full sm:w-auto"

                >

                    Select All

                </Button>


                <Button

                    type="button"

                    variant="outline"

                    onClick={handleClearAll}

                    disabled={!selectedClass}

                    className="w-full sm:w-auto"

                >

                    Clear All

                </Button>


                <Button

                    type="button"

                    variant="outline"

                    onClick={handleReset}

                    disabled={!selectedClass}

                    className="w-full sm:w-auto"

                >

                    Reset

                </Button>

            </div>


            {/* ==================================================
                SUBJECT LIST
            ================================================== */}

            <div className="w-full space-y-3 sm:space-y-4">

                {

                    subjects.map((subject) => {

                        const selected =
                            getSelectedSubject(subject.id);


                        return (

                            <div

                                key={subject.id}

                                className="
                                    w-full
                                    rounded-md
                                    border
                                    p-3
                                    sm:p-4
                                    flex
                                    flex-col
                                    gap-3
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "

                            >


                                {/* SUBJECT */}

                                <div className="flex min-w-0 items-center gap-3">

                                    <Checkbox

                                        checked={!!selected}

                                        onCheckedChange={(checked) => {

                                            if (checked) {

                                                setSelectedSubjects(prev => {

                                                    const exists =
                                                        prev.some(
                                                            item =>
                                                                item.subject_id ===
                                                                subject.id
                                                        );

                                                    if (exists) {

                                                        return prev;

                                                    }

                                                    return [

                                                        ...prev,

                                                        {

                                                            subject_id:
                                                                subject.id,

                                                            is_compulsory:
                                                                true

                                                        }

                                                    ];

                                                });

                                            }

                                            else {

                                                setSelectedSubjects(prev =>

                                                    prev.filter(

                                                        item =>

                                                            item.subject_id !==
                                                            subject.id

                                                    )

                                                );

                                            }

                                        }}

                                    />


                                    <span className="
                                        min-w-0
                                        break-words
                                        text-sm
                                        font-medium
                                    ">

                                        {subject.subject_name}

                                    </span>

                                </div>


                                {/* COMPULSORY */}

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    pl-7
                                    sm:pl-0
                                    sm:shrink-0
                                ">

                                    <Checkbox

                                        checked={
                                            selected?.is_compulsory ??
                                            false
                                        }

                                        disabled={!selected}

                                        onCheckedChange={(checked) => {

                                            setSelectedSubjects(prev =>

                                                prev.map(item =>

                                                    item.subject_id ===
                                                    subject.id

                                                        ? {

                                                            ...item,

                                                            is_compulsory:
                                                                checked

                                                        }

                                                        : item

                                                )

                                            );

                                        }}

                                    />


                                    <span className="
                                        text-xs
                                        text-muted-foreground
                                        sm:text-sm
                                    ">

                                        Compulsory

                                    </span>

                                </div>

                            </div>

                        );

                    })

                }

            </div>


            {/* ==================================================
                SAVE BUTTON
            ================================================== */}

            <div className="pt-1">

                <Button

                    onClick={() =>

                        saveMutation.mutate({

                            class_id:
                                Number(selectedClass),

                            subjects:
                                selectedSubjects

                        })

                    }

                    disabled={

                        !selectedClass ||

                        selectedSubjects.length === 0 ||

                        saveMutation.isPending

                    }

                    className="w-full sm:w-auto"

                >

                    {

                        saveMutation.isPending

                            ? "Saving..."

                            : "Save Subjects"

                    }

                </Button>

            </div>

        </div>

    );

}

export default ClassSubjectForm;

// import { useEffect, useState } from "react";

// import AppSelect from "@/components/common/AppSelect";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// import { useClasses } from "@/hooks/useClasses";
// import { useSubjects } from "@/hooks/useSubjects";
// import { useClassSubjects } from "@/hooks/useClassSubjects";
// import { useSaveClassSubjects } from "@/hooks/useSaveClassSubjects";

// function ClassSubjectForm() {

//     const [selectedClass, setSelectedClass] = useState("");

//     const [selectedSubjects, setSelectedSubjects] = useState([]);

//     const { data: classes = [] } = useClasses();

//     const { data: subjects = [] } = useSubjects();

//     const {

//         data: classSubjects = [],

//         isSuccess

//     } = useClassSubjects(selectedClass);

//     const saveMutation = useSaveClassSubjects();

//     useEffect(() => {

//         if (!isSuccess) return;

//         setSelectedSubjects(

//             classSubjects.map(subject => ({

//                 subject_id: subject.subject_id,

//                 is_compulsory: subject.is_compulsory

//             }))

//         );

//     }, [isSuccess, selectedClass]);

//     const getSelectedSubject = (subjectId) =>

//     selectedSubjects.find(

//         subject =>

//             subject.subject_id === subjectId

//     );

//     const handleSelectAll = () => {

//         setSelectedSubjects(

//             subjects.map(subject => ({

//                 subject_id: subject.id,

//                 is_compulsory: true

//             }))

//         );

//     };

//     const handleClearAll = () => {

//         setSelectedSubjects([]);

//     };

//     const handleReset = () => {

//         setSelectedSubjects(

//             classSubjects.map(subject => ({

//                 subject_id: subject.subject_id,

//                 is_compulsory: subject.is_compulsory

//             }))

//         );

//     };

//     return (

//         <div className="space-y-6">

//             <AppSelect

//                 value={selectedClass}

//                 onValueChange={setSelectedClass}

//                 placeholder="Select Class"

//                 options={classes}

//                 labelKey="class_name"

//             />

//             <div className="flex gap-2">

//                 <Button

//                     type="button"

//                     variant="outline"

//                     onClick={handleSelectAll}

//                     disabled={!selectedClass}

//                 >

//                     Select All

//                 </Button>

//                 <Button

//                     type="button"

//                     variant="outline"

//                     onClick={handleClearAll}

//                     disabled={!selectedClass}

//                 >

//                     Clear All

//                 </Button>

//                 <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handleReset}
//                     disabled={!selectedClass}
//                 >
//                     Reset
//                 </Button>

//             </div>

//             <div className="space-y-4">

//                 {

//                     subjects.map((subject) => {

//                         const selected = getSelectedSubject(subject.id);

//                         return (

//                             <div

//                                 key={subject.id}

//                                 className="flex items-center justify-between border rounded-md p-3"

//                             >

//                                 <div className="flex items-center gap-3">

//                                     <Checkbox

//                                         checked={!!selected}

//                                         onCheckedChange={(checked) => {

//                                             if (checked) {

//                                                 setSelectedSubjects(prev => {

//                                                     const exists = prev.some(

//                                                         item => item.subject_id === subject.id

//                                                     );

//                                                     if (exists) {

//                                                         return prev;

//                                                     }

//                                                     return [

//                                                         ...prev,

//                                                         {

//                                                             subject_id: subject.id,

//                                                             is_compulsory: true

//                                                         }

//                                                     ];

//                                                 });

//                                             }

//                                             else {

//                                                 setSelectedSubjects(prev =>

//                                                     prev.filter(

//                                                         item =>

//                                                             item.subject_id !== subject.id

//                                                     )

//                                                 );

//                                             }

//                                         }}

//                                     />

//                                     <span>

//                                         {subject.subject_name}

//                                     </span>

//                                 </div>

//                                 <div className="flex items-center gap-2">

//                                     <Checkbox

//                                         checked={selected?.is_compulsory ?? false}

//                                         disabled={!selected}

//                                         onCheckedChange={(checked) => {

//                                             setSelectedSubjects(prev =>

//                                                 prev.map(item =>

//                                                     item.subject_id === subject.id

//                                                         ? {

//                                                             ...item,

//                                                             is_compulsory: checked

//                                                         }

//                                                         : item

//                                                 )

//                                             );

//                                         }}

//                                     />

//                                     <span>

//                                         Compulsory

//                                     </span>

//                                 </div>

//                             </div>

//                         );

//                     })

//                 }

//             </div>

//             <Button

//                 onClick={() =>

//                     saveMutation.mutate({

//                         class_id: Number(selectedClass),

//                         subjects: selectedSubjects

//                     })

//                 }

//                 disabled={

//                     !selectedClass ||

//                     selectedSubjects.length === 0 ||

//                     saveMutation.isPending 

//                 }

//             >
//                 {
//                     saveMutation.isPending
//                         ? "Saving..."
//                         : "Save Subjects"
//                 }

//             </Button>

//         </div>

//     );

// }

// export default ClassSubjectForm;