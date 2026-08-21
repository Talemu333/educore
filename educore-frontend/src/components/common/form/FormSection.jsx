function FormSection({

    title,

    children

}) {

    return (

        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold mb-6">

                {title}

            </h2>

            {children}

        </div>

    );

}

export default FormSection;