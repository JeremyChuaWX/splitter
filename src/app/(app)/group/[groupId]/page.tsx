import { Button } from "@/components/ui/button";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ItemTable } from "./item-table";
import { AddItemButton } from "./add-item-button";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.item.getForGroup.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <Header />
                <ItemSection groupId={groupId} />
                <BalanceSection />
            </div>
        </HydrateClient>
    );
}

function Header() {
    return (
        <div className="flex items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">Korea Trip</h1>
            <Button variant="outline">Settings</Button>
        </div>
    );
}

function ItemSection({ groupId }: { groupId: string }) {
    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Items</h2>
                <AddItemButton groupId={groupId} />
            </div>
            <Suspense fallback={<div>loading...</div>}>
                <ItemTable groupId={groupId} />
            </Suspense>
        </div>
    );
}

function BalanceSection() {
    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Balances</h2>
                {/* <Button variant="outline">Add Member</Button> */}
            </div>
        </div>
    );
}
