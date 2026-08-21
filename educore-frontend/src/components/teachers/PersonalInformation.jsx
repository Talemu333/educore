import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";

import { Controller } from "react-hook-form";

function PersonalInformation({

    register,

    control,

    errors

}) {

    return (

        <div className="space-y-5">

            <h3 className="text-lg font-semibold">

                Personal Information

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                    <label>Surname</label>

                    <Input

                        {...register("surname")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.surname?.message}

                    </p>

                </div>

                <div>

                    <label>First Name</label>

                    <Input

                        {...register("first_name")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.first_name?.message}

                    </p>

                </div>

                <div>

                    <label>Middle Name</label>

                    <Input

                        {...register("middle_name")}

                    />

                </div>

                <div>

                    <label>Gender</label>

                    <select

                        {...register("gender")}

                        className="w-full border rounded-md h-10 px-3"

                    >

                        <option value="">

                            Select Gender

                        </option>

                        <option value="Male">

                            Male

                        </option>

                        <option value="Female">

                            Female

                        </option>

                    </select>

                    <p className="text-red-500 text-sm">

                        {errors.gender?.message}

                    </p>

                </div>

                <div className="space-y-2">

                    <label className="text-sm font-medium">

                        Marital Status

                    </label>

                    <Controller

                        control={control}

                        name="marital_status"

                        render={({ field }) => (

                            <Select

                                value={field.value}

                                onValueChange={field.onChange}

                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="Select marital status" />

                                </SelectTrigger>

                                <SelectContent>

                                    <SelectItem value="Single">

                                        Single

                                    </SelectItem>

                                    <SelectItem value="Married">

                                        Married

                                    </SelectItem>

                                    <SelectItem value="Divorced">

                                        Divorced

                                    </SelectItem>

                                    <SelectItem value="Widowed">

                                        Widowed

                                    </SelectItem>

                                </SelectContent>

                            </Select>

                        )}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.marital_status?.message}

                    </p>

                </div>

                <div>

                    <label>Date of Birth</label>

                    <Input

                        type="date"

                        {...register("date_of_birth")}

                    />

                </div>

            </div>

        </div>

    );

}

export default PersonalInformation;