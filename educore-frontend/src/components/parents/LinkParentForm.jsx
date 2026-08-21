import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

import { useParents } from "@/hooks/useParents";
import { useRelationships } from "@/hooks/useRelationships";
import { useLinkParent } from "@/hooks/useLinkParent";

function LinkParentForm({

    studentId,

    onSuccess

}) {

    const [search, setSearch] = useState("");

    const {

        data: parents = [],

        isLoading: loadingParents

    } = useParents();

    const {

        data: relationships = [],

        isLoading: loadingRelationships

    } = useRelationships();

    const linkParentMutation = useLinkParent();

    const {

        control,

        handleSubmit,

        reset

    } = useForm({

        defaultValues: {

            parent_id: "",

            relationship_id: "",

            is_primary_contact: false

        }

    });

    const filteredParents = parents.filter((parent) => {

        const keyword = search.toLowerCase();

        return (

            parent.surname.toLowerCase().includes(keyword)

            ||

            parent.first_name.toLowerCase().includes(keyword)

            ||

            (parent.phone_number || "").includes(search)

        );

    });

    const onSubmit = (values) => {

        linkParentMutation.mutate(

            {

                student_id: studentId,

                parent_id: Number(values.parent_id),

                relationship_id: Number(values.relationship_id),

                is_primary_contact: values.is_primary_contact

            },

            {

                onSuccess: () => {

                    reset();

                    onSuccess?.();

                }

            }

        );

    };

    return (

        <form

            onSubmit={handleSubmit(onSubmit)}

            className="space-y-5"

        >

            <div>

                <Label>

                    Search Parent

                </Label>

                <Input

                    placeholder="Name or Phone Number"

                    value={search}

                    onChange={(e) =>

                        setSearch(e.target.value)

                    }

                />

            </div>

            <div>

                <Label>

                    Parent

                </Label>

                <Controller

                    control={control}

                    name="parent_id"

                    render={({ field }) => (

                        <Select

                            value={field.value}

                            onValueChange={field.onChange}

                            disabled={loadingParents}

                        >

                            <SelectTrigger>

                                <SelectValue

                                    placeholder="Select Parent"

                                />

                            </SelectTrigger>

                            <SelectContent>

                                {

                                    filteredParents.map((parent) => (

                                        <SelectItem

                                            key={parent.id}

                                            value={parent.id.toString()}

                                        >

                                            {parent.surname}{" "}

                                            {parent.first_name}

                                        </SelectItem>

                                    ))

                                }

                            </SelectContent>

                        </Select>

                    )}

                />

            </div>

            <div>

                <Label>

                    Relationship

                </Label>

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

                                <SelectValue

                                    placeholder="Relationship"

                                />

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

            </div>

            <div className="flex items-center gap-3">

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

                <Label>

                    Primary Contact

                </Label>

            </div>

            <Button

                type="submit"

                className="w-full"

                disabled={linkParentMutation.isPending}

            >

                {

                    linkParentMutation.isPending

                        ? "Linking..."

                        : "Link Parent"

                }

            </Button>

        </form>

    );

}

export default LinkParentForm;