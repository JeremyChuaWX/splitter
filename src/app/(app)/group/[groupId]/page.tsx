import { Button } from "@/components/ui/button";
import { ItemsComponent } from "./items-component";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.item.getForGroup.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <HeaderComponent />
                <Suspense fallback={<div>loading...</div>}>
                    <ItemsComponent />
                </Suspense>
                <BalancesComponent />
            </div>
        </HydrateClient>
    );
}

function HeaderComponent() {
    return (
        <div className="flex items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">Korea Trip</h1>
            <Button variant="outline">Settings</Button>
        </div>
    );
}

function BalancesComponent() {
    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Balances</h2>
                {/* <Button variant="outline">Add Member</Button> */}
            </div>
        </div>
    );
}
