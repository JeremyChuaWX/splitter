import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ItemRows } from "./item-rows";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "./header";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.getGroup.queryOptions({ groupId: groupId }));
    prefetch(trpc.getItems.queryOptions({ groupId: groupId }));
    prefetch(trpc.getMembers.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 pt-24 w-2/3">
                <Suspense fallback={<Skeleton className="w-full h-12" />}>
                    <Header />
                </Suspense>
                <ItemSection />
                <BalanceSection />
            </div>
        </HydrateClient>
    );
}

function ItemSection() {
    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Items</h2>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>To Pay</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <Suspense
                        fallback={
                            <>
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                            </>
                        }
                    >
                        <ItemRows />
                    </Suspense>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableHead colSpan={3}>Total Amount</TableHead>
                        <TableCell className="text-right">$123.45</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

function ItemRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
        </TableRow>
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
