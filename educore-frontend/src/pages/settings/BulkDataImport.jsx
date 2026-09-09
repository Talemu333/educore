import { useMemo, useState } from "react";
import api from "@/api/axios";

const IMPORTS = {
    students: {
        label: "Students",
        description: "Import student biodata, admission numbers and class placement.",
        columns: ["admission_number", "admission_sequence", "surname", "first_name", "middle_name", "gender", "date_of_birth", "state_name", "nationality_name", "religion", "blood_group", "genotype", "residential_address", "class_name", "arm_name", "admission_date", "status"],
        required: "surname, first_name, gender, date_of_birth, admission_date, class_name, arm_name"
    },
    teachers: {
        label: "Teachers",
        description: "Import staff records and create teacher login accounts automatically.",
        columns: ["staff_number", "surname", "first_name", "middle_name", "gender", "date_of_birth", "phone_number", "email", "address", "marital_status", "qualification_name", "department_name", "employment_date", "state_name", "nationality_name", "next_of_kin_name", "next_of_kin_phone", "emergency_contact_name", "emergency_contact_phone", "username", "password"],
        required: "surname, first_name, gender"
    },
    parents: {
        label: "Parents",
        description: "Import parent records and link each parent to a student.",
        columns: ["student_admission_number", "surname", "first_name", "middle_name", "gender", "phone_number", "alternate_phone", "email", "occupation", "residential_address", "relationship", "is_primary_contact", "username", "password"],
        required: "student_admission_number, surname, first_name, phone_number, residential_address, relationship"
    },
    payments: {
        label: "Payments",
        description: "Import historical student fee/payment transactions.",
        columns: ["student_admission_number", "session_name", "term_name", "amount_paid", "payment_date", "payment_method", "reference_number", "remarks"],
        required: "student_admission_number, session_name, term_name, amount_paid, payment_date"
    },
    expenses: {
        label: "Expenses",
        description: "Import historical school expenses and financial transactions.",
        columns: ["expense_date", "category", "description", "amount", "payment_method", "vendor", "reference_number", "notes"],
        required: "expense_date, category, description, amount"
    },
    results: {
        label: "Results",
        description: "Import historical CA and examination scores. Existing results are skipped.",
        columns: ["student_admission_number", "teacher_staff_number", "subject_name", "class_name", "arm_name", "session_name", "term_name", "ca_score", "exam_score"],
        required: "student_admission_number, teacher_staff_number, subject_name, class_name, session_name, term_name, ca_score, exam_score"
    }
};

const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

function BulkDataImport() {
    const [type, setType] = useState("students");
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    const config = IMPORTS[type];
    const template = useMemo(() => `${config.columns.join(",")}\n${config.columns.map(() => "").join(",")}`, [config]);

    const handleImport = async () => {
        if (!file) {
            setMessage("Select an Excel or CSV file first.");
            return;
        }
        setBusy(true);
        setMessage("");
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("file", file);
            const response = await api.post("/bulk-import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000
            });
            setResult(response.data.result);
            setMessage(response.data.message || "Import completed.");
            setFile(null);
        } catch (error) {
            setMessage(error.response?.data?.message || "The import could not be completed.");
        } finally {
            setBusy(false);
        }
    };

    const downloadCredentials = () => {
        if (!result?.credentials?.length) return;
        const rows = result.credentials.map(item => [item.name, item.username, item.temporary_password, item.staff_number || ""]);
        downloadText("eduprow-import-credentials.csv", ["name,username,temporary_password,staff_number", ...rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))].join("\n"));
    };

    return (
        <section className="w-full min-w-0 overflow-hidden rounded-xl border bg-background p-4 shadow-sm sm:p-6">
            <div className="mb-5">
                <h2 className="text-xl font-semibold">Bulk Data Import</h2>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    Move an existing school into EduProw without entering thousands of records one by one. Upload Excel (.xlsx/.xls) or CSV files using the templates below.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                {Object.entries(IMPORTS).map(([key, item]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => { setType(key); setResult(null); setMessage(""); }}
                        className={`rounded-xl border p-4 text-left transition ${type === key ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/40"}`}
                    >
                        <div className="font-medium">{item.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                    </button>
                ))}
            </div>

            <div className="mt-5 rounded-xl border bg-muted/20 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <label className="mb-2 block text-sm font-medium">{config.label} spreadsheet</label>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(event) => setFile(event.target.files?.[0] || null)}
                            className="block w-full rounded-lg border bg-background p-2 text-sm"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">Required columns: {config.required}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted" onClick={() => downloadText(`eduprow-${type}-template.csv`, template)}>
                            Download template
                        </button>
                        <button type="button" disabled={busy || !file} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" onClick={handleImport}>
                            {busy ? "Importing…" : `Import ${config.label}`}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-xl border p-4 text-sm">
                <h3 className="font-semibold">Recommended migration order</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>Set up the school's classes, arms, academic sessions, terms, subjects and other basic structure.</li>
                    <li>Import students, then teachers and parents.</li>
                    <li>Import historical payments and expenses.</li>
                    <li>Import historical results last, because result rows depend on students, teachers, subjects and academic periods.</li>
                </ol>
            </div>

            {message && <div className="mt-4 rounded-lg border p-3 text-sm">{message}</div>}

            {result && (
                <div className="mt-4 rounded-xl border p-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                        <div><div className="text-xs text-muted-foreground">Rows</div><div className="text-lg font-semibold">{result.total}</div></div>
                        <div><div className="text-xs text-muted-foreground">Imported</div><div className="text-lg font-semibold">{result.imported}</div></div>
                        <div><div className="text-xs text-muted-foreground">Skipped</div><div className="text-lg font-semibold">{result.skipped}</div></div>
                        <div><div className="text-xs text-muted-foreground">Failed</div><div className="text-lg font-semibold">{result.failed}</div></div>
                    </div>
                    {result.credentials?.length > 0 && (
                        <div className="mt-4 rounded-lg border bg-yellow-50 p-3 text-sm">
                            <div className="font-medium">Temporary login credentials generated</div>
                            <p className="mt-1 text-xs">Download and store this file securely. Users should change their temporary passwords after first login.</p>
                            <button type="button" className="mt-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium" onClick={downloadCredentials}>Download credentials</button>
                        </div>
                    )}
                    {result.errors?.length > 0 && (
                        <div className="mt-4 max-h-64 overflow-auto rounded-lg border p-3 text-xs">
                            <div className="mb-2 font-semibold">Rows requiring attention</div>
                            {result.errors.slice(0, 100).map((error, index) => <div key={index} className="border-b py-1 last:border-b-0">Row {error.row}: {error.message}</div>)}
                            {result.errors.length > 100 && <div className="pt-2 text-muted-foreground">Only the first 100 errors are shown.</div>}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default BulkDataImport;
