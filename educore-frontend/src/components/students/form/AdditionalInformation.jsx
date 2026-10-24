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
                    label="State *"
                    name="state_id"
                    register={register}
                    options={states}
                    optionLabel="state_name"
                    error={errors.state_id}
                />

                <SelectField
                    label="Nationality *"
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

                <div className="md:col-span-2">
                    <label htmlFor="profile_image_url" className="mb-1.5 block text-sm font-medium text-slate-700">Profile picture URL (Cloudinary)</label>
                    <input id="profile_image_url" type="url" placeholder="https://res.cloudinary.com/..." {...register("profile_image_url")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
                    <p className="mt-1 text-xs text-slate-500">Paste the secure Cloudinary image link. EduProw stores the link only.</p>
                    {errors.profile_image_url && <p className="mt-1 text-xs text-red-600">{errors.profile_image_url.message}</p>}
                </div>

            </div>

        </FormSection>

    );

}

export default AdditionalInformation;