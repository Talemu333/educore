import { Input } from "@/components/ui/input";

function TextField({

    label,

    register,

    name,

    error,

    ...props

}) {

    return (

        <div className="space-y-2">

            <label className="text-sm font-medium">

                {label}

            </label>

            <Input

                {...register(name)}

                {...props}

            />

            {error && (

                <p className="text-sm text-red-500">

                    {error.message}

                </p>

            )}

        </div>

    );

}

export default TextField;