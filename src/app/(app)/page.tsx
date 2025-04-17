import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export default function Page() {
    // const trpc = useTRPC();
    // const {} = useQuery();
    // const {} = useMutation();

    return (
        <div className="flex flex-col gap-6 pt-24 w-2/3">
            <HeaderComponent />
            <GroupsComponent />
        </div>
    );
}

function HeaderComponent() {
    return (
        <div className="flex items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">Groups</h1>
            <Button variant="outline">Add Group</Button>
        </div>
    );
}

function GroupsComponent() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <GroupCard />
            <GroupCard />
            <GroupCard />
        </div>
    );
}

function GroupCard() {
    return (
        <Link href="/group/123" passHref legacyBehavior>
            <ForwardedGroupCard />
        </Link>
    );
}

function _GroupCard() {
    return (
        <Card className="transition-all hover:scale-[101%] hover:cursor-pointer">
            <CardContent className="flex items-center">
                <div className="flex flex-1 gap-1 items-center">
                    <CardTitle>Korea Trip</CardTitle>
                    <Badge variant="secondary">Owner</Badge>
                </div>
                <span>$123.45</span>
            </CardContent>
        </Card>
    );
}

const ForwardedGroupCard = React.forwardRef(_GroupCard);
