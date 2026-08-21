function SelectField({

    label,

    name,

    register,

    options,

    optionLabel,

    optionValue = "id",

    error

}) {

    return (

        <div className="space-y-2">

            <label className="font-medium">

                {label}

            </label>

            <select

                {...register(name)}

                className="w-full rounded-md border p-2"

            >

                <option value="">

                    Select {label}

                </option>

                {options.map(option => (

                    <option

                        key={option[optionValue]}

                        value={option[optionValue]}

                    >

                        {option[optionLabel]}

                    </option>

                ))}

            </select>

            {error && (

                <p className="text-red-500 text-sm">

                    {error.message}

                </p>

            )}

        </div>

    );

}

export default SelectField;