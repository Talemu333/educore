import { Input } from "@/components/ui/Input";

function AccountInformation({

    register,

    errors,

    editing

}) {

    return (

        <div className="space-y-5">

            <h3 className="text-lg font-semibold">

                Account Information

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                    <label>

                        Username

                    </label>

                    <Input

                        {...register("username")}

                        disabled={editing}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.username?.message}

                    </p>

                </div>

            </div>

            {

                !editing && (

                    <p className="text-sm text-muted-foreground">

                        A temporary password will be generated automatically.

                    </p>

                )

            }

        </div>

    );

}

export default AccountInformation;