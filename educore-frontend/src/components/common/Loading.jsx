function Loading({

    message = "Loading..."

}) {

    return (

        <div className="flex justify-center items-center py-10">

            <p className="text-muted-foreground">

                {message}

            </p>

        </div>

    );

}

export default Loading;