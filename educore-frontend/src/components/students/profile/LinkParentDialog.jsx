import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useRelationships } from "@/hooks/useRelationships";
import { useLinkParent } from "@/hooks/useLinkParent";


function LinkParentDialog({

    open,

    onOpenChange,

    parent,

    studentId

}) {

    const {

        data: relationships = []

    } = useRelationships();


    const linkParentMutation =
        useLinkParent();


    const [
        relationshipId,
        setRelationshipId
    ] = useState("");


    const [
        isPrimaryContact,
        setIsPrimaryContact
    ] = useState(false);


    if (!parent) {

        return null;

    }


    /*
    =========================================
    HANDLE LINK
    =========================================
    */

    const handleLink = () => {

        if (!relationshipId) {

            return;

        }


        linkParentMutation.mutate(

            {

                student_id:
                    studentId,

                parent_id:
                    parent.id,

                relationship_id:
                    Number(relationshipId),

                is_primary_contact:
                    isPrimaryContact

            },

            {

                onSuccess: () => {

                    setRelationshipId("");

                    setIsPrimaryContact(false);

                    onOpenChange(false);

                }

            }

        );

    };


    /*
    =========================================
    CLOSE DIALOG
    =========================================
    */

    const handleOpenChange = (value) => {

        if (!value) {

            setRelationshipId("");

            setIsPrimaryContact(false);

        }


        onOpenChange(value);

    };


    return (

        <Dialog

            open={open}

            onOpenChange={handleOpenChange}

        >

            <DialogContent
                className="
                    w-[calc(100%-2rem)]
                    max-w-md
                    rounded-xl
                "
            >

                <DialogHeader>

                    <DialogTitle>

                        Link Parent

                    </DialogTitle>

                </DialogHeader>


                <div className="space-y-5">


                    {/* =====================================
                        PARENT INFORMATION
                    ===================================== */}

                    <div
                        className="
                            rounded-lg
                            border
                            bg-muted/30
                            p-4
                        "
                    >

                        <h3
                            className="
                                break-words
                                font-semibold
                            "
                        >

                            {
                                parent.surname
                            }{" "}

                            {
                                parent.first_name
                            }

                        </h3>


                        <p
                            className="
                                mt-1
                                break-all
                                text-sm
                                text-muted-foreground
                            "
                        >

                            {
                                parent.phone_number
                            }

                        </p>


                        {

                            parent.email && (

                                <p
                                    className="
                                        mt-1
                                        break-all
                                        text-sm
                                        text-muted-foreground
                                    "
                                >

                                    {
                                        parent.email
                                    }

                                </p>

                            )

                        }

                    </div>


                    {/* =====================================
                        RELATIONSHIP
                    ===================================== */}

                    <div>

                        <Label
                            className="
                                mb-2
                                block
                            "
                        >

                            Relationship

                        </Label>


                        <Select

                            value={
                                relationshipId
                            }

                            onValueChange={
                                setRelationshipId
                            }

                        >

                            <SelectTrigger
                                className="w-full"
                            >

                                <SelectValue
                                    placeholder="Select relationship"
                                />

                            </SelectTrigger>


                            <SelectContent>

                                {

                                    relationships.map(
                                        (relationship) => (

                                            <SelectItem

                                                key={
                                                    relationship.id
                                                }

                                                value={
                                                    relationship.id.toString()
                                                }

                                            >

                                                {
                                                    relationship.relationship_name
                                                }

                                            </SelectItem>

                                        )
                                    )

                                }

                            </SelectContent>

                        </Select>

                    </div>


                    {/* =====================================
                        PRIMARY CONTACT
                    ===================================== */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            border
                            p-3
                        "
                    >

                        <Checkbox

                            id="primary"

                            checked={
                                isPrimaryContact
                            }

                            onCheckedChange={
                                setIsPrimaryContact
                            }

                        />


                        <Label
                            htmlFor="primary"
                            className="
                                cursor-pointer
                                text-sm
                                font-medium
                            "
                        >

                            Primary Contact

                        </Label>

                    </div>

                </div>


                {/* =====================================
                    ACTIONS
                ===================================== */}

                <DialogFooter
                    className="
                        flex-col-reverse
                        gap-2
                        sm:flex-row
                        sm:justify-end
                    "
                >

                    <Button

                        type="button"

                        variant="outline"

                        className="
                            w-full
                            sm:w-auto
                        "

                        disabled={
                            linkParentMutation.isPending
                        }

                        onClick={() =>
                            handleOpenChange(false)
                        }

                    >

                        Cancel

                    </Button>


                    <Button

                        type="button"

                        className="
                            w-full
                            sm:w-auto
                        "

                        disabled={

                            !relationshipId ||

                            linkParentMutation.isPending

                        }

                        onClick={
                            handleLink
                        }

                    >

                        {

                            linkParentMutation.isPending

                                ? "Linking..."

                                : "Link Parent"

                        }

                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}


export default LinkParentDialog;

// import { useState } from "react";

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter
// } from "@/components/ui/dialog";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from "@/components/ui/select";

// import { Button } from "@/components/ui/Button";

// import { Checkbox } from "@/components/ui/checkbox";

// import { Label } from "@/components/ui/label";

// import { useRelationships } from "@/hooks/useRelationships";
// import { useLinkParent } from "@/hooks/useLinkParent";

// function LinkParentDialog({

//     open,

//     onOpenChange,

//     parent,

//     studentId

// }) {

//     const {

//         data: relationships = []

//     } = useRelationships();

//     const linkParentMutation = useLinkParent();

//     const [relationshipId, setRelationshipId] = useState("");

//     const [isPrimaryContact, setIsPrimaryContact] = useState(false);

//     if (!parent) return null;

//     const handleLink = () => {

//         linkParentMutation.mutate(

//             {

//                 student_id: studentId,

//                 parent_id: parent.id,

//                 relationship_id: Number(relationshipId),

//                 is_primary_contact: isPrimaryContact

//             },

//             {

//                 onSuccess: () => {

//                     setRelationshipId("");

//                     setIsPrimaryContact(false);

//                     onOpenChange(false);

//                 }

//             }

//         );

//     };

//     return (

//         <Dialog

//             open={open}

//             onOpenChange={onOpenChange}

//         >

//             <DialogContent>

//                 <DialogHeader>

//                     <DialogTitle>

//                         Link Parent

//                     </DialogTitle>

//                 </DialogHeader>

//                 <div className="space-y-5">

//                     <div>

//                         <h3 className="font-semibold">

//                             {parent.surname} {parent.first_name}

//                         </h3>

//                         <p className="text-sm text-muted-foreground">

//                             {parent.phone_number}

//                         </p>

//                     </div>

//                     <Select

//                         value={relationshipId}

//                         onValueChange={setRelationshipId}

//                     >

//                         <SelectTrigger>

//                             <SelectValue

//                                 placeholder="Relationship"

//                             />

//                         </SelectTrigger>

//                         <SelectContent>

//                             {

//                                 relationships.map((relationship) => (

//                                     <SelectItem

//                                         key={relationship.id}

//                                         value={relationship.id.toString()}

//                                     >

//                                         {relationship.relationship_name}

//                                     </SelectItem>

//                                 ))

//                             }

//                         </SelectContent>

//                     </Select>

//                     <div className="flex items-center space-x-2">

//                         <Checkbox

//                             id="primary"

//                             checked={isPrimaryContact}

//                             onCheckedChange={setIsPrimaryContact}

//                         />

//                         <Label htmlFor="primary">

//                             Primary Contact

//                         </Label>

//                     </div>

//                 </div>

//                 <DialogFooter>

//                     <Button

//                         variant="outline"

//                         onClick={() => onOpenChange(false)}

//                     >

//                         Cancel

//                     </Button>

//                     <Button

//                         disabled={

//                             !relationshipId ||

//                             linkParentMutation.isPending

//                         }

//                         onClick={handleLink}

//                     >

//                         {

//                             linkParentMutation.isPending

//                                 ? "Linking..."

//                                 : "Link Parent"

//                         }

//                     </Button>

//                 </DialogFooter>

//             </DialogContent>

//         </Dialog>

//     );

// }

// export default LinkParentDialog;