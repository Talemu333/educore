import {

    Select,

    SelectContent,

    SelectItem,

    SelectTrigger,

    SelectValue

} from "@/components/ui/select";

function AppSelect({

    value,

    onValueChange,

    placeholder,

    options,

    labelKey,

    valueKey = "id",

    disabled = false

}) {

    return (

        <Select

            value={value?.toString() ?? ""}

            onValueChange={onValueChange}

            disabled={disabled}

        >

            <SelectTrigger>

                <SelectValue placeholder={placeholder}>

                    {

                        options.find(

                            option =>

                                option[valueKey].toString() ===

                                value?.toString()

                        )?.[labelKey]

                    }

                </SelectValue>

            </SelectTrigger>

            <SelectContent>

                {

                    options.map(option => (

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

    );

}

export default AppSelect;