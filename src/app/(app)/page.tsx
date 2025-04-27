export const dynamic = "force-dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { CreateGroupButton } from "./create-group-button";
import { GroupList } from "./group-list";

export default function Page() {
    prefetch(trpc.getGroups.queryOptions());

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-full max-w-[650px]">
                <Header />
                <GroupSection />
            </div>
        </HydrateClient>
    );
}

function Header() {
    return (
        <div className="flex items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">Groups</h1>
            <CreateGroupButton />
        </div>
    );
}

function GroupSection() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Suspense
                fallback={
                    <>
                        <Skeleton className="w-full rounded-xl h-[74px]" />
                        <Skeleton className="w-full rounded-xl h-[74px]" />
                        <Skeleton className="w-full rounded-xl h-[74px]" />
                    </>
                }
            >
                <GroupList />
            </Suspense>
        </div>
    );
}
