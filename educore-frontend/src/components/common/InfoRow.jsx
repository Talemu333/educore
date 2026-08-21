function InfoRow({

    label,

    value

}) {

    return (

        <div className="flex justify-between border-b py-2">

            <span className="font-medium text-gray-600">

                {label}

            </span>

            <span>

                {value || "-"}

            </span>

        </div>

    );

}

export default InfoRow;