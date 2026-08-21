import FormSection from "../../common/form/FormSection";
import SelectField from "../../common/form/SelectField";

function AdditionalInformation({

    register,

    errors,

    states = [],

    nationalities = []

}) {

    const bloodGroups = [

        { id: "A+", name: "A+" },
        { id: "A-", name: "A-" },
        { id: "B+", name: "B+" },
        { id: "B-", name: "B-" },
        { id: "AB+", name: "AB+" },
        { id: "AB-", name: "AB-" },
        { id: "O+", name: "O+" },
        { id: "O-", name: "O-" }

    ];

    const genotypes = [

        { id: "AA", name: "AA" },
        { id: "AS", name: "AS" },
        { id: "SS", name: "SS" },
        { id: "AC", name: "AC" },
        { id: "SC", name: "SC" }

    ];

    return (

        <FormSection title="Additional Information">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <SelectField
                    label="State"
                    name="state_id"
                    register={register}
                    options={states}
                    optionLabel="state_name"
                    error={errors.state_id}
                />

                <SelectField
                    label="Nationality"
                    name="nationality_id"
                    register={register}
                    options={nationalities}
                    optionLabel="nationality_name"
                    error={errors.nationality_id}
                />

                <SelectField
                    label="Blood Group"
                    name="blood_group"
                    register={register}
                    options={bloodGroups}
                    optionLabel="name"
                    error={errors.blood_group}
                />

                <SelectField
                    label="Genotype"
                    name="genotype"
                    register={register}
                    options={genotypes}
                    optionLabel="name"
                    error={errors.genotype}
                />

            </div>

        </FormSection>

    );

}

export default AdditionalInformation;