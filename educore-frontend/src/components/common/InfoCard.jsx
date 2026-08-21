import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InfoCard({

    title,

    children

}) {

    return (

        <Card>

            <CardHeader>

                <CardTitle>

                    {title}

                </CardTitle>

            </CardHeader>

            <CardContent>

                {children}

            </CardContent>

        </Card>

    );

}

export default InfoCard;