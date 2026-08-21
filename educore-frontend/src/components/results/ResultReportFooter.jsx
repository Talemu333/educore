import { useSchoolSettings }
from "@/hooks/useSchoolSettings";

function ResultReportFooter() {

    const {

        data: settings

    } = useSchoolSettings();


    const generatedDate =

        new Date().toLocaleDateString(

            "en-NG",

            {

                day: "2-digit",

                month: "long",

                year: "numeric"

            }

        );


    return (

        <div className="border-t p-6 print:mt-4">

            {/* Signatures */}

            <div className="grid gap-10 md:grid-cols-2">

                <div className="pt-10 text-center">

                    <div className="border-t border-dashed pt-2">

                        <p className="font-medium">

                            Class Teacher

                        </p>

                        <p className="text-xs text-muted-foreground">

                            Signature & Date

                        </p>

                    </div>

                </div>


                <div className="pt-10 text-center">

                    <div className="border-t border-dashed pt-2">

                        <p className="font-medium">

                            Principal

                        </p>

                        <p className="text-xs text-muted-foreground">

                            Signature & Date

                        </p>

                    </div>

                </div>

            </div>


            {/* Bottom Information */}

            <div className="mt-10 border-t pt-4 text-center">

                <p className="text-xs text-muted-foreground">

                    This result was generated electronically on{" "}

                    {generatedDate}.

                </p>


                <p className="mt-1 text-xs text-muted-foreground">

                    This is a computer-generated academic report

                    {

                        settings?.school_name

                            ? ` of ${settings.school_name}.`

                            : "."

                    }

                </p>

            </div>

        </div>

    );

}

export default ResultReportFooter;