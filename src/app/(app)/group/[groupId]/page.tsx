import {
    BalanceSection as ClientBalanceSection,
    BalanceSectionSkeleton as ClientBalanceSectionSkeleton,
} from "./balance-section";
import {
    Header as ClientHeader,
    HeaderSkeleton as ClientHeaderSkeleton,
} from "./header";
import {
    ItemSection as ClientItemSection,
    ItemSectionSkeleton as ClientItemSectionSkeleton,
} from "./item-section";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;

    return (
        <div className="flex flex-col gap-6 w-full pt-18">
            <Header groupId={groupId} />
            <div className="grid grid-cols-2 gap-6">
                <ItemSection groupId={groupId} />
                <BalanceSection groupId={groupId} />
            </div>
        </div>
    );
}

function Header({ groupId }: { groupId: string }) {
    prefetch(trpc.getGroup.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <Suspense fallback={<ClientHeaderSkeleton />}>
                <ClientHeader />
            </Suspense>
        </HydrateClient>
    );
}

function ItemSection({ groupId }: { groupId: string }) {
    prefetch(trpc.getItemsWithTotal.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <Suspense fallback={<ClientItemSectionSkeleton />}>
                <ClientItemSection />
            </Suspense>
        </HydrateClient>
    );
}

function BalanceSection({ groupId }: { groupId: string }) {
    prefetch(trpc.getBalances.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <Suspense fallback={<ClientBalanceSectionSkeleton />}>
                <ClientBalanceSection />
            </Suspense>
        </HydrateClient>
    );
}
