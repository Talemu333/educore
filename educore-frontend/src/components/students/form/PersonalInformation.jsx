import FormSection from "../../common/form/FormSection";
import TextField from "../../common/form/TextField";
import DateField from "../../common/form/DateField";
import SelectField from "../../common/form/SelectField";
import TextAreaField from "../../common/form/TextAreaField";

function PersonalInformation({
    register,
    errors
}) {

    return (

        <FormSection title="Personal Information">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <TextField
                    label="Surname"
                    name="surname"
                    register={register}
                    error={errors.surname}
                />

                <TextField
                    label="First Name"
                    name="first_name"
                    register={register}
                    error={errors.first_name}
                />

                <TextField
                    label="Middle Name"
                    name="middle_name"
                    register={register}
                    error={errors.middle_name}
                />

                <SelectField
                    label="Gender"
                    name="gender"
                    register={register}
                    options={[
                        { id: "Male", name: "Male" },
                        { id: "Female", name: "Female" }
                    ]}
                    optionLabel="name"
                    optionValue="id"
                    error={errors.gender}
                />

                <DateField
                    label="Date of Birth"
                    name="date_of_birth"
                    register={register}
                    error={errors.date_of_birth}
                />

                <TextAreaField
                    label="Residential Address"
                    name="residential_address"
                    register={register}
                    error={errors.residential_address}
                    rows={3}
                />

            </div>

        </FormSection>

    );

}

export default PersonalInformation;

// import FormSection from "../../common/form/FormSection";
// import TextField from "../../common/form/TextField";
// import RadioGroupField from "../../common/form/RadioGroupField";
// import DateField from "../../common/form/DateField";
// import SelectField from "../../common/form/SelectField";
// import TextAreaField from "../../common/form/TextAreaField";

// function PersonalInformation({

//     register,

//     errors

// }) {

//     return (

//         <FormSection title="Personal Information">

//             <div className="grid grid-cols-3 gap-6">

//                 <TextField
//                     label="Surname"
//                     name="surname"
//                     register={register}
//                     error={errors.surname}
//                 />

//                 <TextField
//                     label="First Name"
//                     name="first_name"
//                     register={register}
//                     error={errors.first_name}
//                 />

//                 <TextField
//                     label="Middle Name"
//                     name="middle_name"
//                     register={register}
//                     error={errors.middle_name}
//                 />
//                 <SelectField
//                     label="Gender"
//                     name="gender"
//                     register={register}
//                     options={[
//                         { id: "Male", name: "Male" },
//                         { id: "Female", name: "Female" }
//                     ]}
//                     optionLabel="name"
//                     optionValue="id"
//                     error={errors.gender}
//                 />
//                 <DateField

//                     label="Date of Birth"

//                     name="date_of_birth"

//                     register={register}

//                     error={errors.date_of_birth}

//                 />
//                 {/* <TextAreaField
//                     label="Residential Address"
//                     name="residential_address"
//                     register={register}
//                     error={errors.residential_address}
//                 /> */}

//                 <TextAreaField

//                     label="Residential Address"

//                     name="residential_address"

//                     register={register}

//                     error={errors.residential_address}

//                     rows={3}

//                 />

//             </div>

//         </FormSection>

//     );

// }

// export default PersonalInformation;