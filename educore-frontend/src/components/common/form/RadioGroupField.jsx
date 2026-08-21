function RadioGroupField({

    label,

    name,

    register,

    options,

    error

}) {

    return (

        <div>

            <label className="font-medium">

                {label}

            </label>

            <div className="flex gap-6 mt-2">

                {options.map(option => (

                    <label
                        key={option.value}
                        className="flex items-center gap-2"
                    >

                        <input

                            type="radio"

                            value={option.value}

                            {...register(name)}

                        />

                        {option.label}

                    </label>

                ))}

            </div>

            {error && (

                <p className="text-red-500 text-sm mt-1">

                    {error.message}

                </p>

            )}

        </div>

    );

}

export default RadioGroupField;