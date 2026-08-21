import { useState } from "react";
import { useStudents } from "../../hooks/useStudents";
import useDebounce from "../../hooks/useDebounce";
import { useDeactivateStudent } from "../../hooks/useDeactivateStudent";
import toast from "react-hot-toast";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table";

import {
    Eye,
    Pencil,
    UserX
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";


function StudentTable() {

    const [search, setSearch] = useState("");

    const [
        studentToDeactivate,
        setStudentToDeactivate
    ] = useState(null);

    const debouncedSearch = useDebounce(search);

    const deactivateStudentMutation =
        useDeactivateStudent();


    const {
        data,
        isLoading,
        error
    } = useStudents(debouncedSearch);


    /*
    =========================================
    HANDLE DEACTIVATE
    =========================================
    */

    const handleDeactivate = (student) => {

        setStudentToDeactivate(student);

    };


    /*
    =========================================
    ERROR
    =========================================
    */

    if (error) {

        return (

            <Card>

                <CardContent className="py-8 text-center">

                    <p className="text-sm text-red-600">
                        Failed to load students.
                    </p>

                </CardContent>

            </Card>

        );

    }


    const students =
        data?.data ?? [];


    return (

        <Card className="w-full overflow-hidden">


            {/* =========================================
                CARD CONTENT
            ========================================= */}

            <CardContent className="p-4 sm:p-6">


                {/* =========================================
                    SEARCH
                ========================================= */}

                <div className="mb-4">

                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full"
                    />

                </div>


                {/* =========================================
                    RESULT COUNT
                ========================================= */}

                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">

                        Showing{" "}
                        <span className="font-medium text-gray-700">
                            {students.length}
                        </span>{" "}
                        students

                    </p>

                </div>


                {/* =========================================
                    LOADING
                ========================================= */}

                {isLoading ? (

                    <div className="py-10 text-center">

                        <p className="text-sm text-muted-foreground">
                            Loading students...
                        </p>

                    </div>

                ) : students.length === 0 ? (

                    /* =====================================
                       EMPTY STATE
                    ===================================== */

                    <div className="py-10 text-center">

                        <p className="text-sm text-muted-foreground">
                            No students found.
                        </p>

                    </div>

                ) : (

                    /* =====================================
                       RESPONSIVE TABLE
                    ===================================== */

                    <div className="w-full overflow-x-auto rounded-lg border">

                        <Table className="min-w-[850px]">

                            <TableHeader>

                                <TableRow>

                                    <TableHead className="whitespace-nowrap">
                                        Admission No
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap">
                                        Name
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap">
                                        Gender
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap">
                                        Class
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap">
                                        Arm
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-right">
                                        Actions
                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {students.map(
                                    (student) => (

                                        <TableRow
                                            key={student.id}
                                        >


                                            {/* ADMISSION NUMBER */}

                                            <TableCell className="whitespace-nowrap">

                                                {student.admission_number}

                                            </TableCell>


                                            {/* NAME */}

                                            <TableCell className="whitespace-nowrap">

                                                <span className="font-medium">

                                                    {student.surname}{" "}
                                                    {student.first_name}

                                                </span>

                                            </TableCell>


                                            {/* GENDER */}

                                            <TableCell className="whitespace-nowrap">

                                                {student.gender}

                                            </TableCell>


                                            {/* CLASS */}

                                            <TableCell className="whitespace-nowrap">

                                                {student.class_name}

                                            </TableCell>


                                            {/* ARM */}

                                            <TableCell className="whitespace-nowrap">

                                                {student.arm_name}

                                            </TableCell>


                                            {/* ACTIONS */}

                                            <TableCell className="whitespace-nowrap text-right">

                                                <div className="flex items-center justify-end gap-2">


                                                    {/* VIEW */}

                                                    <Link
                                                        to={`/students/${student.id}`}
                                                    >

                                                        <Button
                                                            variant="outline"
                                                            size="icon-sm"
                                                            title="View Student"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </Button>

                                                    </Link>


                                                    {/* EDIT */}

                                                    <Link
                                                        to={`/students/${student.id}/edit`}
                                                    >

                                                        <Button
                                                            size="icon-sm"
                                                            title="Edit Student"
                                                        >

                                                            <Pencil className="h-4 w-4" />

                                                        </Button>

                                                    </Link>


                                                    {/* DEACTIVATE */}

                                                    <Button
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        title="Deactivate Student"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        <UserX className="h-4 w-4" />

                                                    </Button>

                                                </div>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </div>

                )}

            </CardContent>


            {/* =========================================
                DEACTIVATE DIALOG
            ========================================= */}

            <AlertDialog

                open={
                    !!studentToDeactivate
                }

                onOpenChange={(open) => {

                    if (!open) {

                        setStudentToDeactivate(
                            null
                        );

                    }

                }}

            >

                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg">

                    <AlertDialogHeader>

                        <AlertDialogTitle>

                            Deactivate Student

                        </AlertDialogTitle>


                        <AlertDialogDescription>

                            {studentToDeactivate && (

                                <>

                                    Are you sure you want to deactivate{" "}

                                    <strong>

                                        {studentToDeactivate.surname}{" "}
                                        {studentToDeactivate.first_name}

                                    </strong>
                                    ?

                                    <br />
                                    <br />

                                    The student will no longer appear
                                    in active student lists, but all
                                    academic records will be preserved.

                                </>

                            )}

                        </AlertDialogDescription>

                    </AlertDialogHeader>


                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">

                        <AlertDialogCancel className="w-full sm:w-auto">

                            Cancel

                        </AlertDialogCancel>


                        <AlertDialogAction

                            className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"

                            disabled={
                                deactivateStudentMutation.isPending
                            }

                            onClick={async () => {

                                try {

                                    await deactivateStudentMutation.mutateAsync(

                                        studentToDeactivate.id

                                    );


                                    toast.success(
                                        "Student deactivated successfully."
                                    );


                                    setStudentToDeactivate(
                                        null
                                    );

                                } catch (err) {

                                    toast.error(

                                        err.response?.data?.message ||

                                        "Failed to deactivate student."

                                    );

                                }

                            }}

                        >

                            {
                                deactivateStudentMutation.isPending

                                    ? "Deactivating..."

                                    : "Deactivate"
                            }

                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>

        </Card>

    );

}


export default StudentTable;

// import { useState } from "react";
// import { useStudents } from "../../hooks/useStudents";
// import useDebounce from "../../hooks/useDebounce";
// import { useDeactivateStudent } from "../../hooks/useDeactivateStudent";
// import toast from "react-hot-toast";

// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {Card,CardContent} from "@/components/ui/card";
// import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from "@/components/ui/table";
// import {Eye,Pencil,UserX} from "lucide-react";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle
// } from "@/components/ui/alert-dialog";

// function StudentTable() {
    
//     const [search, setSearch] = useState("");
//      const [studentToDeactivate, setStudentToDeactivate] = useState(null);
//     const debouncedSearch = useDebounce(search);

//     const handleDeactivate = (student) => {setStudentToDeactivate(student);};
//     const deactivateStudentMutation = useDeactivateStudent();

//     const {

//         data,

//         isLoading,

//         error

//     } = useStudents(debouncedSearch);

//     // console.log(search);
//     // console.log(debouncedSearch);

//     // if (isLoading) {

//     //     return <p>Loading students...</p>;

//     // }

//     if (error) {

//         return <p>Failed to load students.</p>;

//     }

//     // const students = data.data;
//     const students = data?.data ?? [];

//     // if (students.length === 0) {

//     //     return (

//     //         <Card>

//     //             <CardContent className="py-12 text-center">

//     //                 No students found

//     //             </CardContent>

//     //         </Card>

//     //     );

//     // }

//     return (

//         <Card>

//             <CardContent className="pt-6">

//                 <div className="mb-4">

//                     <Input
//                         placeholder="Search students..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />

//                 </div>

//                 <div className="flex justify-between items-center mb-4">

//                     <p className="text-sm text-gray-500">

//                         Showing {students.length} students

//                     </p>

//                 </div>

//                 {isLoading ? (
//                     <p>Loading students...</p>
//                 ) : (
//                     <Table>

//                         <TableHeader>

//                             <TableRow>

//                                 <TableHead>Admission No</TableHead>

//                                 <TableHead>Name</TableHead>

//                                 <TableHead>Gender</TableHead>

//                                 <TableHead>Class</TableHead>

//                                 <TableHead>Arm</TableHead>

//                                 <TableHead className="text-right">Actions</TableHead>


//                             </TableRow>

//                         </TableHeader>

//                         <TableBody>

//                             {students.map(student => (

//                                 <TableRow key={student.id}>

//                                     <TableCell>

//                                         {student.admission_number}

//                                     </TableCell>

//                                     <TableCell>

//                                         {student.surname} {student.first_name}

//                                     </TableCell>

//                                     <TableCell>

//                                         {student.gender}

//                                     </TableCell>

//                                     <TableCell>

//                                         {student.class_name}

//                                     </TableCell>

//                                     <TableCell>

//                                         {student.arm_name}

//                                     </TableCell>

//                                     <TableCell>

//                                         <div className="flex items-center justify-end gap-2">

//                                             <Link to={`/students/${student.id}`}>

//                                                 <Button
//                                                     variant="outline"
//                                                     size="icon-sm"
//                                                     title="View Student"
//                                                 >

//                                                     <Eye className="h-4 w-4" />

//                                                 </Button>

//                                             </Link>

//                                             <Link to={`/students/${student.id}/edit`}>

//                                                 <Button
//                                                     size="icon-sm"
//                                                     title="Edit Student"
//                                                 >

//                                                     <Pencil className="h-4 w-4" />

//                                                 </Button>

//                                             </Link>

//                                             <Button

//                                                 variant="destructive"

//                                                 size="icon-sm"

//                                                 title="Deactivate Student"

//                                                 onClick={() => handleDeactivate(student)}

//                                             >

//                                                 <UserX className="h-4 w-4" />

//                                             </Button>

//                                         </div>

//                                     </TableCell>

//                                 </TableRow>

//                             ))}

//                         </TableBody>

//                     </Table>
//                 )}

                

//             </CardContent>

//             <AlertDialog

//                 open={!!studentToDeactivate}

//                 onOpenChange={(open) => {

//                     if (!open) {

//                         setStudentToDeactivate(null);

//                     }

//                 }}

// >

//                 <AlertDialogContent>

//                     <AlertDialogHeader>

//                         <AlertDialogTitle>

//                             Deactivate Student

//                         </AlertDialogTitle>

//                         <AlertDialogDescription>

//                             {studentToDeactivate && (

//                                 <>
//                                     Are you sure you want to deactivate{" "}
//                                     <strong>

//                                         {studentToDeactivate.surname}{" "}
//                                         {studentToDeactivate.first_name}

//                                     </strong>
//                                     ?

//                                     <br />
//                                     <br />

//                                     The student will no longer appear in active
//                                     student lists, but all academic records will
//                                     be preserved.

//                                 </>

//                             )}

//                         </AlertDialogDescription>

//                     </AlertDialogHeader>

//                     <AlertDialogFooter>

//                         <AlertDialogCancel>

//                             Cancel

//                         </AlertDialogCancel>

//                         <AlertDialogAction

//                             className="bg-red-600 hover:bg-red-700"

//                             onClick={async () => {

//                                 try {

//                                     await deactivateStudentMutation.mutateAsync(

//                                         studentToDeactivate.id

//                                     );

//                                     toast.success(

//                                         "Student deactivated successfully."

//                                     );

//                                     setStudentToDeactivate(null);

//                                 } catch (err) {

//                                     toast.error(

//                                         err.response?.data?.message ||

//                                         "Failed to deactivate student."

//                                     );

//                                 }

//                             }}

//                         >

//                             {deactivateStudentMutation.isPending

//                                 ? "Deactivating..."

//                                 : "Deactivate"

//                             }

//                         </AlertDialogAction>

//                     </AlertDialogFooter>

//                 </AlertDialogContent>

//             </AlertDialog>

//         </Card>

//     );


// }

// export default StudentTable;