import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

function InfoCard({ title, children }) {
    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-0 transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="px-5 pb-1 pt-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight text-slate-800">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                {children}
            </CardContent>
        </Card>
    );
}

export default InfoCard;
