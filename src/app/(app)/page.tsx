import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { CreateGroupComponent } from "./create-group-component";
import { GroupsComponent } from "./groups-component";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
    prefetch(trpc.group.getAll.queryOptions());

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <HeaderComponent />
                <Suspense
                    fallback={
                        <div className="flex flex-col gap-4 w-full">
                            <Skeleton className="w-full rounded-xl h-[74px]" />
                            <Skeleton className="w-full rounded-xl h-[74px]" />
                            <Skeleton className="w-full rounded-xl h-[74px]" />
                        </div>
                    }
                >
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
            <CreateGroupComponent />
        </div>
    );
}
