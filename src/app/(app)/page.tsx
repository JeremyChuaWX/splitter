import { Button } from "@/components/ui/button";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { GroupsComponent } from "./groups-component";

export default function Page() {
    prefetch(trpc.group.getAll.queryOptions());

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <HeaderComponent />
                <Suspense fallback={<div>loading...</div>}>
                    <GroupsComponent />
                </Suspense>
            </div>
        </HydrateClient>
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
