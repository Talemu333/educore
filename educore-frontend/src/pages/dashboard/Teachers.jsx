import { useState } from "react";

import { Button } from "@/components/ui/Button";

import AddTeacherSheet from "@/components/teachers/AddTeacherSheet";

import TeacherTable from "@/components/teachers/TeacherTable";
import TeacherDetailsSheet from "@/components/teachers/TeacherDetailsSheet";

import { Plus } from "lucide-react";

function Teachers() {

    const [open, setOpen] = useState(false);

    const [editingTeacher, setEditingTeacher] = useState(null);

    const [viewTeacherId, setViewTeacherId] = useState(null);

    const [viewOpen, setViewOpen] = useState(false);

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-bold">

                        Teachers

                    </h1>

                    <p className="text-muted-foreground">

                        Manage teachers

                    </p>

                </div>

                <Button

                    onClick={() => setOpen(true)}

                >

                    <Plus className="mr-2 h-4 w-4"/>

                    Add Teacher

                </Button>

            </div>

            <TeacherTable

                onEdit={(teacher) => {

                    setEditingTeacher(teacher);

                    setOpen(true);

                }}

                onView={(teacherId) => {

                    setViewTeacherId(teacherId);

                    setViewOpen(true);

                }}

            />

            <AddTeacherSheet

                teacher={editingTeacher}

                open={open}

                onOpenChange={(value) => {

                    setOpen(value);

                    if (!value) {

                        setEditingTeacher(null);

                    }

                }}

            />

            <TeacherDetailsSheet

                teacherId={viewTeacherId}

                open={viewOpen}

                onOpenChange={(value) => {

                    setViewOpen(value);

                    if (!value) {

                        setViewTeacherId(null);

                    }

                }}

            />

        </div>

    );

}

export default Teachers;