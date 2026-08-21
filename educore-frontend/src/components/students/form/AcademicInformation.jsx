import FormSection from "../../common/form/FormSection";
import TextField from "../../common/form/TextField";
import DateField from "../../common/form/DateField";
import SelectField from "../../common/form/SelectField";

function AcademicInformation({

    register,

    errors,

    sessions = [],

    classes = [],

    arms = []

}) {

    return (

        <FormSection title="Academic Information">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <DateField

                    label="Admission Date"

                    name="admission_date"

                    register={register}

                    error={errors.admission_date}

                />

                <SelectField

                    label="Academic Session"

                    name="session_id"

                    register={register}

                    options={sessions}

                    optionLabel="session_name"

                    error={errors.session_id}

                />

                <SelectField

                    label="Class"

                    name="class_id"

                    register={register}

                    options={classes}

                    optionLabel="class_name"

                    error={errors.class_id}

                />

                <SelectField

                    label="Arm"

                    name="arm_id"

                    register={register}

                    options={arms}

                    optionLabel="arm_name"

                    error={errors.arm_id}

                />

            </div>

        </FormSection>

    );

}

export default AcademicInformation;