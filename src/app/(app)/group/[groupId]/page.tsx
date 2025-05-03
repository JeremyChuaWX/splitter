import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableRow,
} from "@/components/ui/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { AddItemButton } from "./add-item-button";
import { AddMembersButton } from "./add-members-button";
import { Header } from "./header";
import { ItemRows } from "./item-rows";

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
            <div className="flex flex-col gap-6 w-full pt-18">
                <Suspense fallback={<Skeleton className="w-full h-12" />}>
                    <Header />
                </Suspense>
                <div className="grid grid-cols-2 gap-6">
                    <ItemSection />
                    <BalanceSection />
                </div>
            </div>
        </HydrateClient>
    );
}

function ItemSection() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Items</h2>
            <Table>
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
                        <TableCell className="text-right" colSpan={2}>
                            $123.45
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <AddItemButton />
                </TableCaption>
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
        </TableRow>
    );
}

function BalanceSection() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Balances</h2>
            <Table>
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
                        <TableCell className="text-right" colSpan={2}>
                            $123.45
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <AddMembersButton />
                </TableCaption>
            </Table>
        </div>
    );
}
