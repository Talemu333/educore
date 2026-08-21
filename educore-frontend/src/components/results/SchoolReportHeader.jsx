import { useSchoolSettings }
from "@/hooks/useSchoolSettings";

function SchoolReportHeader() {

    const {

        data: settings,

        isLoading

    } = useSchoolSettings();


    if (isLoading) {

        return null;

    }


    return (

        <div className="border-b pb-5">

            <div className="flex flex-col items-center">

                {

                    settings?.school_logo && (

                        <img

                            src={settings.school_logo}

                            alt={`${settings.school_name} logo`}

                            className="mb-3 h-20 w-20 object-contain"

                        />

                    )

                }


                <h1 className="text-center text-2xl font-bold uppercase">

                    {

                        settings?.school_name ||

                        "SCHOOL NAME"

                    }

                </h1>


                {

                    settings?.school_address && (

                        <p className="mt-1 text-center text-sm">

                            {settings.school_address}

                        </p>

                    )

                }


                <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">

                    {

                        settings?.school_phone && (

                            <span>

                                Tel: {settings.school_phone}

                            </span>

                        )

                    }


                    {

                        settings?.school_email && (

                            <span>

                                Email: {settings.school_email}

                            </span>

                        )

                    }

                </div>


                {

                    settings?.school_code && (

                        <p className="mt-1 text-xs text-muted-foreground">

                            School Code: {settings.school_code}

                        </p>

                    )

                }


                <h2 className="mt-4 text-lg font-semibold uppercase">

                    Student Academic Report

                </h2>

            </div>

        </div>

    );

}

export default SchoolReportHeader;