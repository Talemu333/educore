import AddTeacherSheet from "@/components/teachers/AddTeacherSheet";

function LegacyAddTeacherSheet({ teacher, open, onOpenChange }) {
    return (
        <AddTeacherSheet
            teacherId={teacher?.id ?? null}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
}

export default LegacyAddTeacherSheet;
