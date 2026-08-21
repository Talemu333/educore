import InfoCard from "@/components/common/InfoCard";
import InfoRow from "@/components/common/InfoRow";
import { formatDate } from "@/lib/formatDate";

function PersonalInfoCard({ student }) {

    return (

        <InfoCard title="Personal Information">

            <InfoRow
                label="Gender"
                value={student.gender}
            />

            <InfoRow
                label="Date of Birth"
                value={formatDate(student.date_of_birth)}
            />

            <InfoRow
                label="Religion"
                value={student.religion}
            />

        </InfoCard>

    );

}

export default PersonalInfoCard;