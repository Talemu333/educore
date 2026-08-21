import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { UserPlus } from "lucide-react";

import { useTeachers } from "@/hooks/useTeachers";
import { useDeactivateTeacher } from "@/hooks/useDeactivateTeacher";

import AddTeacherSheet from "./AddTeacherSheet";


function TeacherList() {

    const [open, setOpen] = useState(false);

    const [editingTeacher, setEditingTeacher] = useState(null);


    const {

        data: teachers = [],

        isLoading,

        error

    } = useTeachers();


    const deactivateMutation = useDeactivateTeacher();



    if (isLoading) {

        return <p>Loading teachers...</p>;

    }


    if (error) {

        return <p>Failed to load teachers.</p>;

    }



    return (

        <div className="space-y-4">


            <div className="flex justify-between items-center">


                <h2 className="text-xl font-semibold">

                    Teachers

                </h2>


                <Button

                    onClick={() => {

                        setEditingTeacher(null);

                        setOpen(true);

                    }}

                >

                    <UserPlus className="mr-2 h-4 w-4" />

                    Add Teacher

                </Button>


            </div>



            {

                teachers.length === 0 ? (

                    <Card>

                        <CardContent className="py-10 text-center">

                            No teachers found.

                        </CardContent>

                    </Card>

                ) : (


                    teachers.map((teacher) => (


                        <Card key={teacher.id}>


                            <CardContent className="flex justify-between items-center py-5">


                                <div className="flex gap-4">


                                    <Avatar>


                                        <AvatarFallback>

                                            {teacher.full_name

                                                ?.charAt(0)

                                            }

                                        </AvatarFallback>


                                    </Avatar>



                                    <div>


                                        <h3 className="font-semibold">

                                            {teacher.full_name}

                                        </h3>


                                        <p className="text-sm text-muted-foreground">

                                            Staff No:

                                            {" "}

                                            {teacher.staff_number}

                                        </p>


                                        <p className="text-sm">

                                            {teacher.department_name || "-"}

                                        </p>


                                        <p className="text-sm">

                                            {teacher.qualification_name || "-"}

                                        </p>



                                    </div>


                                </div>




                                <div className="flex gap-2 items-center">


                                    {

                                        teacher.status ? (

                                            <Badge>

                                                Active

                                            </Badge>

                                        ) : (

                                            <Badge variant="destructive">

                                                Inactive

                                            </Badge>

                                        )

                                    }



                                    <Button

                                        variant="outline"

                                        size="sm"

                                        onClick={() => {

                                            setEditingTeacher(teacher);

                                            setOpen(true);

                                        }}

                                    >

                                        Edit

                                    </Button>



                                    {

                                        teacher.status && (

                                            <Button

                                                variant="destructive"

                                                size="sm"

                                                onClick={() => {


                                                    const confirm = window.confirm(

                                                        `Deactivate ${teacher.full_name}?`

                                                    );


                                                    if (!confirm) return;


                                                    deactivateMutation.mutate(

                                                        teacher.id

                                                    );


                                                }}

                                            >

                                                Deactivate

                                            </Button>

                                        )

                                    }


                                </div>



                            </CardContent>


                        </Card>


                    ))

                )

            }



            <AddTeacherSheet

                open={open}

                onOpenChange={(value) => {


                    setOpen(value);


                    if (!value) {

                        setEditingTeacher(null);

                    }


                }}

                teacher={editingTeacher}

            />


        </div>

    );

}


export default TeacherList;