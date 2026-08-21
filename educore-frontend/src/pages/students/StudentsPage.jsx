import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";

import { Plus } from "lucide-react";

import StudentTable from "../../components/students/StudentTable";

import PageHeader from "../../components/common/PageHeader";


function StudentsPage() {

    return (

        <div
            className="
                w-full
                max-w-full
                space-y-5
                overflow-x-hidden
                sm:space-y-6
            "
        >

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <PageHeader

                title="Students"

                description="Manage all students."

                action={

                    <Button
                        asChild
                        className="
                            w-full
                            sm:w-auto
                        "
                    >

                        <Link
                            to="/students/new"
                            className="
                                flex
                                w-full
                                items-center
                                justify-center
                                sm:w-auto
                            "
                        >

                            <Plus
                                className="
                                    mr-2
                                    h-4
                                    w-4
                                    shrink-0
                                "
                            />

                            Add Student

                        </Link>

                    </Button>

                }

            />


            {/* =========================================
                STUDENT TABLE
            ========================================= */}

            <div
                className="
                    w-full
                    min-w-0
                    overflow-x-auto
                    rounded-xl
                "
            >

                <StudentTable />

            </div>


        </div>

    );

}


export default StudentsPage;