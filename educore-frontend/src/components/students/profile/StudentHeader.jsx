import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent
} from "@/components/ui/card";

import { Pencil } from "lucide-react";

import { Link } from "react-router-dom";


function StudentHeader({ student }) {

    return (

        <Card className="mb-6 overflow-hidden">

            <CardContent
                className="
                    flex
                    flex-col
                    gap-5
                    p-4
                    sm:p-6
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
            >


                {/* =========================================
                    STUDENT INFORMATION
                ========================================= */}

                <div className="flex min-w-0 items-start gap-4">


                    {/* AVATAR */}

                    <Avatar
                        className="
                            h-20
                            w-20
                            shrink-0
                            sm:h-24
                            sm:w-24
                        "
                    >

                        <AvatarImage
                            src={student.photo_url}
                            alt={student.first_name}
                        />

                        <AvatarFallback
                            className="
                                text-xl
                                font-bold
                                sm:text-2xl
                            "
                        >

                            {student.first_name?.charAt(0)}

                            {student.surname?.charAt(0)}

                        </AvatarFallback>

                    </Avatar>


                    {/* STUDENT DETAILS */}

                    <div
                        className="
                            min-w-0
                            space-y-1.5
                            sm:space-y-2
                        "
                    >

                        <h2
                            className="
                                break-words
                                text-xl
                                font-bold
                                leading-tight
                                sm:text-2xl
                            "
                        >

                            {student.surname}{" "}
                            {student.first_name}{" "}
                            {student.middle_name || ""}

                        </h2>


                        <p className="text-sm text-muted-foreground">

                            Admission No:{" "}

                            <span className="font-medium text-foreground">

                                {student.admission_number}

                            </span>

                        </p>


                        <p
                            className="
                                text-sm
                                text-muted-foreground
                            "
                        >

                            {student.class_name}

                            {" • "}

                            {student.arm_name}

                            {" • "}

                            {student.gender}

                        </p>


                        <div className="pt-1">

                            <Badge
                                variant={
                                    student.status === "Active"
                                        ? "default"
                                        : "destructive"
                                }
                            >

                                {student.status}

                            </Badge>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    EDIT BUTTON
                ========================================= */}

                <Link
                    to={`/students/${student.id}/edit`}
                    className="w-full md:w-auto"
                >

                    <Button
                        variant="outline"
                        className="w-full md:w-auto"
                    >

                        <Pencil className="mr-2 h-4 w-4" />

                        Edit Student

                    </Button>

                </Link>

            </CardContent>

        </Card>

    );

}


export default StudentHeader;

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Pencil } from "lucide-react";
// import { Link } from "react-router-dom";

// function StudentHeader({ student }) {

//     return (

//         <Card className="mb-6">

//             <CardContent className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-6">

//                 <div className="flex items-center gap-4">

//                     <Avatar className="h-24 w-24">

//                         <AvatarImage
//                             src={student.photo_url}
//                             alt={student.first_name}
//                         />

//                         <AvatarFallback className="text-2xl font-bold">

//                             {student.first_name?.charAt(0)}
//                             {student.surname?.charAt(0)}

//                         </AvatarFallback>

//                     </Avatar>

//                     <div className="space-y-2">

//                         <h2 className="text-2xl font-bold">

//                             {student.surname} {student.first_name} {student.middle_name}

//                         </h2>

//                         <p className="text-muted-foreground">

//                             Admission No:{" "}

//                             <span className="font-medium text-foreground">

//                                 {student.admission_number}

//                             </span>

//                         </p>

//                         <p className="text-muted-foreground">

//                             {student.class_name} • {student.arm_name} • {student.gender}

//                         </p>

//                         <Badge
//                             variant={
//                                 student.status === "Active"
//                                     ? "default"
//                                     : "destructive"
//                             }
//                         >
//                             {student.status}
//                         </Badge>

//                     </div>

//                 </div>

//                 <Link to={`/students/${student.id}/edit`}>

//                     <Button variant="outline">

//                         <Pencil className="mr-2 h-4 w-4" />

//                         Edit Student

//                     </Button>

//                 </Link>

//             </CardContent>

//         </Card>

//     );

// }

// export default StudentHeader;