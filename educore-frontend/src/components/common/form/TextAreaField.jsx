import { Textarea } from "@/components/ui/textarea";

function TextAreaField({

    label,

    name,

    register,

    error,

    rows = 4

}) {

    return (

        <div className="space-y-2">

            <label className="font-medium">

                {label}

            </label>

            <Textarea

                rows={rows}

                {...register(name)}

            />

            {error && (

                <p className="text-sm text-red-500">

                    {error.message}

                </p>

            )}

        </div>

    );

}

export default TextAreaField;