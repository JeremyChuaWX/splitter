import { CreateGroupButton } from "./create-group-button";
import { ClientGroupSection, ClientGroupSectionSkeleton } from "./group-list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <div className="flex flex-col gap-6 w-full pt-18">
            <Header />
            <GroupSection />
        </div>
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
    prefetch(trpc.getGroups.queryOptions());

    return (
        <HydrateClient>
            <Suspense fallback={<ClientGroupSectionSkeleton />}>
                <ClientGroupSection />
            </Suspense>
        </HydrateClient>
    );
}
