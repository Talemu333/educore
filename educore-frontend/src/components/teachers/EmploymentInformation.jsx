import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { useDepartments } from "@/hooks/useDepartments";
import { useQualifications } from "@/hooks/useQualifications";
import { useStates } from "@/hooks/useStates";
import { useNationalities } from "@/hooks/useNationalities";

function EmploymentInformation({

    control,

    register,

    errors

}) {

    const { data: departments = [] } = useDepartments();

    const { data: qualifications = [] } = useQualifications();

    const { data: states = [] } = useStates();

    const { data: nationalities = [] } = useNationalities();

    return (

        <div className="space-y-5">

            <h3 className="text-lg font-semibold">

                Employment Information

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Department */}

                <div>

                    <label>Department</label>

                    <Controller

                        control={control}

                        name="department_id"

                        render={({ field }) => (

                            <Select

                                value={field.value?.toString() ?? ""}

                                onValueChange={(value) =>
                                    field.onChange(value)
                                }

                            >

                                <SelectTrigger>

                                    <SelectValue>
                                        {departments.find(
                                            d => d.id.toString() === field.value?.toString()
                                        )?.department_name}
                                    </SelectValue>

                                </SelectTrigger>

                                <SelectContent>

                                    {

                                        departments.map((department) => (

                                            <SelectItem

                                                key={department.id}

                                                value={department.id.toString()}

                                            >

                                                {department.department_name}

                                            </SelectItem>

                                        ))

                                    }

                                </SelectContent>

                            </Select>

                        )}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.department_id?.message}

                    </p>

                </div>

                {/* Qualification */}

                <div>

                    <label>Qualification</label>

                    <Controller

                        control={control}

                        name="qualification_id"

                        render={({ field }) => (

                            <Select

                                value={field.value?.toString() ?? ""}

                                onValueChange={field.onChange}

                            >

                                <SelectTrigger>

                                    <SelectValue>
                                        {
                                            qualifications.find(
                                                q => q.id.toString() === field.value?.toString()
                                            )?.qualification_name
                                        }
                                    </SelectValue>

                                </SelectTrigger>

                                <SelectContent>

                                    {

                                        qualifications.map((qualification) => (

                                            <SelectItem

                                                key={qualification.id}

                                                value={qualification.id.toString()}

                                            >

                                                {qualification.qualification_name}

                                            </SelectItem>

                                        ))

                                    }

                                </SelectContent>

                            </Select>

                        )}

                    />

                </div>

                {/* Employment Date */}

                <div>

                    <label>

                        Employment Date

                    </label>

                    <Input

                        type="date"

                        {...register("employment_date")}

                    />

                </div>

                {/* State */}

                <div>

                    <label>

                        State

                    </label>

                    <Controller

                        control={control}

                        name="state_id"

                        render={({ field }) => (

                            <Select

                                value={field.value?.toString() ?? ""}

                                onValueChange={(value) =>

                                    field.onChange(value)

                                }

                            >

                                <SelectTrigger>

                                    <SelectValue>
                                        {
                                            states.find(
                                                s => s.id.toString() === field.value?.toString()
                                            )?.state_name
                                        }
                                    </SelectValue>

                                </SelectTrigger>

                                <SelectContent>

                                    {

                                        states.map((state) => (

                                            <SelectItem

                                                key={state.id}

                                                value={state.id.toString()}

                                            >

                                                {state.state_name}

                                            </SelectItem>

                                        ))

                                    }

                                </SelectContent>

                            </Select>

                        )}

                    />

                </div>

                {/* Nationality */}

                <div>

                    <label>

                        Nationality

                    </label>

                    <Controller

                        control={control}

                        name="nationality_id"

                        render={({ field }) => (

                            <Select

                                value={field.value?.toString() ?? ""}

                                onValueChange={(value) =>

                                    field.onChange(value)

                                }

                            >

                                <SelectTrigger>

                                    <SelectValue>
                                        {
                                            nationalities.find(
                                                n => n.id.toString() === field.value?.toString()
                                            )?.nationality_name
                                        }
                                    </SelectValue>

                                </SelectTrigger>

                                <SelectContent>

                                    {

                                        nationalities.map((nationality) => (

                                            <SelectItem

                                                key={nationality.id}

                                                value={nationality.id.toString()}

                                            >

                                                {nationality.nationality_name}

                                            </SelectItem>

                                        ))

                                    }

                                </SelectContent>

                            </Select>

                        )}

                    />

                </div>

            </div>

        </div>

    );

}

export default EmploymentInformation;