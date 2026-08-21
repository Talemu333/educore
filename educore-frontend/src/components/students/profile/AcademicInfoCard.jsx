import InfoCard from "@/components/common/InfoCard";
import InfoRow from "@/components/common/InfoRow";
import { formatDate } from "@/lib/formatDate";

function AcademicInfoCard({ student }) {

    return (

        <InfoCard title="Academic Information">

            <InfoRow
                label="Class"
                value={student.class_name}
            />

            <InfoRow
                label="Arm"
                value={student.arm_name}
            />

            <InfoRow
                label="Admission Date"
                value={formatDate(student.admission_date)}
            />

            <InfoRow
                label="Admission Number"
                value={student.admission_number}
            />

        </InfoCard>

    );

}

export default AcademicInfoCard;