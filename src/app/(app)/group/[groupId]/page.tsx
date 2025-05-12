import { BalanceSection, BalanceSectionSkeleton } from "./balance-section";
import { Header } from "./header";
import { ItemSection, ItemSectionSkeleton } from "./item-section";
import { Skeleton } from "@/components/ui/skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.getGroup.queryOptions({ groupId: groupId }));
    prefetch(trpc.getItemsWithTotal.queryOptions({ groupId: groupId }));
    prefetch(trpc.getMembers.queryOptions({ groupId: groupId }));
    prefetch(trpc.getBalances.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 w-full pt-18">
                <Suspense fallback={<Skeleton className="w-full h-12" />}>
                    <Header />
                </Suspense>
                <div className="grid grid-cols-2 gap-6">
                    <Suspense fallback={<ItemSectionSkeleton />}>
                        <ItemSection />
                    </Suspense>
                    <Suspense fallback={<BalanceSectionSkeleton />}>
                        <BalanceSection />
                    </Suspense>
                </div>
            </div>
        </HydrateClient>
    );
}
