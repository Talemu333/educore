import {

    Controller

} from "react-hook-form";

import {

    Select,

    SelectContent,

    SelectItem,

    SelectTrigger,

    SelectValue

} from "@/components/ui/select";

function FormSelect({

    control,

    name,

    placeholder,

    options,

    labelKey,

    valueKey = "id",

    disabled = false

}) {

    return (

        <Controller

            control={control}

            name={name}

            render={({ field }) => (

                <Select

                    disabled={disabled}

                    value={field.value?.toString() ?? ""}

                    onValueChange={field.onChange}

                >

                    <SelectTrigger>

                        <SelectValue placeholder={placeholder}>

                            {

                                options.find(

                                    option =>

                                        option[valueKey].toString() ===

                                        field.value?.toString()

                                )?.[labelKey]

                            }

                        </SelectValue>

                    </SelectTrigger>
                    <SelectContent>

                        {

                            options.map((option) => (

                                <SelectItem

                                    key={option[valueKey]}

                                    value={option[valueKey].toString()}

                                >

                                    {option[labelKey]}

                                </SelectItem>

                            ))

                        }

                    </SelectContent>

                </Select>

            )}

        />

    );
    

}

export default FormSelect;