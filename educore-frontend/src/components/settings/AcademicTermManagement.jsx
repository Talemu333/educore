import { useState } from "react";
import toast from "react-hot-toast";

import { useTerms } from "@/hooks/useTerms";
import { useCreateTerm } from "@/hooks/useCreateTerm";
import { Button } from "@/components/ui/Button";

const INITIAL_FORM = {
    session_id: "",
    term_name: "",
    start_date: "",
    end_date: "",
    is_current: false
};

function AcademicTermManagement({ sessions = [] }) {
    const { data: terms = [] } = useTerms();
    const { mutate: createTerm, isPending: isCreating } = useCreateTerm();
    const [form, setForm] = useState(INITIAL_FORM);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.session_id || !form.term_name || !form.start_date || !form.end_date) {
            toast.error("Please complete all term fields.");
            return;
        }

        if (form.end_date <= form.start_date) {
            toast.error("Term end date must be after start date.");
            return;
        }

        createTerm(
            {
                session_id: Number(form.session_id),
                term_name: form.term_name,
                start_date: form.start_date,
                end_date: form.end_date,
                is_current: form.is_current
            },
            {
                onSuccess: () => {
                    toast.success("Academic term created successfully.");
                    setForm(INITIAL_FORM);
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to create academic term."
                    );
                }
            }
        );
    };

    return (
        <div className="mt-8 border-t pt-6">
            <div>
                <h3 className="text-base font-semibold sm:text-lg">
                    Academic Terms
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Create terms and associate them with an academic session for this school.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-5 rounded-xl border bg-slate-50 p-4 sm:p-5"
            >
                <h4 className="text-sm font-semibold text-gray-800 sm:text-base">
                    Add Academic Term
                </h4>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="text-sm font-medium">Academic Session</label>
                        <select
                            name="session_id"
                            value={form.session_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select Session</option>
                            {sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.session_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Term</label>
                        <select
                            name="term_name"
                            value={form.term_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select Term</option>
                            <option value="First Term">First Term</option>
                            <option value="Second Term">Second Term</option>
                            <option value="Third Term">Third Term</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={form.end_date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="term-is-current"
                        name="is_current"
                        checked={form.is_current}
                        onChange={handleChange}
                        className="h-4 w-4"
                    />
                    <label htmlFor="term-is-current" className="text-sm font-medium">
                        Set as current term
                    </label>
                </div>

                <div className="mt-5 flex justify-stretch sm:justify-end">
                    <Button
                        type="submit"
                        disabled={isCreating}
                        className="w-full sm:w-auto"
                    >
                        {isCreating ? "Saving..." : "Add Term"}
                    </Button>
                </div>
            </form>

            <div className="mt-5 space-y-3">
                {terms.length === 0 ? (
                    <div className="rounded-xl border p-5 text-center text-sm text-muted-foreground">
                        No academic terms found.
                    </div>
                ) : (
                    terms.map((term) => (
                        <div key={term.id} className="rounded-xl border p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-sm font-semibold sm:text-base">
                                            {term.term_name}
                                        </h4>
                                        {term.is_current && (
                                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700 sm:text-xs">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                        {term.session_name}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {String(term.start_date).slice(0, 10)} → {String(term.end_date).slice(0, 10)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AcademicTermManagement;
