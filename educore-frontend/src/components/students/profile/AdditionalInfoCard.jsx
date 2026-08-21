import InfoCard from "@/components/common/InfoCard";
import InfoRow from "@/components/common/InfoRow";

function AdditionalInfoCard({ student }) {

    return (

        <InfoCard title="Additional Information">

            <InfoRow
                label="Blood Group"
                value={student.blood_group}
            />

            <InfoRow
                label="Genotype"
                value={student.genotype}
            />

            <InfoRow
                label="State"
                value={student.state_name}
            />

            <InfoRow
                label="Nationality"
                value={student.nationality_name}
            />

            <InfoRow
                label="Address"
                value={student.residential_address}
            />

        </InfoCard>

    );

}

export default AdditionalInfoCard;