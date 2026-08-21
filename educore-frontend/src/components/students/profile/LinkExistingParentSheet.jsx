import { useMemo, useState } from "react";

import { useRelationships } from "@/hooks/useRelationships";
import { useParents } from "@/hooks/useParents";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent
} from "@/components/ui/Card";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";

import LinkParentDialog from "./LinkParentDialog";


function LinkExistingParentSheet({

    open,

    onOpenChange,

    studentId

}) {

    const [search, setSearch] = useState("");

    const [selectedParent, setSelectedParent] =
        useState(null);

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [relationshipId, setRelationshipId] =
        useState("");

    const [isPrimaryContact, setIsPrimaryContact] =
        useState(false);


    /*
    =========================================
    GET RELATIONSHIPS
    =========================================
    */

    const {
        data: relationships = []
    } = useRelationships();


    /*
    =========================================
    GET PARENTS
    =========================================
    */

    const {
        data: parents = [],
        isLoading
    } = useParents();


    /*
    =========================================
    FILTER PARENTS
    =========================================
    */

    const filteredParents = useMemo(() => {

        const searchTerm =
            search.trim().toLowerCase();


        if (!searchTerm) {

            return parents;

        }


        return parents.filter((parent) => {

            const fullName =
                `${parent.surname || ""} ${parent.first_name || ""}`
                    .toLowerCase();

            const phone =
                parent.phone_number
                    ?.toLowerCase() || "";

            const email =
                parent.email
                    ?.toLowerCase() || "";


            return (

                fullName.includes(searchTerm) ||

                phone.includes(searchTerm) ||

                email.includes(searchTerm)

            );

        });

    }, [
        parents,
        search
    ]);


    /*
    =========================================
    SELECT PARENT
    =========================================
    */

    const handleSelectParent = (parent) => {

        setSelectedParent(parent);

        setRelationshipId("");

        setIsPrimaryContact(false);

    };


    /*
    =========================================
    OPEN LINK DIALOG
    =========================================
    */

    const handleLink = () => {

        if (!selectedParent) {

            return;

        }


        setDialogOpen(true);

    };


    return (

        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >

            <SheetContent
                className="
                    w-full
                    overflow-y-auto
                    sm:max-w-xl
                "
            >

                <SheetHeader>

                    <SheetTitle>

                        Link Existing Parent

                    </SheetTitle>

                </SheetHeader>


                <div className="mt-6 space-y-5">


                    {/* =====================================
                        SEARCH
                    ===================================== */}

                    <div>

                        <Input

                            placeholder="Search parent..."

                            value={search}

                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }

                        />

                    </div>


                    {/* =====================================
                        PARENT LIST
                    ===================================== */}

                    <div
                        className="
                            max-h-[50vh]
                            space-y-3
                            overflow-y-auto
                            pr-1
                        "
                    >

                        {

                            isLoading ? (

                                <p
                                    className="
                                        py-8
                                        text-center
                                        text-sm
                                        text-muted-foreground
                                    "
                                >
                                    Loading parents...
                                </p>

                            ) : filteredParents.length === 0 ? (

                                <Card>

                                    <CardContent
                                        className="
                                            py-8
                                            text-center
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >

                                        No parents found.

                                    </CardContent>

                                </Card>

                            ) : (

                                filteredParents.map(
                                    (parent) => (

                                        <Card
                                            key={parent.id}
                                        >

                                            <CardContent
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-4
                                                    py-4
                                                    sm:flex-row
                                                    sm:items-center
                                                    sm:justify-between
                                                "
                                            >

                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <h4
                                                        className="
                                                            truncate
                                                            font-semibold
                                                        "
                                                    >

                                                        {
                                                            parent.surname
                                                        }{" "}

                                                        {
                                                            parent.first_name
                                                        }

                                                    </h4>


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


                                                <Button

                                                    type="button"

                                                    className="
                                                        w-full
                                                        sm:w-auto
                                                    "

                                                    onClick={() =>
                                                        handleSelectParent(
                                                            parent
                                                        )
                                                    }

                                                >

                                                    Link

                                                </Button>

                                            </CardContent>

                                        </Card>

                                    )
                                )

                            )

                        }

                    </div>


                    {/* =====================================
                        SELECTED PARENT
                    ===================================== */}

                    {

                        selectedParent && (

                            <Card
                                className="
                                    border-primary/20
                                "
                            >

                                <CardContent
                                    className="
                                        space-y-4
                                        py-5
                                    "
                                >

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                text-muted-foreground
                                            "
                                        >
                                            Selected Parent
                                        </p>


                                        <h3
                                            className="
                                                mt-1
                                                font-semibold
                                            "
                                        >

                                            {
                                                selectedParent.first_name
                                            }{" "}

                                            {
                                                selectedParent.surname
                                            }

                                        </h3>

                                    </div>


                                    {/* RELATIONSHIP */}

                                    <div>

                                        <label
                                            className="
                                                mb-2
                                                block
                                                text-sm
                                                font-medium
                                            "
                                        >

                                            Relationship

                                        </label>


                                        <Select

                                            value={
                                                relationshipId
                                            }

                                            onValueChange={
                                                setRelationshipId
                                            }

                                        >

                                            <SelectTrigger>

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


                                    {/* PRIMARY CONTACT */}

                                    <label
                                        className="
                                            flex
                                            cursor-pointer
                                            items-center
                                            gap-3
                                            text-sm
                                        "
                                    >

                                        <input

                                            type="checkbox"

                                            checked={
                                                isPrimaryContact
                                            }

                                            onChange={(event) =>
                                                setIsPrimaryContact(
                                                    event.target.checked
                                                )
                                            }

                                            className="
                                                h-4
                                                w-4
                                            "

                                        />

                                        <span>

                                            Primary Contact

                                        </span>

                                    </label>


                                    {/* LINK BUTTON */}

                                    <Button

                                        type="button"

                                        disabled={
                                            !relationshipId
                                        }

                                        className="
                                            w-full
                                        "

                                        onClick={
                                            handleLink
                                        }

                                    >

                                        Link Parent

                                    </Button>

                                </CardContent>

                            </Card>

                        )

                    }

                </div>

            </SheetContent>


            {/* =====================================
                LINK CONFIRMATION DIALOG
            ===================================== */}

            <LinkParentDialog

                open={dialogOpen}

                onOpenChange={setDialogOpen}

                parent={selectedParent}

                studentId={studentId}

            />

        </Sheet>

    );

}


export default LinkExistingParentSheet;

// import { useState } from "react";
// import { useLinkParent } from "@/hooks/useLinkParent";
// import { useRelationships } from "@/hooks/useRelationships";


// import {
//     Sheet,
//     SheetContent,
//     SheetHeader,
//     SheetTitle
// } from "@/components/ui/sheet";

// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";
// import { useParents } from "@/hooks/useParents";
// import LinkParentDialog from "./LinkParentDialog";

// function LinkExistingParentSheet({

//     open,

//     onOpenChange,

//     studentId

// }) {

//     const [search, setSearch] = useState("");

//     const [selectedParent, setSelectedParent] = useState(null);

//     const [dialogOpen, setDialogOpen] = useState(false);

//     const [relationshipId, setRelationshipId] = useState("");

//     const [isPrimaryContact, setIsPrimaryContact] = useState(false);

//     const linkParentMutation = useLinkParent();

//     const {

//         data: relationships = []

//     } = useRelationships();

//     const {

//         data: parents = [],

//         isLoading

//     } = useParents();

//     return (

//         <Sheet

//             open={open}

//             onOpenChange={onOpenChange}

//         >

//             <SheetContent className="sm:max-w-xl">

//                 <SheetHeader>

//                     <SheetTitle>

//                         Link Existing Parent

//                     </SheetTitle>

//                 </SheetHeader>

//                 <div className="mt-6 space-y-4">

//                     <Input

//                         placeholder="Search parent..."

//                         value={search}

//                         onChange={(e) =>

//                             setSearch(e.target.value)

//                         }

//                     />

//                     {

//                         isLoading

//                             ? (

//                                 <p>Loading...</p>

//                             )

//                             : (

//                                 filteredParents.map((parent) => (

//                                     <Card key={parent.id}>

//                                         <CardContent className="flex items-center justify-between py-4">

//                                             <div>

//                                                 <h4 className="font-semibold">

//                                                     {parent.surname} {parent.first_name}

//                                                 </h4>

//                                                 <p className="text-sm text-muted-foreground">

//                                                     {parent.phone_number}

//                                                 </p>

//                                                 <p className="text-sm text-muted-foreground">

//                                                     {parent.email}

//                                                 </p>

//                                             </div>

//                                             <Button

//                                                 onClick={() => setSelectedParent(parent)}

//                                             >

//                                                 Link

//                                             </Button>

//                                         </CardContent>

//                                     </Card>

//                                 ))

//                             )

//                     }

//                     {

//                         selectedParent && (

//                             <Card className="mt-6">

//                                 <CardContent className="space-y-4 py-5">

//                                     <h3 className="font-semibold">

//                                         Link

//                                         {" "}

//                                         {selectedParent.first_name}

//                                         {" "}

//                                         {selectedParent.surname}

//                                     </h3>

//                                     <Select

//                                         value={relationshipId}

//                                         onValueChange={setRelationshipId}

//                                     >

//                                         <SelectTrigger>

//                                             <SelectValue

//                                                 placeholder="Relationship"

//                                             />

//                                         </SelectTrigger>

//                                         <SelectContent>

//                                             {

//                                                 relationships.map((relationship) => (

//                                                     <SelectItem

//                                                         key={relationship.id}

//                                                         value={relationship.id.toString()}

//                                                     >

//                                                         {relationship.relationship_name}

//                                                     </SelectItem>

//                                                 ))

//                                             }

//                                         </SelectContent>

//                                     </Select>

//                                     <label className="flex items-center gap-2">

//                                         <input

//                                             type="checkbox"

//                                             checked={isPrimaryContact}

//                                             onChange={(e) =>

//                                                 setIsPrimaryContact(

//                                                     e.target.checked

//                                                 )

//                                             }

//                                         />

//                                         Primary Contact

//                                     </label>

//                                     <Button

//                                         onClick={() => {

//                                             setSelectedParent(parent);

//                                             setDialogOpen(true);

//                                         }}

//                                     >

//                                         Link

//                                     </Button>

//                                 </CardContent>

//                             </Card>

//                         )

//                     }

//                 </div>

//             </SheetContent>

//             <LinkParentDialog

//                 open={dialogOpen}

//                 onOpenChange={setDialogOpen}

//                 parent={selectedParent}

//                 studentId={studentId}

//             />

//         </Sheet>

//     );

// }

// export default LinkExistingParentSheet;