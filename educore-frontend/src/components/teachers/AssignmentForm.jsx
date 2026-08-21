import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { useEffect } from "react";
import { useRef } from "react";

import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import { useClasses } from "@/hooks/useClasses";
import { useArms } from "@/hooks/useArms";
import { useClassSubjects } from "@/hooks/useClassSubjects";
import FormSelect from "@/components/common/FormSelect";
import { useUpdateTeacherAssignment } from "@/hooks/useUpdateTeacherAssignment";

import { useCreateTeacherAssignment } from "@/hooks/useCreateTeacherAssignment";



function AssignmentForm({

    teacherId,

    editingAssignment,

    onFinishEditing

}) {

    const createAssignmentMutation = useCreateTeacherAssignment();
    const updateAssignmentMutation = useUpdateTeacherAssignment();

    const {

        control,

        handleSubmit,

        watch,

        reset,

        setValue

    } = useForm({

        defaultValues: {

            session_id: "",

            term_id: "",

            class_id: "",

            arm_id: "",

            subject_id: ""

        }

    });

    const selectedSession = watch("session_id");
    const selectedClass = watch("class_id");

    const formRef = useRef(null);

    const {

        data: sessions = []

    } = useSessions();

    const {

        data: terms = []

    } = useTerms();

    const {

        data: classes = []

    } = useClasses();

    const {

        data: arms = []

    } = useArms();

    const {

        data: classSubjects = [],

    } = useClassSubjects(selectedClass);

    useEffect(() => {

        setValue("arm_id", "");

    }, [

        selectedClass,

        setValue

    ]);

    useEffect(() => {

        setValue("term_id", "");

    }, [

        selectedSession,

        setValue

    ]);

    useEffect(() => {

        setValue(

            "subject_id",

            ""

        );

    }, [

        selectedClass,

        setValue

    ]);
    
    useEffect(() => {

            if (!editingAssignment) return;

            setValue(
                "session_id",
                editingAssignment.session_id.toString()
            );

            setValue(
                "class_id",
                editingAssignment.class_id.toString()
            );

            setTimeout(() => {

                setValue(
                    "term_id",
                    editingAssignment.term_id.toString()
                );

                setValue(
                    "arm_id",
                    editingAssignment.arm_id?.toString() ?? ""
                );

                setValue(
                    "subject_id",
                    editingAssignment.subject_id.toString()
                );

                formRef.current?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 0);

        }, [editingAssignment, setValue]);


    const filteredTerms = terms.filter(

        term =>

            term.session_id?.toString() === selectedSession?.toString()

    );
    const filteredArms = arms.filter(

        arm =>

            arm.class_id?.toString() === selectedClass?.toString()

    );

    const onSubmit = (values) => {

        const payload = {

            teacher_id: teacherId,

            ...values,

            session_id: Number(values.session_id),

            term_id: Number(values.term_id),

            class_id: Number(values.class_id),

            arm_id: values.arm_id
                ? Number(values.arm_id)
                : null,

            subject_id: Number(values.subject_id)

        };

        if (editingAssignment) {

            updateAssignmentMutation.mutate(

                {

                    id: editingAssignment.id,

                    data: payload

                },

                {

                    onSuccess: () => {

                        reset();

                        onFinishEditing();

                    }

                }

            );

        } else {

            createAssignmentMutation.mutate(

                payload,

                {

                    onSuccess: () => {

                        reset();

                    }

                }

            );

        }

    };

    return (

        <div

            className={`

                rounded-lg

                border

                p-4

                transition-all

                ${editingAssignment

                    ? "border-blue-500 bg-blue-50"

                    : "border-border"}

            `}

        >

                <form

                ref={formRef}

                onSubmit={handleSubmit(onSubmit)}

                className="grid grid-cols-2 gap-4"

            >

            {/* Session */}

                <FormSelect

                    control={control}

                    name="session_id"

                    placeholder="Academic Session"

                    options={sessions}

                    labelKey="session_name"

                />

            {/* Term */}
                <FormSelect

                    control={control}

                    name="term_id"

                    placeholder="Term"

                    options={filteredTerms}

                    labelKey="term_name"

                    disabled={!selectedSession}

                />

            {/* Class */}
                <FormSelect

                    control={control}

                    name="class_id"

                    placeholder="Class"

                    options={classes}

                    labelKey="class_name"

                />

            {/* Arm */}
                <FormSelect

                    control={control}

                    name="arm_id"

                    placeholder="Arm"

                    options={filteredArms}

                    labelKey="arm_name"

                    disabled={!selectedClass}

                />

            {/* Subject */}
                <FormSelect

                    control={control}

                    name="subject_id"

                    placeholder="Subject"

                    options={classSubjects}

                    labelKey="subject_name"

                    disabled={!selectedClass}

                />

                <div className="col-span-2 flex gap-3">

                    <Button
                        type="submit"
                        className="flex-1"
                    >

                        {

                            editingAssignment

                                ? "Update Assignment"

                                : "Assign Teacher"

                        }

                    </Button>

                    {

                        editingAssignment && (

                            <Button

                                type="button"

                                disabled={

                                    createAssignmentMutation.isPending ||

                                    updateAssignmentMutation.isPending

                                }

                                variant="outline"

                                onClick={() => {

                                    reset();

                                    onFinishEditing();

                                }}

                            >

                                Cancel

                            </Button>

                        )

                    }

                </div>

            </form>

        </div>

        

    );

}

export default AssignmentForm;