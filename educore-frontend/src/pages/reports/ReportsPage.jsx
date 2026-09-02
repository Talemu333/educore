import { BarChart3 } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";

function ReportsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports"
                description="Access academic, attendance and administrative reports from one place."
            />

            <section className="app-surface overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-slate-900">
                        Reports Centre
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Select a report to review school information and performance data.
                    </p>
                </div>

                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <BarChart3 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                        Reports workspace
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        No report modules are currently available on this screen. Report options can be added here as the school's reporting requirements are defined.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ReportsPage;
