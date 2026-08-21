import { Input } from "@/components/ui/input";

function DateField({

    label,

    register,

    name,

    error

}) {

    return (

        <div className="space-y-2">

            <label className="font-medium">

                {label}

            </label>

            <Input

                type="date"

                {...register(name)}

            />

            {error && (

                <p className="text-red-500 text-sm">

                    {error.message}

                </p>

            )}

        </div>

    );

}

export default DateField;