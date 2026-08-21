import { useStudent } from "../../hooks/useStudent";

import Loading from "../common/Loading";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";

import StudentHeader from "./profile/StudentHeader";
import PersonalInfoCard from "./profile/PersonalInfoCard";
import AcademicInfoCard from "./profile/AcademicInfoCard";
import AdditionalInfoCard from "./profile/AdditionalInfoCard";

import {
    User,
    Users,
    GraduationCap,
    ClipboardCheck,
    Wallet
} from "lucide-react";

import StudentParentsTab from "./profile/StudentParentsTab";
import StudentResultsTab from "./profile/StudentResultsTab";


function StudentProfile({

    studentId

}) {

    const {

        data: student,

        isLoading,

        error

    } = useStudent(studentId);


    if (isLoading) {

        return <Loading />;

    }


    if (error) {

        return (

            <p className="text-sm text-destructive">

                Failed to load student.

            </p>

        );

    }


    return (

        <div className="space-y-6">


            {/* =========================================
                STUDENT HEADER
            ========================================= */}

            <StudentHeader
                student={student}
            />


            {/* =========================================
                STUDENT TABS
            ========================================= */}

            <Tabs
                defaultValue="profile"
                className="w-full"
            >


                {/* =====================================
                    TAB NAVIGATION

                    Mobile:
                    horizontally scrollable

                    Desktop:
                    five equal columns
                ===================================== */}

                <div className="w-full overflow-x-auto">

                    <TabsList
                        className="
                            flex
                            w-max
                            min-w-full
                            justify-start
                            sm:grid
                            sm:grid-cols-5
                        "
                    >


                        {/* PROFILE */}

                        <TabsTrigger
                            value="profile"
                            className="
                                shrink-0
                                whitespace-nowrap
                                px-4
                            "
                        >

                            <User
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                "
                            />

                            Profile

                        </TabsTrigger>


                        {/* PARENTS */}

                        <TabsTrigger
                            value="parents"
                            className="
                                shrink-0
                                whitespace-nowrap
                                px-4
                            "
                        >

                            <Users
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                "
                            />

                            Parents

                        </TabsTrigger>


                        {/* RESULTS */}

                        <TabsTrigger
                            value="results"
                            className="
                                shrink-0
                                whitespace-nowrap
                                px-4
                            "
                        >

                            <GraduationCap
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                "
                            />

                            Results

                        </TabsTrigger>


                        {/* ATTENDANCE */}

                        <TabsTrigger
                            value="attendance"
                            className="
                                shrink-0
                                whitespace-nowrap
                                px-4
                            "
                        >

                            <ClipboardCheck
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                "
                            />

                            Attendance

                        </TabsTrigger>


                        {/* PAYMENTS */}

                        <TabsTrigger
                            value="payments"
                            className="
                                shrink-0
                                whitespace-nowrap
                                px-4
                            "
                        >

                            <Wallet
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                "
                            />

                            Payments

                        </TabsTrigger>


                    </TabsList>

                </div>


                {/* =====================================
                    PROFILE TAB
                ===================================== */}

                <TabsContent
                    value="profile"
                    className="mt-6"
                >

                    <div
                        className="
                            grid
                            gap-6
                            lg:grid-cols-2
                        "
                    >

                        <PersonalInfoCard
                            student={student}
                        />


                        <AcademicInfoCard
                            student={student}
                        />

                    </div>


                    <div className="mt-6">

                        <AdditionalInfoCard
                            student={student}
                        />

                    </div>

                </TabsContent>


                {/* =====================================
                    PARENTS TAB
                ===================================== */}

                <TabsContent
                    value="parents"
                    className="mt-6"
                >

                    <StudentParentsTab
                        studentId={student.id}
                    />

                </TabsContent>


                {/* =====================================
                    RESULTS TAB
                ===================================== */}

                <TabsContent
                    value="results"
                    className="mt-6"
                >

                    <StudentResultsTab
                        studentId={student.id}
                    />

                </TabsContent>


                {/* =====================================
                    ATTENDANCE TAB
                ===================================== */}

                <TabsContent
                    value="attendance"
                    className="mt-6"
                >

                    <div
                        className="
                            rounded-xl
                            border
                            border-dashed
                            p-8
                            text-center
                            text-sm
                            text-muted-foreground
                        "
                    >

                        Attendance coming soon...

                    </div>

                </TabsContent>


                {/* =====================================
                    PAYMENTS TAB
                ===================================== */}

                <TabsContent
                    value="payments"
                    className="mt-6"
                >

                    <div
                        className="
                            rounded-xl
                            border
                            border-dashed
                            p-8
                            text-center
                            text-sm
                            text-muted-foreground
                        "
                    >

                        Payments coming soon...

                    </div>

                </TabsContent>


            </Tabs>

        </div>

    );

}


export default StudentProfile;

// import { useStudent } from "../../hooks/useStudent";

// import Loading from "../common/Loading";

// import {Tabs,TabsContent,TabsList,TabsTrigger} from "@/components/ui/tabs";
// import StudentHeader from "./profile/StudentHeader";
// import PersonalInfoCard from "./profile/PersonalInfoCard";
// import AcademicInfoCard from "./profile/AcademicInfoCard";
// import AdditionalInfoCard from "./profile/AdditionalInfoCard";
// import {User,Users,GraduationCap,ClipboardCheck,Wallet} from "lucide-react";
// import StudentParentsTab from "./profile/StudentParentsTab";
// import StudentResultsTab from "./profile/StudentResultsTab";


// function StudentProfile({

//     studentId

// }) {

//     const {

//         data: student,

//         isLoading,

//         error

//     } = useStudent(studentId);

//     if (isLoading) {

//         return <Loading />;

//     }

//     if (error) {

//         return <p>Failed to load student.</p>;

//     }

//     return (

//         <>

//             <StudentHeader student={student} />

//             <Tabs defaultValue="profile">

//                 <TabsList className="grid w-full grid-cols-5">

//                     <TabsTrigger value="profile">
//                         <User className="mr-2 h-4 w-4" />
//                         Profile
//                     </TabsTrigger>

//                     <TabsTrigger value="parents">
//                         <Users className="mr-2 h-4 w-4" />
//                         Parents
//                     </TabsTrigger>

//                     <TabsTrigger value="results">
//                         <GraduationCap className="mr-2 h-4 w-4" />
//                         Results
//                     </TabsTrigger>

//                     <TabsTrigger value="attendance">
//                         <ClipboardCheck className="mr-2 h-4 w-4" />
//                         Attendance
//                     </TabsTrigger>

//                     <TabsTrigger value="payments">
//                         <Wallet className="mr-2 h-4 w-4" />
//                         Payments
//                     </TabsTrigger>

//                 </TabsList>

//                 <TabsContent value="profile">

//                     <div className="grid gap-6 lg:grid-cols-2">

//                         < PersonalInfoCard student={student} />

//                         <AcademicInfoCard student={student} />

//                     </div>

//                     <div className="mt-6">

//                         <AdditionalInfoCard student={student} />

//                     </div>

//                 </TabsContent>

//                 <TabsContent value="parents">

//                     <StudentParentsTab studentId={student.id} />

//                 </TabsContent>

//                 <TabsContent value="results">

//                     <StudentResultsTab
//                         studentId={student.id}
//                     />

//                 </TabsContent>

//                 <TabsContent value="attendance">

//                     Attendance coming soon...

//                 </TabsContent>

//                 <TabsContent value="payments">

//                     Payments coming soon...

//                 </TabsContent>

//             </Tabs>

//         </>

//     );

// }

// export default StudentProfile;