import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ItemTable } from "./item-table";
import { SettingsDropdown } from "./settings-dropdown";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.item.getForGroup.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <Header groupId={groupId} />
                <ItemSection groupId={groupId} />
                <BalanceSection />
            </div>
        </HydrateClient>
    );
}

function Header({ groupId }: { groupId: string }) {
    return (
        <div className="flex gap-2 items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">Korea Trip</h1>
            <SettingsDropdown groupId={groupId} />
        </div>
    );
}

function ItemSection({ groupId }: { groupId: string }) {
    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Items</h2>
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
            </div>
        </div>
    );
}
