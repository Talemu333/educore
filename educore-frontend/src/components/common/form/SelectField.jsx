function SelectField({

    label,

    name,

    register,

    options,

    optionLabel,

    optionValue = "id",

    error,

    disabled = false

}) {

    return (

        <div className="space-y-2">

            <label className="font-medium">

                {label}

            </label>

            <select

                {...register(name)}

                disabled={disabled}

                className="w-full rounded-md border p-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600"

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