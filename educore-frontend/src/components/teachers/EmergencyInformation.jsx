import { Input } from "@/components/ui/Input";

function EmergencyInformation({

    register,

    errors

}) {

    return (

        <div className="space-y-5">

            <h3 className="text-lg font-semibold">

                Next of Kin & Emergency Contact

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                    <label>Next of Kin</label>

                    <Input

                        {...register("next_of_kin_name")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.next_of_kin_name?.message}

                    </p>

                </div>

                <div>

                    <label>Next of Kin Phone</label>

                    <Input

                        {...register("next_of_kin_phone")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.next_of_kin_phone?.message}

                    </p>

                </div>

                <div>

                    <label>Emergency Contact</label>

                    <Input

                        {...register("emergency_contact_name")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.emergency_contact_name?.message}

                    </p>

                </div>

                <div>

                    <label>Emergency Contact Phone</label>

                    <Input

                        {...register("emergency_contact_phone")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.emergency_contact_phone?.message}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default EmergencyInformation;