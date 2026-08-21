import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function ContactInformation({

    register,

    errors

}) {

    return (

        <div className="space-y-5">

            <h3 className="text-lg font-semibold">

                Contact Information

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                    <label>

                        Phone Number

                    </label>

                    <Input

                        {...register("phone_number")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.phone_number?.message}

                    </p>

                </div>

                <div>

                    <label>

                        Email Address

                    </label>

                    <Input

                        type="email"

                        {...register("email")}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.email?.message}

                    </p>

                </div>

                <div className="md:col-span-2">

                    <label>

                        Residential Address

                    </label>

                    <Textarea

                        {...register("address")}

                        rows={4}

                    />

                    <p className="text-red-500 text-sm">

                        {errors.address?.message}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default ContactInformation;