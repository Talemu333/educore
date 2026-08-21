import { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import TeacherTable from "@/components/teachers/TeacherTable";
import AddTeacherSheet from "@/components/teachers/AddTeacherSheet";
import ViewTeacherSheet from "@/components/teachers/ViewTeacherSheet";
import TeacherAssignmentSheet from "@/components/teachers/TeacherAssignmentSheet";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";


function TeachersPage() {

    const [open, setOpen] = useState(false);

    const [editingTeacherId, setEditingTeacherId] = useState(null);

    const [viewOpen, setViewOpen] = useState(false);

    const [viewTeacherId, setViewTeacherId] = useState(null);

    const [search, setSearch] = useState("");

    const [departmentFilter, setDepartmentFilter] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [assignmentOpen, setAssignmentOpen] = useState(false);

    const [assignmentTeacherId, setAssignmentTeacherId] = useState(null);

    const { data: departments = [] } = useDepartments();


    return (

        <div className="w-full space-y-4 sm:space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
            ">

                <div className="min-w-0">

                    <h1 className="
                        text-xl
                        font-bold
                        sm:text-2xl
                    ">
                        Teachers
                    </h1>

                    <p className="
                        text-sm
                        text-muted-foreground
                    ">
                        Manage all teachers.
                    </p>

                </div>


                <Button

                    className="
                        w-full
                        sm:w-auto
                    "

                    onClick={() => {

                        setEditingTeacherId(null);

                        setOpen(true);

                    }}

                >

                    Add Teacher

                </Button>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:flex
                lg:items-center
            ">

                {/* SEARCH */}

                <Input

                    placeholder="Search teacher..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                    className="
                        w-full
                        lg:max-w-sm
                    "

                />


                {/* DEPARTMENT */}

                <Select

                    value={departmentFilter}

                    onValueChange={setDepartmentFilter}

                >

                    <SelectTrigger
                        className="
                            w-full
                            sm:w-full
                            lg:w-56
                        "
                    >

                        <SelectValue
                            placeholder="All Departments"
                        />

                    </SelectTrigger>


                    <SelectContent>

                        <SelectItem value="">

                            All Departments

                        </SelectItem>


                        {

                            departments.map((department) => (

                                <SelectItem

                                    key={department.id}

                                    value={
                                        department.id.toString()
                                    }

                                >

                                    {
                                        department.department_name
                                    }

                                </SelectItem>

                            ))

                        }

                    </SelectContent>

                </Select>


                {/* STATUS */}

                <Select

                    value={statusFilter}

                    onValueChange={setStatusFilter}

                >

                    <SelectTrigger
                        className="
                            w-full
                            sm:w-full
                            lg:w-44
                        "
                    >

                        <SelectValue
                            placeholder="All Status"
                        />

                    </SelectTrigger>


                    <SelectContent>

                        <SelectItem value="">

                            All Status

                        </SelectItem>


                        <SelectItem value="true">

                            Active

                        </SelectItem>


                        <SelectItem value="false">

                            Inactive

                        </SelectItem>

                    </SelectContent>

                </Select>

            </div>


            {/* ==================================================
                TEACHER TABLE
            ================================================== */}

            <div className="
                w-full
                min-w-0
                overflow-x-auto
            ">

                <TeacherTable

                    search={search}

                    departmentFilter={departmentFilter}

                    statusFilter={statusFilter}

                    onEdit={(teacher) => {

                        setEditingTeacherId(teacher.id);

                        setOpen(true);

                    }}

                    onView={(teacher) => {

                        setViewTeacherId(teacher.id);

                        setViewOpen(true);

                    }}

                    onAssign={(teacher) => {

                        setAssignmentTeacherId(teacher.id);

                        setAssignmentOpen(true);

                    }}

                />

            </div>


            {/* ==================================================
                ADD / EDIT TEACHER
            ================================================== */}

            <AddTeacherSheet

                teacherId={editingTeacherId}

                open={open}

                onOpenChange={(value) => {

                    setOpen(value);

                    if (!value) {

                        setEditingTeacherId(null);

                    }

                }}

            />


            {/* ==================================================
                VIEW TEACHER
            ================================================== */}

            <ViewTeacherSheet

                teacherId={viewTeacherId}

                open={viewOpen}

                onOpenChange={(value) => {

                    setViewOpen(value);

                    if (!value) {

                        setViewTeacherId(null);

                    }

                }}

            />


            {/* ==================================================
                TEACHER ASSIGNMENT
            ================================================== */}

            <TeacherAssignmentSheet

                teacherId={assignmentTeacherId}

                open={assignmentOpen}

                onOpenChange={(value) => {

                    setAssignmentOpen(value);

                    if (!value) {

                        setAssignmentTeacherId(null);

                    }

                }}

            />

        </div>

    );

}


export default TeachersPage;

// import { useState } from "react";
// import { useDepartments } from "@/hooks/useDepartments";

// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";

// import TeacherTable from "@/components/teachers/TeacherTable";
// import AddTeacherSheet from "@/components/teachers/AddTeacherSheet";
// import ViewTeacherSheet from "@/components/teachers/ViewTeacherSheet";
// import TeacherAssignmentSheet from "@/components/teachers/TeacherAssignmentSheet";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from "@/components/ui/select";


// function TeachersPage() {

//     const [open, setOpen] = useState(false);

//     const [editingTeacherId, setEditingTeacherId] = useState(null);

//     const [viewOpen, setViewOpen] = useState(false);

//     const [viewTeacherId, setViewTeacherId] = useState(null);

//     const [search, setSearch] = useState("");

//     const [departmentFilter, setDepartmentFilter] = useState("");

//     const [statusFilter, setStatusFilter] = useState("");

//     const [assignmentOpen, setAssignmentOpen] = useState(false);

//     const [assignmentTeacherId, setAssignmentTeacherId] = useState(null);

//     const { data: departments = [] } = useDepartments();

//     return (

//         <div className="space-y-6">

//             <div className="flex items-center justify-between">

//                 <div>

//                     <h1 className="text-2xl font-bold">

//                         Teachers

//                     </h1>

//                     <p className="text-muted-foreground">

//                         Manage all teachers.

//                     </p>

//                 </div>

//                 <Button

//                     onClick={() => {

//                         setEditingTeacherId(null);

//                         setOpen(true);

//                     }}

//                 >

//                     Add Teacher

//                 </Button>

//             </div>

//             <div className="flex gap-4 items-center">

//                 <Input
//                     placeholder="Search teacher..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="max-w-sm"
//                 />

//                 <Select
//                     value={departmentFilter}
//                     onValueChange={setDepartmentFilter}
//                 >

//                     <SelectTrigger className="w-56">

//                         <SelectValue placeholder="All Departments" />

//                     </SelectTrigger>

//                     <SelectContent>

//                         <SelectItem value="">

//                             All Departments

//                         </SelectItem>

//                         {

//                             departments.map((department) => (

//                                 <SelectItem

//                                     key={department.id}

//                                     value={department.id.toString()}

//                                 >

//                                     {department.department_name}

//                                 </SelectItem>

//                             ))

//                         }

//                     </SelectContent>

//                 </Select>

//                 <Select
//                     value={statusFilter}
//                     onValueChange={setStatusFilter}
//                 >

//                     <SelectTrigger className="w-44">

//                         <SelectValue placeholder="All Status" />

//                     </SelectTrigger>

//                     <SelectContent>

//                         <SelectItem value="">

//                             All Status

//                         </SelectItem>

//                         <SelectItem value="true">

//                             Active

//                         </SelectItem>

//                         <SelectItem value="false">

//                             Inactive

//                         </SelectItem>

//                     </SelectContent>

//                 </Select>

//             </div>

//             <TeacherTable

//                 search={search}

//                 departmentFilter={departmentFilter}

//                 statusFilter={statusFilter}

//                 onEdit={(teacher) => {

//                     setEditingTeacherId(teacher.id);

//                     setOpen(true);

//                 }}

//                 onView={(teacher) => {

//                     setViewTeacherId(teacher.id);

//                     setViewOpen(true);

//                 }}

//                 onAssign={(teacher) => {

//                     setAssignmentTeacherId(teacher.id);

//                     setAssignmentOpen(true);

//                 }}

//             />

//             <AddTeacherSheet

//                 teacherId={editingTeacherId}

//                 open={open}

//                 onOpenChange={(value) => {

//                     setOpen(value);

//                     if (!value) {

//                         setEditingTeacherId(null);

//                     }

//                 }}

//             />

//             <ViewTeacherSheet

//                 teacherId={viewTeacherId}

//                 open={viewOpen}

//                 onOpenChange={(value) => {

//                     setViewOpen(value);

//                     if (!value) {

//                         setViewTeacherId(null);

//                     }

//                 }}

//             />

//             <TeacherAssignmentSheet

//                 teacherId={assignmentTeacherId}

//                 open={assignmentOpen}

//                 onOpenChange={(value) => {

//                     setAssignmentOpen(value);

//                     if (!value) {

//                         setAssignmentTeacherId(null);

//                     }

//                 }}

//             />

//         </div>

//     );

// }

// export default TeachersPage;