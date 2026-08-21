import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import ParentForm from "./ParentForm";


function AddParentSheet({

    studentId,

    parent,

    open,

    onOpenChange,

}) {

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

                        {
                            parent
                                ? "Edit Parent"
                                : "Add Parent"
                        }

                    </SheetTitle>

                </SheetHeader>


                <div className="mt-6">

                    <ParentForm

                        studentId={studentId}

                        parent={parent}

                        onSuccess={() =>
                            onOpenChange(false)
                        }

                    />

                </div>

            </SheetContent>

        </Sheet>

    );

}


export default AddParentSheet;

// import {
//     Sheet,
//     SheetContent,
//     SheetHeader,
//     SheetTitle,
// } from "@/components/ui/sheet";

// import ParentForm from "./ParentForm";

// function AddParentSheet({

//     studentId,

//     parent,

//     open,

//     onOpenChange,

// }) {

//     return (

//         <Sheet
//             open={open}
//             onOpenChange={onOpenChange}
//         >

//             <SheetContent className="sm:max-w-xl overflow-y-auto">

//                 <SheetHeader>

//                     <SheetTitle>

//                         {

//                             parent

//                                 ? "Edit Parent"

//                                 : "Add Parent"

//                         }

//                     </SheetTitle>

//                 </SheetHeader>

//                 <div className="mt-6">

//                     <ParentForm

//                         studentId={studentId}

//                         parent={parent}

//                         onSuccess={() => onOpenChange(false)}

//                     />

//                 </div>

//             </SheetContent>

//         </Sheet>

//     );

// }

// export default AddParentSheet;