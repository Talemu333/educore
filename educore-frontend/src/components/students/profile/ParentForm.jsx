import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { useUpdateParent } from "@/hooks/useUpdateParent";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { parentSchema } from "@/validators/parentValidator";
import { useCreateParent } from "@/hooks/useCreateParent";
import { useRelationships } from "@/hooks/useRelationships";
import {Select,SelectContent, SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

function ParentForm({studentId, parent = null, onSuccess}) {

    const {

        data: relationships = [],

        isLoading: loadingRelationships

    } = useRelationships();

    const createParentMutation = useCreateParent();

    const updateParentMutation = useUpdateParent();

    const {

        register,

        handleSubmit,

        control,

        reset,

        formState: { errors }

    } = useForm({

        resolver: zodResolver(parentSchema),

        defaultValues: parent ?? {

            surname: "",

            first_name: "",

            middle_name: "",

            gender: "",

            relationship_id: "",

            phone_number: "",

            alternate_phone: "",

            email: "",

            occupation: "",

            residential_address: "",

            username: "",

            is_primary_contact: false

        }

    });

    useEffect(() => {

        reset({

            surname: parent?.surname || "",

            first_name: parent?.first_name || "",

            middle_name: parent?.middle_name || "",

            gender: parent?.gender || "",

            relationship_id:

                parent?.relationship_id?.toString() || "",

            phone_number: parent?.phone_number || "",

            alternate_phone:

                parent?.alternate_phone || "",

            email: parent?.email || "",

            occupation: parent?.occupation || "",

            residential_address:

                parent?.residential_address || "",

            username: parent?.username || "",

            is_primary_contact:

                parent?.is_primary_contact || false

        });

    }, [parent, reset]);

    const onSubmit = (values) => {

        const payload = {

            ...values,

            relationship_id: Number(values.relationship_id),

            student_id: studentId

        };

        if (parent) {

            updateParentMutation.mutate(

                {

                    id: parent.id,

                    data: payload

                },

                {

                    onSuccess: () => {

                        onSuccess?.();

                    }

                }

            );

        } else {

            createParentMutation.mutate(

                payload,

                {

                    onSuccess: () => {

                        reset();

                        onSuccess?.();

                    }

                }

            );

        }

    };

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <h3 className="col-span-full text-lg font-semibold">
                    Parent Information
                </h3>

                <div>
                    <label className="text-sm font-medium">
                        Surname
                    </label>
                    <Input

                        placeholder="Surname"

                        {...register("surname")}

                    />

                    {errors.surname && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.surname.message}

                        </p>

                    )}

                </div>

                <div>
                    <label className="text-sm font-medium">
                        First Name
                    </label>
                    <Input

                        placeholder="First Name"

                        {...register("first_name")}

                    />

                    {errors.first_name && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.first_name.message}

                        </p>

                    )}

                </div>

                <div>
                    <label className="text-sm font-medium">
                        Middle Name
                    </label>
                    <Input

                        placeholder="Middle Name"

                        {...register("middle_name")}

                    />

                    {errors.middle_name && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.middle_name.message}

                        </p>

                    )}

                </div>

                <div>  
                    <label className="text-sm font-medium">
                        Gender
                    </label>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (

                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loadingRelationships}
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="Gender" />

                                </SelectTrigger>

                                <SelectContent>

                                    <SelectItem value="Male">

                                        Male

                                    </SelectItem>

                                    <SelectItem value="Female">

                                        Female

                                    </SelectItem>

                                </SelectContent>

                            </Select>

                        )}
                    />
                
                    {errors.gender && (

                        <p className="mt-1 text-sm text-red-500">

                            {errors.gender.message}

                        </p>

                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Occupation
                    </label>
                    <Input

                        placeholder="Occupation"

                        {...register("occupation")}

                    />

                    {errors.occupation && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.occupation.message}

                        </p>

                    )}

                </div>

                <div>
                    <label className="text-sm font-medium">
                        Relationship
                    </label>
                    <Controller

                        control={control}

                        name="relationship_id"

                        render={({ field }) => (

                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loadingRelationships}
                            >

                                <SelectTrigger>
                                    <SelectValue>
                                        {relationships.find(
                                            (r) => r.id.toString() === field.value
                                        )?.relationship_name || "Relationship"}
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent>

                                    {

                                        relationships.map((relationship) => (

                                            <SelectItem

                                                key={relationship.id}

                                                value={relationship.id.toString()}

                                            >

                                                {relationship.relationship_name}

                                            </SelectItem>

                                        ))

                                    }

                                </SelectContent>

                            </Select>

                        )}

                    />

                    {errors.relationship_id && (

                        <p className="mt-1 text-sm text-red-500">

                            {errors.relationship_id.message}

                        </p>

                    )}

                </div>

                <h3 className="col-span-full text-lg font-semibold pt-4">
                    Contact Information
                </h3>

                <div>
                    <label className="text-sm font-medium">
                        Username
                    </label>
                    <Input

                        placeholder="Username"

                        {...register("username")}

                    />

                    {errors.username && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.username.message}

                        </p>

                    )}

                </div>

                <div>
                    <label className="text-sm font-medium">
                        Email
                    </label>
                    <Input

                        placeholder="Email"

                        {...register("email")}

                    />

                    {errors.email && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.email.message}

                        </p>

                    )}

                </div>

                <div>
                    <label className="text-sm font-medium">
                        Phone Number
                    </label>
                    <Input

                        placeholder="Phone Number"

                        {...register("phone_number")}

                    />

                    {errors.phone_number && (

                        <p className="text-sm text-red-500 mt-1">

                            {errors.phone_number.message}

                        </p>

                    )}

                </div>


                <div>
                    <label className="text-sm font-medium">
                        Alternate Phone
                    </label>
                    <Input

                        placeholder="Alternate Phone"

                        {...register("alternate_phone")}

                    />

                </div>   

                
            </div>

            <div>
                <label className="text-sm font-medium">
                        Residential Address
                    </label>
                <Textarea

                    placeholder="Residential Address"

                    {...register("residential_address")}

                />

                {errors.residential_address && (

                    <p className="text-sm text-red-500 mt-1">

                        {errors.residential_address.message}

                    </p>

                )}

            </div>

            <div className="flex items-center space-x-2 mt-4">

                <Controller
                    control={control}
                    name="is_primary_contact"
                    render={({ field }) => (

                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />

                    )}
                />

                <label className="text-sm font-medium">

                    Set as Primary Contact

                </label>

            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={
                    createParentMutation.isPending ||
                    updateParentMutation.isPending
                }
            >

                {

                    createParentMutation.isPending ||

                    updateParentMutation.isPending

                        ? "Saving..."

                        : parent

                            ? "Update Parent"

                            : "Save Parent"

                }

            </Button>

        </form>

    );

}

export default ParentForm;