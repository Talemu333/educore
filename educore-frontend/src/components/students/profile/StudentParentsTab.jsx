import { useState } from "react";
import { useUnlinkParent } from "@/hooks/useUnlinkParent";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { useStudentParents } from "@/hooks/useStudentParents";
import AddParentSheet from "./AddParentSheet";
import LinkParentSheet from "../../parents/LinkParentSheet";

function StudentParentsTab({ studentId }) {

    const [addOpen, setAddOpen] = useState(false);

    const [linkOpen, setLinkOpen] = useState(false);

    const [editingParent, setEditingParent] = useState(null);

    const {

        data: parents = [],

        isLoading,

        error

    } = useStudentParents(studentId);

    const unlinkParentMutation = useUnlinkParent();

    if (isLoading) {

        return <p>Loading parents...</p>;

    }

    if (error) {

        return <p>Failed to load parents.</p>;

    }

    return (

        <div className="space-y-4">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <h3 className="text-lg font-semibold">

                    Parents & Guardians

                </h3>

                {/* Action Buttons */}
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                    <Button

                        className="w-full sm:w-auto"

                        onClick={() => {

                            setEditingParent(null);

                            setAddOpen(true);

                        }}

                    >

                        <UserPlus className="mr-2 h-4 w-4" />

                        Add Parent

                    </Button>

                    <Button

                        variant="outline"

                        className="w-full sm:w-auto"

                        onClick={() => {

                            setLinkOpen(true);

                        }}

                    >

                        Link Existing

                    </Button>

                </div>

            </div>


            {/* Empty State */}

            {

                parents.length === 0 ? (

                    <Card>

                        <CardContent className="py-12 px-4 text-center">

                            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

                            <h3 className="text-lg font-semibold">

                                No Parent Linked

                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">

                                This student has no linked parent or guardian.

                            </p>

                        </CardContent>

                    </Card>

                ) : (

                    /* Parent List */

                    parents.map((parent) => (

                        <Card key={parent.id}>

                            <CardContent className="p-4 sm:py-5">

                                {/* Parent Information + Actions */}

                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                                    {/* Parent Information */}

                                    <div className="flex min-w-0 gap-3 sm:gap-4">

                                        <Avatar className="h-12 w-12 shrink-0">

                                            <AvatarFallback>

                                                {parent.first_name?.charAt(0)}

                                                {parent.surname?.charAt(0)}

                                            </AvatarFallback>

                                        </Avatar>

                                        <div className="min-w-0 space-y-1">

                                            {/* Name + Badge */}

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h4 className="font-semibold break-words">

                                                    {parent.surname}{" "}

                                                    {parent.first_name}

                                                </h4>

                                                {

                                                    parent.is_primary_contact && (

                                                        <Badge>

                                                            Primary

                                                        </Badge>

                                                    )

                                                }

                                            </div>

                                            {/* Relationship */}

                                            <p className="text-sm text-muted-foreground">

                                                {parent.relationship_name}

                                            </p>

                                            {/* Phone */}

                                            <p className="text-sm break-all">

                                                📞 {parent.phone_number}

                                            </p>

                                            {/* Email */}

                                            <p className="text-sm break-all">

                                                ✉️ {parent.email || "-"}

                                            </p>

                                        </div>

                                    </div>


                                    {/* Action Buttons */}

                                    <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">

                                        <Button

                                            variant="outline"

                                            size="sm"

                                            className="flex-1 sm:flex-none"

                                            onClick={() => {

                                                setEditingParent(parent);

                                                setAddOpen(true);

                                            }}

                                        >

                                            Edit

                                        </Button>

                                        <Button

                                            variant="destructive"

                                            size="sm"

                                            className="flex-1 sm:flex-none"

                                            onClick={() => {

                                                const confirmed = window.confirm(

                                                    `Remove ${parent.first_name} ${parent.surname} from this student?`

                                                );

                                                if (!confirmed) return;

                                                unlinkParentMutation.mutate({

                                                    studentId,

                                                    parentId: parent.id

                                                });

                                            }}

                                        >

                                            Remove

                                        </Button>

                                    </div>

                                </div>

                            </CardContent>

                        </Card>

                    ))

                )

            }


            {/* Add / Edit Parent */}

            <AddParentSheet

                studentId={studentId}

                parent={editingParent}

                open={addOpen}

                onOpenChange={(value) => {

                    setAddOpen(value);

                    if (!value) {

                        setEditingParent(null);

                    }

                }}

            />


            {/* Link Existing Parent */}

            <LinkParentSheet

                studentId={studentId}

                open={linkOpen}

                onOpenChange={setLinkOpen}

            />

        </div>

    );

}

export default StudentParentsTab;

// import { useState } from "react";
// import { useUnlinkParent } from "@/hooks/useUnlinkParent";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { UserPlus, Users } from "lucide-react";
// import { useStudentParents } from "@/hooks/useStudentParents";
// import AddParentSheet from "./AddParentSheet";
// import LinkParentSheet from "../../parents/LinkParentSheet";

// function StudentParentsTab({ studentId }) {

//     const [addOpen, setAddOpen] = useState(false);

//     const [linkOpen, setLinkOpen] = useState(false);

//     const [editingParent, setEditingParent] = useState(null);

//     const {

//         data: parents = [],

//         isLoading,

//         error

//     } = useStudentParents(studentId);

//     const unlinkParentMutation = useUnlinkParent();

//     if (isLoading) {

//         return <p>Loading parents...</p>;

//     }

//     if (error) {

//         return <p>Failed to load parents.</p>;

//     }

//     return (

//         <div className="space-y-4">

//             <div className="flex items-center justify-between">

//                 <h3 className="text-lg font-semibold">

//                     Parents & Guardians

//                 </h3>

//                 <div className="flex gap-2">

//                     <Button

//                         onClick={() => {

//                             setEditingParent(null);

//                             setAddOpen(true);

//                         }}

//                     >

//                         <UserPlus className="mr-2 h-4 w-4" />

//                         Add Parent

//                     </Button>

//                     <Button

//                         variant="outline"

//                         onClick={() => {

//                             setLinkOpen(true);

//                         }}

//                     >

//                         Link Existing

//                     </Button>

//                 </div>

//             </div>

//             {

//                 parents.length === 0 ? (

//                     <Card>

//                         <CardContent className="py-12 text-center">

//                             <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

//                             <h3 className="text-lg font-semibold">

//                                 No Parent Linked

//                             </h3>

//                             <p className="mt-2 text-muted-foreground">

//                                 This student has no linked parent or guardian.

//                             </p>

//                         </CardContent>

//                     </Card>

//                 ) : (

//                     parents.map((parent) => (

//                         <Card key={parent.id}>

//                             <CardContent className="flex items-start justify-between py-5">

//                                 <div className="flex gap-4">

//                                     <Avatar className="h-12 w-12">

//                                         <AvatarFallback>

//                                             {parent.first_name?.charAt(0)}

//                                             {parent.surname?.charAt(0)}

//                                         </AvatarFallback>

//                                     </Avatar>

//                                     <div className="space-y-1">

//                                         <div className="flex items-center gap-2">

//                                             <h4 className="font-semibold">

//                                                 {parent.surname} {parent.first_name}

//                                             </h4>

//                                             {

//                                                 parent.is_primary_contact && (

//                                                     <Badge>

//                                                         Primary

//                                                     </Badge>

//                                                 )

//                                             }

//                                         </div>

//                                         <p className="text-sm text-muted-foreground">

//                                             {parent.relationship_name}

//                                         </p>

//                                         <p className="text-sm">

//                                             📞 {parent.phone_number}

//                                         </p>

//                                         <p className="text-sm">

//                                             ✉️ {parent.email || "-"}

//                                         </p>

//                                     </div>

//                                 </div>

//                                 <div className="flex gap-2">

//                                     <Button

//                                         variant="outline"

//                                         size="sm"

//                                         onClick={() => {

//                                             setEditingParent(parent);

//                                             setAddOpen(true);

//                                         }}

//                                     >

//                                         Edit

//                                     </Button>

//                                     <Button

//                                         variant="destructive"

//                                         size="sm"

//                                         onClick={() => {

//                                             const confirmed = window.confirm(

//                                                 `Remove ${parent.first_name} ${parent.surname} from this student?`

//                                             );

//                                             if (!confirmed) return;

//                                             unlinkParentMutation.mutate({

//                                                 studentId,

//                                                 parentId: parent.id

//                                             });

//                                         }}

//                                     >

//                                         Remove

//                                     </Button>

//                                 </div>

//                             </CardContent>

//                         </Card>

//                     ))

//                 )

//             }

//             <AddParentSheet

//                 studentId={studentId}

//                 parent={editingParent}

//                 open={addOpen}

//                 onOpenChange={(value) => {

//                     setAddOpen(value);

//                     if (!value) {

//                         setEditingParent(null);

//                     }

//                 }}

//             />

//             <LinkParentSheet

//                 studentId={studentId}

//                 open={linkOpen}

//                 onOpenChange={setLinkOpen}

//             />

//         </div>

//     );

// }

// export default StudentParentsTab;