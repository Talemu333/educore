import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

function AddParentDialog({

    open,

    onOpenChange

}) {

    return (

        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>

                        Add Parent

                    </DialogTitle>

                </DialogHeader>

                Parent form goes here...

            </DialogContent>

        </Dialog>

    );

}

export default AddParentDialog;